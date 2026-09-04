// @ts-check
import esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const entry = path.join(ROOT, 'src/index.js');
const outFile = path.join(ROOT, 'dist/index.esm.js');

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
