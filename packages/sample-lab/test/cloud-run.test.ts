import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  CloudAndonError,
  collectOutputRefs,
  downloadView,
  isApiFormatPrompt,
  isUiFormatGraph,
  landRunArtifact,
  pollJob,
  submitPrompt,
  type CloudRunClient,
} from "../src/index.js";

const API_PROMPT = {
  "1": { class_type: "KSampler", inputs: { seed: 0 } },
};

const UI_GRAPH = {
  nodes: [{ id: 1, type: "KSampler" }],
  links: [],
};

function jsonResponse(body: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

describe("prompt shape", () => {
  it("detects API format vs UI format", () => {
    expect(isApiFormatPrompt(API_PROMPT)).toBe(true);
    expect(isUiFormatGraph(UI_GRAPH)).toBe(true);
    expect(isApiFormatPrompt(UI_GRAPH)).toBe(false);
  });
});

describe("submitPrompt", () => {
  it("andons UI-format graphs instead of converting them", async () => {
    const client: CloudRunClient = { apiKey: "k", fetch: async () => jsonResponse({}) };
    await expect(submitPrompt(client, UI_GRAPH as never)).rejects.toMatchObject({
      name: "CloudAndonError",
      code: "ANDON_UI_FORMAT",
    });
  });

  it("posts API-format prompts and returns prompt_id", async () => {
    const client: CloudRunClient = {
      apiKey: "k",
      fetch: async (input, init) => {
        expect(String(input)).toContain("/api/prompt");
        expect(init?.method).toBe("POST");
        const headers = init?.headers as Record<string, string>;
        expect(headers["X-API-Key"]).toBe("k");
        return jsonResponse({ prompt_id: "job-1" });
      },
    };
    await expect(submitPrompt(client, API_PROMPT)).resolves.toEqual({ promptId: "job-1" });
  });
});

describe("pollJob", () => {
  it("polls until success", async () => {
    const statuses = ["queued_waiting", "executing", "success"];
    const client: CloudRunClient = {
      apiKey: "k",
      sleep: async () => undefined,
      fetch: async () => jsonResponse({ status: statuses.shift() }),
    };
    await expect(pollJob(client, "job-1", { intervalMs: 1 })).resolves.toBe("success");
  });

  it("throws on terminal failure", async () => {
    const client: CloudRunClient = {
      apiKey: "k",
      fetch: async () => jsonResponse({ status: "error" }),
    };
    await expect(pollJob(client, "job-1")).rejects.toBeInstanceOf(CloudAndonError);
  });
});

describe("collectOutputRefs", () => {
  it("collects audio files and inline LUFS text", () => {
    const refs = collectOutputRefs({
      n1: { audio: [{ filename: "a.flac", subfolder: "", type: "output" }] },
      n2: { text: ["Integrated Loudness: -12.32 LUFS"] },
    });
    expect(refs).toHaveLength(2);
    expect(refs[0]!.filename).toBe("a.flac");
    expect(refs[1]!.inlineText).toContain("-12.32");
  });
});

describe("downloadView", () => {
  it("does not forward the API key to the signed URL", async () => {
    const seen: Array<{ url: string; hasKey: boolean }> = [];
    const client: CloudRunClient = {
      apiKey: "secret",
      fetch: async (input, init) => {
        const url = String(input);
        const headers = (init?.headers ?? {}) as Record<string, string>;
        seen.push({ url, hasKey: Boolean(headers["X-API-Key"]) });
        if (url.includes("/api/view")) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://storage.example/file" },
          });
        }
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      },
    };
    const bytes = await downloadView(client, {
      filename: "a.flac",
      subfolder: "",
      type: "output",
    });
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
    expect(seen[0]!.hasKey).toBe(true);
    expect(seen[1]!.url).toContain("storage.example");
    expect(seen[1]!.hasKey).toBe(false);
  });
});

describe("landRunArtifact", () => {
  it("writes files, inline LUFS, and a run manifest without inventing gpu_seconds", async () => {
    const dest = mkdtempSync(join(tmpdir(), "motif-land-"));
    const client: CloudRunClient = {
      apiKey: "k",
      fetch: async (input) => {
        const url = String(input);
        if (url.includes("/api/jobs/")) {
          return jsonResponse({
            id: "job-1",
            status: "completed",
            outputs: {
              save: { audio: [{ filename: "motif_sfx.flac", subfolder: "", type: "output" }] },
              lufs: { text: ["Integrated Loudness: -21.94 LUFS"] },
            },
          });
        }
        if (url.includes("/api/view")) {
          return new Response(null, {
            status: 302,
            headers: { Location: "https://storage.example/file" },
          });
        }
        return new Response(new Uint8Array([70, 76, 65, 67]), { status: 200 });
      },
    };
    const landed = await landRunArtifact(client, { promptId: "job-1", destDir: dest });
    expect(landed.gpuSeconds).toBeUndefined();
    const manifest = JSON.parse(readFileSync(join(dest, "run-manifest.json"), "utf-8")) as {
      gpuSeconds: number | null;
    };
    expect(manifest.gpuSeconds).toBeNull();
    expect(readFileSync(join(dest, "lufs.text.txt"), "utf-8")).toContain("-21.94");
  });
});
