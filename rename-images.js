import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function removeVietnamese(str) {
    // Normalize and remove diacritics
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Handle đ/Đ
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    // Remove special chars
    str = str.replace(/[^a-zA-Z0-9\s\-\.]/g, '');
    // Spaces to dash
    str = str.replace(/\s+/g, '-');
    // Clean dashes
    str = str.replace(/-+/g, '-');
    return str;
}

const mapping = {};
const folders = ['public/hdsd', 'public/faqs'];

console.log('Starting rename...\n');

folders.forEach(folderPath => {
    if (!fs.existsSync(folderPath)) {
        console.log(`Skip: ${folderPath}`);
        return;
    }

    console.log(`Processing: ${folderPath}`);
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const fullPath = path.join(folderPath, file);
        const stats = fs.statSync(fullPath);

        if (!stats.isFile()) return;
        if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) return;

        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        const newBaseName = removeVietnamese(baseName);
        let newFileName = newBaseName + ext;

        if (file === newFileName) {
            console.log(`  OK: ${file}`);
            return;
        }

        let newPath = path.join(folderPath, newFileName);
        let counter = 1;

        while (fs.existsSync(newPath) && newPath !== fullPath) {
            newFileName = `${newBaseName}-${counter}${ext}`;
            newPath = path.join(folderPath, newFileName);
            counter++;
        }

        try {
            fs.renameSync(fullPath, newPath);
            const oldRel = fullPath.replace(/\\/g, '/');
            const newRel = newPath.replace(/\\/g, '/');
            mapping[oldRel] = newRel;
            console.log(`  RENAMED: ${file} -> ${newFileName}`);
        } catch (err) {
            console.log(`  FAILED: ${file}`);
        }
    });

    console.log('');
});

fs.writeFileSync('image-rename-mapping.json', JSON.stringify(mapping, null, 2));
console.log(`Done! Renamed ${Object.keys(mapping).length} files`);
console.log('Next: node update-json-paths.js');
