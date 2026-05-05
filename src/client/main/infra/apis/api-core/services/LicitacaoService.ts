/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtractEditalDataResponse } from '../models/ExtractEditalDataResponse';
import type { ExtractEditalDataStreamResponse } from '../models/ExtractEditalDataStreamResponse';
import type { UploadEditalDocumentResponse } from '../models/UploadEditalDocumentResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LicitacaoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Faz upload simples do edital
   * Recebe o PDF principal do edital em multipart/form-data, armazena o documento e retorna os metadados necessários para preview no cadastro.
   * @returns UploadEditalDocumentResponse Edital enviado com sucesso
   * @throws ApiError
   */
  public uploadEditalDocument({
    formData,
  }: {
    formData: {
      /**
       * ID da empresa dona do edital enviado
       */
      companyId: string;
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<UploadEditalDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/upload-edital-document',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Extrai dados de um edital de licitação
   * Recebe um PDF de edital via upload (multipart/form-data), processa via RAG (busca vetorial + LLM) e retorna a licitação estruturada no modelo de domínio.
   * @returns ExtractEditalDataResponse Dados extraídos com sucesso
   * @throws ApiError
   */
  public extractEditalData({
    companyId,
    formData,
  }: {
    companyId: string,
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
      query: {
        'companyId': companyId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Extrai dados de um edital de licitação (Stream SSE)
   * Recebe um PDF de edital via upload (multipart/form-data) e retorna um EventStream (SSE) com o progresso do processamento em tempo real.
   * @returns ExtractEditalDataStreamResponse Stream SSE iniciado
   * @throws ApiError
   */
  public extractEditalDataStream({
    companyId,
    formData,
  }: {
    companyId: string,
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
      query: {
        'companyId': companyId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
}
