/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlterarContratoDTO = {
  cnpjCompra: string;
  anoCompra?: number;
  sequencialCompra: number;
  tipoContratoId: number;
  numeroContratoEmpenho: string;
  processo: string;
  categoriaProcessoId: number;
  niFornecedor: string;
  tipoPessoaFornecedor: string;
  nomeRazaoSocialFornecedor: string;
  receita: boolean;
  codigoUnidade: string;
  objetoContrato: string;
  valorInicial: number;
  numeroParcelas: number;
  valorParcela: number;
  valorGlobal: number;
  dataAssinatura: string;
  dataVigenciaInicio: string;
  dataVigenciaFim: string;
  valorAcumulado?: number;
  niFornecedorSubContratado?: string;
  tipoPessoaFornecedorSubContratado?: string;
  nomeRazaoSocialFornecedorSubContratado?: string;
  informacaoComplementar?: string;
  urlCipi?: string;
  identificadorCipi?: string;
  cnpjOrgaoSubRogado?: string;
  codigoUnidadeSubRogada?: string;
  justificativa?: string;
};

