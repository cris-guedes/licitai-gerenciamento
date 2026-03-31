/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DominioGenericoResumidoDTO } from './DominioGenericoResumidoDTO';
import type { MoedaResumidoDTO } from './MoedaResumidoDTO';
import type { PaisResumidoDTO } from './PaisResumidoDTO';
export type RecuperarCompraItemResultadoDTO = {
  situacaoCompraItemResultadoId?: '1' | '2';
  aplicacaoMargemPreferencia?: boolean;
  aplicacaoBeneficioMeEpp?: boolean;
  aplicacaoCriterioDesempate?: boolean;
  naturezaJuridicaId?: string;
  situacaoCompraItemResultadoNome?: string;
  porteFornecedorNome?: string;
  sequencialResultado?: number;
  naturezaJuridicaNome?: string;
  dataAtualizacao?: string;
  niFornecedor?: string;
  tipoPessoa?: 'PJ' | 'PF' | 'PE';
  dataInclusao?: string;
  numeroItem?: number;
  valorTotalHomologado?: number;
  timezoneCotacaoMoedaEstrangeira?: string;
  moedaEstrangeira?: MoedaResumidoDTO;
  valorNominalMoedaEstrangeira?: number;
  dataCotacaoMoedaEstrangeira?: string;
  nomeRazaoSocialFornecedor?: string;
  codigoPais?: string;
  porteFornecedorId?: '1' | '2' | '3' | '4' | '5';
  quantidadeHomologada?: number;
  valorUnitarioHomologado?: number;
  percentualDesconto?: number;
  amparoLegalMargemPreferencia?: DominioGenericoResumidoDTO;
  amparoLegalCriterioDesempate?: DominioGenericoResumidoDTO;
  paisOrigemProdutoServico?: PaisResumidoDTO;
  indicadorSubcontratacao?: boolean;
  ordemClassificacaoSrp?: number;
  dataResultado?: string;
  motivoCancelamento?: string;
  dataCancelamento?: string;
  numeroControlePNCPCompra?: string;
};

