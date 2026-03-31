/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Obrigatoriedade } from './Obrigatoriedade';
export type TipoInstrumentoConvocatorio = {
  id?: number;
  nome?: string;
  descricao?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  statusAtivo?: boolean;
  justificativaAtualizacao?: string;
  obrigatoriedadeDataAberturaProposta?: Obrigatoriedade;
  obrigatoriedadeDataEncerramentoProposta?: Obrigatoriedade;
};

