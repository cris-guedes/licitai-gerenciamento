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
 * Converte a saída do extrator de IA para o modelo de domínio.
 *
 * O schema Zod (EDITAL_FIELD_SCHEMA) já usa a mesma nomenclatura do domínio,
 * portanto este mapper realiza passagem direta sem conversão de nomes.
 */
export class EditalExtractionMapper {

    static toLicitacao(rawExtraction: RawExtraction, rawItems: RawItem[]): Licitacao {
        const e   = rawExtraction;
        const org = e.orgaoGerenciador ?? {};

        return {
            // ─── Identidade do processo ───────────────────────────────────────
            numeroLicitacao:       e.numeroLicitacao              ?? null,
            ano:                   e.ano                          ?? null,
            processo:              e.numeroProcesso               ?? null,
            modalidade:            e.modalidade                   ?? null,
            objeto:                e.objetoResumido ?? e.objeto   ?? null,
            orgaoGerenciador:      mapOrgaoPublico(org),
            valorTotalEstimado:    e.valorTotalEstimado            ?? null,
            srp:                   e.srp                          ?? null,

            // ─── Rastreamento (preenchido fora da extração de PDF) ────────────
            valorTotalHomologado:  null,
            situacao:              null,
            dataPublicacao:        e.dataPublicacao               ?? null,
            dataUltimaAtualizacao: null,
            linkProcesso:          org.portal                     ?? null,
            identificadorExterno:  org.codigoUnidade              ?? null,

            // ─── Edital completo ──────────────────────────────────────────────
            edital: mapEdital(e, rawItems),
        };
    }
}

// ─── Mapeamentos auxiliares ───────────────────────────────────────────────────

function mapOrgaoPublico(raw: Record<string, any>): OrgaoPublico {
    return {
        cnpj:             raw.cnpj          ?? null,
        nome:             raw.nome          ?? null,
        codigoUnidade:    raw.codigoUnidade ?? null,
        nomeUnidade:      raw.nomeUnidade   ?? null,
        municipio:        raw.municipio     ?? null,
        uf:               raw.uf            ?? null,
        esfera:           raw.esfera        ?? null,
        poder:            raw.poder         ?? null,
        itensSolicitados: null,
        textoOriginal:    raw.textoOriginal ?? null,
    };
}

function mapEdital(e: Record<string, any>, rawItems: RawItem[]): Edital {
    return {
        amparoLegal:            e.amparoLegal                                ?? null,
        orgaosParticipantes:    mapOrgaosParticipantes(e.orgaosParticipantes ?? []),
        cronograma:             mapCronograma(e.cronograma                   ?? {}),
        certame:                mapCertame(e.certame                         ?? {}),
        itens:                  rawItems.map(mapItemLicitado),
        execucao:               mapExecucao(e.execucao                       ?? {}),
        habilitacao:            mapHabilitacao(e.documentosHabilitacao       ?? {}),
        informacaoComplementar: e.observacoes                                ?? null,
        textoOriginal:          e.textoOriginal                              ?? null,
    };
}

function mapOrgaosParticipantes(raw: any[]): OrgaoPublico[] {
    return raw.map(o => ({
        cnpj:             o.cnpj          ?? null,
        nome:             o.nome          ?? null,
        codigoUnidade:    o.codigoUnidade ?? null,
        nomeUnidade:      null,
        municipio:        o.municipio     ?? null,
        uf:               o.uf            ?? null,
        esfera:           null,
        poder:            null,
        itensSolicitados: Array.isArray(o.itensSolicitados) && o.itensSolicitados.length > 0
            ? o.itensSolicitados.map((it: any) => ({ itemNumero: it.itemNumero, quantidade: it.quantidade }))
            : null,
        textoOriginal:    null,
    }));
}

function mapCronograma(c: Record<string, any>): CronogramaLicitacao {
    return {
        acolhimentoInicio:   c.acolhimentoInicio   ?? null,
        acolhimentoFim:      c.acolhimentoFim      ?? null,
        horaLimite:          c.horaLimite          ?? null,
        sessaoPublica:       c.sessaoPublica        ?? null,
        horaSessaoPublica:   c.horaSessaoPublica    ?? null,
        esclarecimentosAte:  c.esclarecimentosAte  ?? null,
        impugnacaoAte:       c.impugnacaoAte       ?? null,
        textoOriginalPrazos: c.textoOriginalPrazos ?? null,
        textoOriginal:       c.textoOriginal       ?? null,
    };
}

