// @ts-check

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

/**
 * Ensures a directory exists; creates it if necessary.
 * @param {string} dir - The directory path.
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main function: copies type definitions from @types/bootstrap and creates re-export files.
 */
function copyTypes() {
    // Validate that @types/bootstrap is installed
    if (!fs.existsSync(TYPES_SRC)) {
        console.error(`@types/bootstrap not found at ${TYPES_SRC}`);
        console.error('Please run: npm install --save-dev @types/bootstrap');
        process.exit(1);
    }

    // Ensure target directories exist
    ensureDir(TYPES_DEST);
    ensureDir(DIST_ROOT);

    // Copy all .d.ts files from the source to the destination
    const files = fs.readdirSync(TYPES_SRC).filter(f => f.endsWith('.d.ts'));
    for (const file of files) {
        const srcPath = path.join(TYPES_SRC, file);
        const destPath = path.join(TYPES_DEST, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file}`);
    }

    // Create re-export files for each component
    for (const component of COMPONENTS) {
        const exportPath = path.join(DIST_ROOT, `${component}.d.ts`);
        const content = `export { default } from './types/${component}';\n`;
        fs.writeFileSync(exportPath, content);
        console.log(`Created ${component}.d.ts`);
    }

    // Create the main index.d.ts that re-exports component classes
    const componentExports = COMPONENTS.map(
        c => `export { default as ${capitalize(c)} } from './types/${c}';`
    ).join('\n');

    const indexContent = [
        '// Re-export component classes',
        componentExports,
        '',
        '// Re-export common types from base-component',
        "export type { GetInstanceFactory, GetOrCreateInstanceFactory, ComponentOptions } from './types/base-component';",
    ].join('\n');

    fs.writeFileSync(path.join(DIST_ROOT, 'index.d.ts'), indexContent);
    console.log('Created index.d.ts');
}

// Execute the function
copyTypes();
