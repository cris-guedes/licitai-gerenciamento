import { z } from "zod";

/** Accepts a single value or an array — handles both query-string shapes */
function arrayParam<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.preprocess(
        (v) => v === undefined ? undefined : Array.isArray(v) ? v : [v],
        z.array(itemSchema).optional()
    );
}

const TipoDocumentoEnum = z.enum([
    "edital",
    "aviso_licitacao",
    "contrato",
    "ata_registro_preco",
    "resultado",
    "homologacao",
    "adjudicacao",
    "dispensa",
    "inexigibilidade",
]);

const StatusEnum = z.enum([
    "recebendo_proposta",
    "propostas_encerradas", // Em Julgamento / Propostas Encerradas
    "divulgada",
    "homologada",
    "revogada",
    "anulada",
    "suspensa",
    "encerrada",
    "fracassada",
    "deserta",
]);

const OrdenacaoEnum = z.enum(["data", "-data", "valor", "-valor"]);

const EsferaEnum = z.enum(["F", "E", "M", "D", "N"]);

const PoderEnum = z.enum(["E", "L", "J", "N"]);

const FonteOrcamentariaEnum = z.enum([
    "estadual",
    "federal",
    "municipal",
    "nao_se_aplica",
    "organismo_internacional",
]);

const MargemPreferenciaEnum = z.enum(["resolucao_cics", "resolucao_ciia_pac"]);

const SearchPublicProcurementsInputSchema = z.object({
    q: z
        .coerce.string()
        .optional()
        .describe(
            "Texto livre para busca semântica no título e descrição dos documentos. " +
            "Ex: 'desenvolvimento software', 'consultoria TI', 'sistema gestão'."
        ),

    tiposDocumento: arrayParam(TipoDocumentoEnum)
        .describe(
            "Filtra pelo tipo de documento. Valores: " +
            "'edital' (licitação aberta), 'aviso_licitacao' (aviso de abertura), " +
            "'contrato', 'ata_registro_preco', 'resultado', 'homologacao', " +
            "'adjudicacao', 'dispensa', 'inexigibilidade'. " +
            "Omita para usar o padrão: edital, aviso_licitacao, dispensa, inexigibilidade " +
            "(a API exige este campo — o servidor aplica o default automaticamente quando ausente)."
        ),

    status: StatusEnum
        .optional()
        .describe(
            "Status da contratação. Use 'recebendo_proposta' para licitações abertas (ativas). " +
            "Outros valores: 'divulgada', 'homologada', 'revogada', 'anulada', " +
            "'suspensa', 'encerrada', 'fracassada', 'deserta'."
        ),

    ordenacao: OrdenacaoEnum
        .optional()
        .describe(
            "Critério de ordenação dos resultados: " +
            "'data' (mais antigas primeiro), '-data' (mais recentes primeiro), " +
            "'valor' (menor valor primeiro), '-valor' (maior valor primeiro). " +
            "Padrão recomendado: '-data'."
        ),

    pagina: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Número da página para paginação (começa em 1)."),

    tamPagina: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .describe("Quantidade de itens por página (máximo 500). Padrão recomendado: 20."),

    orgaos: arrayParam(z.number().int())
        .describe(
            "Lista de IDs numéricos dos órgãos para filtrar. " +
            "Use fetch_company_by_cnpj para obter o ID de um órgão pelo CNPJ."
        ),

    unidades: arrayParam(z.number().int())
        .describe("Lista de IDs numéricos das unidades administrativas (UASGs)."),

    esferas: arrayParam(EsferaEnum)
        .describe(
            "Esfera administrativa do órgão: " +
            "'F' (Federal), 'E' (Estadual), 'M' (Municipal), 'D' (Distrital), 'N' (Não definida)."
        ),

    poderes: arrayParam(PoderEnum)
        .describe(
            "Poder da entidade: " +
            "'E' (Executivo), 'L' (Legislativo), 'J' (Judiciário), 'N' (Não definido)."
        ),

    ufs: arrayParam(z.string().length(2))
        .describe(
            "Unidades Federativas para filtro geográfico (siglas de 2 letras). " +
            "Ex: ['SP', 'RJ', 'MG']. Omita para busca nacional."
        ),

    municipios: arrayParam(z.number().int())
        .describe("Lista de IDs numéricos dos municípios (código IBGE)."),

    modalidades: arrayParam(z.union([
            z.literal(1),  // Leilão - Eletrônico
            z.literal(2),  // Diálogo Competitivo
            z.literal(3),  // Concurso
            z.literal(4),  // Concorrência - Eletrônica
            z.literal(5),  // Concorrência - Presencial
            z.literal(6),  // Pregão - Eletrônico
            z.literal(7),  // Pregão - Presencial
            z.literal(8),  // Dispensa de Licitação
            z.literal(9),  // Inexigibilidade
            z.literal(12), // Manifestação de Interesse
            z.literal(13), // Pré-qualificação
        ]))
        .describe(
            "Modalidade da licitação (código numérico): " +
            "1=Leilão Eletrônico, 2=Diálogo Competitivo, 3=Concurso, " +
            "4=Concorrência Eletrônica, 5=Concorrência Presencial, " +
            "6=Pregão Eletrônico, 7=Pregão Presencial, " +
            "8=Dispensa, 9=Inexigibilidade, 12=Manifestação de Interesse, 13=Pré-qualificação."
        ),

    tipos: arrayParam(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]))
        .describe("Tipo do documento (código numérico): 1=Bem, 2=Serviço, 3=Obra, 4=Serviço de Engenharia."),

    fontesOrcamentarias: arrayParam(FonteOrcamentariaEnum)
        .describe(
            "Fonte orçamentária do recurso: " +
            "'federal', 'estadual', 'municipal', 'organismo_internacional', 'nao_se_aplica'."
        ),

    tiposMargensPreferencia: arrayParam(MargemPreferenciaEnum)
        .describe(
            "Tipo de margem de preferência aplicada: " +
            "'resolucao_cics' ou 'resolucao_ciia_pac'."
        ),

    exigenciaConteudoNacional: z
        .boolean()
        .optional()
        .describe("Se true, filtra apenas licitações que exigem conteúdo de produção nacional."),
});

