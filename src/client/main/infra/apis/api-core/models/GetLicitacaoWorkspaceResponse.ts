/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetLicitacaoWorkspaceResponse = {
  oportunidade: {
    /**
     * ID da oportunidade em rascunho.
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
     * ID da licitação em andamento, quando já criada.
     */
    id: (string | null);
    /**
     * Status atual da licitação, quando já criada.
     */
    status: ('IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null);
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

