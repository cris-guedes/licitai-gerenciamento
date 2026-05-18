import { z } from "zod";
import { LicitacaoDraftPreviewSchema } from "./draftPreview";

export const LicitacaoDraftSummarySchema = z.object({
    oportunidadeId: z.string().describe("ID da oportunidade em rascunho."),
    oportunidadeStatus: z.enum(["DRAFT", "ACTIVE", "CANCELLED"]).describe("Status atual da oportunidade."),
    licitacaoId: z.string().nullable().describe("ID da licitação em andamento, quando já criada."),
    licitacaoStatus: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).nullable().describe("Status atual da licitação, quando já criada."),
    editalId: z.string().nullable().describe("ID do edital vinculado ao rascunho."),
    editalStatus: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).nullable().describe("Status atual do edital vinculado."),
    primaryDocumentName: z.string().nullable().describe("Nome do documento principal exibido como título do rascunho."),
    primaryDocumentType: z.enum(["EDITAL", "ANEXO", "OUTRO"]).nullable().describe("Tipo do documento principal do rascunho."),
    draftPreview: LicitacaoDraftPreviewSchema.nullable().describe("Prévia leve extraída da primeira página do edital para exibição no workspace."),
    documentCount: z.number().describe("Quantidade total de documentos anexados ao rascunho."),
    readyDocuments: z.number().describe("Quantidade de documentos já prontos para uso."),
    processingDocuments: z.number().describe("Quantidade de documentos ainda em processamento."),
    failedDocuments: z.number().describe("Quantidade de documentos que falharam no processamento."),
    createdAt: z.string().describe("Data ISO de criação da licitação."),
    updatedAt: z.string().describe("Data ISO da última atualização da licitação."),
});

export const LicitacaoWorkspaceAnalysisSchema = z.object({
    id: z.string().describe("ID da análise persistida para o documento."),
    type: z.enum(["EXTRACT_EDITAL", "SUMMARY"]).describe("Tipo da análise gerada para o documento."),
    status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]).describe("Status da execução da análise."),
    markdownContent: z.string().nullable().describe("Conteúdo markdown opcional salvo junto da análise."),
    result: z.unknown().nullable().describe("Payload estruturado salvo como resultado da análise."),
    metrics: z.unknown().nullable().describe("Métricas e artefatos associados à execução da análise."),
    errorMessage: z.string().nullable().describe("Mensagem de erro, quando a análise falhou."),
    startedAt: z.string().nullable().describe("Data ISO de início da análise."),
    finishedAt: z.string().nullable().describe("Data ISO de término da análise."),
    createdAt: z.string().describe("Data ISO em que a análise foi criada."),
    updatedAt: z.string().describe("Data ISO da última atualização da análise."),
});

export const LicitacaoWorkspaceDocumentSchema = z.object({
    id: z.string().describe("ID do documento vinculado à licitação."),
    type: z.enum(["EDITAL", "ANEXO", "OUTRO"]).describe("Tipo do documento."),
    displayName: z.string().nullable().describe("Nome amigável opcional para exibição na UI, quando disponível."),
    originalName: z.string().describe("Nome original do arquivo enviado."),
    mimeType: z.string().describe("Mime type do documento."),
    sizeBytes: z.number().describe("Tamanho do arquivo em bytes."),
    status: z.enum(["PROCESSING", "READY", "FAILED"]).describe("Status atual do documento na pipeline."),
    documentUrl: z.string().describe("URL temporária do arquivo para leitura e preview."),
    previewUrl: z.string().describe("URL temporária do preview do documento."),
    previewUrlExpiresAt: z.string().describe("Data ISO de expiração da URL temporária."),
    uploadedAt: z.string().describe("Data ISO da última atualização relevante do documento."),
    analyses: z.array(LicitacaoWorkspaceAnalysisSchema).describe("Últimas análises persistidas para o documento."),
});

const LicitacaoWorkspaceCronogramaSchema = z.object({
    acolhimentoInicio: z.string().nullable(),
    acolhimentoFim: z.string().nullable(),
    horaLimite: z.string().nullable(),
    sessaoPublicaEm: z.string().nullable(),
    esclarecimentosAte: z.string().nullable(),
    impugnacaoAte: z.string().nullable(),
});

