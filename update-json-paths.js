import fs from 'fs';

const jsonFile = 'src/data/leafContent.json';
const mappingFile = 'image-rename-mapping.json';

if (!fs.existsSync(mappingFile)) { console.log('Run rename-images.js first!'); process.exit(1); }
if (!fs.existsSync(jsonFile)) { console.log('JSON not found!'); process.exit(1); }

const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
let jsonContent = fs.readFileSync(jsonFile, 'utf8');
let updateCount = 0;

console.log('Updating JSON paths...\n');

Object.keys(mapping).forEach(oldPath => {
    const newPath = mapping[oldPath];
    const oldJsonPath = oldPath.replace(/^public\//, '');
    const newJsonPath = newPath.replace(/^public\//, '');
    const escapedOld = oldJsonPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOld, 'g');
    if (regex.test(jsonContent)) {
        jsonContent = jsonContent.replace(regex, newJsonPath);
        updateCount++;
        console.log(`  ${oldJsonPath} -> ${newJsonPath}`);
    }
});

if (updateCount > 0) {
    fs.copyFileSync(jsonFile, `${jsonFile}.backup`);
    fs.writeFileSync(jsonFile, jsonContent, 'utf8');
    console.log(`\nUpdated ${updateCount} paths. Backup created.`);
} else {
    console.log('\nNo updates needed');
}
