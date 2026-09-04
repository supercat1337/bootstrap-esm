import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const TEMP_TYPES_DIR = path.join(ROOT, 'dist/types-temp/src');
const OUTPUT_FILE = path.join(ROOT, 'dist/types.d.ts');
const INDEX_JS = path.join(ROOT, 'src/index.js');

function getPublicExports() {
    const content = fs.readFileSync(INDEX_JS, 'utf8');
    const regex = /export\s*\{\s*default\s+as\s+(\w+)\s*}\s*from\s*['"][^'"]+['"]/g;
    const names = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        names.push(match[1]);
    }
    return names;
}

function orderFiles(files) {
    const isUtil = f =>
        f.includes(path.sep + 'util' + path.sep) || f.includes(path.sep + 'dom' + path.sep);
    return files.sort((a, b) => {
        const baseA = path.basename(a);
        const baseB = path.basename(b);
        if (baseA === 'config.d.ts') return -1;
        if (baseB === 'config.d.ts') return 1;
        if (baseA === 'base-component.d.ts') return -1;
        if (baseB === 'base-component.d.ts') return 1;
        const aUtil = isUtil(a);
        const bUtil = isUtil(b);
        if (aUtil && !bUtil) return -1;
        if (!aUtil && bUtil) return 1;
        return a.localeCompare(b);
    });
}

function bundleTypes() {
    if (!fs.existsSync(TEMP_TYPES_DIR)) {
        console.error(`Types temp directory not found: ${TEMP_TYPES_DIR}`);
        console.error('Run "npm run create_types" first or check tsc output.');
        process.exit(1);
    }

    const allFiles = fs
        .readdirSync(TEMP_TYPES_DIR, { recursive: true })
        .filter(file => typeof file === 'string' && file.endsWith('.d.ts'))
        .map(file => path.join(TEMP_TYPES_DIR, file).replace(/\\/g, '/'));

    const indexFile = path.join(TEMP_TYPES_DIR, 'index.d.ts');

    let files = allFiles
        .filter(f => f !== indexFile)
        .filter(f => !/\b(dom|util\/index.d.ts|util\/sanitizer.d.ts)\b/.test(f));
    files = orderFiles(files);

    console.log(`Found ${files.length} type files to bundle...`);

    let finalContent = '';

    for (const filePath of files) {
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Remove all relative imports, and all imports (we'll add Popper manually)
        const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?/gm;
        let newContent = content.replace(importRegex, '');

        // 2. Remove export default, export { ... }, export * from
        newContent = newContent.replace(/^export\s+default\s+\w+;?/gm, '');
        newContent = newContent.replace(
            /^export\s*\{\s*[^}]*\s*\}\s*(from\s*['"][^'"]+['"])?\s*;?/gm,
            ''
        );
        newContent = newContent.replace(/^export\s+\*\s+from\s+['"][^'"]+['"]\s*;?/gm, '');

        // 3. Remove remaining 'export' modifiers
        newContent = newContent.replace(/^export\s+/gm, '');

        // 4. Add 'declare' to top-level declarations (outside braces)
        const lines = newContent.split('\n');
        const resultLines = [];
        let braceDepth = 0;
        for (let line of lines) {
            const trimmed = line.trim();
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            braceDepth += openBraces - closeBraces;

            if (braceDepth === 0 && trimmed) {
                // Check if it's a declaration without declare/export
                const declarationMatch = trimmed.match(/^(declare|export)\s+/);
                if (!declarationMatch) {
                    const keywordMatch = trimmed.match(
                        /^\s*((?:abstract\s+)?(?:class|function|interface|type|namespace|enum|const|let|var))\s+/
                    );
                    if (keywordMatch) {
                        const indent = line.match(/^\s*/)[0];
                        const rest = line.trimStart();
                        resultLines.push(indent + 'declare ' + rest);
                        continue;
                    }
                }
            }
            resultLines.push(line);
        }
        newContent = resultLines.join('\n');

        // 5. Fix type mistakes: :array -> any[], :elem -> any
        newContent = newContent.replace(/:\s*array\b/g, ': any[]');
        newContent = newContent.replace(/:\s*elem\b/g, ': any');

        // 6. Remove erroneous static get NAME(): void in Config
        newContent = newContent.replace(/static\s+get\s+NAME\(\s*\)\s*:\s*void\s*;?/g, '');

        // 7. Fix Popover _getContentForTemplate to avoid conflict with Tooltip
        newContent = newContent.replace(
            /_getContentForTemplate\(\)\s*:\s*\{[^}]*\}/,
            '_getContentForTemplate(): any'
        );

        // 8. Clean up blank lines
        newContent = newContent.replace(/\n{3,}/g, '\n\n').trim();

        if (newContent) {
            const relativePath = path.relative(TEMP_TYPES_DIR, filePath);
            finalContent += `/* From ${relativePath} */\n${newContent}\n\n`;
        }
    }

    // Add Popper import at the very beginning (always)
    finalContent = `import Popper from "@popperjs/core";\n\n` + finalContent;

    // Add explicit exports for public classes
    const publicClasses = getPublicExports();
    if (publicClasses.length > 0) {
        finalContent += `export { ${publicClasses.join(', ')} };\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, finalContent);
    console.log(`Bundle created: ${OUTPUT_FILE}`);
}

bundleTypes();