const LicitacaoWorkspaceCertameSchema = z.object({
    modoDisputa: z.string().nullable(),
    criterioJulgamento: z.string().nullable(),
    tipoLance: z.string().nullable(),
    intervaloLances: z.string().nullable(),
    duracaoSessaoMinutos: z.number().nullable(),
    exclusivoMeEpp: z.boolean().nullable(),
    permiteConsorcio: z.boolean().nullable(),
    exigeVisitaTecnica: z.boolean().nullable(),
    permiteAdesao: z.boolean().nullable(),
    percentualAdesao: z.string().nullable(),
    regionalidade: z.string().nullable(),
    difal: z.boolean().nullable(),
    vigenciaAtaMeses: z.number().nullable(),
    vigenciaContratoDias: z.number().nullable(),
});

const LicitacaoWorkspaceExecucaoSchema = z.object({
    prazoEntregaDias: z.string().nullable(),
    localEntrega: z.string().nullable(),
    tipoEntrega: z.string().nullable(),
    responsavelInstalacao: z.string().nullable(),
    prazoPagamentoDias: z.string().nullable(),
    prazoAceiteDias: z.string().nullable(),
    validadePropostaDias: z.string().nullable(),
    garantiaTipo: z.string().nullable(),
    garantiaMeses: z.string().nullable(),
    garantiaTempoAtendimentoHoras: z.string().nullable(),
});

export const LicitacaoWorkspaceCompanyItemSummarySchema = z.object({
    id: z.string().describe("ID do item interno da empresa vinculado ao item do edital."),
    codigo: z.string().describe("Codigo interno do item da empresa."),
    descricao: z.string().describe("Descricao do item interno da empresa."),
    marca: z.string().nullable().describe("Marca comercial do item interno, quando informada."),
    unidadeMedida: z.string().describe("Unidade de medida do item interno."),
    imageUrl: z.string().nullable().describe("URL da imagem do item interno, quando disponivel."),
    precoReferencia: z.string().nullable().describe("Preco de referencia atualmente salvo no catalogo interno."),
    ativo: z.boolean().describe("Indica se o item interno está ativo no catalogo da empresa."),
    updatedAt: z.string().describe("Data ISO da ultima atualizacao do item interno."),
});

export const LicitacaoWorkspaceItemPricingSchema = z.object({
    id: z.string().describe("ID da configuracao de precificacao do item da oportunidade."),
    quantidadeCotada: z.string().nullable().describe("Quantidade efetivamente considerada para a proposta."),
    quantidadeAdesao: z.string().nullable().describe("Quantidade adicional prevista para adesao, quando aplicavel."),
    precoOfertaUnitario: z.string().nullable().describe("Preco unitario ofertado pela empresa."),
    precoOfertaTotal: z.string().nullable().describe("Preco total calculado para a oferta do item."),
    custoUnitarioSnapshot: z.string().nullable().describe("Custo unitario congelado para a precificacao desta oportunidade."),
    valorMinimoLance: z.string().nullable().describe("Valor minimo definido internamente para a fase de lances."),
    ofertaMarca: z.string().nullable().describe("Marca efetivamente ofertada para este item."),
    ofertaModelo: z.string().nullable().describe("Modelo efetivamente ofertado para este item."),
    garantiaDescricao: z.string().nullable().describe("Descricao da garantia comercial prometida para este item."),
});

export const LicitacaoWorkspaceItemDisputaSchema = z.object({
    id: z.string().describe("ID do registro operacional da disputa do item."),
    ultimoLance: z.string().nullable().describe("Ultimo lance registrado pela empresa para o item."),
    dataUltimoLance: z.string().nullable().describe("Data ISO do ultimo lance informado."),
    situacaoDisputa: z.string().nullable().describe("Situacao textual resumida da disputa do item."),
    observacaoOperacional: z.string().nullable().describe("Observacoes operacionais da fase de disputa."),
});

