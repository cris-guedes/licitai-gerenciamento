/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListLicitacaoDraftsResponse = {
  /**
   * Lista de licitações em andamento que podem ser retomadas.
   */
  drafts: Array<{
    /**
     * ID da oportunidade em rascunho.
     */
    oportunidadeId: string;
    /**
     * Status atual da oportunidade.
     */
    oportunidadeStatus: 'DRAFT' | 'ACTIVE' | 'CANCELLED';
    /**
     * ID da licitação em andamento, quando já criada.
     */
    licitacaoId: (string | null);
    /**
     * Status atual da licitação, quando já criada.
     */
    licitacaoStatus: ('IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null);
    /**
     * ID do edital vinculado ao rascunho.
     */
    editalId: (string | null);
    /**
     * Status atual do edital vinculado.
     */
    editalStatus: ('IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null);
    /**
     * Nome do documento principal exibido como título do rascunho.
     */
    primaryDocumentName: (string | null);
    /**
     * Tipo do documento principal do rascunho.
     */
    primaryDocumentType: ('EDITAL' | 'ANEXO' | 'OUTRO' | null);
    /**
     * Prévia leve extraída da primeira página do edital para exibição no workspace.
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
     * Quantidade total de documentos anexados ao rascunho.
     */
    documentCount: number;
    /**
     * Quantidade de documentos já prontos para uso.
     */
    readyDocuments: number;
    /**
     * Quantidade de documentos ainda em processamento.
     */
    processingDocuments: number;
    /**
     * Quantidade de documentos que falharam no processamento.
     */
    failedDocuments: number;
    /**
     * Data ISO de criação da licitação.
     */
    createdAt: string;
    /**
     * Data ISO da última atualização da licitação.
     */
    updatedAt: string;
  }>;
};

