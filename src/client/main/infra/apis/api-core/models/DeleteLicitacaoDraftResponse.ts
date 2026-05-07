/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeleteLicitacaoDraftResponse = {
  /**
   * ID da oportunidade excluída.
   */
  oportunidadeId: string;
  /**
   * Quantidade de documentos removidos junto com o rascunho.
   */
  deletedDocuments: number;
  /**
   * Confirma que o rascunho foi removido com sucesso.
   */
  deleted: boolean;
};

