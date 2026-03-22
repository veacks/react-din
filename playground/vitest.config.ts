import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@din/react': resolve(__dirname, '../packages/react/src/index.ts'),
            '@din/vanilla': resolve(__dirname, '../packages/vanilla/src/index.ts'),
            'react-din': resolve(__dirname, '../packages/react-din/src/index.ts'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/unit/**/*.spec.ts', 'tests/unit/**/*.spec.tsx'],
        setupFiles: ['./vitest.setup.ts'],
    },
});
