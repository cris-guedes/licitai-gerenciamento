/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UploadEditalDocumentResponse = {
  /**
   * ID interno do processo licitatório criado para acompanhar o fluxo global da licitação.
   */
  licitacaoId: string;
  /**
   * Status global inicial do processo licitatório após o upload do edital.
   */
  licitacaoStatus: 'IN_PROGRESS';
  /**
   * ID interno do edital criado para concentrar os dados ricos e documentos do certame.
   */
  editalId: string;
  /**
   * Status inicial do edital criado junto ao processo licitatório.
   */
  editalStatus: 'IN_PROGRESS';
  /**
   * ID interno do documento armazenado.
   */
  documentId: string;
  /**
   * Tipo de documento aceito neste fluxo inicial.
   */
  documentType: string;
  /**
   * Nome original do arquivo enviado.
   */
  originalName: string;
  /**
   * MIME type persistido para o documento.
   */
  mimeType: string;
  /**
   * Tamanho do arquivo armazenado em bytes.
   */
  sizeBytes: number;
  /**
   * Status final do documento após o upload simples.
   */
  status: 'READY';
  /**
   * URL pública do documento armazenado para preview e consumo posterior.
   */
  documentUrl: string;
  /**
   * URL utilizada pelo frontend para renderizar o preview do edital.
   */
  previewUrl: string;
  /**
   * Data/hora ISO de expiração da URL temporária de preview do documento.
   */
  previewUrlExpiresAt: string;
  /**
   * Data/hora ISO em que o documento foi persistido.
   */
  uploadedAt: string;
};