export const LicitacaoWorkspaceItemSchema = z.object({
    id: z.string().describe("ID do item oficial do edital."),
    oportunidadeItemId: z.string().nullable().describe("ID do item operacional da oportunidade que gerencia este item do edital."),
    numeroItem: z.number().nullable().describe("Numero sequencial do item no edital."),
    descricao: z.string().nullable().describe("Descricao oficial do item no edital."),
    tipoItem: z.string().nullable().describe("Tipo do item no edital, como material ou servico."),
    lote: z.string().nullable().describe("Identificacao do lote ao qual o item pertence, quando houver."),
    quantidadeTotal: z.string().nullable().describe("Quantidade total solicitada no edital."),
    unidadeMedida: z.string().nullable().describe("Unidade de medida oficial do item no edital."),
    valorUnitarioEstimado: z.string().nullable().describe("Valor unitario estimado pelo edital."),
    valorTotalEstimado: z.string().nullable().describe("Valor total estimado pelo edital."),
    codigoCatmatCatser: z.string().nullable().describe("Codigo CATMAT ou CATSER informado pelo edital."),
    codigoNcmNbs: z.string().nullable().describe("Codigo NCM ou NBS informado pelo edital."),
    criterioJulgamentoItem: z.string().nullable().describe("Criterio de julgamento do item no edital."),
    beneficioTributario: z.string().nullable().describe("Beneficio tributario associado ao item, quando existir."),
    observacao: z.string().nullable().describe("Observacoes oficiais do item no edital."),
    isSelected: z.boolean().describe("Indica se o item continua ativo para a proposta da empresa."),
    status: z.enum(["PENDING_PRICING", "READY_FOR_BID", "IN_BIDDING", "WON", "LOST", "DISCARDED"]).describe("Status operacional do item dentro da oportunidade."),
    observacaoInterna: z.string().nullable().describe("Observacoes internas do time comercial para este item."),
    companyItem: LicitacaoWorkspaceCompanyItemSummarySchema.nullable().describe("Item interno atualmente vinculado ao item do edital."),
    pricing: LicitacaoWorkspaceItemPricingSchema.nullable().describe("Dados de precificacao salvos para este item da oportunidade."),
    disputa: LicitacaoWorkspaceItemDisputaSchema.nullable().describe("Dados correntes da fase de disputa do item."),
});

const LicitacaoWorkspaceOrgaoSchema = z.object({
    id: z.string(),
    papel: z.string(),
    orgao: z.object({
        id: z.string(),
        cnpj: z.string().nullable(),
        razaoSocial: z.string().nullable(),
        codigoUnidade: z.string().nullable(),
        nomeUnidade: z.string().nullable(),
        municipio: z.string().nullable(),
        uf: z.string().nullable(),
        esfera: z.string().nullable(),
        poder: z.string().nullable(),
    }),
    itens: z.array(z.object({
        id: z.string(),
        editalItemId: z.string(),
        numeroItem: z.number().nullable(),
        descricao: z.string().nullable(),
        quantidadeSolicitada: z.string().nullable(),
    })),
});

const LicitacaoWorkspaceHabilitacaoSchema = z.object({
    id: z.string(),
    tipo: z.string(),
    categoria: z.string(),
    obrigatorio: z.boolean(),
    ordem: z.number().nullable(),
});

export const LicitacaoWorkspaceActorSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});

export const LicitacaoWorkspaceTaskSchema = z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(["OPEN", "DONE"]),
    dueAt: z.string().nullable(),
    completedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: LicitacaoWorkspaceActorSchema,
});

export const LicitacaoWorkspaceNoteSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: LicitacaoWorkspaceActorSchema,
});

