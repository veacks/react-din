import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredFiles = [
    'core/Cargo.toml',
    'core/src/lib.rs',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length > 0) {
    console.error('din-core validation failed:');
    missing.forEach((file) => console.error(`- missing ${file}`));
    process.exit(1);
}

const cargoVersion = spawnSync('cargo', ['--version'], { cwd: root, encoding: 'utf8' });
if (cargoVersion.status !== 0) {
    console.warn('[din-core] cargo not found; validated checked-in crate files only.');
    process.exit(0);
}

const testRun = spawnSync('cargo', ['test', '--offline', '--manifest-path', path.join(root, 'core', 'Cargo.toml'), '--quiet'], {
    cwd: root,
    stdio: 'inherit',
});

process.exit(testRun.status ?? 1);
