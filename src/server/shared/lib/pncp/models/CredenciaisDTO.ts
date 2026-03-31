/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DominioGenericoMinimoDTO } from './DominioGenericoMinimoDTO';
import type { EnteCredenciaisDTO } from './EnteCredenciaisDTO';
export type CredenciaisDTO = {
  id?: number;
  login?: string;
  nome?: string;
  cpfCnpj?: string;
  email?: string;
  administrador?: boolean;
  gestaoEnteAutorizado?: boolean;
  statusBloqueado?: boolean;
  token?: string;
  senha?: string;
  telefone?: string;
  cnpjVinculado?: string;
  entesAutorizados?: Array<EnteCredenciaisDTO>;
  nivelGovBR?: string;
  permissoes?: Array<DominioGenericoMinimoDTO>;
};

