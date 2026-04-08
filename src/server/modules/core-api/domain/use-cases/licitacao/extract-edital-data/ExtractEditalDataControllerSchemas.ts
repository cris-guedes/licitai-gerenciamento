import { z } from "zod";

const ExtractEditalDataBodySchema = z.object({
    pdfUrl: z
        .string()
        .url("pdfUrl deve ser uma URL válida")
        .describe("URL pública do PDF do edital a ser convertido para Markdown"),
});

const ExtractEditalDataMetricsSchema = z.object({
    sessionId:          z.string(),
    timestamp:          z.string(),
    pdfUrl:             z.string(),
    pdfFileSizeBytes:   z.number(),
    conversionTimeMs:   z.number(),
    extractionTimeMs:   z.number(),
    totalTimeMs:        z.number(),
    mdFileSizeBytes:    z.number(),
    mdWordCount:        z.number(),
    doclingFilename:    z.string(),
    tempDir:            z.string(),
    tokensUsed: z.object({
        prompt:     z.number(),
        completion: z.number(),
        total:      z.number(),
    }),
});

const AnaliseCriticaItemSchema = z.object({
    numero:               z.number(),
    produto:              z.string(),
    quantidade:           z.number(),
    marca:                z.string(),
    modelo:               z.string(),
    fornecedor:           z.string(),
    ncm:                  z.string(),
    valorReferencia:      z.number(),
    valorReferenciaTotal: z.number(),
    precoCusto:           z.number(),
    precoMinimo:          z.number(),
});

const AnaliseCriticaEditalSchema = z.object({
    orgao:                    z.string(),
    uasg:                     z.string(),
    dataAbertura:             z.string(),
    ambito:                   z.string(),
    cadastro:                 z.string(),
    abertura:                 z.string(),
    uf:                       z.string(),
    modoDisputa:              z.string(),
    cidade:                   z.string(),
    empresas:                 z.array(z.string()),
    analista:                 z.string(),
    tipoDeLance:              z.string(),
    numeroEdital:             z.string(),
    intervaloLances:          z.string(),
    numeroProcesso:           z.string(),
    criterioJulgamento:       z.string(),
    plataforma:               z.string(),
    eppMe:                    z.string(),
    adesao:                   z.string(),
    modalidade:               z.string(),
    regionalidade:            z.string(),
    esclarecimentoImpugnacao: z.string(),
    difal:                    z.string(),
    prazoEnvioProposta:       z.string(),
    obs:                      z.string(),
    itens:                    z.array(AnaliseCriticaItemSchema),
    prazoEntrega:             z.string(),
    tipoEntrega:              z.enum(["centralizada", "descentralizada", "nao_especifica"]),
    tipoGarantia:             z.enum(["on-site", "balcao", "nao_especifica"]),
    instalacao:               z.enum(["fornecedor", "comprador", "nao_especifica"]),
    validadeProposta:         z.string(),
    garantia:                 z.string(),
    prazoAceite:              z.string(),
    prazoPagamento:           z.string(),
    documentacoes: z.object({
        cnpj:                       z.boolean(),
        outrosDocumentos:           z.string(),
        inscricaoEstadual:          z.boolean(),
        certidaoFgts:               z.boolean(),
        certidaoTributosFederais:   z.boolean(),
        certidaoTributosEstaduais:  z.boolean(),
        certidaoTributosMunicipais: z.boolean(),
        certidaoTrabalhista:        z.boolean(),
        certidaoFalenciaRecuperacao: z.boolean(),
        contratoSocial:             z.boolean(),
        docSocios:                  z.boolean(),
        balancos:                   z.boolean(),
        atestado:                   z.boolean(),
        alvara:                     z.boolean(),
        certidaoJunta:              z.boolean(),
        certidaoUnificadaCgu:       z.boolean(),
        inscricaoMunicipal:         z.boolean(),
        garantiaProposta:           z.boolean(),
    }),
    observacoes: z.string(),
});

const ExtractEditalDataResponseSchema = z.object({
    sessionId:     z.string(),
    mdContent:     z.string(),
    analiseCritica: AnaliseCriticaEditalSchema,
    metrics:       ExtractEditalDataMetricsSchema,
});

export namespace ExtractEditalDataControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body     = ExtractEditalDataBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = ExtractEditalDataResponseSchema;

    export type Input          = z.infer<typeof ExtractEditalDataBodySchema>;
    export type Metrics        = z.infer<typeof ExtractEditalDataMetricsSchema>;
    export type AnaliseCritica = z.infer<typeof AnaliseCriticaEditalSchema>;
    export type Output         = z.infer<typeof ExtractEditalDataResponseSchema>;
}
