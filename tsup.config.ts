import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'packages/react-din/src/index.ts',
        'core/index': 'packages/react-din/src/core/index.ts',
        'nodes/index': 'packages/react-din/src/nodes/index.ts',
        'transport/index': 'packages/react-din/src/transport/index.ts',
        'sequencer/index': 'packages/react-din/src/sequencer/index.ts',
        'analyzers/index': 'packages/react-din/src/analyzers/index.ts',
        'sources/index': 'packages/react-din/src/sources/index.ts',
        'effects/index': 'packages/react-din/src/effects/index.ts',
        'midi/index': 'packages/react-din/src/midi/index.ts',
        'patch/index': 'packages/react-din/src/patch/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ['react', 'react-dom', '@din/react'],
    esbuildOptions(options) {
        options.jsx = 'automatic';
    },
});
