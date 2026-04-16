import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { EmbeddingProvider } from "@/server/shared/infra/providers/vector/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/vector/flat-vector-store";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type EditalFieldExtractorResult = {
    extraction: Record<string, any>;
    tokensUsed: { prompt: number; completion: number; total: number };
    searchesPerformed: number;
    totalChunksRetrieved: number;
    hits: import("@/server/shared/infra/providers/vector/flat-vector-store").SearchResult[];
};

// ─── Queries de busca — frases-âncora que cobrem todos os campos do edital ────

export const EDITAL_SEARCH_QUERIES = [
    // Identificação / capa / Órgão
    "licitação será regida pela Lei Federal n.º 14.133 Decreto n.º 10.024",
    "objeto Registro de Preços SRP futura eventual aquisição material serviço",
    "valor estimado total contratação R$ referência teto máximo",
    "MUNICÍPIO DE PREFEITURA CNPJ nota fiscal emitidas em nome",
    // Cronograma
    "data hora limite para recebimento das propostas abertura sessão pública",
    "prazo para pedidos de esclarecimentos impugnações antes abertura",
    // Disputa
    "critério de julgamento menor preço modo de disputa aberto",
    "intervalo mínimo de diferença de valores entre os lances deverá ser R$",
    "duração da sessão de disputa minutos encerramento automático",
    // Regras de participação / Lei 123
    "participação de empresas em regime de consórcio não será permitida",
    "microempresa empresa de pequeno porte benefícios Lei Complementar 123 exclusivo",
    "será possível adesão à Ata de Registro de Preços carona conforme Anexo",
    "isenção fiscal Convênio ICMS diferencial de alíquota DIFAL operações internas",
    "visita técnica obrigatória facultativa dispensada instalações",
    // Prazos e vigência
    "prazo de entrega dos bens contados do recebimento do empenho dias",
    "bens serão recebidos provisoriamente no prazo de dias verificação qualidade",
    "pagamento fatura prazo não superior a trinta dias após atesto nota fiscal",
    "prazo de validade da proposta dias abertura",
    "vigência da ata de registro de preços doze meses prorrogação",
    // Garantia / Logística
    "garantia produto assistência técnica sem garantia balcão remota onsite meses",
    "local de entrega depósito almoxarifado secretaria recebimento",
    "local de execução do objeto endereço de realização do evento",
    "local da prestação dos serviços e endereço completo",
    "documentos de habilitação jurídica fiscal social trabalhista regularidade tributária",
    "prova de inscrição no Cadastro Nacional de Pessoas Jurídicas CNPJ",
    "certidão negativa de falência ou recuperação judicial FGTS CNDT",
    "qualificação técnica atestados de capacidade técnica",
    "qualificação econômico-financeira balanço patrimonial",
    // Anexos
    "ANEXO I II III IV V VI Termo de Referência Projeto Básico Minuta da Ata",
];

// ─── Prompt do sistema ─────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `
Você é um especialista em análise de editais de licitação brasileiros.

Analise os chunks de texto recuperados do edital fornecidos abaixo e extraia TODAS as informações estruturadas seguindo o esquema Zod solicitado.

REGRAS DE EXTRAÇÃO:

1.  **DADOS GERAIS DO EDITAL**
    - 'numero': O número do edital/licitação (ex: "Pregão 56/2023"). NÃO CONFUNDA com o número do processo administrativo.
    - 'numero_processo': O número do processo administrativo (ex: "Processo 91/2023").
    - 'modalidade': Identifique se é Pregão Eletrônico, Presencial, Dispensa, etc.
    - 'objeto': Resumo sucinto do que está sendo contratado.
    - 'ano': O ano da licitação (ex: 2023).

