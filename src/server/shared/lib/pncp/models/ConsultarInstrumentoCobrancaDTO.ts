/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotaFiscalEletronicaConsultaDTO } from './NotaFiscalEletronicaConsultaDTO';
import type { TipoInstrumentoCobrancaDTO } from './TipoInstrumentoCobrancaDTO';
export type ConsultarInstrumentoCobrancaDTO = {
  cnpj?: string;
  ano?: number;
  sequencialContrato?: number;
  sequencialInstrumentoCobranca?: number;
  tipoInstrumentoCobranca?: TipoInstrumentoCobrancaDTO;
  numeroInstrumentoCobranca?: string;
  dataEmissaoDocumento?: string;
  observacao?: string;
  chaveNFe?: string;
  fonteNFe?: number;
  dataConsultaNFe?: string;
  statusResponseNFe?: string;
  jsonResponseNFe?: string;
  notaFiscalEletronica?: NotaFiscalEletronicaConsultaDTO;
  dataInclusao?: string;
  dataAtualizacao?: string;
};

