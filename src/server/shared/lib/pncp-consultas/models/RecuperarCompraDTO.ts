/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContratacaoFonteOrcamentariaDTO } from './ContratacaoFonteOrcamentariaDTO';
import type { RecuperarAmparoLegalDTO } from './RecuperarAmparoLegalDTO';
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
export type RecuperarCompraDTO = {
  valorTotalEstimado?: number;
  valorTotalHomologado?: number;
  indicadorOrcamentoSigiloso?: 'COMPRA_SEM_SIGILO' | 'COMPRA_PARCIALMENTE_SIGILOSA' | 'COMPRA_TOTALMENTE_SIGILOSA';
  orcamentoSigilosoCodigo?: number;
  orcamentoSigilosoDescricao?: string;
  numeroControlePNCP?: string;
  linkSistemaOrigem?: string;
  linkProcessoEletronico?: string;
  anoCompra?: number;
  sequencialCompra?: number;
  numeroCompra?: string;
  processo?: string;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  modalidadeId?: number;
  modalidadeNome?: string;
  justificativaPresencial?: string;
  modoDisputaId?: number;
  modoDisputaNome?: string;
  tipoInstrumentoConvocatorioCodigo?: number;
  tipoInstrumentoConvocatorioNome?: string;
  amparoLegal?: RecuperarAmparoLegalDTO;
  objetoCompra?: string;
  informacaoComplementar?: string;
  srp?: boolean;
  fontesOrcamentarias?: Array<ContratacaoFonteOrcamentariaDTO>;
  dataPublicacaoPncp?: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  situacaoCompraId?: '1' | '2' | '3' | '4';
  situacaoCompraNome?: string;
  existeResultado?: boolean;
  dataInclusao?: string;
  dataAtualizacao?: string;
  dataAtualizacaoGlobal?: string;
  usuarioNome?: string;
};

