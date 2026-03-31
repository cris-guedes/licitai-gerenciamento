const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generating Resolved TypeBox schemas from Controllers...');

const useCasesDir = path.join(__dirname, '..', 'src', 'domain', 'use-cases');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let processedCount = 0;
const controllers = [];

walkDir(useCasesDir, (filePath) => {
    const fileName = path.basename(filePath);
    if (fileName.endsWith('Controller.ts') && !fileName.startsWith('make')) {
        // Use relative paths and forward slashes for better cross-platform support
        const relativeInput = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

        console.log(`  ✓ Processing: ${fileName}`);

        try {
            // Run Intelligent Resolver
            execSync(`npx ts-node --transpile-only -r tsconfig-paths/register scripts/generate-resolved-schemas.ts --file "${relativeInput}"`, {
                stdio: 'inherit'
            });
            processedCount++;

            // Collect controller info for registry
            // filePath is absolute. We need relative path from src/main/config/schemas.ts to the controller schema
            // Schema file is same as controller but with 'Schemas.ts' suffix
            const schemaFilePath = filePath.replace('.ts', 'Schemas.ts');
            controllers.push({
                name: fileName.replace('.ts', ''), // e.g. LoginController
                path: schemaFilePath
            });

        } catch (error) {
            console.error(`  ✗ Error processing ${fileName}:`);
            console.error(error.message);
        }
    }
});

// Generate Registry File
if (controllers.length > 0) {
    console.log('\n📦 Generating Schema Registry...');
    const registryPath = path.join(__dirname, '..', 'src', 'main', 'config', 'schemas.ts');

    const imports = controllers.map(c => {
        // Calculate relative path from src/main/config to the schema file
        // c.path is absolute
        const configDir = path.dirname(registryPath);
        let relPath = path.relative(configDir, c.path).replace(/\\/g, '/');
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        relPath = relPath.replace('.ts', ''); // Remove extension for import
        return `import { ${c.name} } from '${relPath}';`;
    }).join('\n');

    const fileContent = `import { FastifyInstance } from 'fastify';
import { AuthHeaders } from '../../domain/shared/HeaderTypes';

${imports}

export const schemas = [
    AuthHeaders,
${controllers.map(c => `    ${c.name}.Headers,
    ${c.name}.Body,
    ${c.name}.Response,
    ${c.name}.Params,
    ${c.name}.Query`).join(',\n')}
].filter((s): s is any => !!s && s.type !== 'null' && typeof s === 'object');

export const registerGlobalSchemas = (app: FastifyInstance) => {
    schemas.forEach(schema => {
        if (schema) app.addSchema(schema);
    });
};
`;

    fs.writeFileSync(registryPath, fileContent);
    console.log(`✅ Registry generated at ${registryPath}`);
}

console.log(`\n✅ Done! Generated ${processedCount} schemas.`);
console.log('📚 Next: Ensure registerGlobalSchemas is called in app.ts');
