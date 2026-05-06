export interface FinalizeOportunidadeRegistrationOrgaoDTO {
    cnpj: string;
    nome: string;
    codigoUnidade: string;
    nomeUnidade: string;
    municipio: string;
    uf: string;
    esfera: string;
    poder: string;
    itensSolicitados: Array<{
        itemId: string;
        quantidade: string;
    }>;
}

export interface FinalizeOportunidadeRegistrationItemDTO {
    itemId: string;
    numero: string;
    descricao: string;
    tipo: string;
    lote: string;
    quantidade: string;
    unidadeMedida: string;
    valorUnitarioEstimado: string;
    valorTotal: string;
    codigoNcmNbs: string;
    descricaoNcmNbs: string;
    codigoCatmatCatser: string;
    criterioJulgamento: string;
    beneficioTributario: string;
    observacao: string;
}

export interface FinalizeOportunidadeRegistrationHabilitacaoDTO {
    tipo: string;
    categoria: string;
    obrigatorio: string;
}

export interface FinalizeOportunidadeRegistrationFormDTO {
    numeroLicitacao: string;
    ano: string;
    processo: string;
    modalidade: string;
    objeto: string;
    orgaoGerenciador: FinalizeOportunidadeRegistrationOrgaoDTO;
    valorTotalEstimado: string;
    valorTotalHomologado: string;
    srp: string;
    situacao: string;
    dataPublicacao: string;
    dataUltimaAtualizacao: string;
    linkProcesso: string;
    identificadorExterno: string;
    edital: {
        amparoLegal: string;
        orgaosParticipantes: FinalizeOportunidadeRegistrationOrgaoDTO[];
        cronograma: {
            acolhimentoInicio: string;
            acolhimentoFim: string;
            horaLimite: string;
            sessaoPublica: string;
            horaSessaoPublica: string;
            esclarecimentosAte: string;
            impugnacaoAte: string;
        };
        certame: {
            modoDisputa: string;
            criterioJulgamento: string;
            tipoLance: string;
            intervaloLances: string;
            duracaoSessaoMinutos: string;
            exclusivoMeEpp: string;
            permiteConsorcio: string;
            exigeVisitaTecnica: string;
            regionalidade: string;
            permiteAdesao: string;
            percentualAdesao: string;
            vigenciaAtaMeses: string;
            vigenciaContratoDias: string;
            difal: string;
        };
        itens: FinalizeOportunidadeRegistrationItemDTO[];
        execucao: {
            entrega: {
                prazoEmDias: string;
                localEntrega: string;
                tipoEntrega: string;
                responsavelInstalacao: string;
            };
            pagamento: {
                prazoEmDias: string;
            };
            aceite: {
                prazoEmDias: string;
            };
            validadeProposta: string;
            garantia: {
                tipo: string;
                meses: string;
                tempoAtendimentoHoras: string;
            };
        };
        habilitacao: FinalizeOportunidadeRegistrationHabilitacaoDTO[];
        informacaoComplementar: string;
    };
}

export interface FinalizeOportunidadeRegistrationDTO {
    companyId: string;
    oportunidadeId?: string;
    form: FinalizeOportunidadeRegistrationFormDTO;
    userId: string;
    createdById?: string;
}