2.  **ÓRGÃO GERENCIADOR (CONTRATANTE)**
    - 'nome': Nome completo da prefeitura, secretaria ou autarquia.
    - 'cnpj': O CNPJ do órgão que está contratando (procure no cabeçalho ou no rodapé/assinaturas). Formato: XX.XXX.XXX/XXXX-XX.
    - 'portal': A URL do portal onde as propostas são enviadas (evite o PNCP, procure o portal de disputa como Licitar Digital, BNC, ComprasBR).

3.  **REGRAS E DISPUTA**
    - 'srp': Marque true se houver qualquer menção a "Sistema de Registro de Preços" ou "Ata de Registro de Preços".
    - 'criterio_julgamento': Menor Preço, Maior Desconto, etc.
    - 'exclusivo_me_epp': Marque true se houver cláusula de exclusividade para ME/EPP nos itens (Lei 123/06).
    - 'permite_adesao': Marque true se houver menção à possibilidade de adesão à ata por outros órgãos (carona).

4.  **DOCUMENTOS DE HABILITAÇÃO**
    - Identifique detalhadamente os documentos exigidos. Se houver menção a CNDT, FGTS, Certidão de Falência, etc., agrupe-os corretamente. 
    - Se encontrar regras de habilitação nos chunks, você DEVE extrair os itens, nunca retorne listas vazias se houver conteúdo pertinente.

5.  **LOGÍSTICA E PRAZOS**
    - 'entrega': Determine o prazo de entrega (ex: 10 dias) e o local. Aceite "Local do Evento" ou o endereço de execução se não houver um almoxarifado central.
    - 'pagamento': Prazo para pagamento após o atesto da nota fiscal (ex: 30 dias).
    - 'validade_proposta': Prazo de validade da proposta (comumente 60 ou 90 dias).

