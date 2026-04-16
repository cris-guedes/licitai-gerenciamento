import { z } from "zod";

// ─── Input ────────────────────────────────────────────────────────────────────

const ExtractionModeSchema = z.enum(["velocidade", "balanceado", "qualidade", "imagem", "agente"]);

const ExtractEditalDataBodySchema = z.object({
    pdfUrl: z
        .string()
        .url("pdfUrl deve ser uma URL válida")
        .describe("URL pública do PDF do edital"),
    mode: ExtractionModeSchema.default("balanceado"),
});

// ─── Metrics ─────────────────────────────────────────────────────────────────

const MetricsSchema = z.object({
    sessionId:        z.string(),
    timestamp:        z.string(),
    pdfUrl:           z.string(),
    pdfFileSizeBytes: z.number(),
    conversionTimeMs: z.number(),
    chunkingTimeMs:     z.number(),
    scoringTimeMs:      z.number(),
    filteredChunkCount: z.number(),
    extractionTimeMs:   z.number(),
    totalTimeMs:        z.number(),
    mdFileSizeBytes:    z.number(),
    mdWordCount:        z.number(),
    chunkCount:         z.number(),
    totalTablesInPdf:   z.number().optional(),
    doclingFilename:  z.string(),
    tempDir:          z.string(),
    tokensUsed: z.object({
        prompt:     z.number(),
        completion: z.number(),
        total:      z.number(),
    }),
    topChunks: z.array(z.object({
        id:        z.string(),
        score:     z.number(),
        headings:  z.array(z.string()),
        charCount: z.number(),
        preview:   z.string(),
    })),
    config: z.object({
        chunkSize:         z.number(),
        chunkOverlap:      z.number(),
        embeddingModel:    z.string(),
        aiModel:           z.string(),
        fileParser:        z.string(),
        extractionMode:    z.string(),
        topKPorIntent:     z.record(z.string(), z.number()),
        queriesPorIntent:  z.record(z.string(), z.array(z.string())),
    }).optional(),
});

// ─── Extraction schemas ───────────────────────────────────────────────────────

const nullable = <T extends z.ZodTypeAny>(schema: T) => schema.nullable();

const EditalItemSchema = z.object({
    numero:                  z.number(),
    lote:                    nullable(z.string()),
    descricao:               z.string(),
    quantidade:              z.number(),
    unidade:                 z.string(),
    valor_unitario_estimado: nullable(z.number()),
    valor_total_estimado:    nullable(z.number()),
    catmat_catser:           nullable(z.string()),
});

const EditalSchema = z.object({
    numero:               z.string(),
    numero_processo:      z.string(),
    modalidade:           z.string(),
    objeto_resumido:      z.string(),
    valor_estimado_total: nullable(z.number()),
    identificacao: z.object({
        uasg:   z.string(),
        portal: z.string(),
    }),
    classificacao: z.object({
        ambito: z.string(),
    }),
    orgao_gerenciador: z.object({
        nome:   z.string(),
        cnpj:   z.string(),
        uf:     z.string(),
        cidade: z.string(),
    }),
    datas: z.object({
        data_abertura:                  nullable(z.string()),
        data_proposta_limite:           nullable(z.string()),
        hora_proposta_limite:           nullable(z.string()),
        data_esclarecimento_impugnacao: nullable(z.string()),
        cadastro_inicio:                nullable(z.string()),
        cadastro_fim:                   nullable(z.string()),
    }),
    disputa: z.object({
        modo:                z.string(),
        criterio_julgamento: z.string(),
        tipo_lance:          z.string(),
        intervalo_lances:    nullable(z.string()),
    }),
    regras: z.object({
        exclusivo_me_epp:  z.boolean(),
        permite_adesao:    z.boolean(),
        percentual_adesao: nullable(z.number()),
        regionalidade:     nullable(z.string()),
        difal:             z.boolean(),
    }),
    logistica: z.object({
        local_entrega:          nullable(z.string()),
        tipo_entrega:           z.string(),
        responsavel_instalacao: z.string(),
    }),
    prazos: z.object({
        entrega:   z.object({ texto_original: nullable(z.string()), dias_corridos: nullable(z.number()) }),
        aceite:    z.object({ texto_original: nullable(z.string()), dias: nullable(z.number()) }),
        pagamento: z.object({ texto_original: nullable(z.string()), dias: nullable(z.number()) }),
        validade_proposta_dias: nullable(z.number()),
    }),
    garantia: z.object({
        tipo:                    z.string(),
        meses:                   nullable(z.number()),
        tempo_atendimento_horas: nullable(z.number()),
    }),
    itens:               z.array(EditalItemSchema),
    orgaos_participantes: z.array(z.object({
        nome:  z.string(),
        itens: z.array(z.object({ item_numero: z.number(), quantidade: z.number() })),
    })),
    documentos_exigidos: z.array(z.object({
        tipo:        z.string(),
        obrigatorio: z.boolean(),
    })),
    observacoes: nullable(z.string()),
});

const ExtractionResultSchema = z.object({
    edital: EditalSchema,
});

// ─── Response ─────────────────────────────────────────────────────────────────

const ExtractEditalDataResponseSchema = z.object({
    sessionId:  z.string(),
    mdContent:  z.string(),
    extraction: ExtractionResultSchema,
    metrics:    MetricsSchema,
});

// ─── Namespace ────────────────────────────────────────────────────────────────

export namespace ExtractEditalDataControllerSchemas {
    export const Headers  = z.object({ "authorization": z.string().optional() }).optional();
    export const Body     = ExtractEditalDataBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = ExtractEditalDataResponseSchema;

    export type Input   = z.infer<typeof ExtractEditalDataBodySchema>;
    export type Metrics = z.infer<typeof MetricsSchema>;
    export type Output  = z.infer<typeof ExtractEditalDataResponseSchema>;
}
