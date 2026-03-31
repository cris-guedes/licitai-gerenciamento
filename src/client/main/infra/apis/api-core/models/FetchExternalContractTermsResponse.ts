/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchExternalContractTermsResponse = {
  terms: Array<{
    sequencialTermoContrato?: number;
    numeroTermoContrato?: string;
    tipoTermoContratoNome?: string;
    dataAssinatura?: string;
    dataVigenciaInicio?: string;
    dataVigenciaFim?: string;
    dataPublicacaoPncp?: string;
    niFornecedor?: string;
    nomeRazaoSocialFornecedor?: string;
    objetoTermoContrato?: string;
    valorGlobal?: (number | null);
    valorAcrescido?: (number | null);
    valorParcela?: (number | null);
    numeroParcelas?: number;
    prazoAditadoDias?: number;
    informacaoComplementar?: (string | null);
    informativoObservacao?: (string | null);
    fundamentoLegal?: (string | null);
  }>;
};

