// ────────────────────────────────────────────
// Asset loader — fetch, decode, cache AudioBuffers
// ────────────────────────────────────────────

import type { SoundtrackPack, AudioAsset } from "@motif/schema";
import type { LoadState, PlaybackEventType, PlaybackListener } from "./types.js";

export class AssetLoader {
  private ctx: AudioContext;
  private cache = new Map<string, AudioBuffer>();
  private inflight = new Map<string, Promise<AudioBuffer>>();
  private listener: PlaybackListener | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  setListener(listener: PlaybackListener): void {
    this.listener = listener;
  }

  /** Get a previously decoded buffer (synchronous, returns undefined if not cached) */
  getBuffer(assetId: string): AudioBuffer | undefined {
    return this.cache.get(assetId);
  }

  /** True if all given asset IDs are cached */
  allCached(assetIds: string[]): boolean {
    return assetIds.every((id) => this.cache.has(id));
  }

  /** Load all assets referenced by the given stem IDs */
  async loadForStems(
    pack: SoundtrackPack,
    stemIds: string[],
  ): Promise<{ loaded: number; errors: string[] }> {
    const stemsById = new Map(pack.stems.map((s) => [s.id, s]));
    const assetsById = new Map(pack.assets.map((a) => [a.id, a]));

    const assetsToLoad: AudioAsset[] = [];
    for (const stemId of stemIds) {
      const stem = stemsById.get(stemId);
      if (!stem) continue;
      const asset = assetsById.get(stem.assetId);
      if (!asset) continue;
      if (!this.cache.has(asset.id) && !this.inflight.has(asset.id)) {
        assetsToLoad.push(asset);
      }
    }

    if (assetsToLoad.length === 0) {
      return { loaded: 0, errors: [] };
    }

    this.emit("load-progress", { state: "loading" as LoadState, progress: 0 });

    const errors: string[] = [];
    let completed = 0;

    const processAsset = async (asset: AudioAsset) => {
      try {
        const buffer = await this.loadAsset(asset);
        this.cache.set(asset.id, buffer);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Failed to load ${asset.id}: ${msg}`);
      } finally {
        completed++;
        this.emit("load-progress", {
          state: (errors.length > 0 ? "error" : "loading") as LoadState,
          progress: completed / assetsToLoad.length,
        });
      }
    };

    await runWithConcurrency(assetsToLoad, processAsset, 4);

    this.emit("load-progress", {
      state: errors.length > 0 ? ("error" as LoadState) : ("loaded" as LoadState),
      progress: 1,
    });

    return { loaded: completed - errors.length, errors };
  }

  /** Load a single stinger asset by asset ID */
  async loadStingerAsset(
    pack: SoundtrackPack,
    assetId: string,
  ): Promise<AudioBuffer | null> {
    if (this.cache.has(assetId)) return this.cache.get(assetId)!;

    const asset = pack.assets.find((a) => a.id === assetId);
    if (!asset) return null;

    try {
      const buffer = await this.loadAsset(asset);
      this.cache.set(asset.id, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  /** Timeout in milliseconds for fetch and decode operations */
  static readonly LOAD_TIMEOUT_MS = 30_000;

  // Security note: asset.src is fetched without URL validation. In browser environments,
  // CORS policies provide protection against cross-origin requests. Server-side consumers
  // should validate URLs before passing packs to the loader.
  private async loadAsset(asset: AudioAsset): Promise<AudioBuffer> {
    // If already inflight, reuse promise
    const existing = this.inflight.get(asset.id);
    if (existing) return existing;

    const promise = (async () => {
      // Fetch with timeout via AbortController
      const controller = new AbortController();
      const fetchTimer = setTimeout(
        () => controller.abort(),
        AssetLoader.LOAD_TIMEOUT_MS,
      );

      let response: Response;
      try {
        response = await fetch(asset.src, { signal: controller.signal });
      } catch (err) {
        clearTimeout(fetchTimer);
        this.inflight.delete(asset.id);
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(
            `Audio asset '${asset.id}' timed out after ${AssetLoader.LOAD_TIMEOUT_MS / 1000}s. Check your network connection.`,
          );
        }
        throw err;
      }
      clearTimeout(fetchTimer);

      if (!response.ok) {
        const contentType = response.headers?.get?.("content-type") ?? "unknown";
        throw new Error(
          `Failed to load audio '${asset.id}': server returned ${response.status} (${contentType})`,
        );
      }

      // Validate content-type — reject HTML error pages fed to decodeAudioData
      const contentType = response.headers?.get?.("content-type") ?? "";
      if (
        contentType &&
        !contentType.startsWith("audio/") &&
        !contentType.startsWith("application/octet-stream") &&
        !contentType.startsWith("application/ogg")
      ) {
        throw new Error(
          `Failed to load audio '${asset.id}': expected audio content but received '${contentType}'`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error(
          `Failed to load audio '${asset.id}': server returned an empty response`,
        );
      }

      // Decode with timeout — a stalled decodeAudioData should not hang forever
      let decodeTimer: ReturnType<typeof setTimeout>;
      const decoded = await Promise.race([
        this.ctx.decodeAudioData(arrayBuffer).then((buf) => {
          clearTimeout(decodeTimer);
          return buf;
        }),
        new Promise<never>((_, reject) => {
          decodeTimer = setTimeout(
            () =>
              reject(
                new Error(
                  `Audio asset '${asset.id}' decode timed out after ${AssetLoader.LOAD_TIMEOUT_MS / 1000}s. The file may be corrupted.`,
                ),
              ),
            AssetLoader.LOAD_TIMEOUT_MS,
          );
        }),
      ]);

      return decoded;
    })();

    this.inflight.set(asset.id, promise);
    try {
      return await promise;
    } finally {
      this.inflight.delete(asset.id);
    }
  }

  /** Clear all cached buffers */
  clear(): void {
    this.cache.clear();
  }

  private emit(type: string, detail: unknown): void {
    this.listener?.({ type: type as PlaybackEventType, detail });
  }
}

/** Process an array of items with a maximum number of concurrent tasks. */
async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  maxConcurrency: number,
): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(maxConcurrency, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  });
  await Promise.all(workers);
}
