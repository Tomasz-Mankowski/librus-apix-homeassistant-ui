import { defineConfig } from "vitest/config";

// One ES module with everything inside (Lit included): HACS installs a single file.
export default defineConfig({
  // Caches outside the mounted repo (the build runs in a container, D-012).
  cacheDir: "/tmp/vite-cache",
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "librus-apix-homeassistant-ui.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    fsModuleCachePath: "/tmp/vitest-cache",
  },
});
