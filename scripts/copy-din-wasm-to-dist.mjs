import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const pkgRoot = path.dirname(require.resolve('din-wasm/package.json'));
const wasmSrc = path.join(pkgRoot, 'din_wasm_bg.wasm');
const dest = path.join(__dirname, '../dist/runtime/wasm/din_wasm_bg.wasm');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(wasmSrc, dest);
