/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IncluirCompraItemDTO = {
  numeroItem: number;
  materialOuServico: 'M' | 'S';
  orcamentoSigiloso: boolean;
  tipoBeneficioId: '1' | '2' | '3' | '4' | '5';
  incentivoProdutivoBasico: boolean;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
  valorUnitarioEstimado: number;
  valorTotal: number;
  criterioJulgamentoId: number;
  /**
   * Código de patrimônio
   */
  patrimonio?: string;
  /**
   * Código de registro imobiliário
   */
  codigoRegistroImobiliario?: string;
  itemCategoriaId?: number;
  aplicabilidadeMargemPreferenciaNormal?: boolean;
  aplicabilidadeMargemPreferenciaAdicional?: boolean;
  codigoTipoMargemPreferencia?: number;
  percentualMargemPreferenciaNormal?: number;
  percentualMargemPreferenciaAdicional?: number;
  inConteudoNacional?: boolean;
  ncmNbsCodigo?: string;
  ncmNbsDescricao?: string;
  catalogoId?: number;
  categoriaItemCatalogoId?: number;
  catalogoCodigoItem?: string;
  informacaoComplementar?: string;
};

