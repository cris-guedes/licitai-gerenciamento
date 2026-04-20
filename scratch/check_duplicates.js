
const fs = require('fs');
const payloads = JSON.parse(fs.readFileSync('c:/Users/cristian/Desktop/licitai-gerenciamento/temp/288c7118-04eb-4438-bb0a-dde30b8e1a40/field-payloads.json', 'utf8'));

const counts = new Map();
const duplicates = [];

payloads.forEach((p, i) => {
    const key = JSON.stringify({
        page: p.page,
        section: p.section,
        header: p.header,
        text: p.text
    });
    
    if (counts.has(key)) {
        duplicates.push({ index: i, original: counts.get(key), data: p });
    } else {
        counts.set(key, i);
    }
});

console.log(`Total payloads: ${payloads.length}`);
console.log(`Unique payloads: ${counts.size}`);
console.log(`Duplicate count: ${duplicates.length}`);

if (duplicates.length > 0) {
    console.log('\nExample Duplicate:');
    console.log(JSON.stringify(duplicates[0], null, 2));
}
