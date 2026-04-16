import type {
    Licitacao,
    Edital,
    OrgaoPublico,
    CronogramaLicitacao,
    RegrasCertame,
    ItemLicitado,
    ExecucaoContratual,
    DocumentoHabilitacao,
} from "@/server/modules/core-api/domain/entities";

// ─── Tipos internos (saída bruta dos extratores) ──────────────────────────────

type RawExtraction = Record<string, any>;

type RawItem = {
    numero:                  number | null;
    lote:                    string | null;
    descricao:               string;
    quantidade:              number | null;
    unidade:                 string | null;
    valor_unitario_estimado: number | null;
    valor_total_estimado:    number | null;
    catmat_catser:           string | null;
    texto_original:          string | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Converte a saída bruta dos extratores de IA para o modelo de domínio.
 *
 * A IA retorna uma estrutura snake_case sem identidade de domínio — este
 * mapper é a fronteira entre os dois mundos.
 */
export class EditalExtractionMapper {

    static toLicitacao(rawExtraction: RawExtraction, rawItems: RawItem[]): Licitacao {
        const e    = rawExtraction?.edital ?? {};
        const org  = e.orgao_gerenciador ?? {};

        // Tenta inferir o ano do número da licitação (ex: 91/2023 -> 2023)
        const inferredYear = typeof e.numero === "string" && e.numero.includes("/") 
            ? parseInt(e.numero.split("/").pop() ?? "", 10) 
            : null;

        return {
            // ─── Identidade do processo ───────────────────────────────────────
            numeroLicitacao:       e.numero               ?? null,
            ano:                   e.ano ?? inferredYear  ?? null,
            processo:              e.numero_processo      ?? null,
            modalidade:            e.modalidade           ?? null,
            objeto:                e.objeto_resumido ?? e.objeto ?? null,
            orgaoGerenciador:      mapOrgaoPublico(org),
            valorTotalEstimado:    e.valor_estimado_total ?? null,
            srp:                   e.srp                  ?? null,

            // ─── Rastreamento (preenchido fora da extração de PDF) ────────────
            valorTotalHomologado:  e.valor_total_homologado ?? null,
            situacao:              e.situacao               ?? null,
            dataPublicacao:        e.data_publicacao        ?? null,
            dataUltimaAtualizacao: e.data_ultima_atualizacao ?? null,
            linkProcesso:          org.portal               ?? null,
            identificadorExterno:  org.uasg                 ?? null,

            // ─── Edital completo ──────────────────────────────────────────────
            edital: mapEdital(e, rawItems),
        };
    }
}

// ─── Mapeamentos auxiliares ───────────────────────────────────────────────────

function mapOrgaoPublico(raw: Record<string, any>): OrgaoPublico {
    return {
        cnpj:          raw.cnpj          ?? null,
        nome:          raw.nome          ?? null,
        codigoUnidade: raw.uasg          ?? null,
        nomeUnidade:   raw.nome_unidade  ?? null,
        municipio:     raw.cidade        ?? null,
        uf:            raw.uf            ?? null,
        esfera:        raw.esfera        ?? null,
        poder:         raw.poder         ?? null,
        textoOriginal: raw.texto_original ?? null,
    };
}

function mapEdital(e: Record<string, any>, rawItems: RawItem[]): Edital {
    return {
        amparoLegal:            e.amparo_legal ?? null,
        orgaosParticipantes:    mapOrgaosParticipantes(e.orgaos_participantes ?? []),
        cronograma:             mapCronograma(e.cronograma ?? {}),
        certame:                mapCertame(e.disputa ?? {}, e.regras ?? {}),
        itens:                  rawItems.map(mapItemLicitado),
        execucao:               mapExecucao(e.prazos ?? {}, e.logistica ?? {}, e.garantia ?? {}),
        habilitacao:            mapHabilitacao(e.documentos_habilitacao ?? {}),
        informacaoComplementar: e.observacoes ?? null,
        textoOriginal:          e.texto_original ?? null,
    };
}

function mapOrgaosParticipantes(raw: any[]): OrgaoPublico[] {
    return raw.map(o => ({
        cnpj:          o.cnpj   ?? null,
        nome:          o.nome   ?? null,
        codigoUnidade: o.uasg   ?? null,
        nomeUnidade:   null,
        municipio:     o.cidade ?? null,
        uf:            o.uf     ?? null,
        esfera:        null,
        poder:         null,
        textoOriginal: null, // Participantes raramente têm evidência própria separada
    }));
}

function mapCronograma(c: Record<string, any>): CronogramaLicitacao {
    return {
        acolhimentoInicio:  c.data_abertura_propostas     ?? null,
        acolhimentoFim:     c.data_limite_propostas        ?? null,
        horaLimite:         c.hora_limite_propostas        ?? null,
        sessaoPublica:      c.data_sessao_publica          ?? null,
        esclarecimentosAte: c.data_limite_esclarecimentos  ?? null,
        textoOriginal:      c.texto_original               ?? null,
    };
}

function mapCertame(disputa: Record<string, any>, regras: Record<string, any>): RegrasCertame {
    return {
        modoDisputa:       disputa.modo                    ?? null,
        criterioJulgamento: disputa.criterio_julgamento    ?? null,
        tipoInstrumento:   null,
        intervaloLances:   disputa.intervalo_minimo_lances ?? null,
        exclusivoMeEpp:    regras.exclusivo_me_epp         ?? null,
        permiteAdesao:     regras.permite_adesao           ?? null,
        percentualAdesao:  regras.percentual_maximo_adesao ?? null,
        regionalidade:     regras.regionalidade            ?? null,
        difal:             regras.difal                    ?? null,
        textoOriginal:     regras.texto_original           ?? null,
    };
}

function mapItemLicitado(raw: RawItem): ItemLicitado {
    return {
        numero:                raw.numero                  ?? 0,
        descricao:             raw.descricao               ?? null,
        tipo:                  (raw as any).tipo           ?? null,
        lote:                  raw.lote                    ?? null,
        quantidade:            raw.quantidade              ?? null,
        unidadeMedida:         raw.unidade                 ?? null,
        valorUnitarioEstimado: raw.valor_unitario_estimado ?? null,
        valorTotal:            raw.valor_total_estimado    ?? null,
        codigoNcmNbs:          (raw as any).ncm_nbs        ?? null,
        descricaoNcmNbs:       (raw as any).descricao_ncm_nbs ?? null,
        codigoCatmatCatser:    raw.catmat_catser           ?? null,
        criterioJulgamento:    (raw as any).criterio_julgamento ?? null,
        beneficioTributario:   (raw as any).beneficio_tributario ?? null,
        observacao:            (raw as any).observacao          ?? null,
    };
}

function mapExecucao(
    prazos:   Record<string, any>,
    logistica: Record<string, any>,
    garantia: Record<string, any>,
): ExecucaoContratual {
    return {
        entrega: {
            prazoEmDias:           prazos.entrega?.dias_corridos        ?? null,
            textoOriginal:         prazos.entrega?.texto_original        ?? null,
            localEntrega:          logistica.local_entrega              ?? null,
            tipoEntrega:           logistica.tipo_entrega               ?? null,
            responsavelInstalacao: logistica.responsavel_instalacao     ?? null,
        },
        pagamento: {
            prazoEmDias:   prazos.pagamento?.dias            ?? null,
            textoOriginal: prazos.pagamento?.texto_original  ?? null,
        },
        aceite: {
            prazoEmDias:   prazos.aceite?.dias               ?? null,
            textoOriginal: prazos.aceite?.texto_original     ?? null,
        },
        validadeProposta: prazos.validade_proposta_dias      ?? null,
        garantia: {
            tipo:                  garantia.tipo                        ?? null,
            meses:                 garantia.prazo_meses                 ?? null,
            tempoAtendimentoHoras: garantia.tempo_atendimento_horas     ?? null,
            textoOriginal:         garantia.texto_original              ?? null,
        },
    };
}

function mapHabilitacao(docs: Record<string, string[]>): DocumentoHabilitacao[] {
    const categorias: Array<[string, string[]]> = [
        ["Jurídica",                   docs.juridica           ?? []],
        ["Fiscal e Trabalhista",        docs.fiscal_trabalhista ?? []],
        ["Qualificação Técnica",        docs.tecnica            ?? []],
        ["Qualificação Econômica",      docs.economica          ?? []],
    ];

    return categorias.flatMap(([categoria, itens]) =>
        itens.map(doc => ({
            tipo:        doc,
            categoria:   categoria,
            obrigatorio: true,
        })),
    );
}
