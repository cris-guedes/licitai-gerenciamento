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

type RawExtraction = Record<string, any>;

type RawItem = {
    numero:                  number | { value?: number | null } | null;
    lote:                    string | { value?: string | null } | null;
    descricao:               string | { value?: string | null };
    quantidade:              number | { value?: number | null } | null;
    unidade:                 string | { value?: string | null } | null;
    valor_unitario_estimado: number | { value?: number | null } | null;
    valor_total_estimado:    number | { value?: number | null } | null;
    catmat_catser:           string | { value?: string | null } | null;
    texto_original?:         string | null;
};

export class EditalExtractionMapper {
    static toLicitacao(rawExtraction: RawExtraction, rawItems: RawItem[]): Licitacao {
        const e = rawExtraction;
        const org = e.orgaoGerenciador ?? {};

        return {
            numeroLicitacao:       unwrapValue(e.numeroLicitacao),
            ano:                   unwrapValue(e.ano),
            processo:              unwrapValue(e.numeroProcesso),
            modalidade:            unwrapValue(e.modalidade),
            objeto:                unwrapValue(e.objetoResumido) ?? unwrapValue(e.objeto),
            orgaoGerenciador:      mapOrgaoPublico(org),
            valorTotalEstimado:    unwrapValue(e.valorTotalEstimado),
            srp:                   unwrapValue(e.srp),
            valorTotalHomologado:  null,
            situacao:              null,
            dataPublicacao:        unwrapValue(e.dataPublicacao),
            dataUltimaAtualizacao: null,
            linkProcesso:          unwrapValue(org.portal),
            identificadorExterno:  unwrapValue(org.codigoUnidade),
            edital:                mapEdital(e, rawItems),
        };
    }
}

function mapOrgaoPublico(raw: Record<string, any>): OrgaoPublico {
    return {
        cnpj:             unwrapValue(raw.cnpj),
        nome:             unwrapValue(raw.nome),
        codigoUnidade:    unwrapValue(raw.codigoUnidade),
        nomeUnidade:      unwrapValue(raw.nomeUnidade),
        municipio:        unwrapValue(raw.municipio),
        uf:               unwrapValue(raw.uf),
        esfera:           unwrapValue(raw.esfera),
        poder:            unwrapValue(raw.poder),
        itensSolicitados: null,
    };
}

function mapEdital(e: Record<string, any>, rawItems: RawItem[]): Edital {
    return {
        amparoLegal:            unwrapValue(e.amparoLegal),
        orgaosParticipantes:    mapOrgaosParticipantes(e.orgaosParticipantes ?? []),
        cronograma:             mapCronograma(e.cronograma ?? {}),
        certame:                mapCertame(e.certame ?? {}),
        itens:                  rawItems.map(mapItemLicitado),
        execucao:               mapExecucao(e.execucao ?? {}),
        habilitacao:            mapHabilitacao(e.documentosHabilitacao ?? {}),
        informacaoComplementar: unwrapValue(e.observacoes),
    };
}

function mapOrgaosParticipantes(raw: any[]): OrgaoPublico[] {
    return raw.map(o => ({
        cnpj:             unwrapValue(o.cnpj),
        nome:             unwrapValue(o.nome),
        codigoUnidade:    unwrapValue(o.codigoUnidade),
        nomeUnidade:      null,
        municipio:        unwrapValue(o.municipio),
        uf:               unwrapValue(o.uf),
        esfera:           null,
        poder:            null,
        itensSolicitados: Array.isArray(o.itensSolicitados) && o.itensSolicitados.length > 0
            ? o.itensSolicitados.map((it: any) => ({
                itemNumero: unwrapValue(it.itemNumero) ?? 0,
                quantidade: unwrapValue(it.quantidade) ?? 0,
            }))
            : null,
    }));
}

