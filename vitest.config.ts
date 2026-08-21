import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /**
     * Delegate to each workspace package's own vitest.config.ts rather than
     * re-globbing test files here.
     *
     * The previous root config globbed `*.test.ts` only. That silently excluded
     * apps/studio's 7 `.test.tsx` component suites — 93 tests covering playback,
     * preview, export, keyboard shortcuts, the error boundary and save — while
     * still reporting a green run. CI runs `pnpm vitest run --coverage` against
     * THIS file, so those suites were not gating anything.
     *
     * Re-globbing to include `.tsx` was not enough on its own: those suites need
     * jsdom, a setup file and the React plugin, all of which already live in
     * apps/studio/vitest.config.ts. Delegating picks up the right environment
     * per package and keeps one source of truth for each package's own config.
     */
    projects: ["packages/*", "apps/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/test/**", "**/node_modules/**"],
    },
  },
});
