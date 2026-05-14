/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetLicitacaoWorkspaceResponse = {
  oportunidade: {
    /**
     * ID da oportunidade.
     */
    id: string;
    /**
     * Status atual da oportunidade.
     */
    status: 'DRAFT' | 'ACTIVE' | 'CANCELLED';
    /**
     * Prévia leve derivada da primeira página do edital principal.
     */
    draftPreview: ({
      source: string;
      sourceDocumentId: string;
      sourcePage: number;
      extractedAt: string;
      displayName: (string | null);
      orgaoNome: (string | null);
      modalidade: (string | null);
      numero: (string | null);
      objetoResumo: (string | null);
      dataAbertura: (string | null);
    } | null);
    /**
     * Data ISO de criação da oportunidade.
     */
    createdAt: string;
    /**
     * Data ISO da última atualização da oportunidade.
     */
    updatedAt: string;
  };
  licitacao: {
    /**
     * ID da licitação, quando já criada.
     */
    id: (string | null);
    /**
     * Status atual da licitação, quando já criada.
     */
    status: ('IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null);
    /**
     * Sistema de origem da licitação.
     */
    sourceSystem: ('PNCP' | 'COMPRAS_GOV' | 'PORTAL_EXTERNO' | 'MANUAL' | null);
    /**
     * Referência externa da licitação no sistema de origem.
     */
    sourceReference: (string | null);
    /**
     * Número de controle PNCP, quando disponível.
     */
    numeroControlePncp: (string | null);
    /**
     * Ano da compra no sistema de origem.
     */
    anoCompra: (number | null);
    /**
     * Sequencial da compra no sistema de origem.
     */
    sequencialCompra: (number | null);
    /**
     * Número da licitação.
     */
    numeroLicitacao: (string | null);
    /**
     * Processo administrativo da licitação.
     */
    processoAdministrativo: (string | null);
    /**
     * Modalidade da licitação.
     */
    modalidadeNome: (string | null);
    /**
     * Tipo de instrumento da licitação.
     */
    tipoInstrumentoNome: (string | null);
    /**
     * Objeto ou resumo da licitação.
     */
    objetoResumo: (string | null);
    /**
     * Situação oficial no portal de origem.
     */
    situacaoOficial: (string | null);
    /**
     * Valor estimado total da licitação.
     */
    valorEstimadoTotal: (string | null);
    /**
     * Valor homologado total da licitação.
     */
    valorHomologadoTotal: (string | null);
    /**
     * Data ISO de publicação da licitação.
     */
    dataPublicacao: (string | null);
    /**
     * Data ISO de abertura de propostas.
     */
    dataAberturaProposta: (string | null);
    /**
     * Data ISO de encerramento de propostas.
     */
    dataEncerramentoProposta: (string | null);
    /**
     * Link para o sistema de origem.
     */
    linkSistemaOrigem: (string | null);
    /**
     * Link para o processo eletrônico.
     */
    linkProcessoEletronico: (string | null);
    /**
     * Data ISO da última atualização oficial.
     */
    ultimaAtualizacaoOficial: (string | null);
    /**
     * Prévia leve derivada da primeira página do edital principal.
     */
    draftPreview: ({
      source: string;
      sourceDocumentId: string;
      sourcePage: number;
      extractedAt: string;
      displayName: (string | null);
      orgaoNome: (string | null);
      modalidade: (string | null);
      numero: (string | null);
      objetoResumo: (string | null);
      dataAbertura: (string | null);
    } | null);
    /**
     * Data ISO de criação da licitação.
     */
    createdAt: string;
    /**
     * Data ISO da última atualização da licitação.
     */
    updatedAt: string;
  };
  edital: ({
    /**
     * ID do edital vinculado.
     */
    id: string;
    /**
     * Status atual do edital.
     */
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    /**
     * Versão do edital.
     */
    versao: number;
    /**
     * Indica se esta é a versão atual do edital.
     */
    isAtual: boolean;
    /**
     * Tipo da versão do edital.
     */
    tipoVersao: 'ORIGINAL' | 'RETIFICACAO' | 'ADENDO' | 'CONSOLIDADO';
    /**
     * Documento principal vinculado ao edital.
     */
    documentoPrincipalId: (string | null);
    /**
     * CNPJ do órgão registrado no edital.
     */
    orgaoCnpj: (string | null);
    /**
     * Razão social do órgão registrada no edital.
     */
    orgaoRazaoSocial: (string | null);
    /**
     * Esfera do órgão registrada no edital.
     */
    orgaoEsfera: (string | null);
    /**
     * Poder do órgão registrado no edital.
     */
    orgaoPoder: (string | null);
    /**
     * Código da unidade registrada no edital.
     */
    unidadeCodigo: (string | null);
    /**
     * Nome da unidade registrada no edital.
     */
    unidadeNome: (string | null);
    /**
     * Município registrado no edital.
     */
    municipio: (string | null);
    /**
     * UF registrada no edital.
     */
    uf: (string | null);
    /**
     * Número registrado no edital.
     */
    numero: (string | null);
    /**
     * Processo registrado no edital.
     */
    processo: (string | null);
    /**
     * Modalidade registrada no edital.
     */
    modalidade: (string | null);
    /**
     * Tipo de instrumento registrado no edital.
     */
    tipoInstrumento: (string | null);
    /**
     * Modo de disputa registrado no edital.
     */
    modoDisputa: (string | null);
    /**
     * Objeto registrado no edital.
     */
    objeto: (string | null);
    /**
     * Valor estimado registrado no edital.
     */
    valorEstimado: (string | null);
    /**
     * Data ISO de abertura registrada no edital.
     */
    dataAbertura: (string | null);
    /**
     * Data ISO de encerramento registrada no edital.
     */
    dataEncerramento: (string | null);
    /**
     * Informação complementar registrada no edital.
     */
    informacaoComplementar: (string | null);
    /**
     * Amparo legal registrado no edital.
     */
    amparoLegal: (string | null);
    /**
     * Indica se o edital usa sistema de registro de preços.
     */
    srp: boolean;
    /**
     * Cronograma operacional do edital.
     */
    cronograma: ({
      acolhimentoInicio: (string | null);
      acolhimentoFim: (string | null);
      horaLimite: (string | null);
      sessaoPublicaEm: (string | null);
      esclarecimentosAte: (string | null);
      impugnacaoAte: (string | null);
    } | null);
    /**
     * Regras principais do certame.
     */
    certame: ({
      modoDisputa: (string | null);
      criterioJulgamento: (string | null);
      tipoLance: (string | null);
      intervaloLances: (string | null);
      duracaoSessaoMinutos: (number | null);
      exclusivoMeEpp: (boolean | null);
      permiteConsorcio: (boolean | null);
      exigeVisitaTecnica: (boolean | null);
      permiteAdesao: (boolean | null);
      percentualAdesao: (string | null);
      regionalidade: (string | null);
      difal: (boolean | null);
      vigenciaAtaMeses: (number | null);
      vigenciaContratoDias: (number | null);
    } | null);
    /**
     * Condições de execução capturadas no cadastro.
     */
    execucao: ({
      prazoEntregaDias: (string | null);
      localEntrega: (string | null);
      tipoEntrega: (string | null);
      responsavelInstalacao: (string | null);
      prazoPagamentoDias: (string | null);
      prazoAceiteDias: (string | null);
      validadePropostaDias: (string | null);
      garantiaTipo: (string | null);
      garantiaMeses: (string | null);
      garantiaTempoAtendimentoHoras: (string | null);
    } | null);
    /**
     * Itens detalhados do edital.
     */
    itens: Array<{
      id: string;
      numeroItem: (number | null);
      descricao: (string | null);
      tipoItem: (string | null);
      lote: (string | null);
      quantidadeTotal: (string | null);
      unidadeMedida: (string | null);
      valorUnitarioEstimado: (string | null);
      valorTotalEstimado: (string | null);
      codigoCatmatCatser: (string | null);
      codigoNcmNbs: (string | null);
      criterioJulgamentoItem: (string | null);
      beneficioTributario: (string | null);
      observacao: (string | null);
    }>;
    /**
     * Órgãos vinculados ao edital e distribuição de itens.
     */
    orgaos: Array<{
      id: string;
      papel: string;
      orgao: {
        id: string;
        cnpj: (string | null);
        razaoSocial: (string | null);
        codigoUnidade: (string | null);
        nomeUnidade: (string | null);
        municipio: (string | null);
        uf: (string | null);
        esfera: (string | null);
        poder: (string | null);
      };
      itens: Array<{
        id: string;
        editalItemId: string;
        numeroItem: (number | null);
        descricao: (string | null);
        quantidadeSolicitada: (string | null);
      }>;
    }>;
    /**
     * Exigências de habilitação do edital.
     */
    habilitacoes: Array<{
      id: string;
      tipo: string;
      categoria: string;
      obrigatorio: boolean;
      ordem: (number | null);
    }>;
    /**
     * Data ISO de criação do edital.
     */
    createdAt: string;
    /**
     * Data ISO da última atualização do edital.
     */
    updatedAt: string;
  } | null);
  /**
   * Documentos e artefatos do workspace de IA da licitação.
   */
  documents: Array<{
    /**
     * ID do documento vinculado à licitação.
     */
    id: string;
    /**
     * Tipo do documento.
     */
    type: 'EDITAL' | 'ANEXO' | 'OUTRO';
    /**
     * Nome amigável opcional para exibição na UI, quando disponível.
     */
    displayName: (string | null);
    /**
     * Nome original do arquivo enviado.
     */
    originalName: string;
    /**
     * Mime type do documento.
     */
    mimeType: string;
    /**
     * Tamanho do arquivo em bytes.
     */
    sizeBytes: number;
    /**
     * Status atual do documento na pipeline.
     */
    status: 'PROCESSING' | 'READY' | 'FAILED';
    /**
     * URL temporária do arquivo para leitura e preview.
     */
    documentUrl: string;
    /**
     * URL temporária do preview do documento.
     */
    previewUrl: string;
    /**
     * Data ISO de expiração da URL temporária.
     */
    previewUrlExpiresAt: string;
    /**
     * Data ISO da última atualização relevante do documento.
     */
    uploadedAt: string;
    /**
     * Últimas análises persistidas para o documento.
     */
    analyses: Array<{
      /**
       * ID da análise persistida para o documento.
       */
      id: string;
      /**
       * Tipo da análise gerada para o documento.
       */
      type: 'EXTRACT_EDITAL' | 'SUMMARY';
      /**
       * Status da execução da análise.
       */
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
      /**
       * Conteúdo markdown opcional salvo junto da análise.
       */
      markdownContent: (string | null);
      /**
       * Payload estruturado salvo como resultado da análise.
       */
      result: null;
      /**
       * Métricas e artefatos associados à execução da análise.
       */
      metrics: null;
      /**
       * Mensagem de erro, quando a análise falhou.
       */
      errorMessage: (string | null);
      /**
       * Data ISO de início da análise.
       */
      startedAt: (string | null);
      /**
       * Data ISO de término da análise.
       */
      finishedAt: (string | null);
      /**
       * Data ISO em que a análise foi criada.
       */
      createdAt: string;
      /**
       * Data ISO da última atualização da análise.
       */
      updatedAt: string;
    }>;
  }>;
};

