/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
export type AtaRegistroPrecoDTO = {
  numeroAtaRegistroPreco?: string;
  anoAta?: number;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  dataCancelamento?: string;
  cancelado?: boolean;
  dataPublicacaoPncp?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  dataAtualizacaoGlobal?: string;
  sequencialAta?: number;
  numeroControlePNCP?: string;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  modalidadeNome?: string;
  objetoCompra?: string;
  informacaoComplementarCompra?: string;
  usuarioNome?: string;
};

