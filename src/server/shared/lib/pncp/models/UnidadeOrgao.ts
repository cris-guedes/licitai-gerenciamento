/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Municipio } from './Municipio';
import type { OrgaoEntidade } from './OrgaoEntidade';
export type UnidadeOrgao = {
  id?: number;
  orgao?: OrgaoEntidade;
  codigoUnidade?: string;
  nomeUnidade?: string;
  municipio?: Municipio;
  dataInclusao?: string;
  dataAtualizacao?: string;
  statusAtivo?: boolean;
  justificativaAtualizacao?: string;
};

