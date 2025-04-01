import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactLuckyCanvas',
      formats: ['es'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: ['react', 'lucky-canvas'],
      output: {
        globals: {
          react: 'React',
          'lucky-canvas': 'LuckyCanvas'
        }
      }
    },
    sourcemap: true
  },
  server: {
    port: 3001
  }
}) 