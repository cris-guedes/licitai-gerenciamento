/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AtaRegistroPreco } from '../models/AtaRegistroPreco';
import type { AtaRegistroPrecoAlteracaoDTO } from '../models/AtaRegistroPrecoAlteracaoDTO';
import type { AtaRegistroPrecoDTO } from '../models/AtaRegistroPrecoDTO';
import type { AtaRegistroPrecoInclusaoDTO } from '../models/AtaRegistroPrecoInclusaoDTO';
import type { ExclusaoDTO } from '../models/ExclusaoDTO';
import type { PaginaRetornoAtaRegistroPrecoDTO } from '../models/PaginaRetornoAtaRegistroPrecoDTO';
import type { RecuperarAtaRegistroPrecoDTO } from '../models/RecuperarAtaRegistroPrecoDTO';
import type { RecuperarDadosDocumentoAtaDTO } from '../models/RecuperarDadosDocumentoAtaDTO';
import type { RecuperarHistoricoAtaDTO } from '../models/RecuperarHistoricoAtaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AtaService {
  /**
   * Consultar Ata de Registro de Preço
   * @returns RecuperarAtaRegistroPrecoDTO OK
   * @throws ApiError
   */
  public static recuperarAtaRegistoPreco({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
  }): CancelablePromise<RecuperarAtaRegistroPrecoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Retificar Ata de Registro de Preço
   * @returns AtaRegistroPrecoDTO OK
   * @throws ApiError
   */
  public static retificarAta({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    requestBody,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    requestBody: AtaRegistroPrecoAlteracaoDTO,
  }): CancelablePromise<AtaRegistroPrecoDTO> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Excluir Ata de Registro de Preço
   * @returns any OK
   * @throws ApiError
   */
  public static deleteAta({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    requestBody,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    requestBody?: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Consultar Atas de Registro de Preço por Compra
   * @returns PaginaRetornoAtaRegistroPrecoDTO OK
   * @throws ApiError
   */
  public static recuperarAtasPorFiltros({
    cnpj,
    anoCompra,
    sequencialCompra,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoAtaRegistroPrecoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
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
   * Inserir Ata de Registro de Preço
   * @returns AtaRegistroPreco OK
   * @throws ApiError
   */
  public static inserirAta({
    cnpj,
    anoCompra,
    sequencialCompra,
    requestBody,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    requestBody: AtaRegistroPrecoInclusaoDTO,
  }): CancelablePromise<AtaRegistroPreco> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
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
   * Consultar Dados de Todos os Documentos de uma Ata de Registro de Preço
   * @returns RecuperarDadosDocumentoAtaDTO OK
   * @throws ApiError
   */
  public static recuperarInformacoesDocumentosAta({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarDadosDocumentoAtaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Inserir Documento em Ata de Registro de Preço
   * @returns any OK
   * @throws ApiError
   */
  public static inserirArquivo3({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    tituloDocumento,
    tipoDocumento,
    formData,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    tituloDocumento: string,
    tipoDocumento: string,
    formData?: {
      arquivo: Blob;
    },
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
      },
      headers: {
        'Titulo-Documento': tituloDocumento,
        'Tipo-Documento': tipoDocumento,
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
   * Consultar Histórico de Ata
   * @returns RecuperarHistoricoAtaDTO OK
   * @throws ApiError
   */
  public static consultarHistoricoAta({
    cnpj,
    ano,
    sequencial,
    sequencialAta,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialAta: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarHistoricoAtaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/atas/{sequencialAta}/historico',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialAta': sequencialAta,
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
   * Consultar Quantidade Histórico de Ata
   * @returns number OK
   * @throws ApiError
   */
  public static consultarHistoricoAtaQuantidade({
    cnpj,
    ano,
    sequencial,
    sequencialAta,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialAta: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/atas/{sequencialAta}/historico/quantidade',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialAta': sequencialAta,
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
   * Baixar Arquivo/Documento de Ata de Registro de Preço
   * @returns binary OK
   * @throws ApiError
   */
  public static recuperarArquivo4({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    sequencialDocumento,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Excluir Arquivo/Documento de Ata de Registro de Preço
   * @returns any OK
   * @throws ApiError
   */
  public static deleteDocumentoAta({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    sequencialDocumento,
    requestBody,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    sequencialDocumento: number,
    requestBody: ExclusaoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Consultar Quantidade de Documentos de Ata
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarAtaDocumentoQuantidade({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos/quantidade',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
   * Baixar Arquivo/Documento Excluído de Ata de Registro de Preço
   * @returns binary OK
   * @throws ApiError
   */
  public static recuperarArquivo5({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
    sequencialDocumento,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{anoCompra}/{sequencialCompra}/atas/{sequencialAta}/arquivos/excluidos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
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
}
