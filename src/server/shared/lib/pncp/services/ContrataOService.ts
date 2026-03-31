/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlterarCompraDTO } from '../models/AlterarCompraDTO';
import type { AlterarCompraItemDTO } from '../models/AlterarCompraItemDTO';
import type { AlterarCompraItemParcialDTO } from '../models/AlterarCompraItemParcialDTO';
import type { AlterarCompraItemResultadoDTO } from '../models/AlterarCompraItemResultadoDTO';
import type { AlterarCompraParcialDTO } from '../models/AlterarCompraParcialDTO';
import type { ExclusaoDTO } from '../models/ExclusaoDTO';
import type { IncluirCompraItemDTO } from '../models/IncluirCompraItemDTO';
import type { IncluirCompraItemResultadoDTO } from '../models/IncluirCompraItemResultadoDTO';
import type { RecuperarCompraItemResultadoDTO } from '../models/RecuperarCompraItemResultadoDTO';
import type { RecuperarCompraItemSigiloDTO } from '../models/RecuperarCompraItemSigiloDTO';
import type { RecuperarDadosDocumentoCompraDTO } from '../models/RecuperarDadosDocumentoCompraDTO';
import type { RecuperarHistoricoCompraDTO } from '../models/RecuperarHistoricoCompraDTO';
import type { RecuperarImagemContratacaoItemDTO } from '../models/RecuperarImagemContratacaoItemDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContrataOService {
  /**
   * Retificar Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarCompra({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: AlterarCompraDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}',
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
   * Excluir Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static removerCompra({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody?: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}',
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
   * Retificar parcialmente uma Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarParcialmenteCompra({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: AlterarCompraParcialDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}',
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
   * Consultar Item de Contratação
   * @returns RecuperarCompraItemSigiloDTO OK
   * @throws ApiError
   */
  public static recuperarCompraItem({
    cnpj,
    ano,
    sequencial,
    numeroItem,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
  }): CancelablePromise<RecuperarCompraItemSigiloDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
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
   * Retificar Item de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarCompraItem({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    requestBody: AlterarCompraItemDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
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
   * Retificar Parcialmente um Item de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarParcialmenteCompraItem({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    requestBody: AlterarCompraItemParcialDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
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
   * Consultar Resultado de Item de Contratação
   * @returns RecuperarCompraItemResultadoDTO OK
   * @throws ApiError
   */
  public static recuperarResultado({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    sequencialResultado,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    sequencialResultado: number,
  }): CancelablePromise<RecuperarCompraItemResultadoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados/{sequencialResultado}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
        'sequencialResultado': sequencialResultado,
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
   * Retificar Resultado de Item de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarCompraItemResultado({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    sequencialResultado,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    sequencialResultado: number,
    requestBody: AlterarCompraItemResultadoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados/{sequencialResultado}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
        'sequencialResultado': sequencialResultado,
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
   * Inserir Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static incluirCompra({
    cnpj,
    tituloDocumento,
    tipoDocumentoId,
    formData,
  }: {
    cnpj: string,
    tituloDocumento: string,
    tipoDocumentoId: number,
    formData?: {
      /**
       * O arquivo com os dados da compra deve utilizar o formato JSON, conforme o exemplo:
       * {
         * "codigoUnidadeCompradora": "string",
         * "numeroCompra": "00001",
         * "anoCompra": 2025,
         * "tipoInstrumentoConvocatorioId": "1",
         * "modalidadeId": "1",
         * "modoDisputaId": "1",
         * "amparoLegalId": 1,
         * "srp": true,
         * "numeroProcesso": "string",
         * "objetoCompra": "string",
         * "informacaoComplementar": "string",
         * "dataAberturaProposta": "2025-10-01T14:30:01",
         * "dataEncerramentoProposta": "2025-10-05T14:30:01",
         * "linkSistemaOrigem": "string",
         * "linkProcessoEletronico": "string",
         * "justificativaPresencial": "string",
         * "fontesOrcamentarias": [
           * 1,
           * 2
           * ],
           * "itensCompra": [
             * {
               * "numeroItem": 1,
               * "materialOuServico": "M",
               * "tipoBeneficioId": "1",
               * "incentivoProdutivoBasico": true,
               * "aplicabilidadeMargemPreferenciaNormal": false,
               * "aplicabilidadeMargemPreferenciaAdicional": false,
               * "codigoTipoMargemPreferencia": 1,
               * "percentualMargemPreferenciaNormal": 0.001,
               * "percentualMargemPreferenciaAdicional": 0.001,
               * "inConteudoNacional": true,
               * "descricao": "string",
               * "informacaoComplementar": "string",
               * "quantidade": 1,
               * "unidadeMedida": "string",
               * "valorUnitarioEstimado": 100.00,
               * "valorTotal": 100.00,
               * "orcamentoSigiloso": true,
               * "criterioJulgamentoId": "1",
               * "itemCategoriaId": 1,
               * "patrimonio": "string",
               * "codigoRegistroImobiliario": "string",
               * "catalogoId": 1,
               * "categoriaItemCatalogoId": 1,
               * "catalogoCodigoItem": 1
               * }
               * ]
               * }
               */
              compra: Blob;
              documento: Blob;
            },
          }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
              method: 'POST',
              url: '/v1/orgaos/{cnpj}/compras',
              path: {
                'cnpj': cnpj,
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
           * Consultar Todos os Itens de Contratação
           * @returns RecuperarCompraItemSigiloDTO OK
           * @throws ApiError
           */
          public static pesquisarCompraItem({
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
          }): CancelablePromise<Array<RecuperarCompraItemSigiloDTO>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens',
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
           * Inserir Item de Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static incluirCompraItem({
            cnpj,
            ano,
            sequencial,
            requestBody,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            requestBody: Array<IncluirCompraItemDTO>,
          }): CancelablePromise<Array<Record<string, any>>> {
            return __request(OpenAPI, {
              method: 'POST',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens',
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
           * Consultar Resultados de Item de Contratação
           * @returns RecuperarCompraItemResultadoDTO OK
           * @throws ApiError
           */
          public static recuperarResultados({
            cnpj,
            ano,
            sequencial,
            numeroItem,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
          }): CancelablePromise<Array<RecuperarCompraItemResultadoDTO>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
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
           * Inserir Resultado de Item de Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static incluirCompraItemResultado({
            cnpj,
            ano,
            sequencial,
            numeroItem,
            requestBody,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
            requestBody: IncluirCompraItemResultadoDTO,
          }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
              method: 'POST',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/resultados',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
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
           * Recuperar Imagens de um Item de uma Contratação
           * @returns RecuperarImagemContratacaoItemDTO OK
           * @throws ApiError
           */
          public static getImagemLista({
            cnpj,
            ano,
            sequencial,
            numeroItem,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
          }): CancelablePromise<Array<RecuperarImagemContratacaoItemDTO>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
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
           * Inserir Imagem de um Item de Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static inserirImagem({
            cnpj,
            ano,
            sequencial,
            numeroItem,
            textoAlternativoImagem,
            formData,
            tituloImagem,
            legendaImagem,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
            textoAlternativoImagem: string,
            formData: {
              imagem: Blob;
            },
            tituloImagem?: string,
            legendaImagem?: string,
          }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
              method: 'POST',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
              },
              headers: {
                'Titulo-Imagem': tituloImagem,
                'Legenda-Imagem': legendaImagem,
                'Texto-Alternativo-Imagem': textoAlternativoImagem,
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
           * Consultar Documentos de Contratação
           * @returns RecuperarDadosDocumentoCompraDTO OK
           * @throws ApiError
           */
          public static recuperarInformacoesDocumentosCompra({
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
          }): CancelablePromise<Array<RecuperarDadosDocumentoCompraDTO>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos',
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
           * Inserir Documento de Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static inserirArquivo2({
            cnpj,
            ano,
            sequencial,
            tituloDocumento,
            tipoDocumentoId,
            formData,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            tituloDocumento: string,
            tipoDocumentoId: number,
            formData: {
              arquivo: Blob;
            },
          }): CancelablePromise<Record<string, any>> {
            return __request(OpenAPI, {
              method: 'POST',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
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
           * Recuperar Imagem de um Item de uma Contratação
           * @returns string OK
           * @throws ApiError
           */
          public static getImagem({
            cnpj,
            ano,
            sequencial,
            numeroItem,
            sequencialImagem,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
            sequencialImagem: number,
          }): CancelablePromise<Array<string>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem/{sequencialImagem}',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
                'sequencialImagem': sequencialImagem,
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
           * Remover Imagem de um Item de uma Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static removerImagem({
            cnpj,
            ano,
            sequencial,
            numeroItem,
            sequencialImagem,
            requestBody,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            numeroItem: number,
            sequencialImagem: number,
            requestBody?: ExclusaoDTO,
          }): CancelablePromise<any> {
            return __request(OpenAPI, {
              method: 'DELETE',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/{numeroItem}/imagem/{sequencialImagem}',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
                'numeroItem': numeroItem,
                'sequencialImagem': sequencialImagem,
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
           * Consultar Quantidade Item de Contratação
           * @returns number OK
           * @throws ApiError
           */
          public static recuperarCompraItemQuantidade({
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
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens/quantidade',
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
          /**
           * Consultar Histórico de Contratação
           * @returns RecuperarHistoricoCompraDTO OK
           * @throws ApiError
           */
          public static consultarCompra({
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
          }): CancelablePromise<Array<RecuperarHistoricoCompraDTO>> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/historico',
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
           * Consultar Quantidade Histórico de Contratação
           * @returns number OK
           * @throws ApiError
           */
          public static consultarQuantidade({
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
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/historico/quantidade',
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
          /**
           * Baixar Arquivo/Documento de Contratação
           * @returns binary OK
           * @throws ApiError
           */
          public static recuperarArquivo3({
            cnpj,
            ano,
            sequencial,
            sequencialDocumento,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            sequencialDocumento: number,
          }): CancelablePromise<Blob> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/{sequencialDocumento}',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
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
           * Excluir Arquivo/Documento de Contratação
           * @returns any OK
           * @throws ApiError
           */
          public static removerDocumentoCompra({
            cnpj,
            ano,
            sequencial,
            sequencialDocumento,
            requestBody,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            sequencialDocumento: number,
            requestBody: ExclusaoDTO,
          }): CancelablePromise<any> {
            return __request(OpenAPI, {
              method: 'DELETE',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/{sequencialDocumento}',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
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
           * Consultar Quantidade de Documentos de Contratação
           * @returns number OK
           * @throws ApiError
           */
          public static recuperarCompraDocumentoQuantidade({
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
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/quantidade',
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
          /**
           * Baixar Arquivo/Documento Excluído de Contratação
           * @returns binary OK
           * @throws ApiError
           */
          public static recuperarArquivoExlcuido({
            cnpj,
            ano,
            sequencial,
            sequencialDocumento,
          }: {
            cnpj: string,
            ano: number,
            sequencial: number,
            sequencialDocumento: number,
          }): CancelablePromise<Blob> {
            return __request(OpenAPI, {
              method: 'GET',
              url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/arquivos/excluidos/{sequencialDocumento}',
              path: {
                'cnpj': cnpj,
                'ano': ano,
                'sequencial': sequencial,
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
