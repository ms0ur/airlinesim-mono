import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SRC_DIR = join(import.meta.dir, '../src');
const DIRS = ['core', 'definitions', 'engine', 'events'];

async function scanFiles(dir: string): Promise<string[]> {
    const files = await readdir(dir, { withFileTypes: true, recursive: true });
    return files
        .filter(f => f.isFile() && f.name.endsWith('.ts') && f.name !== 'index.ts')
        .map(f => join(f.parentPath, f.name));
}

async function generate() {
    console.log('Generating exports for aivents...');

    const mainExports: string[] = [];

    for (const dir of DIRS) {
        const fullDirPath = join(SRC_DIR, dir);
        const files = await scanFiles(fullDirPath);

        const exports = files.map(file => {
            const relPath = relative(fullDirPath, file)
                .replace(/\.ts$/, '')
                .replace(/\\/g, '/');
            return `export * from './${relPath}';`;
        });

        if (exports.length > 0) {
            const indexPath = join(fullDirPath, 'index.ts');
            await writeFile(indexPath, exports.join('\n') + '\n');
            console.log(`Updated ${join(dir, 'index.ts')}`);
            mainExports.push(`export * from './${dir}';`);
        }
    }

    if (mainExports.length > 0) {
        const mainIndexPath = join(SRC_DIR, 'index.ts');
        await writeFile(mainIndexPath, mainExports.join('\n') + '\n');
        console.log('Updated src/index.ts');
    }

    console.log('Done!');
}

generate().catch(console.error);
