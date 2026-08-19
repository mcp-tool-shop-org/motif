import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GenerationParams } from "@motif-studio/schema";
import { CloudAndonError } from "./errors.js";

export const COMFY_CLOUD_BASE_URL = "https://cloud.comfy.org";

const TERMINAL_OK = new Set(["success", "completed"]);
const TERMINAL_FAIL = new Set([
  "error",
  "non_retryable_error",
  "lost",
  "cancelled",
  "failed",
]);

export interface CloudRunClient {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

export interface CloudFileRef {
  filename: string;
  subfolder: string;
  type: string;
  nodeId?: string;
  kind?: string;
  inlineText?: string;
}

export interface LandedRun {
  dir: string;
  promptId: string;
  workflowId?: string;
  files: string[];
  gpuSeconds?: number;
}

function headers(client: CloudRunClient, json = true): Record<string, string> {
  const h: Record<string, string> = { "X-API-Key": client.apiKey };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function baseUrl(client: CloudRunClient): string {
  return client.baseUrl ?? COMFY_CLOUD_BASE_URL;
}

function fetcher(client: CloudRunClient): typeof fetch {
  return client.fetch ?? fetch;
}

function sleepFn(client: CloudRunClient): (ms: number) => Promise<void> {
  return (
    client.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  );
}

export function isApiFormatPrompt(graph: unknown): boolean {
  if (!graph || typeof graph !== "object" || Array.isArray(graph)) return false;
  const rec = graph as Record<string, unknown>;
  if (Array.isArray(rec.nodes)) return false;
  const values = Object.values(rec);
  if (values.length === 0) return false;
  return values.every(
    (v) =>
      v != null &&
      typeof v === "object" &&
      "class_type" in (v as object) &&
      "inputs" in (v as object),
  );
}

export function isUiFormatGraph(graph: unknown): boolean {
  if (!graph || typeof graph !== "object") return false;
  const rec = graph as Record<string, unknown>;
  return Array.isArray(rec.nodes) && Array.isArray(rec.links);
}

/**
 * Submit an API-format prompt.
 *
 * ANDON: the archived Motif graphs (`ace15-track-to-stems.json`, `sa3-sfx-batch.json`)
 * are editor/save format (`nodes` + `links`). Public REST `POST /api/prompt` takes
 * API-format only. MCP `submit_workflow` rejects UI format and forbids client-side
 * conversion — server converts via `run_saved_workflow({ workflow_id })`. There is
 * no documented REST equivalent of `run_saved_workflow`. Do not guess one.
 */
export async function submitPrompt(
  client: CloudRunClient,
  prompt: Record<string, unknown>,
): Promise<{ promptId: string }> {
  if (isUiFormatGraph(prompt)) {
    throw new CloudAndonError(
      "ANDON_UI_FORMAT",
      "Archived graph is editor/save format. REST POST /api/prompt takes API-format JSON. Do not self-convert; run the cloud workflow_id via MCP run_saved_workflow (no public REST path measured).",
    );
  }
  if (!isApiFormatPrompt(prompt)) {
    throw new CloudAndonError(
      "ANDON_PROMPT_SHAPE",
      "submitPrompt expects a Comfy API-format prompt (node-id keys with class_type + inputs).",
    );
  }

  const response = await fetcher(client)(`${baseUrl(client)}/api/prompt`, {
    method: "POST",
    headers: headers(client),
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new CloudAndonError(
      "PROMPT_HTTP",
      `POST /api/prompt failed: HTTP ${response.status}`,
    );
  }
  const body = (await response.json()) as { prompt_id?: string; error?: unknown };
  if (body.error) {
    throw new CloudAndonError("PROMPT_ERROR", `Workflow error: ${JSON.stringify(body.error)}`);
  }
  if (!body.prompt_id) {
    throw new CloudAndonError("PROMPT_ID", "POST /api/prompt returned no prompt_id");
  }
  return { promptId: body.prompt_id };
}

export async function getJobStatus(
  client: CloudRunClient,
  promptId: string,
): Promise<string> {
  const response = await fetcher(client)(
    `${baseUrl(client)}/api/job/${promptId}/status`,
    { headers: headers(client, false) },
  );
  if (!response.ok) {
    throw new CloudAndonError(
      "STATUS_HTTP",
      `GET /api/job/${promptId}/status failed: HTTP ${response.status}`,
    );
  }
  const body = (await response.json()) as { status?: string };
  if (!body.status) {
    throw new CloudAndonError("STATUS_SHAPE", "Job status response missing status");
  }
  return body.status;
}

export async function pollJob(
  client: CloudRunClient,
  promptId: string,
  options?: { timeoutMs?: number; intervalMs?: number },
): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? 300_000;
  const intervalMs = options?.intervalMs ?? 2_000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await getJobStatus(client, promptId);
    if (TERMINAL_OK.has(status)) return status;
    if (TERMINAL_FAIL.has(status)) {
      throw new CloudAndonError("JOB_FAILED", `Job ${promptId} ended with status ${status}`);
    }
    await sleepFn(client)(intervalMs);
  }
  throw new CloudAndonError(
    "JOB_TIMEOUT",
    `Job ${promptId} did not complete within ${timeoutMs}ms`,
  );
}

export async function getJobDetail(
  client: CloudRunClient,
  promptId: string,
): Promise<Record<string, unknown>> {
  const response = await fetcher(client)(`${baseUrl(client)}/api/jobs/${promptId}`, {
    headers: headers(client, false),
  });
  if (!response.ok) {
    throw new CloudAndonError(
      "JOB_HTTP",
      `GET /api/jobs/${promptId} failed: HTTP ${response.status}`,
    );
  }
  return (await response.json()) as Record<string, unknown>;
}

/**
 * Download one output via GET /api/view. Follow the 302 without forwarding X-API-Key
 * (the signed URL carries its own auth; leaking the key to GCS is a documented trap).
 */
export async function downloadView(
  client: CloudRunClient,
  ref: CloudFileRef,
): Promise<Uint8Array> {
  const params = new URLSearchParams({
    filename: ref.filename,
    subfolder: ref.subfolder,
    type: ref.type,
  });
  const view = await fetcher(client)(`${baseUrl(client)}/api/view?${params}`, {
    headers: { "X-API-Key": client.apiKey },
    redirect: "manual",
  });
  if (view.status === 302) {
    const location = view.headers.get("location");
    if (!location) {
      throw new CloudAndonError("VIEW_REDIRECT", " /api/view 302 missing Location");
    }
    const file = await fetcher(client)(location);
    if (!file.ok) {
      throw new CloudAndonError("VIEW_FILE", `Signed URL fetch failed: HTTP ${file.status}`);
    }
    return new Uint8Array(await file.arrayBuffer());
  }
  if (!view.ok) {
    throw new CloudAndonError("VIEW_HTTP", `GET /api/view failed: HTTP ${view.status}`);
  }
  return new Uint8Array(await view.arrayBuffer());
}

export function collectOutputRefs(outputs: unknown): CloudFileRef[] {
  const refs: CloudFileRef[] = [];
  if (!outputs || typeof outputs !== "object") return refs;

  for (const [nodeId, nodeOutputs] of Object.entries(outputs as Record<string, unknown>)) {
    if (!nodeOutputs || typeof nodeOutputs !== "object") continue;
    for (const [kind, value] of Object.entries(nodeOutputs as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") {
            refs.push({
              filename: `${nodeId}.${kind}.txt`,
              subfolder: "",
              type: "output",
              nodeId,
              kind,
              inlineText: item,
            });
          } else if (item && typeof item === "object" && "filename" in item) {
            const rec = item as {
              filename: string;
              subfolder?: string;
              type?: string;
            };
            refs.push({
              filename: rec.filename,
              subfolder: rec.subfolder ?? "",
              type: rec.type ?? "output",
              nodeId,
              kind,
            });
          }
        }
      }
    }
  }
  return refs;
}

