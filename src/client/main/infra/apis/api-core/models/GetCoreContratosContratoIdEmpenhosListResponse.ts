/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetCoreContratosContratoIdEmpenhosListResponse = {
  /**
   * Lista de notas de empenho do contrato
   */
  data: Array<{
    /**
     * ID do Empenho gerado
     */
    id: string;
    /**
     * Número do Empenho
     */
    numeroEmpenho: string;
    /**
     * Valor do empenho
     */
    valor: number;
    /**
     * Status do empenho
     */
    status: string;
  }>;
  /**
   * Total de empenhos
   */
  totalRegistros: number;
};

