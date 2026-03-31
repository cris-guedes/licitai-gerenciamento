/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchExternalContractDetailResponse = {
  numeroContratoEmpenho?: string;
  numeroControlePNCP?: string;
  numeroControlePncpCompra?: string;
  sequencialContrato?: number;
  anoContrato?: number;
  processo?: string;
  objetoContrato?: string;
  tipoContratoNome?: string;
  categoriaNome?: string;
  niFornecedor?: string;
  nomeRazaoSocialFornecedor?: string;
  tipoPessoa?: string;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  dataPublicacaoPncp?: string;
  dataAtualizacao?: string;
  valorInicial?: (number | null);
  valorGlobal?: (number | null);
  valorAcumulado?: (number | null);
  valorParcela?: (number | null);
  numeroParcelas?: number;
  numeroRetificacao?: number;
  receita?: boolean;
  informacaoComplementar?: (string | null);
  orgaoCnpj?: string;
  orgaoNome?: string;
  unidadeNome?: string;
  unidadeCodigo?: string;
  municipioNome?: string;
  ufSigla?: string;
};

