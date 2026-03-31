/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmparoLegal } from './AmparoLegal';
import type { Modalidade } from './Modalidade';
import type { ModoDisputa } from './ModoDisputa';
import type { OrgaoEntidade } from './OrgaoEntidade';
import type { TipoInstrumentoConvocatorio } from './TipoInstrumentoConvocatorio';
import type { UnidadeOrgao } from './UnidadeOrgao';
export type Compra = {
  id?: number;
  modalidade?: Modalidade;
  numeroCompra?: string;
  anoCompra?: number;
  processo?: string;
  tipoInstrumentoConvocatorio?: TipoInstrumentoConvocatorio;
  situacaoCompra?: '1' | '2' | '3' | '4';
  objetoCompra?: string;
  informacaoComplementar?: string;
  srp?: boolean;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  dataPublicacaoPncp?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  dataAtualizacaoGlobal?: string;
  sequencialCompra?: number;
  listaItensDescricao?: string;
  orgaoEntidade?: OrgaoEntidade;
  unidadeOrgao?: UnidadeOrgao;
  orgaoSubRogado?: OrgaoEntidade;
  unidadeSubRogada?: UnidadeOrgao;
  amparoLegal?: AmparoLegal;
  modoDisputa?: ModoDisputa;
  linkSistemaOrigem?: string;
  linkProcessoEletronico?: string;
  excluido?: boolean;
  atributoControle?: number;
  justificativaPresencial?: string;
  valorTotal?: number;
  valorTotalHomologado?: number;
  indicadorOrcamentoSigiloso?: 'IndicadorOrcamentoSigiloso.COMPRA_SEM_SIGILO(codigo=1, descricao=Compra sem sigilo)' | 'IndicadorOrcamentoSigiloso.COMPRA_PARCIALMENTE_SIGILOSA(codigo=2, descricao=Compra parcialmente sigilosa)' | 'IndicadorOrcamentoSigiloso.COMPRA_TOTALMENTE_SIGILOSA(codigo=3, descricao=Compra totalmente sigilosa)';
  existeResultado?: boolean;
  numeroControle?: string;
};