/**
 * Per-job cost is `gpu_seconds` from the billing activity feed — the job envelope
 * has no cost field. Public OpenAPI does not document that feed (MCP:
 * get_billing_activity). Callers may inject a lookup; we do not invent an endpoint.
 */
export async function landRunArtifact(
  client: CloudRunClient,
  options: {
    promptId: string;
    destDir: string;
    workflowId?: string;
    generation?: GenerationParams;
    lookupGpuSeconds?: (promptId: string) => Promise<number | undefined>;
  },
): Promise<LandedRun> {
  const detail = await getJobDetail(client, options.promptId);
  const refs = collectOutputRefs(detail.outputs);
  mkdirSync(options.destDir, { recursive: true });
  const files: string[] = [];

  for (const ref of refs) {
    const dest = join(options.destDir, safeFilename(ref.filename));
    if (ref.inlineText != null) {
      writeFileSync(dest, `${ref.inlineText}\n`, "utf-8");
    } else {
      const bytes = await downloadView(client, ref);
      writeFileSync(dest, bytes);
    }
    files.push(dest);
  }

  const gpuSeconds = options.lookupGpuSeconds
    ? await options.lookupGpuSeconds(options.promptId)
    : undefined;

  const manifest = {
    promptId: options.promptId,
    workflowId: options.workflowId,
    gpuSeconds: gpuSeconds ?? null,
    files: files.map((f) => f.replace(/\\/g, "/")),
    note:
      "gpu_seconds comes from the billing activity feed, not the job envelope. Inject lookupGpuSeconds; do not assume a REST path.",
  };
  writeFileSync(join(options.destDir, "run-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  if (options.generation) {
    writeFileSync(
      join(options.destDir, "generation.json"),
      `${JSON.stringify(options.generation, null, 2)}\n`,
    );
  }
  files.push(join(options.destDir, "run-manifest.json"));

  return {
    dir: options.destDir,
    promptId: options.promptId,
    workflowId: options.workflowId,
    files,
    gpuSeconds,
  };
}

function safeFilename(name: string): string {
  return name.replace(/[\\/]/g, "_");
}

/**
 * End-to-end: submit API-format prompt, poll, download into destDir.
 * Running by workflow_id alone is andon — see submitPrompt.
 */
export async function runCloudGraph(
  client: CloudRunClient,
  options: {
    prompt: Record<string, unknown>;
    destDir: string;
    workflowId?: string;
    generation?: GenerationParams;
    timeoutMs?: number;
    lookupGpuSeconds?: (promptId: string) => Promise<number | undefined>;
  },
): Promise<LandedRun> {
  const { promptId } = await submitPrompt(client, options.prompt);
  await pollJob(client, promptId, { timeoutMs: options.timeoutMs });
  return landRunArtifact(client, {
    promptId,
    destDir: options.destDir,
    workflowId: options.workflowId,
    generation: options.generation,
    lookupGpuSeconds: options.lookupGpuSeconds,
  });
}
