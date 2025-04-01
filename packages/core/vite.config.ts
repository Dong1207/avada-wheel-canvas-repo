import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LuckyCanvas',
      formats: ['es'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          'lucky-canvas': 'LuckyCanvas'
        }
      }
    },
    sourcemap: true
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts']
    })
  ],
  server: {
    port: 3002,
    open: '/examples/wheel.html'
  }
}) 