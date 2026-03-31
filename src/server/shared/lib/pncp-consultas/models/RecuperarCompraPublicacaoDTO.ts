/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContratacaoFonteOrcamentariaDTO } from './ContratacaoFonteOrcamentariaDTO';
import type { RecuperarAmparoLegalDTO } from './RecuperarAmparoLegalDTO';
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
export type RecuperarCompraPublicacaoDTO = {
  dataAtualizacao?: string;
  valorTotalEstimado?: number;
  modalidadeNome?: string;
  modoDisputaNome?: string;
  fontesOrcamentarias?: Array<ContratacaoFonteOrcamentariaDTO>;
  situacaoCompraId?: '1' | '2' | '3' | '4';
  situacaoCompraNome?: string;
  usuarioNome?: string;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  anoCompra?: number;
  sequencialCompra?: number;
  numeroCompra?: string;
  processo?: string;
  objetoCompra?: string;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  valorTotalHomologado?: number;
  srp?: boolean;
  dataInclusao?: string;
  amparoLegal?: RecuperarAmparoLegalDTO;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  informacaoComplementar?: string;
  linkSistemaOrigem?: string;
  justificativaPresencial?: string;
  dataPublicacaoPncp?: string;
  modalidadeId?: number;
  dataAtualizacaoGlobal?: string;
  linkProcessoEletronico?: string;
  numeroControlePNCP?: string;
  modoDisputaId?: number;
  tipoInstrumentoConvocatorioNome?: string;
  tipoInstrumentoConvocatorioCodigo?: number;
};

