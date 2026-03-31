/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogoDTO } from './CatalogoDTO';
import type { DominioGenericoDTO } from './DominioGenericoDTO';
import type { TipoMargemPreferenciaDTO } from './TipoMargemPreferenciaDTO';
export type RecuperarCompraItemSigiloDTO = {
  numeroItem?: number;
  descricao?: string;
  materialOuServico?: 'M' | 'S';
  materialOuServicoNome?: string;
  valorUnitarioEstimado?: number;
  valorTotal?: number;
  quantidade?: number;
  unidadeMedida?: string;
  orcamentoSigiloso?: boolean;
  itemCategoriaId?: number;
  itemCategoriaNome?: string;
  patrimonio?: string;
  codigoRegistroImobiliario?: string;
  criterioJulgamentoId?: number;
  criterioJulgamentoNome?: string;
  situacaoCompraItem?: '1' | '2' | '3' | '4' | '5';
  situacaoCompraItemNome?: string;
  tipoBeneficio?: '1' | '2' | '3' | '4' | '5';
  tipoBeneficioNome?: string;
  incentivoProdutivoBasico?: boolean;
  dataInclusao?: string;
  dataAtualizacao?: string;
  temResultado?: boolean;
  imagem?: number;
  aplicabilidadeMargemPreferenciaNormal?: boolean;
  aplicabilidadeMargemPreferenciaAdicional?: boolean;
  percentualMargemPreferenciaNormal?: number;
  percentualMargemPreferenciaAdicional?: number;
  ncmNbsCodigo?: string;
  ncmNbsDescricao?: string;
  catalogo?: CatalogoDTO;
  categoriaItemCatalogo?: DominioGenericoDTO;
  catalogoCodigoItem?: string;
  informacaoComplementar?: string;
  tipoMargemPreferencia?: TipoMargemPreferenciaDTO;
  exigenciaConteudoNacional?: boolean;
};

