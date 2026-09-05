// @ts-check
import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const entry = path.join(ROOT, 'src/index.js');
const outFile = path.join(ROOT, 'dist/index.esm.js');
const initEntry = path.join(ROOT, 'src/init.js');
const initOut = path.join(ROOT, 'dist/init.js');

// 1. Основной бандл (без side-effects)
await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: 'neutral',
    legalComments: 'none',
    outfile: outFile,
    sourcemap: false,
    minify: false,
    metafile: true,
    external: ['@popperjs/core'],
    format: 'esm',
    target: 'ES2024',
    ignoreAnnotations: false,
});

// 2. Бандл инициализации
if (fs.existsSync(initEntry)) {
    await esbuild.build({
        entryPoints: [initEntry],
        bundle: true,
        platform: 'neutral',
        legalComments: 'none',
        outfile: initOut,
        sourcemap: false,
        minify: false,
        external: ['@popperjs/core'],
        format: 'esm',
        target: 'ES2024',
    });
} else {
    console.warn('src/init.js not found, skipping init bundle');
}

// 3. Замена пути Popper
function replacePopperPath(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /from\s+["']@popperjs\/core["']/g,
        `from "@popperjs/core/dist/esm/index.js"`
    );
    fs.writeFileSync(file, content);
}

replacePopperPath(outFile);
if (fs.existsSync(initOut)) {
    replacePopperPath(initOut);
}