- NUNCA invente dados. Use null se não encontrar no texto.
- Itens: deixe o campo "itens" como [].
- Datas: formato de entrada DD/MM/AAAA → saída ISO AAAA-MM-DD.
`.trim();

// ─── Schema de extração ────────────────────────────────────────────────────────

export const EDITAL_FIELD_SCHEMA = z.object({
    edital: z.object({
        numero: z.string().nullable(),
        numero_processo: z.string().nullable(),
        modalidade: z.enum([
            "pregao_eletronico", "pregao_presencial", "dispensa", "inexigibilidade",
            "concorrencia", "tomada_precos", "convite", "leilao", "concurso", "credenciamento",
        ]).nullable(),
        amparo_legal: z.string().nullable(),
        srp: z.boolean().nullable(),
        ano: z.number().nullable(),
        objeto: z.string().nullable(),
        objeto_resumido: z.string().nullable(),
        valor_estimado_total: z.number().nullable(),
        valor_total_homologado: z.number().nullable(),
        situacao: z.string().nullable(),
        data_publicacao: z.string().nullable(),
        data_ultima_atualizacao: z.string().nullable(),
        texto_original: z.string().nullable(),
        orgao_gerenciador: z.object({
            nome: z.string().nullable(),
            cnpj: z.string().nullable(),
            uasg: z.string().nullable(),
            uf: z.string().nullable(),
            cidade: z.string().nullable(),
            esfera: z.enum(["municipal", "estadual", "federal"]).nullable(),
            poder: z.enum(["executivo", "legislativo", "judiciario"]).nullable(),
            nome_unidade: z.string().nullable(),
            portal: z.string().nullable(),
            texto_original: z.string().nullable(),
        }),
        cronograma: z.object({
            data_abertura_propostas: z.string().nullable(),
            data_limite_propostas: z.string().nullable(),
            hora_limite_propostas: z.string().nullable(),
            data_sessao_publica: z.string().nullable(),
            hora_sessao_publica: z.string().nullable(),
            data_limite_esclarecimentos: z.string().nullable(),
            data_limite_impugnacao: z.string().nullable(),
            texto_original: z.string().nullable(),
        }),
        disputa: z.object({
            modo: z.enum(["aberto", "fechado", "aberto_fechado"]).nullable(),
            criterio_julgamento: z.enum([
                "menor_preco", "maior_desconto", "melhor_tecnica", "tecnica_e_preco", "maior_lance",
            ]).nullable(),
            tipo_lance: z.enum(["unitario", "global", "percentual"]).nullable(),
            intervalo_minimo_lances: z.string().nullable(),
            duracao_sessao_minutos: z.number().nullable(),
            texto_original: z.string().nullable(),
        }),
        regras: z.object({
            exclusivo_me_epp: z.boolean().nullable(),
            permite_consorcio: z.boolean().nullable(),
            exige_visita_tecnica: z.boolean().nullable(),
            permite_adesao: z.boolean().nullable(),
            percentual_maximo_adesao: z.number().nullable(),
            regionalidade: z.string().nullable(),
            difal: z.boolean().nullable(),
            vigencia_contrato_dias: z.number().nullable(),
            vigencia_ata_meses: z.number().nullable(),
            texto_original: z.string().nullable(),
        }),
        logistica: z.object({
            local_entrega: z.string().nullable(),
            tipo_entrega: z.enum(["centralizada", "descentralizada"]).nullable(),
            responsavel_instalacao: z.enum(["fornecedor", "comprador"]).nullable(),
            texto_original: z.string().nullable(),
        }),
        prazos: z.object({
            entrega: z.object({ texto_original: z.string().nullable(), dias_corridos: z.number().nullable() }),
            aceite: z.object({ texto_original: z.string().nullable(), dias: z.number().nullable() }),
            pagamento: z.object({ texto_original: z.string().nullable(), dias: z.number().nullable() }),
            validade_proposta_dias: z.number().nullable(),
            texto_original: z.string().nullable(),
        }),
        garantia: z.object({
            tipo: z.enum(["onsite", "balcao", "remota", "sem_garantia"]).nullable(),
            prazo_meses: z.number().nullable(),
            tempo_atendimento_horas: z.number().nullable(),
            texto_original: z.string().nullable(),
        }),
        itens: z.array(z.object({
            numero: z.number(),
            descricao: z.string(),
        })),
        orgaos_participantes: z.array(z.object({
            nome: z.string(),
            cnpj: z.string().nullable(),
            uasg: z.string().nullable(),
            uf: z.string().nullable(),
            cidade: z.string().nullable(),
            itens: z.array(z.object({ item_numero: z.number(), quantidade: z.number() })),
        })),
        documentos_habilitacao: z.object({
            juridica: z.array(z.string()),
            fiscal_trabalhista: z.array(z.string()),
            tecnica: z.array(z.string()),
            economica: z.array(z.string()),
        }),
        observacoes: z.string().nullable(),
    }),
});

// ─── Extrator de campos do edital via busca vetorial ─────────────────────────

export class EditalFieldExtractor {
    private readonly openai: ReturnType<typeof createOpenAI>;
    private readonly model: string;
    private embeddingCache = new Map<string, Float32Array>();

    constructor(
        private readonly embeddingProvider: EmbeddingProvider.Contract,
        private readonly vectorStore: FlatVectorStore.Contract,
    ) {
        this.model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
        this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async warmupEmbeddings(): Promise<void> {
        console.log(`[EditalFieldExtractor] Pré-computando ${EDITAL_SEARCH_QUERIES.length} embeddings em batch...`);
        const embeddings = await this.embeddingProvider.embedMany(EDITAL_SEARCH_QUERIES, true);
        for (let i = 0; i < EDITAL_SEARCH_QUERIES.length; i++) {
            this.embeddingCache.set(EDITAL_SEARCH_QUERIES[i]!, embeddings[i]!);
        }
    }

    async extract(onProgress?: EditalFieldExtractor.ProgressFn): Promise<EditalFieldExtractorResult> {
        const startTime = Date.now();

        // 1. Recuperação paralela com queries de busca pré-computadas
        const queryEmbeddings = await Promise.all(
            EDITAL_SEARCH_QUERIES.map(q => {
                const cached = this.embeddingCache.get(q);
                if (cached) return Promise.resolve(cached);
                return this.embeddingProvider.embedMany([q], true).then(embs => embs[0]!);
            }),
        );

        // topK=60, minScore=0.20 — reduzido para capturar mais seções administrativas em editais variados
        const retrievedChunks = this.vectorStore.multiQuerySearch(queryEmbeddings, 60, 0.20);

        // Força inclusão dos primeiros 15 chunks (capa expandida: UASG, CNPJ, nome, portal, objeto)
        const coverPageChunks = this.vectorStore
            .listByMetadata(() => true)
            .sort((a, b) => (a.metadata?.chunk_index as number ?? 0) - (b.metadata?.chunk_index as number ?? 0))
            .slice(0, 15);

        const retrievedIds = new Set(retrievedChunks.map(h => h.id));
        const forcedCoverEntries = coverPageChunks.filter(h => !retrievedIds.has(h.id));
        const allChunks = [...retrievedChunks, ...forcedCoverEntries];

        const sortedByPosition = [...allChunks].sort(
            (a, b) => (a.metadata?.chunk_index as number ?? 0) - (b.metadata?.chunk_index as number ?? 0),
        );

        const context = sortedByPosition
            .filter(h => h.text)
            .map(h => `[Pág ${h.metadata?.page ?? "?"}] ${h.text}`)
            .join("\n\n---\n\n");

        console.log(
            `[EditalFieldExtractor] Contexto: ${context.length} chars (${retrievedChunks.length} retrieved + ${forcedCoverEntries.length} forced = ${allChunks.length} chunks)`,
        );

        onProgress?.(`${allChunks.length} fragmentos recuperados, extraindo campos com IA...`, 60);

        // 2. Extração em passo único
        const { object, usage } = await generateObject({
            model: this.openai(this.model),
            schema: EDITAL_FIELD_SCHEMA,
            system: SYSTEM_PROMPT,
            prompt: `Analise as informações extraídas do edital abaixo para preencher o esquema JSON.

