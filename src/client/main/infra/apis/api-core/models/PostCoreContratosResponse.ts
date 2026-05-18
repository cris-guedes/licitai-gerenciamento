/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostCoreContratosResponse = {
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
  createdAt?: string;
  updatedAt?: string;
  oportunidade?: any;
};

