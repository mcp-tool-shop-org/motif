import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Workspace health tests — validate monorepo consistency across all packages.
 */

const ROOT = resolve(__dirname, "..", "..", "..");

interface PkgJson {
  name: string;
  version: string;
  license?: string;
  author?: string;
  repository?: { url?: string; directory?: string } | string;
  type?: string;
  main?: string;
  types?: string;
}

function loadRootPkg(): PkgJson {
  return JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
}

function loadWorkspacePackages(): { dir: string; pkg: PkgJson }[] {
  const result: { dir: string; pkg: PkgJson }[] = [];
  for (const base of ["packages", "apps"]) {
    const baseDir = join(ROOT, base);
    if (!existsSync(baseDir)) continue;
    for (const name of readdirSync(baseDir)) {
      const pkgPath = join(baseDir, name, "package.json");
      if (existsSync(pkgPath)) {
        result.push({
          dir: join(baseDir, name),
          pkg: JSON.parse(readFileSync(pkgPath, "utf-8")),
        });
      }
    }
  }
  return result;
}

describe("Workspace health", () => {
  const rootPkg = loadRootPkg();
  const workspaces = loadWorkspacePackages();

  it("discovers all workspace packages", () => {
    expect(workspaces.length).toBeGreaterThanOrEqual(16);
  });

  it("all packages use @motif-studio scope", () => {
    for (const { pkg } of workspaces) {
      expect(pkg.name).toMatch(/^@motif-studio\//);
    }
  });

  it("all packages share the same version", () => {
    const versions = new Set(workspaces.map((w) => w.pkg.version));
    expect(versions.size).toBe(1);
  });

  it("all package versions are valid semver", () => {
    for (const { pkg } of workspaces) {
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    }
  });

  it("all package versions are >= 1.0.0", () => {
    for (const { pkg } of workspaces) {
      const major = parseInt(pkg.version.split(".")[0]);
      expect(major).toBeGreaterThanOrEqual(1);
    }
  });

  it("all library packages have MIT license", () => {
    const libs = workspaces.filter((w) => w.dir.includes("packages"));
    for (const { pkg } of libs) {
      expect(pkg.license).toBe("MIT");
    }
  });

  it("all library packages have author field", () => {
    const libs = workspaces.filter((w) => w.dir.includes("packages"));
    for (const { pkg } of libs) {
      expect(pkg.author).toBeTruthy();
    }
  });

  it("all packages use ESM (type: module)", () => {
    for (const { pkg } of workspaces) {
      expect(pkg.type).toBe("module");
    }
  });

  it("CHANGELOG mentions current version", () => {
    const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf-8");
    const version = workspaces[0].pkg.version;
    expect(changelog).toContain(version);
  });
});
