import {defineConfig} from "vite";
import dts from "vite-plugin-dts";
import {resolve} from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AvadaWheelCanvas",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format === "umd" ? "umd" : "esm"}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          "avada-wheel-canvas": "AvadaWheelCanvas",
        },
      },
    },
    minify: "esbuild",
    sourcemap: true,
    target: "esnext",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
    }),
  ],
  server: {port: 3002},
});
