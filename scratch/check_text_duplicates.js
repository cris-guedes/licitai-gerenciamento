
const fs = require('fs');
const payloads = JSON.parse(fs.readFileSync('c:/Users/cristian/Desktop/licitai-gerenciamento/temp/288c7118-04eb-4438-bb0a-dde30b8e1a40/field-payloads.json', 'utf8'));

const textCounts = new Map();
const textDuplicates = [];

payloads.forEach((p, i) => {
    const text = p.text.trim();
    if (textCounts.has(text)) {
        textDuplicates.push({ index: i, original: textCounts.get(text), text: text.substring(0, 100) + '...' });
    } else {
        textCounts.set(text, i);
    }
});

console.log(`Total payloads: ${payloads.length}`);
console.log(`Unique text contents: ${textCounts.size}`);
console.log(`Duplicate text count: ${textDuplicates.length}`);

if (textDuplicates.length > 0) {
    console.log('\nExample Text Duplicate:');
    console.log(JSON.stringify(textDuplicates[0], null, 2));
}
