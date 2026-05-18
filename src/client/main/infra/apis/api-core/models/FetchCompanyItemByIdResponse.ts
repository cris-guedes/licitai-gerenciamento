/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchCompanyItemByIdResponse = {
  /**
   * ID do item da empresa
   */
  id: string;
  /**
   * ID da empresa dona do item
   */
  companyId: string;
  /**
   * Codigo interno do item
   */
  codigo: string;
  /**
   * Descricao principal do item
   */
  descricao: string;
  /**
   * Marca comercial do item, quando informada
   */
  marca: (string | null);
  /**
   * Unidade de medida operacional do item
   */
  unidadeMedida: string;
  /**
   * Imagem principal do item para exibição no catálogo
   */
  imageUrl: (string | null);
  /**
   * Preço de referência do item
   */
  precoReferencia: (number | null);
  /**
   * Indica se o item pode ser usado nos fluxos operacionais
   */
  ativo: boolean;
  /**
   * Data de criacao do item
   */
  createdAt: string;
  /**
   * Data da ultima atualizacao do item
   */
  updatedAt: string;
};

