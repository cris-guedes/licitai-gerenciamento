/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlterarCompraItemDTO = {
  numeroItem: number;
  materialOuServico: 'M' | 'S';
  tipoBeneficioId: '1' | '2' | '3' | '4' | '5';
  incentivoProdutivoBasico: boolean;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
  orcamentoSigiloso: boolean;
  valorUnitarioEstimado: number;
  valorTotal: number;
  situacaoCompraItemId: '1' | '2' | '3' | '4' | '5';
  criterioJulgamentoId: number;
  justificativa?: string;
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

