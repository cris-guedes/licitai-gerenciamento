/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlterarTermoContratoDTO } from '../models/AlterarTermoContratoDTO';
import type { ExclusaoDTO } from '../models/ExclusaoDTO';
import type { IncluirTermoContratoDTO } from '../models/IncluirTermoContratoDTO';
import type { RecuperarDadosDocumentoTermoContratoDTO } from '../models/RecuperarDadosDocumentoTermoContratoDTO';
import type { RecuperarTermoContratoDTO } from '../models/RecuperarTermoContratoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TermoDeContratoService {
  /**
   * Consultar Termo de Contrato
   * @returns RecuperarTermoContratoDTO OK
   * @throws ApiError
   */
  public static recuperarTermoContrato({
    cnpj,
    ano,
    sequencial,
    sequencialTermoContrato,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermoContrato: number,
  }): CancelablePromise<RecuperarTermoContratoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermoContrato}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermoContrato': sequencialTermoContrato,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Retificar Termo de Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static retificarTermoContrato({
    cnpj,
    ano,
    sequencial,
    sequencialTermoContrato,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermoContrato: number,
    requestBody: AlterarTermoContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermoContrato}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermoContrato': sequencialTermoContrato,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir Termo de Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static removerContrato1({
    cnpj,
    ano,
    sequencial,
    sequencialTermoContrato,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermoContrato: number,
    requestBody?: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermoContrato}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermoContrato': sequencialTermoContrato,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Termos de Contrato
   * @returns RecuperarTermoContratoDTO OK
   * @throws ApiError
   */
  public static recuperarTermosContrato({
    cnpj,
    ano,
    sequencial,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarTermoContratoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'pagina': pagina,
        'tamanhoPagina': tamanhoPagina,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Inserir Termo de Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static inserirTermoContrato({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: IncluirTermoContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Documentos de Termo de Contrato
   * @returns RecuperarDadosDocumentoTermoContratoDTO OK
   * @throws ApiError
   */
  public static recuperarInformacoesDocumentosTermoContrato({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarDadosDocumentoTermoContratoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
      },
      query: {
        'pagina': pagina,
        'tamanhoPagina': tamanhoPagina,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Inserir Documento de Termo de Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static inserirArquivo({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
    tituloDocumento,
    tipoDocumentoId,
    formData,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
    tituloDocumento: string,
    tipoDocumentoId: number,
    formData?: {
      arquivo: Blob;
    },
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
      },
      headers: {
        'Titulo-Documento': tituloDocumento,
        'Tipo-Documento-Id': tipoDocumentoId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Baixar Arquivo/Documento de Termo de Contrato
   * @returns binary OK
   * @throws ApiError
   */
  public static recuperarArquivo({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
    sequencialDocumento,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
        'sequencialDocumento': sequencialDocumento,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir Arquivo/Documento de Termo de Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static removerDocumentoContrato({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
    sequencialDocumento,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
    sequencialDocumento: number,
    requestBody: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
        'sequencialDocumento': sequencialDocumento,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Quantidade de Documentos de Termo de Contrato
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarQuantidadeDocumentosTermoContrato({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/quantidade',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Baixar Arquivo/Documento Excluído de Termo de Contrato
   * @returns binary OK
   * @throws ApiError
   */
  public static arquivoexcluido({
    cnpj,
    ano,
    sequencial,
    sequencialTermo,
    sequencialDocumento,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialTermo: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/{sequencialTermo}/arquivos/excluidos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialTermo': sequencialTermo,
        'sequencialDocumento': sequencialDocumento,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Quantidade de Termos de Contrato
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarQuantidadeTermosContrato({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/termos/quantidade',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
}
