/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlterarTermoContratoDTO = {
  tipoTermoContratoId: number;
  numeroTermoContrato?: string;
  objetoTermoContrato: string;
  qualificacaoAcrescimoSupressao: boolean;
  qualificacaoVigencia: boolean;
  qualificacaoFornecedor: boolean;
  qualificacaoInformativo: boolean;
  qualificacaoReajuste: boolean;
  dataAssinatura: string;
  niFornecedor?: string;
  tipoPessoaFornecedor?: string;
  nomeRazaoSocialFornecedor?: string;
  niFornecedorSubContratado?: string;
  tipoPessoaFornecedorSubContratado?: string;
  nomeRazaoSocialFornecedorSubContratado?: string;
  informativoObservacao?: string;
  fundamentoLegal?: string;
  valorAcrescido?: number;
  numeroParcelas?: number;
  valorParcela?: number;
  valorGlobal?: number;
  prazoAditadoDias?: number;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  justificativa?: string;
};

