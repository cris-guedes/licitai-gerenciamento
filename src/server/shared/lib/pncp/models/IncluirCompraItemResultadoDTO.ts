/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IncluirCompraItemResultadoDTO = {
  quantidadeHomologada?: number;
  valorUnitarioHomologado?: number;
  valorTotalHomologado?: number;
  percentualDesconto?: number;
  aplicacaoMargemPreferencia?: boolean;
  amparoLegalMargemPreferenciaId?: number;
  aplicacaoBeneficioMeEpp?: boolean;
  aplicacaoCriterioDesempate?: boolean;
  amparoLegalCriterioDesempateId?: number;
  simboloMoedaEstrangeira?: string;
  dataCotacaoMoedaEstrangeira?: string;
  timezoneCotacaoMoedaEstrangeira?: string;
  valorNominalMoedaEstrangeira?: number;
  paisOrigemProdutoServicoId?: string;
  tipoPessoaId?: 'PJ' | 'PF' | 'PE';
  niFornecedor?: string;
  nomeRazaoSocialFornecedor?: string;
  porteFornecedorId?: '1' | '2' | '3' | '4' | '5';
  codigoPais?: string;
  indicadorSubcontratacao?: boolean;
  ordemClassificacaoSrp?: number;
  dataResultado?: string;
  naturezaJuridicaId?: string;
};

