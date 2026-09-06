import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TYPES_SRC = path.join(ROOT, 'node_modules/@types/bootstrap/js/dist');
const TYPES_DEST = path.join(ROOT, 'dist/types');
const DIST_ROOT = path.join(ROOT, 'dist');

/**
 * List of component names (without extension).
 * These correspond to files in @types/bootstrap/js/dist/.
 */
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
 * Ensures a directory exists, creating it recursively if needed.
 * @param {string} dir - The directory path.
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - Input string.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Main function:
 * - Copies all .d.ts files from @types/bootstrap/js/dist/ to dist/types/
 * - Creates re-export files for each component with explicit .ts extension
 * - Creates dist/index.d.ts with named exports using .ts extension
 */
function copyTypes() {
    // Check that @types/bootstrap is installed
    if (!fs.existsSync(TYPES_SRC)) {
        console.error(`@types/bootstrap not found at ${TYPES_SRC}`);
        console.error('Please run: npm install --save-dev @types/bootstrap');
        process.exit(1);
    }

    // Create destination directories
    ensureDir(TYPES_DEST);
    ensureDir(DIST_ROOT);

    // Copy all .d.ts files from source to dist/types/
    const files = fs.readdirSync(TYPES_SRC).filter(f => f.endsWith('.d.ts'));
    for (const file of files) {
        const srcPath = path.join(TYPES_SRC, file);
        const destPath = path.join(TYPES_DEST, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file}`);
    }

    // Create re-export files for each component (default export) with .ts extension
    for (const component of COMPONENTS) {
        const exportPath = path.join(DIST_ROOT, `${component}.d.ts`);
        // Use explicit .ts extension to avoid resolution issues in VS Code
        const content = `export { default } from './types/${component}.ts';\n`;
        fs.writeFileSync(exportPath, content);
        console.log(`Created ${component}.d.ts`);
    }

    // Create the main index.d.ts with named exports and .ts extension
    const componentExports = COMPONENTS.map(
        c => `export { default as ${capitalize(c)} } from './types/${c}.ts';`
    ).join('\n');

    const indexContent = [
        '// Re-export component classes',
        componentExports,
        '',
        '// Re-export common types from base-component',
        "export type { GetInstanceFactory, GetOrCreateInstanceFactory, ComponentOptions } from './types/base-component.ts';",
    ].join('\n');

    fs.writeFileSync(path.join(DIST_ROOT, 'index.d.ts'), indexContent);
    console.log('Created index.d.ts');
}

copyTypes();
