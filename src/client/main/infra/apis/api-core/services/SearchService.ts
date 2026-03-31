/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FetchExternalAtaDetailResponse } from '../models/FetchExternalAtaDetailResponse';
import type { FetchExternalAtaFilesResponse } from '../models/FetchExternalAtaFilesResponse';
import type { FetchExternalAtaHistoryResponse } from '../models/FetchExternalAtaHistoryResponse';
import type { FetchExternalContractDetailResponse } from '../models/FetchExternalContractDetailResponse';
import type { FetchExternalContractFilesResponse } from '../models/FetchExternalContractFilesResponse';
import type { FetchExternalContractHistoryResponse } from '../models/FetchExternalContractHistoryResponse';
import type { FetchExternalContractTermsResponse } from '../models/FetchExternalContractTermsResponse';
import type { FetchExternalProcurementAtasResponse } from '../models/FetchExternalProcurementAtasResponse';
import type { FetchExternalProcurementContractsResponse } from '../models/FetchExternalProcurementContractsResponse';
import type { FetchExternalProcurementDetailResponse } from '../models/FetchExternalProcurementDetailResponse';
import type { FetchExternalProcurementFilesResponse } from '../models/FetchExternalProcurementFilesResponse';
import type { FetchExternalProcurementHistoryResponse } from '../models/FetchExternalProcurementHistoryResponse';
import type { FetchExternalProcurementItemResultsResponse } from '../models/FetchExternalProcurementItemResultsResponse';
import type { FetchExternalProcurementItemsResponse } from '../models/FetchExternalProcurementItemsResponse';
import type { SearchPublicProcurementsResponse } from '../models/SearchPublicProcurementsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SearchService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Busca avançada de licitações no PNCP
   * Realiza buscas filtradas de editais, avisos e contratos diretamente na base do PNCP.
   * @returns SearchPublicProcurementsResponse Sucesso na busca
   * @throws ApiError
   */
  public searchPublicProcurements({
    q,
    tiposDocumento,
    status,
    ordenacao,
    pagina,
    tamPagina,
    orgaos,
    unidades,
    esferas,
    poderes,
    ufs,
    municipios,
    modalidades,
    tipos,
    fontesOrcamentarias,
    tiposMargensPreferencia,
    exigenciaConteudoNacional,
  }: {
    q?: string,
    tiposDocumento?: Array<'edital' | 'aviso_licitacao' | 'contrato' | 'ata_registro_preco' | 'resultado' | 'homologacao' | 'adjudicacao' | 'dispensa' | 'inexigibilidade'>,
    status?: 'recebendo_proposta' | 'propostas_encerradas' | 'divulgada' | 'homologada' | 'revogada' | 'anulada' | 'suspensa' | 'encerrada' | 'fracassada' | 'deserta',
    ordenacao?: 'data' | '-data' | 'valor' | '-valor',
    pagina?: number,
    tamPagina?: number,
    orgaos?: Array<number>,
    unidades?: Array<number>,
    esferas?: Array<'F' | 'E' | 'M' | 'D' | 'N'>,
    poderes?: Array<'E' | 'L' | 'J' | 'N'>,
    ufs?: Array<string>,
    municipios?: Array<number>,
    modalidades?: Array<number>,
    tipos?: Array<number>,
    fontesOrcamentarias?: Array<'estadual' | 'federal' | 'municipal' | 'nao_se_aplica' | 'organismo_internacional'>,
    tiposMargensPreferencia?: Array<'resolucao_cics' | 'resolucao_ciia_pac'>,
    exigenciaConteudoNacional?: boolean,
  }): CancelablePromise<SearchPublicProcurementsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/search-public-procurements',
      query: {
        'q': q,
        'tiposDocumento': tiposDocumento,
        'status': status,
        'ordenacao': ordenacao,
        'pagina': pagina,
        'tamPagina': tamPagina,
        'orgaos': orgaos,
        'unidades': unidades,
        'esferas': esferas,
        'poderes': poderes,
        'ufs': ufs,
        'municipios': municipios,
        'modalidades': modalidades,
        'tipos': tipos,
        'fontesOrcamentarias': fontesOrcamentarias,
        'tiposMargensPreferencia': tiposMargensPreferencia,
        'exigenciaConteudoNacional': exigenciaConteudoNacional,
      },
    });
  }
  /**
   * Busca itens de uma contratação
   * Retorna os itens (produtos/serviços) de uma licitação específica diretamente da API PNCP v1.
   * @returns FetchExternalProcurementItemsResponse Itens encontrados
   * @throws ApiError
   */
  public fetchExternalProcurementItems({
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
  }): CancelablePromise<FetchExternalProcurementItemsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-items',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'pagina': pagina,
        'tamanhoPagina': tamanhoPagina,
      },
    });
  }
  /**
   * Busca detalhes de uma contratação
   * Retorna os detalhes completos de uma licitação específica diretamente da API PNCP v1.
   * @returns FetchExternalProcurementDetailResponse Detalhes encontrados
   * @throws ApiError
   */
  public fetchExternalProcurementDetail({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<FetchExternalProcurementDetailResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-detail',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
    });
  }
  /**
   * Busca arquivos de uma contratação
   * Retorna a lista de documentos (edital, anexos, adendos) de uma licitação específica.
   * @returns FetchExternalProcurementFilesResponse Arquivos encontrados
   * @throws ApiError
   */
  public fetchExternalProcurementFiles({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<FetchExternalProcurementFilesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-files',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
    });
  }
  /**
   * Busca atas de registro de preço de uma contratação
   * Retorna as atas de registro de preço vinculadas a uma licitação específica.
   * @returns FetchExternalProcurementAtasResponse Atas encontradas
   * @throws ApiError
   */
  public fetchExternalProcurementAtas({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<FetchExternalProcurementAtasResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-atas',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
    });
  }
  /**
   * Busca contratos/empenhos de uma contratação
   * Retorna os contratos e empenhos vinculados a uma licitação específica.
   * @returns FetchExternalProcurementContractsResponse Contratos encontrados
   * @throws ApiError
   */
  public fetchExternalProcurementContracts({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<FetchExternalProcurementContractsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-contracts',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
    });
  }
  /**
   * Busca histórico de alterações de uma contratação
   * Retorna o log de manutenção (linha do tempo) de uma licitação específica.
   * @returns FetchExternalProcurementHistoryResponse Histórico encontrado
   * @throws ApiError
   */
  public fetchExternalProcurementHistory({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<FetchExternalProcurementHistoryResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-history',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
    });
  }
  /**
   * Busca resultados de um item de contratação
   * Retorna os fornecedores vencedores e valores homologados de um item específico.
   * @returns FetchExternalProcurementItemResultsResponse Resultados encontrados
   * @throws ApiError
   */
  public fetchExternalProcurementItemResults({
    cnpj,
    ano,
    sequencial,
    numeroItem,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
  }): CancelablePromise<FetchExternalProcurementItemResultsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-procurement-item-results',
      query: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
      },
    });
  }
  /**
   * Busca detalhes de um contrato/empenho
   * Retorna os dados completos de um contrato ou empenho específico pelo CNPJ do órgão, ano e sequencial do contrato.
   * @returns FetchExternalContractDetailResponse Detalhes do contrato encontrados
   * @throws ApiError
   */
  public fetchExternalContractDetail({
    cnpj,
    anoContrato,
    sequencialContrato,
  }: {
    cnpj: string,
    anoContrato: number,
    sequencialContrato: number,
  }): CancelablePromise<FetchExternalContractDetailResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-contract-detail',
      query: {
        'cnpj': cnpj,
        'anoContrato': anoContrato,
        'sequencialContrato': sequencialContrato,
      },
    });
  }
  /**
   * Busca arquivos de um contrato/empenho
   * Retorna os documentos anexados a um contrato ou empenho específico.
   * @returns FetchExternalContractFilesResponse Arquivos encontrados
   * @throws ApiError
   */
  public fetchExternalContractFiles({
    cnpj,
    anoContrato,
    sequencialContrato,
  }: {
    cnpj: string,
    anoContrato: number,
    sequencialContrato: number,
  }): CancelablePromise<FetchExternalContractFilesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-contract-files',
      query: {
        'cnpj': cnpj,
        'anoContrato': anoContrato,
        'sequencialContrato': sequencialContrato,
      },
    });
  }
  /**
   * Busca histórico de alterações de um contrato/empenho
   * Retorna o log de manutenção (linha do tempo) de um contrato ou empenho específico.
   * @returns FetchExternalContractHistoryResponse Histórico encontrado
   * @throws ApiError
   */
  public fetchExternalContractHistory({
    cnpj,
    anoContrato,
    sequencialContrato,
  }: {
    cnpj: string,
    anoContrato: number,
    sequencialContrato: number,
  }): CancelablePromise<FetchExternalContractHistoryResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-contract-history',
      query: {
        'cnpj': cnpj,
        'anoContrato': anoContrato,
        'sequencialContrato': sequencialContrato,
      },
    });
  }
  /**
   * Busca termos aditivos de um contrato/empenho
   * Retorna os termos aditivos, supressivos e outros instrumentos vinculados a um contrato ou empenho.
   * @returns FetchExternalContractTermsResponse Termos encontrados
   * @throws ApiError
   */
  public fetchExternalContractTerms({
    cnpj,
    anoContrato,
    sequencialContrato,
  }: {
    cnpj: string,
    anoContrato: number,
    sequencialContrato: number,
  }): CancelablePromise<FetchExternalContractTermsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-contract-terms',
      query: {
        'cnpj': cnpj,
        'anoContrato': anoContrato,
        'sequencialContrato': sequencialContrato,
      },
    });
  }
  /**
   * Busca detalhes de uma ata de registro de preço
   * Retorna os dados completos de uma ata de registro de preço específica pelo CNPJ do órgão, ano, sequencial da compra e sequencial da ata.
   * @returns FetchExternalAtaDetailResponse Detalhes da ata encontrados
   * @throws ApiError
   */
  public fetchExternalAtaDetail({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
  }): CancelablePromise<FetchExternalAtaDetailResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-ata-detail',
      query: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
      },
    });
  }
  /**
   * Busca arquivos de uma ata de registro de preço
   * Retorna os documentos anexados a uma ata de registro de preço específica.
   * @returns FetchExternalAtaFilesResponse Arquivos encontrados
   * @throws ApiError
   */
  public fetchExternalAtaFiles({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
  }): CancelablePromise<FetchExternalAtaFilesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-ata-files',
      query: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
      },
    });
  }
  /**
   * Busca histórico de alterações de uma ata de registro de preço
   * Retorna o log de manutenção (linha do tempo) de uma ata de registro de preço específica.
   * @returns FetchExternalAtaHistoryResponse Histórico encontrado
   * @throws ApiError
   */
  public fetchExternalAtaHistory({
    cnpj,
    anoCompra,
    sequencialCompra,
    sequencialAta,
  }: {
    cnpj: string,
    anoCompra: number,
    sequencialCompra: number,
    sequencialAta: number,
  }): CancelablePromise<FetchExternalAtaHistoryResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-external-ata-history',
      query: {
        'cnpj': cnpj,
        'anoCompra': anoCompra,
        'sequencialCompra': sequencialCompra,
        'sequencialAta': sequencialAta,
      },
    });
  }
}
