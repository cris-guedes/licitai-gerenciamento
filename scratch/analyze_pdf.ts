import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DocumentHandlerFileParsingProvider } from './src/server/shared/infra/providers/file-parsing/document-handler-file-parsing-provider';

dotenv.config();

async function main() {
    const provider = new DocumentHandlerFileParsingProvider();
    const sessionId = 'analysis-session';
    const pdfPath = 'temp/fa429de6-5510-4c0b-8657-7a82010f40a5/original.pdf';
    
    if (!fs.existsSync(pdfPath)) {
        console.error('PDF not found!');
        return;
    }

    const buffer = fs.readFileSync(pdfPath);
    console.log(`Parsing ${pdfPath}...`);
    
    const { response } = await provider.process(buffer, 'test.pdf');
    
    let fullText = '';
    for (const page of response.pages) {
        fullText += `\n\n--- Page ${page.page} ---\n\n`;
        fullText += page.chunks.map(c => c.text).join('\n');
    }

    fs.writeFileSync('temp/full_text_analysis.txt', fullText);
    console.log('Full text saved to temp/full_text_analysis.txt');
}

main().catch(console.error);
