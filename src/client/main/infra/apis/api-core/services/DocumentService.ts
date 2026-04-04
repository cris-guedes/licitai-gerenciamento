/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RegisterDocumentResponse } from '../models/RegisterDocumentResponse';
import type { RunDocumentSummaryResponse } from '../models/RunDocumentSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DocumentService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Registra um documento por URL
   * Cria um registro de documento usando uma URL pública de PDF já disponível (ex: link do PNCP).
   * @returns RegisterDocumentResponse Documento registrado
   * @throws ApiError
   */
  public registerDocument({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da organização
       */
      orgId: string;
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do edital ao qual o documento pertence
       */
      editalId: string;
      /**
       * Tipo do documento: edital | annex | minute | contract | other
       */
      type: string;
      /**
       * URL pública do documento PDF
       */
      url: string;
      /**
       * Data de publicação (ISO 8601)
       */
      publishedAt?: (string | null);
    },
  }): CancelablePromise<RegisterDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/document/register',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Gera resumo de um documento
   * Busca o PDF pelo URL do documento, extrai o texto e usa IA para gerar um resumo em português.
   * @returns RunDocumentSummaryResponse Resumo gerado
   * @throws ApiError
   */
  public runDocumentSummary({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da organização
       */
      orgId: string;
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do documento a resumir
       */
      documentId: string;
    },
  }): CancelablePromise<RunDocumentSummaryResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/document/summarize',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
