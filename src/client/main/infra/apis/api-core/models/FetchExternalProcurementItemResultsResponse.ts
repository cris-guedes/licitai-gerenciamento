/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchExternalProcurementItemResultsResponse = {
  results: Array<{
    sequencialResultado?: number;
    niFornecedor?: string;
    nomeRazaoSocialFornecedor?: string;
    tipoPessoa?: string;
    porteFornecedorNome?: string;
    valorUnitarioHomologado?: number;
    valorTotalHomologado?: number;
    quantidadeHomologada?: number;
    percentualDesconto?: number;
    situacaoCompraItemResultadoNome?: string;
    aplicacaoBeneficioMeEpp?: boolean;
    dataResultado?: string;
    motivoCancelamento?: string;
  }>;
};

