import { z } from "zod";

// ─── Input ────────────────────────────────────────────────────────────────────
// Recebe multipart/form-data com campo 'file' (PDF).
// O body JSON não é utilizado — a validação ocorre no controller via FormData.

const ExtractEditalDataBodySchema = z.null();

// ─── Métricas de processamento ────────────────────────────────────────────────

const StepDetailSchema = z.object({
    label: z.string(),
    value: z.string(),
});

const PipelineStepSchema = z.object({
    id: z.string(),
    label: z.string(),
    timeMs: z.number(),
    details: z.array(StepDetailSchema),
});

const PipelineStepsGroupSchema = z.object({
    label: z.string(),
    totalTimeMs: z.number(),
    steps: z.array(PipelineStepSchema),
});

const DetailedStepsSchema = z.object({
    orchestration: PipelineStepsGroupSchema,
    info: PipelineStepsGroupSchema,
    items: PipelineStepsGroupSchema,
});

const ArtifactsSchema = z.object({
    directory: z.string(),
    originalPdf: z.string(),
    pdfProcessingResponse: z.string(),
    aiInputs: z.string(),
    extractionResult: z.string(),
    metrics: z.string(),
});

const MetricsSchema = z.object({
    sessionId:         z.string(),
    timestamp:         z.string(),
    pdfFilename:       z.string(),
    pdfFileSizeBytes:  z.number(),
    totalWords:        z.number(),
    entriesIndexed:    z.number(),
    itemsExtracted:    z.number(),
    totalTimeMs:       z.number(),
    tokensUsed: z.object({
        prompt:     z.number(),
        completion: z.number(),
        total:      z.number(),
    }),
    /** Total de tokens consumidos pelo modelo de embedding (queries + documento). */
    embeddingTokensUsed: z.number(),
    /** Quantidade de chunks limpos enviados para cada agente de extração. */
    chunksEnviados: z.object({
        agenteCampos: z.number(),
        agenteItens:  z.number(),
    }),
    artifacts: ArtifactsSchema,
    steps: DetailedStepsSchema,
});

// ─── Modelo de domínio (espelha as entidades) ─────────────────────────────────

const n = <T extends z.ZodTypeAny>(schema: T) => schema.nullable();

const OrgaoPublicoSchema = z.object({
    cnpj:             n(z.string()),
    nome:             n(z.string()),
    codigoUnidade:    n(z.string()),
    nomeUnidade:      n(z.string()),
    municipio:        n(z.string()),
    uf:               n(z.string()),
    esfera:           n(z.enum(["federal", "estadual", "municipal"])),
    poder:            n(z.enum(["executivo", "legislativo", "judiciario"])),
    itensSolicitados: n(z.array(z.object({ itemNumero: z.number(), quantidade: z.number() }))),
});

const CronogramaSchema = z.object({
    acolhimentoInicio:   n(z.string()),
    acolhimentoFim:      n(z.string()),
    horaLimite:          n(z.string()),
    sessaoPublica:       n(z.string()),
    horaSessaoPublica:   n(z.string()),
    esclarecimentosAte:  n(z.string()),
    impugnacaoAte:       n(z.string()),
});

const CertameSchema = z.object({
    modoDisputa:               n(z.string()),
    criterioJulgamento:        n(z.string()),
    tipoLance:                 n(z.enum(["unitario", "global", "percentual"])),
    intervaloLances:           n(z.string()),
    duracaoSessaoMinutos:      n(z.number()),
    exclusivoMeEpp:            n(z.boolean()),
    permiteConsorcio:          n(z.boolean()),
    exigeVisitaTecnica:        n(z.boolean()),
    permiteAdesao:             n(z.boolean()),
    percentualAdesao:          n(z.number()),
    regionalidade:             n(z.string()),
    difal:                     n(z.boolean()),
    vigenciaAtaMeses:          n(z.number()),
    vigenciaContratoDias:      n(z.number()),
});

const PrazoSchema = z.object({
    prazoEmDias: n(z.number()),
});

const ExecucaoSchema = z.object({
    entrega: PrazoSchema.extend({
        localEntrega:           n(z.string()),
        tipoEntrega:            n(z.enum(["centralizada", "descentralizada"])),
        responsavelInstalacao:  n(z.enum(["fornecedor", "comprador"])),
    }),
    pagamento:        PrazoSchema,
    aceite:           PrazoSchema,
    validadeProposta: n(z.number()),
    garantia: z.object({
        tipo:                  n(z.enum(["onsite", "balcao", "sem_garantia", "remota"])),
        meses:                 n(z.number()),
        tempoAtendimentoHoras: n(z.number()),
    }),
});

const ItemLicitadoSchema = z.object({
    numero:                n(z.number()),
    descricao:             n(z.string()),
    tipo:                  n(z.enum(["material", "servico"])),
    lote:                  n(z.string()),
    quantidade:            n(z.number()),
    unidadeMedida:         n(z.string()),
    valorUnitarioEstimado: n(z.number()),
    valorTotal:            n(z.number()),
    codigoNcmNbs:          n(z.string()),
    descricaoNcmNbs:       n(z.string()),
    codigoCatmatCatser:    n(z.string()),
    criterioJulgamento:    n(z.string()),
    beneficioTributario:   n(z.string()),
    observacao:            n(z.string()),
});

const DocumentoHabilitacaoSchema = z.object({
    tipo:        z.string(),
    categoria:   z.string(),
    obrigatorio: z.boolean(),
});

const EditalSchema = z.object({
    amparoLegal:            n(z.string()),
    orgaosParticipantes:    z.array(OrgaoPublicoSchema),
    cronograma:             CronogramaSchema,
    certame:                CertameSchema,
    itens:                  z.array(ItemLicitadoSchema),
    execucao:               ExecucaoSchema,
    habilitacao:            z.array(DocumentoHabilitacaoSchema),
    informacaoComplementar: n(z.string()),
});

const LicitacaoSchema = z.object({
    numeroLicitacao:       n(z.string()),
    ano:                   n(z.number()),
    processo:              n(z.string()),
    modalidade:            n(z.string()),
    objeto:                n(z.string()),
    orgaoGerenciador:      OrgaoPublicoSchema.nullable(),
    valorTotalEstimado:    n(z.number()),
    srp:                   n(z.boolean()),
    valorTotalHomologado:  n(z.number()),
    situacao:              n(z.string()),
    dataPublicacao:        n(z.string()),
    dataUltimaAtualizacao: n(z.string()),
    linkProcesso:          n(z.string()),
    identificadorExterno:  n(z.string()),
    edital:                EditalSchema.nullable(),
});

// ─── Resposta ─────────────────────────────────────────────────────────────────

const ExtractEditalDataResponseSchema = z.object({
    sessionId:  z.string(),
    mdContent:  z.string(),
    licitacao:  LicitacaoSchema,
    metrics:    MetricsSchema,
});

// ─── Namespace ────────────────────────────────────────────────────────────────

export namespace ExtractEditalDataControllerSchemas {
    export const Headers  = z.object({ authorization: z.string().optional() }).optional();
    export const Body     = ExtractEditalDataBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = ExtractEditalDataResponseSchema;

    export type Metrics = z.infer<typeof MetricsSchema>;
    export type Output  = z.infer<typeof ExtractEditalDataResponseSchema>;
}