function mapCertame(c: Record<string, any>): RegrasCertame {
    return {
        modoDisputa:               c.modoDisputa               ?? null,
        criterioJulgamento:        c.criterioJulgamento        ?? null,
        tipoLance:                 c.tipoLance                 ?? null,
        intervaloLances:           c.intervaloLances           ?? null,
        duracaoSessaoMinutos:      c.duracaoSessaoMinutos      ?? null,
        textoOriginalDisputa:      c.textoOriginalDisputa      ?? null,
        exclusivoMeEpp:            c.exclusivoMeEpp            ?? null,
        exclusivoMeEppTexto:       c.exclusivoMeEppTexto       ?? null,
        permiteConsorcio:          c.permiteConsorcio          ?? null,
        permiteConsorcioTexto:     c.permiteConsorcioTexto     ?? null,
        exigeVisitaTecnica:        c.exigeVisitaTecnica        ?? null,
        exigeVisitaTecnicaTexto:   c.exigeVisitaTecnicaTexto   ?? null,
        regionalidade:             c.regionalidade             ?? null,
        permiteAdesao:             c.permiteAdesao             ?? null,
        permiteAdesaoTexto:        c.permiteAdesaoTexto        ?? null,
        percentualAdesao:          c.percentualAdesao          ?? null,
        vigenciaAtaMeses:          c.vigenciaAtaMeses          ?? null,
        vigenciaAtaMesesTexto:     c.vigenciaAtaMesesTexto     ?? null,
        vigenciaContratoDias:      c.vigenciaContratoDias      ?? null,
        vigenciaContratoDiasTexto: c.vigenciaContratoDiasTexto ?? null,
        difal:                     c.difal                     ?? null,
        textoOriginal:             c.textoOriginal             ?? null,
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

function mapExecucao(e: Record<string, any>): ExecucaoContratual {
    const entrega   = e.entrega   ?? {};
    const aceite    = e.aceite    ?? {};
    const pagamento = e.pagamento ?? {};
    const garantia  = e.garantia  ?? {};

    return {
        entrega: {
            prazoEmDias:            entrega.prazoEmDias           ?? null,
            textoOriginal:          entrega.textoOriginal         ?? null,
            localEntrega:           entrega.localEntrega          ?? null,
            tipoEntrega:            entrega.tipoEntrega           ?? null,
            responsavelInstalacao:  entrega.responsavelInstalacao ?? null,
            textoOriginalLogistica: entrega.textoOriginalLogistica ?? null,
        },
        aceite: {
            prazoEmDias:   aceite.prazoEmDias   ?? null,
            textoOriginal: aceite.textoOriginal ?? null,
        },
        pagamento: {
            prazoEmDias:   pagamento.prazoEmDias   ?? null,
            textoOriginal: pagamento.textoOriginal ?? null,
        },
        validadeProposta: e.validadeProposta ?? null,
        garantia: {
            tipo:                  garantia.tipo                  ?? null,
            meses:                 garantia.meses                 ?? null,
            tempoAtendimentoHoras: garantia.tempoAtendimentoHoras ?? null,
            textoOriginal:         garantia.textoOriginal         ?? null,
        },
        textoOriginal: e.textoOriginal ?? null,
    };
}

function mapHabilitacao(docs: Record<string, string[]>): DocumentoHabilitacao[] {
    const categorias: Array<[string, string[]]> = [
        ["Jurídica",               docs.juridica          ?? []],
        ["Fiscal e Trabalhista",   docs.fiscalTrabalhista ?? []],
        ["Qualificação Técnica",   docs.tecnica           ?? []],
        ["Qualificação Econômica", docs.economica         ?? []],
    ];

    return categorias.flatMap(([categoria, itens]) =>
        itens.map(doc => ({
            tipo:        doc,
            categoria:   categoria,
            obrigatorio: true,
        })),
    );
}