LEMBRETES CRÍTICOS ANTES DE PREENCHER:
- srp: Procure por "Ata de Registro de Preços" ou "SRP". Se for Registro de Preços, preencha true.
- numero vs processo: No cabeçalho, se houver "Processo nº 91/2023" e "Edital nº 56/2023", garanta que numero=56/2023 e numero_processo=91/2023.
- orgao_gerenciador.cnpj: procure o CNPJ do órgão no cabeçalho ou nas assinaturas finais. NÃO invente o CNPJ se não encontrar.
- orgao_gerenciador.uasg: Identifique códigos de identificação do órgão. Se não encontrar um código de 6 dígitos explicitamente, deixe null.
- prazos: Se disser "30 (trinta) dias", use o número 30. Se for "imediato", use 0.

CONTEXTO DO EDITAL:
${context}`,
            temperature: 0,
        });

        console.log("\n[EditalFieldExtractor] AI_RAW_RESPONSE:");
        console.log(JSON.stringify(object, null, 2));
        console.log("-------------------------------------------\n");

        const elapsedMs = Date.now() - startTime;
        console.log(`[EditalFieldExtractor] Extração concluída em ${elapsedMs}ms`);

        onProgress?.("Campos do edital extraídos com sucesso", 70);

        return {
            extraction: object,
            tokensUsed: {
                prompt: usage?.inputTokens ?? 0,
                completion: usage?.outputTokens ?? 0,
                total: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
            },
            searchesPerformed: EDITAL_SEARCH_QUERIES.length,
            totalChunksRetrieved: retrievedChunks.length,
            hits: allChunks,
        };
    }
}

export namespace EditalFieldExtractor {
    export type ProgressFn = (message: string, percent: number) => void;
}
