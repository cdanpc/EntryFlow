import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { "@/auth": path.resolve(root, "auth.ts"), "@": path.resolve(root, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
