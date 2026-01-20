import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@prisma/client', '.prisma/client']
      })
    ],
    build: {
      rollupOptions: {
        external: [
          'better-sqlite3',
          'playwright',
          'playwright-core',
          /^chromium-bidi.*/,
          /^playwright.*/
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@': resolve('src/renderer'),
        '@renderer': resolve('src/renderer')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: 'src/renderer/index.html'
      }
    }
  }
})
