import type { ChunkedDocumentResultItem } from "@/server/shared/lib/docling/models/ChunkedDocumentResultItem";

const PAGE_BREAK_PATTERN = /<!--\s*PAGE_BREAK\s*-->/gi; // fallback — provider já deve ter removido
const COLLAPSE_WHITESPACE = /\s+/g;

/**
 * ChunkPostProcessing — pipeline de pós-processamento de chunks.
 *
 * Ponto central para tratamentos aplicados após o chunking e antes do embedding.
 * Cada etapa é uma função pura e independente, facilitando adição futura de:
 *   - normalização NLP (stopwords, stemming, lemmatização)
 *   - enriquecimento com metadados (entidades, categorias)
 *   - filtragem por domínio
 *   - etc.
 *
 * Etapas atuais:
 *  1. cleanChunk       — strip de PAGE_BREAK e templates de cabeçalho/rodapé por chunk
 *  2. deduplicateList  — remove chunks duplicados ou quase-duplicados por fingerprint
 *  3. filterShort      — descarta chunks abaixo do mínimo de conteúdo útil
 */
export class ChunkPostProcessing {
    /**
     * @param minChunkChars      Mínimo de chars após limpeza para manter o chunk (default: 60)
     * @param templateThreshold  Frequência mínima (0–1) para detectar um ngram como template (default: 0.15)
     * @param templateNgramSize  Tamanho do prefixo (chars) usado na detecção de template (default: 120)
     */
    constructor(
        private readonly minChunkChars     = 5,
        private readonly templateThreshold = 0.05,
        private readonly templateNgramSize = 50,
        private readonly dedupeMinLen      = 60,
    ) {}

    // ─── Pipeline principal ─────────────────────────────────────────────────

    run(chunks: ChunkedDocumentResultItem[]): ChunkPostProcessing.RunResult {
        if (chunks.length === 0) {
            return { chunks: [], removedCount: 0, detectedTemplates: [] };
        }

        const templates = this.detectTemplates(chunks);

        const seen   = new Set<string>();
        const result: ChunkedDocumentResultItem[] = [];
        let removedCount = 0;

        const removedChunksList: string[] = [];

        for (const chunk of chunks) {
            // 1. Limpeza individual
            const cleaned = this.cleanChunk(chunk.text, templates);

            // 2. Deduplicação por fingerprint
            if (!this.deduplicateList(cleaned, seen)) {
                removedCount++;
                removedChunksList.push(`[DEDUPLICATE] ${cleaned.replace(/\n/g, ' ').substring(0, 100)}...`);
                continue;
            }

            // 3. Filtro por tamanho mínimo
            if (!this.filterShort(cleaned)) {
                removedCount++;
                removedChunksList.push(`[SHORT] ${cleaned.replace(/\n/g, ' ').substring(0, 100)}...`);
                continue;
            }

            result.push({ ...chunk, text: cleaned });
        }

        if (removedChunksList.length > 0) {
            console.log(`[ChunkPostProcessing] Chunks removidos detalhados:\n${removedChunksList.map(c => `  - ${c}`).join('\n')}`);
        }

        console.log(
            `[ChunkPostProcessing] ${chunks.length} → ${result.length} chunks` +
            ` (removidos: ${removedCount}, templates detectados: ${templates.length})`
        );

        return { chunks: result, removedCount, detectedTemplates: templates };
    }

    // ─── Etapa 1: limpeza individual ────────────────────────────────────────

    /**
     * Remove PAGE_BREAK e prefixos de template do texto de um chunk individual.
     */
    cleanChunk(text: string, templates: string[]): string {
        let cleaned = text.replace(PAGE_BREAK_PATTERN, "").trim();

        for (const templateNorm of templates) {
            const textNorm = this.normalize(cleaned);
            // Prefix seguro com pelo menos 30 caracteres do template
            const templatePrefix = templateNorm.slice(0, Math.min(30, templateNorm.length));
            const idx = textNorm.indexOf(templatePrefix);

            // Permite lixo de OCR (como um link quebrado) antes do header
            if (idx >= 0 && idx < 100) {
                const endPos = this.findTemplateEnd(cleaned, templateNorm);
                if (endPos > 0) {
                    cleaned = cleaned.slice(endPos).trim();
                }
            }
        }

        return cleaned.trim();
    }

