import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import {resolve} from "path";
import {fileURLToPath} from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.jsx"],
    }),
  ],
  resolve: {
    alias: {
      // Alias để import từ thư mục lib
      "@lib": resolve(__dirname, "src/lib"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.jsx"),
      name: "AvadaWheelCanvasReact",
      formats: ["es", "umd"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
  },
  server: {
    port: 3001,
    open: true,
  },
});
