import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

const pkgRoot = __dirname;
const reactSubpaths = [
    'core',
    'nodes',
    'transport',
    'sequencer',
    'analyzers',
    'sources',
    'effects',
    'midi',
    'data',
    'patch',
    'routing',
    'notes',
    'synths',
    'utils',
] as const;

const subpathAliases = Object.fromEntries(
    reactSubpaths.map((sub) => [`@open-din/react/${sub}`, resolve(pkgRoot, `src/${sub}/index.ts`)])
);

export default defineConfig({
    resolve: {
        alias: {
            // Bare `@open-din/react` must not be the only alias, or `@open-din/react/foo` fails to resolve in tests.
            ...subpathAliases,
            '@open-din/react': resolve(pkgRoot, 'src/index.ts'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
        setupFiles: ['./vitest.setup.ts'],
    },
});
