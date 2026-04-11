import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const exampleDir = path.dirname(fileURLToPath(import.meta.url))
const reactDinRoot = path.resolve(exampleDir, '..')
const dinAudioWorkletShimPath = path.resolve(exampleDir, 'shims/loadDinAudioWorklet.ts')

/** Rollup regex alias + absolute `replacement` can resolve to `../` + abs path (ENOENT). Use resolveId. */
function dinAudioWorkletShimPlugin(): Plugin {
  return {
    name: 'din-audio-worklet-shim',
    enforce: 'pre',
    resolveId(id) {
      const withoutQuery = id.split('?')[0].replace(/\\/g, '/')
      if (!withoutQuery.includes('/runtime/wasm/loadDinAudioWorklet')) return null
      if (withoutQuery.includes('/shims/loadDinAudioWorklet')) return null
      if (/\/runtime\/wasm\/loadDinAudioWorklet(\.|$)/.test(withoutQuery)) {
        return dinAudioWorkletShimPath
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [dinAudioWorkletShimPlugin(), react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // Ensure we use the same React instance everywhere
      { find: 'react', replacement: path.resolve(exampleDir, '../node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(exampleDir, '../node_modules/react-dom') },
      // Subpaths must map to source (package.json "exports" point at dist/)
      {
        find: '@open-din/react/nodes',
        replacement: path.resolve(reactDinRoot, 'src/nodes/index.ts'),
      },
      {
        find: '@open-din/react/sources',
        replacement: path.resolve(reactDinRoot, 'src/sources/index.ts'),
      },
      {
        find: '@open-din/react/synths',
        replacement: path.resolve(reactDinRoot, 'src/synths/index.ts'),
      },
      {
        find: '@open-din/react/analyzers',
        replacement: path.resolve(reactDinRoot, 'src/analyzers/index.ts'),
      },
      { find: '@open-din/react', replacement: path.resolve(reactDinRoot, 'src/index.ts') },
      {
        find: 'din-wasm',
        replacement: path.resolve(exampleDir, '../../din-core/crates/din-wasm/pkg'),
      },
    ],
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
        reactDinRoot,
        path.resolve(exampleDir, '../../din-core'),
      ],
    },
  },
})
