import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    platform: 'node',
    target: 'es2022',
    external: [],
    noExternal: ['ws'],
    outExtension() {
        return {
            js: '.cjs',
        };
    },
    esbuildOptions(options) {
        options.jsx = 'automatic';
    },
});
