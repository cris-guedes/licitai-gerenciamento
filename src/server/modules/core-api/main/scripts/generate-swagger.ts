console.log('1. Importing dotenv...');
import 'dotenv/config';
console.log('2. Importing app factory...');
import { app as createApp } from '@/app';
console.log('3. Importing fs and path...');
import fs from 'fs';
import path from 'path';

async function generateSwagger() {
    console.log('4. Starting generation process...');

    try {
        const app = await createApp();
        await app.ready();

        // Retrieve the Swagger JSON
        // @ts-ignore - .swagger() is added by @fastify/swagger plugin
        const swagger = app.swagger();

        const outputDir = path.resolve(__dirname, '../../appointments-frontend/docs');
        const outputPath = path.join(outputDir, 'appointments.json');

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(swagger, null, 2));

        console.log(`✅ Swagger specification generated successfully at: ${outputPath}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating Swagger:', error);
        process.exit(1);
    }
}

generateSwagger();
