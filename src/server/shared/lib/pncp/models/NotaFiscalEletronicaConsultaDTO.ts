/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventoNotaFiscalConsultaDTO } from './EventoNotaFiscalConsultaDTO';
import type { ItemNotaFiscalConsultaDTO } from './ItemNotaFiscalConsultaDTO';
export type NotaFiscalEletronicaConsultaDTO = {
  instrumentoCobrancaId?: number;
  chave?: string;
  nfTransparenciaID?: number;
  numero?: number;
  serie?: number;
  dataEmissao?: string;
  niEmitente?: string;
  nomeEmitente?: string;
  nomeMunicipioEmitente?: string;
  codigoOrgaoDestinatario?: string;
  nomeOrgaoDestinatario?: string;
  codigoOrgaoSuperiorDestinatario?: string;
  nomeOrgaoSuperiorDestinatario?: string;
  valorNotaFiscal?: string;
  tipoEventoMaisRecente?: string;
  dataTipoEventoMaisRecente?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  itens?: Array<ItemNotaFiscalConsultaDTO>;
  eventos?: Array<EventoNotaFiscalConsultaDTO>;
};