export const LicitacaoItemSchema = z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    item_url: z.string().optional(),
    document_type: z.string().optional(),
    createdAt: z.string().optional(),
    ano: z.string().optional(),
    numero_sequencial: z.string().optional(),
    numero_controle_pncp: z.string().optional(),
    orgao_id: z.string().optional(),
    orgao_cnpj: z.string().optional(),
    orgao_nome: z.string().optional(),
    unidade_id: z.string().optional(),
    unidade_nome: z.string().optional(),
    esfera_id: EsferaEnum.optional(),
    poder_id: PoderEnum.optional(),
    municipio_id: z.string().optional(),
    municipio_nome: z.string().optional(),
    uf: z.string().optional(),
    modalidade_licitacao_id: z.string().optional(),
    modalidade_licitacao_nome: z.string().optional(),
    situacao_id: z.string().optional(),
    situacao_nome: z.string().optional(),
    data_publicacao_pncp: z.string().optional(),
    data_atualizacao_pncp: z.string().optional(),
    data_inicio_vigencia: z.string().nullable().optional(),
    data_fim_vigencia: z.string().nullable().optional(),
    cancelado: z.boolean().optional(),
    valor_global: z.number().nullable().optional(),
    tem_resultado: z.boolean().optional(),
    tipo_id: z.string().optional(),
    tipo_nome: z.string().optional(),
    exigencia_conteudo_nacional: z.boolean().optional(),
});

export const SearchPublicProcurementsResponseSchema = z.object({
    items: z.array(LicitacaoItemSchema),
    total: z.number().describe("Total de registros encontrados"),
});

export namespace SearchPublicProcurementsControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = z.null();

    export const Query = SearchPublicProcurementsInputSchema;

    export const Params = z.null();

    export const Response = SearchPublicProcurementsResponseSchema;

    export type Input = z.infer<typeof SearchPublicProcurementsInputSchema>;
}
