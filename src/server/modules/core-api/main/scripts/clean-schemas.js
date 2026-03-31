const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up generated schemas...');

const useCasesDir = path.join(__dirname, '..', 'src', 'domain', 'use-cases');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let deletedCount = 0;

walkDir(useCasesDir, (filePath) => {
    if (path.basename(filePath).endsWith('ControllerSchemas.ts')) {
        fs.unlinkSync(filePath);
        deletedCount++;
    }
});

console.log(`✅ Cleaned up ${deletedCount} schema files.`);
