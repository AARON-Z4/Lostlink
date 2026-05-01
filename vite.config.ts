/**
 * vite.config.ts
 *
 * Replaces @lovable.dev/vite-tanstack-config to eliminate the
 * lovable-tagger -> tailwindcss@v3 conflict that broke the CSS.
 *
 * Includes ALL required plugins in the correct order:
 *  1. tanstackStart  – TanStack Start SSR engine (must be first)
 *  2. tailwindcss    – Tailwind v4 CSS processing
 *  3. react          – React fast-refresh
 *  4. tsconfigPaths  – @/ alias resolution
 */
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // TanStack Start SSR plugin — Vercel preset is in app.config.ts
    tanstackStart(),

    // Tailwind v4 — must come before react to process CSS first
    tailwindcss(),

    // React fast-refresh
    react(),

    // @/ path alias from tsconfig.json
    tsconfigPaths(),
  ],
  server: {
    port: 8080,
    strictPort: false,
  },
});
