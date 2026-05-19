/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetCoreContratosListResponse = {
  /**
   * Lista de contratos
   */
  data: Array<{
    /**
     * ID do Contrato
     */
    id: string;
    /**
     * ID da Oportunidade
     */
    oportunidadeId: string;
    /**
     * ID da empresa
     */
    companyId: string;
    /**
     * Número do contrato
     */
    numeroContrato: (string | null);
    anoContrato?: (number | null);
    processo?: (string | null);
    objetoContrato?: (string | null);
    tipoContrato?: (string | null);
    fornecedorCnpjCpf?: (string | null);
    fornecedorNome?: (string | null);
    valorInicial?: (string | null);
    valorGlobal?: (string | null);
    valorTotal?: (string | null);
    dataAssinatura?: (string | null);
    dataVigenciaInicio?: (string | null);
    dataVigenciaFim?: (string | null);
    /**
     * Status do contrato
     */
    status: string;
    orgaoContratante?: ({
      editalOrgaoId?: (string | null);
      orgaoId?: (string | null);
      papel?: string;
      cnpj?: (string | null);
      razaoSocial?: (string | null);
      codigoUnidade?: (string | null);
      nomeUnidade?: (string | null);
      municipio?: (string | null);
      uf?: (string | null);
      esfera?: (string | null);
      poder?: (string | null);
    } | null);
    createdAt?: string;
    updatedAt?: string;
    oportunidade?: any;
  }>;
  /**
   * Total de resultados
   */
  totalRegistros: number;
};

