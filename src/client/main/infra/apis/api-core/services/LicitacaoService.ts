/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtractEditalDataResponse } from '../models/ExtractEditalDataResponse';
import type { ExtractEditalDataStreamResponse } from '../models/ExtractEditalDataStreamResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LicitacaoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Extrai dados de um edital de licitação
   * Recebe um PDF de edital via upload (multipart/form-data), processa via RAG (busca vetorial + LLM) e retorna a licitação estruturada no modelo de domínio.
   * @returns ExtractEditalDataResponse Dados extraídos com sucesso
   * @throws ApiError
   */
  public extractEditalData({
    formData,
  }: {
    formData: {
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<ExtractEditalDataResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Extrai dados de um edital de licitação (Stream SSE)
   * Recebe um PDF de edital via upload (multipart/form-data) e retorna um EventStream (SSE) com o progresso do processamento em tempo real.
   * @returns ExtractEditalDataStreamResponse Stream iniciado
   * @throws ApiError
   */
  public extractEditalDataStream({
    formData,
  }: {
    formData: {
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<ExtractEditalDataStreamResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data/stream',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
}