function mapCronograma(c: Record<string, any>): CronogramaLicitacao {
    return {
        acolhimentoInicio:   unwrapValue(c.acolhimentoInicio),
        acolhimentoFim:      unwrapValue(c.acolhimentoFim),
        horaLimite:          unwrapValue(c.horaLimite),
        sessaoPublica:       unwrapValue(c.sessaoPublica),
        horaSessaoPublica:   unwrapValue(c.horaSessaoPublica),
        esclarecimentosAte:  unwrapValue(c.esclarecimentosAte),
        impugnacaoAte:       unwrapValue(c.impugnacaoAte),
    };
}

function mapCertame(c: Record<string, any>): RegrasCertame {
    return {
        modoDisputa:               unwrapValue(c.modoDisputa),
        criterioJulgamento:        unwrapValue(c.criterioJulgamento),
        tipoLance:                 unwrapValue(c.tipoLance),
        intervaloLances:           unwrapValue(c.intervaloLances),
        duracaoSessaoMinutos:      unwrapValue(c.duracaoSessaoMinutos),
        exclusivoMeEpp:            unwrapValue(c.exclusivoMeEpp),
        permiteConsorcio:          unwrapValue(c.permiteConsorcio),
        exigeVisitaTecnica:        unwrapValue(c.exigeVisitaTecnica),
        regionalidade:             unwrapValue(c.regionalidade),
        permiteAdesao:             unwrapValue(c.permiteAdesao),
        percentualAdesao:          unwrapValue(c.percentualAdesao),
        vigenciaAtaMeses:          unwrapValue(c.vigenciaAtaMeses),
        vigenciaContratoDias:      unwrapValue(c.vigenciaContratoDias),
        difal:                     unwrapValue(c.difal),
    };
}

function mapItemLicitado(raw: RawItem): ItemLicitado {
    return {
        numero:                unwrapValue(raw.numero) ?? 0,
        descricao:             unwrapValue(raw.descricao),
        tipo:                  unwrapValue((raw as any).tipo),
        lote:                  unwrapValue(raw.lote),
        quantidade:            unwrapValue(raw.quantidade),
        unidadeMedida:         unwrapValue(raw.unidade),
        valorUnitarioEstimado: unwrapValue(raw.valor_unitario_estimado),
        valorTotal:            unwrapValue(raw.valor_total_estimado),
        codigoNcmNbs:          unwrapValue((raw as any).ncm_nbs),
        descricaoNcmNbs:       unwrapValue((raw as any).descricao_ncm_nbs),
        codigoCatmatCatser:    unwrapValue(raw.catmat_catser),
        criterioJulgamento:    unwrapValue((raw as any).criterio_julgamento),
        beneficioTributario:   unwrapValue((raw as any).beneficio_tributario),
        observacao:            unwrapValue((raw as any).observacao),
    };
}

function mapExecucao(e: Record<string, any>): ExecucaoContratual {
    const entrega   = e.entrega   ?? {};
    const aceite    = e.aceite    ?? {};
    const pagamento = e.pagamento ?? {};
    const garantia  = e.garantia  ?? {};

    return {
        entrega: {
            prazoEmDias:            unwrapValue(entrega.prazoEmDias),
            localEntrega:           unwrapValue(entrega.localEntrega),
            tipoEntrega:            unwrapValue(entrega.tipoEntrega),
            responsavelInstalacao:  unwrapValue(entrega.responsavelInstalacao),
        },
        aceite: {
            prazoEmDias: unwrapValue(aceite.prazoEmDias),
        },
        pagamento: {
            prazoEmDias: unwrapValue(pagamento.prazoEmDias),
        },
        validadeProposta: unwrapValue(e.validadeProposta),
        garantia: {
            tipo:                  unwrapValue(garantia.tipo),
            meses:                 unwrapValue(garantia.meses),
            tempoAtendimentoHoras: unwrapValue(garantia.tempoAtendimentoHoras),
        },
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
            tipo:        unwrapValue(doc) ?? "",
            categoria:   categoria,
            obrigatorio: true,
        })),
    );
}

function unwrapValue<T>(value: T | { value?: T | null } | null | undefined): T | null {
    if (value && typeof value === "object" && "value" in value) {
        return value.value ?? null;
    }

    return (value ?? null) as T | null;
}
