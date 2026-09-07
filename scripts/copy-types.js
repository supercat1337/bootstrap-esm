import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TYPES_SRC = path.join(ROOT, 'node_modules/@types/bootstrap/js/dist');
const TYPES_DEST = path.join(ROOT, 'dist/types');
const DIST_ROOT = path.join(ROOT, 'dist');

const COMPONENTS = [
    'alert',
    'button',
    'carousel',
    'collapse',
    'dropdown',
    'modal',
    'offcanvas',
    'popover',
    'scrollspy',
    'tab',
    'toast',
    'tooltip',
];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Fixes relative imports in .d.ts files by adding .js extension.
 * Also fixes the erroneous import from "./base-component.d".
 * @param {string} content - The content of the .d.ts file.
 * @returns {string} The content with fixed imports.
 */
function fixImports(content) {
    return content.replace(/from\s+(["'])(\.\.?\/[^"']+?)(\1)/g, (match, quote, pathPart) => {
        // Если путь уже заканчивается на .js, .ts, .d.ts или другие расширения — оставляем как есть
        if (pathPart.endsWith('.js') || pathPart.endsWith('.ts') || pathPart.endsWith('.d.ts')) {
            return match;
        }
        if (pathPart.endsWith('.d')) {
            const newPath = pathPart.slice(0, -2) + '.js';
            return `from ${quote}${newPath}${quote}`;
        }
        // Иначе добавляем .js
        return `from ${quote}${pathPart}.js${quote}`;
    });
}

function copyTypes() {
    if (!fs.existsSync(TYPES_SRC)) {
        console.error(`@types/bootstrap not found at ${TYPES_SRC}`);
        console.error('Please run: npm install --save-dev @types/bootstrap');
        process.exit(1);
    }

    ensureDir(TYPES_DEST);
    ensureDir(DIST_ROOT);

    const files = fs.readdirSync(TYPES_SRC).filter(f => f.endsWith('.d.ts'));
    for (const file of files) {
        const srcPath = path.join(TYPES_SRC, file);

        let content = fs.readFileSync(srcPath, 'utf8');
        content = fixImports(content);
        const destPath = path.join(TYPES_DEST, file);
        //console.log("destPath", destPath);
        fs.writeFileSync(destPath, content);
        console.log(`Copied and fixed ${file}`);
    }

    // Create re-export files
    for (const component of COMPONENTS) {
        const exportPath = path.join(DIST_ROOT, `${component}.d.ts`);
        const content = `export { default } from './types/${component}.js';\n`;
        fs.writeFileSync(exportPath, content);
        console.log(`Created ${component}.d.ts`);
    }

    // Create index.d.ts
    const componentExports = COMPONENTS.map(
        c => `export { default as ${capitalize(c)} } from './types/${c}.js';`
    ).join('\n');

    const indexContent = [
        '// Re-export component classes',
        componentExports,
        '',
        '// Re-export common types from base-component',
        "export type { GetInstanceFactory, GetOrCreateInstanceFactory, ComponentOptions } from './types/base-component.js';",
    ].join('\n');

    fs.writeFileSync(path.join(DIST_ROOT, 'index.d.ts'), indexContent);
    console.log('Created index.d.ts');
}

copyTypes();