export const LicitacaoWorkspaceSchema = z.object({
    oportunidade: z.object({
        id: z.string().describe("ID da oportunidade."),
        status: z.enum(["DRAFT", "ACTIVE", "CANCELLED"]).describe("Status atual da oportunidade."),
        draftPreview: LicitacaoDraftPreviewSchema.nullable().describe("Prévia leve derivada da primeira página do edital principal."),
        createdAt: z.string().describe("Data ISO de criação da oportunidade."),
        updatedAt: z.string().describe("Data ISO da última atualização da oportunidade."),
    }),
    licitacao: z.object({
        id: z.string().nullable().describe("ID da licitação, quando já criada."),
        status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).nullable().describe("Status atual da licitação, quando já criada."),
        sourceSystem: z.enum(["PNCP", "COMPRAS_GOV", "PORTAL_EXTERNO", "MANUAL"]).nullable().describe("Sistema de origem da licitação."),
        sourceReference: z.string().nullable().describe("Referência externa da licitação no sistema de origem."),
        numeroControlePncp: z.string().nullable().describe("Número de controle PNCP, quando disponível."),
        anoCompra: z.number().nullable().describe("Ano da compra no sistema de origem."),
        sequencialCompra: z.number().nullable().describe("Sequencial da compra no sistema de origem."),
        numeroLicitacao: z.string().nullable().describe("Número da licitação."),
        processoAdministrativo: z.string().nullable().describe("Processo administrativo da licitação."),
        modalidadeNome: z.string().nullable().describe("Modalidade da licitação."),
        tipoInstrumentoNome: z.string().nullable().describe("Tipo de instrumento da licitação."),
        objetoResumo: z.string().nullable().describe("Objeto ou resumo da licitação."),
        situacaoOficial: z.string().nullable().describe("Situação oficial no portal de origem."),
        valorEstimadoTotal: z.string().nullable().describe("Valor estimado total da licitação."),
        valorHomologadoTotal: z.string().nullable().describe("Valor homologado total da licitação."),
        dataPublicacao: z.string().nullable().describe("Data ISO de publicação da licitação."),
        dataAberturaProposta: z.string().nullable().describe("Data ISO de abertura de propostas."),
        dataEncerramentoProposta: z.string().nullable().describe("Data ISO de encerramento de propostas."),
        linkSistemaOrigem: z.string().nullable().describe("Link para o sistema de origem."),
        linkProcessoEletronico: z.string().nullable().describe("Link para o processo eletrônico."),
        ultimaAtualizacaoOficial: z.string().nullable().describe("Data ISO da última atualização oficial."),
        draftPreview: LicitacaoDraftPreviewSchema.nullable().describe("Prévia leve derivada da primeira página do edital principal."),
        createdAt: z.string().describe("Data ISO de criação da licitação."),
        updatedAt: z.string().describe("Data ISO da última atualização da licitação."),
    }),
    edital: z.object({
        id: z.string().describe("ID do edital vinculado."),
        status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).describe("Status atual do edital."),
        versao: z.number().describe("Versão do edital."),
        isAtual: z.boolean().describe("Indica se esta é a versão atual do edital."),
        tipoVersao: z.enum(["ORIGINAL", "RETIFICACAO", "ADENDO", "CONSOLIDADO"]).describe("Tipo da versão do edital."),
        documentoPrincipalId: z.string().nullable().describe("Documento principal vinculado ao edital."),
        orgaoCnpj: z.string().nullable().describe("CNPJ do órgão registrado no edital."),
        orgaoRazaoSocial: z.string().nullable().describe("Razão social do órgão registrada no edital."),
        orgaoEsfera: z.string().nullable().describe("Esfera do órgão registrada no edital."),
        orgaoPoder: z.string().nullable().describe("Poder do órgão registrado no edital."),
        unidadeCodigo: z.string().nullable().describe("Código da unidade registrada no edital."),
        unidadeNome: z.string().nullable().describe("Nome da unidade registrada no edital."),
        municipio: z.string().nullable().describe("Município registrado no edital."),
        uf: z.string().nullable().describe("UF registrada no edital."),
        numero: z.string().nullable().describe("Número registrado no edital."),
        processo: z.string().nullable().describe("Processo registrado no edital."),
        modalidade: z.string().nullable().describe("Modalidade registrada no edital."),
        tipoInstrumento: z.string().nullable().describe("Tipo de instrumento registrado no edital."),
        modoDisputa: z.string().nullable().describe("Modo de disputa registrado no edital."),
        objeto: z.string().nullable().describe("Objeto registrado no edital."),
        valorEstimado: z.string().nullable().describe("Valor estimado registrado no edital."),
        dataAbertura: z.string().nullable().describe("Data ISO de abertura registrada no edital."),
        dataEncerramento: z.string().nullable().describe("Data ISO de encerramento registrada no edital."),
        informacaoComplementar: z.string().nullable().describe("Informação complementar registrada no edital."),
        amparoLegal: z.string().nullable().describe("Amparo legal registrado no edital."),
        srp: z.boolean().describe("Indica se o edital usa sistema de registro de preços."),
        cronograma: LicitacaoWorkspaceCronogramaSchema.nullable().describe("Cronograma operacional do edital."),
        certame: LicitacaoWorkspaceCertameSchema.nullable().describe("Regras principais do certame."),
        execucao: LicitacaoWorkspaceExecucaoSchema.nullable().describe("Condições de execução capturadas no cadastro."),
        itens: z.array(LicitacaoWorkspaceItemSchema).describe("Itens detalhados do edital."),
        orgaos: z.array(LicitacaoWorkspaceOrgaoSchema).describe("Órgãos vinculados ao edital e distribuição de itens."),
        habilitacoes: z.array(LicitacaoWorkspaceHabilitacaoSchema).describe("Exigências de habilitação do edital."),
        createdAt: z.string().describe("Data ISO de criação do edital."),
        updatedAt: z.string().describe("Data ISO da última atualização do edital."),
    }).nullable(),
    documents: z.array(LicitacaoWorkspaceDocumentSchema).describe("Documentos e artefatos do workspace de IA da licitação."),
    tasks: z.array(LicitacaoWorkspaceTaskSchema).describe("Tarefas operacionais da oportunidade."),
    notes: z.array(LicitacaoWorkspaceNoteSchema).describe("Notas internas registradas para a oportunidade."),
});