    // ─── Etapa 2: deduplicação de lista ────────────────────────────────────

    deduplicateList(text: string, seen: Set<string>): boolean {
        // Se o texto for muito curto, não deduplicar. 
        // Fragmentos de tabelas (ex: "AMP", "UNID", "Item 1") costumam ser curtos e repetitivos.
        // Removê-los limpa demais os dados e quebra a extração.
        if (text.length < this.dedupeMinLen) return true;

        const fp = this.fingerprint(text);
        if (!fp || seen.has(fp)) return false;
        seen.add(fp);
        return true;
    }

    // ─── Etapa 3: filtro por tamanho ───────────────────────────────────────

    /**
     * Retorna true se o chunk tem conteúdo suficiente para ser útil.
     */
    filterShort(text: string): boolean {
        return text.trim().length >= this.minChunkChars;
    }

    // ─── Detecção de templates ──────────────────────────────────────────────

    private detectTemplates(chunks: ChunkedDocumentResultItem[]): string[] {
        const total     = chunks.length;
        const threshold = Math.max(3, Math.ceil(total * this.templateThreshold));
        const freqMap   = new Map<string, number>();

        for (const chunk of chunks) {
            // Normalizar PRIMEIRO, antes de dar slice, para remover formatações (**, _, quebras)
            const cleanText = this.normalize(chunk.text);
            if (cleanText.length < this.templateNgramSize) continue;

            const candidate = cleanText.slice(0, this.templateNgramSize);
            if (candidate.length < 25) continue;

            freqMap.set(candidate, (freqMap.get(candidate) ?? 0) + 1);
        }

        const templates: string[] = [];

        for (const [candidate, count] of freqMap) {
            if (count >= threshold) {
                // Ao invés de usar apenas os primeiros 50 caracteres do template,
                // vamos descobrir o maior prefixo comum (Longest Common Prefix) 
                // entre todos os chunks que começam com esse candidato.
                const matchingChunks = chunks
                    .map(c => this.normalize(c.text))
                    .filter(t => t.startsWith(candidate));
                
                const fullTemplate = this.findLongestCommonPrefix(matchingChunks);

                if (fullTemplate) {
                    templates.push(fullTemplate);
                    console.log(`[ChunkPostProcessing] Full Template detectado (freq: ${count}/${total}, len: ${fullTemplate.length}): "${fullTemplate.slice(0, 80)}..."`);
                }
            }
        }

        return templates;
    }

    private findLongestCommonPrefix(strings: string[]): string {
        if (!strings.length) return "";
        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (!strings[i].startsWith(prefix) && prefix.length > 0) {
                prefix = prefix.slice(0, prefix.length - 1);
            }
            if (!prefix) break;
        }
        return prefix;
    }

    private findTemplateEnd(text: string, templateNorm: string): number {
        // Encontrar o final do template usando as últimas palavras do texto original normalizado
        const words = templateNorm.split(/\s+/);
        // Pega as últimas 3 palavras significativas
        const lastWords = words.slice(-Math.min(4, words.length)).join(" ");
        
        // Vamos procurar essas palavras ignorando cases, mas preservando o index
        // O `this.normalize` remove muita coisa, vamos usar uma regex simples
        const regexSafe = lastWords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        const match = new RegExp(regexSafe, 'i').exec(text);
        
        if (match) {
            return match.index + match[0].length;
        }
        return Math.min(templateNorm.length + 30, text.length / 2);
    }


    // ─── Utilitários ────────────────────────────────────────────────────────

    private normalize(text: string): string {
        return text
            .replace(/\*\*/g, "")
            .replace(/_/g, "")
            .replace(PAGE_BREAK_PATTERN, "")
            .replace(COLLAPSE_WHITESPACE, " ")
            .toLowerCase()
            .trim();
    }

    private fingerprint(text: string): string {
        // NÃO remova números isolados (\b\d+\b), pois em tabelas de itens (Ex: Item 01 vs Item 02)
        // os números são o único diferencial. 
        return this.normalize(text);
    }
}

export namespace ChunkPostProcessing {
    export type RunResult = {
        chunks:            ChunkedDocumentResultItem[];
        removedCount:      number;
        detectedTemplates: string[];
    };
}
