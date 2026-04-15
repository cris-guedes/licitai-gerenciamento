const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Simple mock for the provider to get the text if we can't import correctly
// Actually, I'll try to require the compiled version if it exists
const pdfPath = 'temp/fa429de6-5510-4c0b-8657-7a82010f40a5/original.pdf';

if (!fs.existsSync(pdfPath)) {
    console.error('PDF not found!');
    process.exit(1);
}

// Since I can't easily run the full TS provider here, I'll try to use a simpler way
// to see the text if I can find any other text files in the temp folder.
// Wait, I saw "content.md" but it was empty. 
// Let's see if there are other files in other session folders.
console.log('Searching for text in all session folders...');
const tempDir = 'temp';
const dirs = fs.readdirSync(tempDir).filter(f => fs.lstatSync(path.join(tempDir, f)).isDirectory());

for (const dir of dirs) {
    const contentPath = path.join(tempDir, dir, 'content.md');
    if (fs.existsSync(contentPath)) {
        const stats = fs.statSync(contentPath);
        if (stats.size > 0) {
            console.log(`Found content in ${contentPath} (${stats.size} bytes)`);
            const content = fs.readFileSync(contentPath, 'utf8');
            console.log(content.slice(0, 1000));
        }
    }
}
