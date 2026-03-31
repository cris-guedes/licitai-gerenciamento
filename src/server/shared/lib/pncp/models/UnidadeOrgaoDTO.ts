/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Municipio } from './Municipio';
import type { OrgaoEntidadeDTO } from './OrgaoEntidadeDTO';
export type UnidadeOrgaoDTO = {
  id?: number;
  orgao?: OrgaoEntidadeDTO;
  codigoUnidade?: string;
  nomeUnidade?: string;
  municipio?: Municipio;
  dataInclusao?: string;
  dataAtualizacao?: string;
  statusAtivo?: boolean;
  justificativaAtualizacao?: string;
};

