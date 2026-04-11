import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure we use the same React instance everywhere
      'react': path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
      // Use local source for @open-din/react during demo development
      '@open-din/react': path.resolve(__dirname, '../src/index.ts'),
      // Resolve like the library: same pkg path as react-din/package.json (monorepo)
      'din-wasm': path.resolve(__dirname, '../../din-core/crates/din-wasm/pkg'),
    },
  },
  // Let WASM load via fetch(instantiateStreaming); avoid corrupting the bindgen wrapper in pre-bundle
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['din-wasm'],
  },
  assetsInclude: ['**/*.wasm'],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, '..'),
        path.resolve(__dirname, '../../din-core'),
      ],
    },
  },
})
