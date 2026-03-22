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
      'react': path.resolve(__dirname, '../../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../../node_modules/react-dom'),
      '@din/react': path.resolve(__dirname, '../src/index.ts'),
      '@din/vanilla': path.resolve(__dirname, '../../vanilla/src/index.ts'),
      'react-din': path.resolve(__dirname, '../../react-din/src/index.ts'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
