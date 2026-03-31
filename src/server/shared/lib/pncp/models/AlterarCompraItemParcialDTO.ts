/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlterarCompraItemParcialDTO = {
  materialOuServico?: 'M' | 'S';
  tipoBeneficioId?: '1' | '2' | '3' | '4' | '5';
  incentivoProdutivoBasico?: boolean;
  descricao?: string;
  quantidade?: number;
  unidadeMedida?: string;
  valorUnitarioEstimado?: number;
  valorTotal?: number;
  orcamentoSigiloso?: boolean;
  situacaoCompraItemId?: '1' | '2' | '3' | '4' | '5';
  criterioJulgamentoId?: number;
  patrimonio?: string;
  codigoRegistroImobiliario?: string;
  itemCategoriaId?: number;
  justificativa?: string;
  aplicabilidadeMargemPreferenciaNormal?: boolean;
  aplicabilidadeMargemPreferenciaAdicional?: boolean;
  codigoTipoMargemPreferencia?: number;
  percentualMargemPreferenciaNormal?: number;
  percentualMargemPreferenciaAdicional?: number;
  ncmNbsCodigo?: string;
  ncmNbsDescricao?: string;
  inConteudoNacional?: boolean;
  catalogoId?: number;
  categoriaItemCatalogoId?: number;
  catalogoCodigoItem?: string;
  informacaoComplementar?: string;
};

