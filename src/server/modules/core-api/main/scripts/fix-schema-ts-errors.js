const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root of backend
const rootDir = path.join(__dirname, '../src');

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walk(filePath, fileList);
        } else {
            if (file.endsWith('ControllerSchemas.ts')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const files = walk(rootDir);
let fixedCount = 0;

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');

    // Pattern: (SomeController.Body.type !== 'null')
    // We want to replace it with ((SomeController.Body as any).type !== 'null')

    // We use a regex that captures the variable name
    // Matches: && (MyController.Body.type !== 'null')
    const regex = /&&\s*\(([^)]+)\.Body\.type\s*!==\s*'null'\)/g;

    if (regex.test(content)) {
        const newContent = content.replace(regex, (match, controllerName) => {
            return `&& ((${controllerName}.Body as any).type !== 'null')`;
        });

        // Also fix Query and Params if they exist with similar pattern?
        // The error log showed them too. Pattern is usually: 
        // && (Controller.Part.type !== 'null')

        const genericRegex = /&&\s*\(([^)]+)\.(Body|Query|Params)\.type\s*!==\s*'null'\)/g;
        const finalContent = newContent.replace(genericRegex, (match, controller, part) => {
            return `&& ((${controller}.${part} as any).type !== 'null')`;
        });

        if (content !== finalContent) {
            fs.writeFileSync(filePath, finalContent);
            console.log(`Fixed: ${path.relative(rootDir, filePath)}`);
            fixedCount++;
        }
    }
});

console.log(`\n✅ Fixed ${fixedCount} files.`);
