import { z } from "zod";

// ─── Sub-schemas (espelham os domain entities) ────────────────────────────────

const OrgaoPublicoSchema = z.object({
    nome: z.string().nullable(),
    cnpj: z.string().nullable(),
    codigoUnidade: z.string().nullable(),   // UASG ou código interno
    nomeUnidade: z.string().nullable(),
    municipio: z.string().nullable(),
    uf: z.string().nullable(),
    esfera: z.enum(["municipal", "estadual", "federal"]).nullable(),
    poder: z.enum(["executivo", "legislativo", "judiciario"]).nullable(),
    portal: z.string().nullable(),   // usado para preencher Licitacao.linkProcesso
});

const CronogramaSchema = z.object({
    acolhimentoInicio: z.string().nullable(),  // data abertura propostas (ISO 8601)
    acolhimentoFim: z.string().nullable(),  // data limite propostas (ISO 8601) — "Recebimento das propostas: até..."
    horaLimite: z.string().nullable(),  // hora limite propostas (HH:MM)
    sessaoPublica: z.string().nullable(),  // data+hora sessão pública (ISO 8601 com T)
    horaSessaoPublica: z.string().nullable(),  // hora sessão pública (HH:MM) — null se já embutido em sessaoPublica
    esclarecimentosAte: z.string().nullable(),  // data limite esclarecimentos (ISO 8601)
    impugnacaoAte: z.string().nullable(),  // data limite impugnação (ISO 8601)
});

const CertameSchema = z.object({
    // ── Disputa ──────────────────────────────────────────────────────────────
    modoDisputa: z.enum(["aberto", "fechado", "aberto_fechado"]).nullable(),
    criterioJulgamento: z.enum(["menor_preco", "maior_desconto", "melhor_tecnica", "tecnica_e_preco", "maior_lance"]).nullable(),
    tipoLance: z.enum(["unitario", "global", "percentual"]).nullable(),
    intervaloLances: z.string().nullable(),
    duracaoSessaoMinutos: z.number().nullable(),
    // ── Participação ─────────────────────────────────────────────────────────
    exclusivoMeEpp: z.boolean().nullable(),
    permiteConsorcio: z.boolean().nullable(),
    exigeVisitaTecnica: z.boolean().nullable(),
    regionalidade: z.string().nullable(),
    // ── Adesão e Vigências ────────────────────────────────────────────────────
    permiteAdesao: z.boolean().nullable(),
    percentualAdesao: z.number().nullable(),
    vigenciaAtaMeses: z.number().nullable(),
    vigenciaContratoDias: z.number().nullable(),
    difal: z.boolean().nullable(),
});

const ExecucaoSchema = z.object({
    entrega: z.object({
        prazoEmDias: z.number().nullable(),
        localEntrega: z.string().nullable(),
        tipoEntrega: z.enum(["centralizada", "descentralizada"]).nullable(),
        responsavelInstalacao: z.enum(["fornecedor", "comprador"]).nullable(),
    }),
    aceite: z.object({
        prazoEmDias: z.number().nullable(),
    }),
    pagamento: z.object({
        prazoEmDias: z.number().nullable(),
    }),
    validadeProposta: z.number().nullable(),
    garantia: z.object({
        tipo: z.enum(["onsite", "balcao", "remota", "sem_garantia"]).nullable(),
        meses: z.number().nullable(),
        tempoAtendimentoHoras: z.number().nullable(),
    }),
});

const DocumentosHabilitacaoSchema = z.object({
    juridica: z.array(z.string()),
    fiscalTrabalhista: z.array(z.string()),
    tecnica: z.array(z.string()),
    economica: z.array(z.string()),
});

// ─── Schema principal ────────────────────────────────────────────────────────

export const EDITAL_FIELD_SCHEMA = z.object({
    // ── Identidade (Licitacao) ────────────────────────────────────────────────
    numeroLicitacao: z.string().nullable(),
    numeroProcesso: z.string().nullable(),
    modalidade: z.enum([
        "pregao_eletronico", "pregao_presencial", "dispensa", "inexigibilidade",
        "concorrencia", "tomada_precos", "convite", "leilao", "concurso", "credenciamento",
    ]).nullable(),
    amparoLegal: z.string().nullable(),
    srp: z.boolean().nullable(),
    ano: z.number().nullable(),
    objeto: z.string().nullable(),
    objetoResumido: z.string().nullable(),
    valorTotalEstimado: z.number().nullable(),
    dataPublicacao: z.string().nullable(),   // ISO 8601 (YYYY-MM-DD)

    // ── Órgão (OrgaoPublico) ──────────────────────────────────────────────────
    orgaoGerenciador: OrgaoPublicoSchema,

    // ── Cronograma (CronogramaLicitacao) ──────────────────────────────────────
    cronograma: CronogramaSchema,

    // ── Certame / Regras (RegrasCertame) ──────────────────────────────────────
    certame: CertameSchema,

    // ── Execução contratual (ExecucaoContratual) ──────────────────────────────
    execucao: ExecucaoSchema,

    // ── Órgãos participantes (SRP) ────────────────────────────────────────────
    orgaosParticipantes: z.array(z.object({
        nome: z.string(),
        cnpj: z.string().nullable(),
        codigoUnidade: z.string().nullable(),
        uf: z.string().nullable(),
        municipio: z.string().nullable(),
        itensSolicitados: z.array(z.object({ itemNumero: z.number(), quantidade: z.number() })),
    })),

    // ── Habilitação (DocumentoHabilitacao) ────────────────────────────────────
    documentosHabilitacao: DocumentosHabilitacaoSchema,

    // ── Informações adicionais ────────────────────────────────────────────────
    /**
     * Informações relevantes que não se encaixam nos campos estruturados.
     * Capture: organização de lotes, condições exclusivas deste edital,
     * penalidades diferenciadas, exigências técnicas especiais,
     * cláusulas não-padrão, subcontratação, vistoria obrigatória com detalhes,
     * etc. Seja objetivo e liste por tópico separado por "\n- ".
     */
    observacoes: z.string().nullable(),
});
