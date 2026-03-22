import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const cargoToml = path.join(root, 'core', 'Cargo.toml');

if (!fs.existsSync(cargoToml)) {
    console.error('Missing Rust crate manifest at core/Cargo.toml');
    process.exit(1);
}

const cargoVersion = spawnSync('cargo', ['--version'], { cwd: root, encoding: 'utf8' });
if (cargoVersion.status !== 0) {
    console.warn('[din-core] cargo not found; using the checked-in TypeScript fallback bridge.');
    process.exit(0);
}

const testRun = spawnSync('cargo', ['test', '--offline', '--manifest-path', cargoToml, '--quiet'], {
    cwd: root,
    stdio: 'inherit',
});

if (testRun.status !== 0) {
    process.exit(testRun.status ?? 1);
}

const buildRun = spawnSync('cargo', ['build', '--offline', '--manifest-path', cargoToml, '--quiet'], {
    cwd: root,
    stdio: 'inherit',
});

if (buildRun.status !== 0) {
    process.exit(buildRun.status ?? 1);
}

console.log('[din-core] Rust crate built successfully. Runtime bridge remains on the TypeScript fallback unless a generated WASM backend is registered.');
