/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApproveEditalAnalysisResponse } from '../models/ApproveEditalAnalysisResponse';
import type { ListEditalAnalysesResponse } from '../models/ListEditalAnalysesResponse';
import type { RunEditalAnalysisResponse } from '../models/RunEditalAnalysisResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EditalAnalysisService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Executa análise estruturada de edital
   * Lê os documentos informados, extrai texto dos PDFs e usa IA para popular os campos de EditalAnalysis.
   * @returns RunEditalAnalysisResponse Análise concluída
   * @throws ApiError
   */
  public runEditalAnalysis({
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
       * ID do edital a analisar
       */
      editalId: string;
      /**
       * IDs dos documentos a usar na análise
       */
      documentIds: Array<string>;
    },
  }): CancelablePromise<RunEditalAnalysisResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/edital-analysis/run',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Lista análises de um edital
   * Retorna o histórico de análises de um edital, ordenado da versão mais recente para a mais antiga.
   * @returns ListEditalAnalysesResponse Lista de análises retornada
   * @throws ApiError
   */
  public listEditalAnalyses({
    orgId,
    editalId,
  }: {
    orgId: string,
    editalId: string,
  }): CancelablePromise<ListEditalAnalysesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/edital-analysis/list',
      query: {
        'orgId': orgId,
        'editalId': editalId,
      },
    });
  }
  /**
   * Aprova uma análise de edital
   * Copia os campos extraídos da análise para o Edital canônico e marca a análise como aprovada.
   * @returns ApproveEditalAnalysisResponse Análise aprovada e dados promovidos para o Edital
   * @throws ApiError
   */
  public approveEditalAnalysis({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da análise a aprovar
       */
      editalAnalysisId: string;
    },
  }): CancelablePromise<ApproveEditalAnalysisResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/edital-analysis/approve',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
