/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SearchResponse } from '../models/SearchResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
  /**
   * Busca avançada de documentos PNCP
   * Permite buscar editais e outros documentos do PNCP utilizando filtros combináveis como órgão, modalidade, UF, status, tipo, margem de preferência e fonte orçamentária.
   *
   * @returns SearchResponse Resultado paginado
   * @throws ApiError
   */
  public static searchDocuments({
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
    /**
     * Texto livre para busca (título e descrição)
     */
    q?: string,
    /**
     * Tipo de documento indexado
     */
    tiposDocumento?: Array<'edital' | 'aviso_licitacao' | 'contrato' | 'ata_registro_preco' | 'resultado' | 'homologacao' | 'adjudicacao' | 'dispensa' | 'inexigibilidade'>,
    /**
     * Status da contratação
     */
    status?: 'recebendo_proposta' | 'divulgada' | 'homologada' | 'revogada' | 'anulada' | 'suspensa' | 'encerrada' | 'fracassada' | 'deserta',
    /**
     * Campo para ordenação (prefixar com "-" para decrescente)
     */
    ordenacao?: 'data' | '-data' | 'valor' | '-valor',
    pagina?: number,
    tamPagina?: number,
    /**
     * IDs dos órgãos (separados por "|")
     */
    orgaos?: Array<number>,
    /**
     * IDs das unidades administrativas
     */
    unidades?: Array<number>,
    /**
     * Esfera administrativa
     */
    esferas?: Array<'F' | 'E' | 'M' | 'D' | 'N'>,
    /**
     * Poder da entidade
     */
    poderes?: Array<'E' | 'L' | 'J' | 'N'>,
    /**
     * Unidade Federativa
     */
    ufs?: Array<string>,
    /**
     * IDs dos municípios
     */
    municipios?: Array<number>,
    /**
     * Modalidade da licitação
     */
    modalidades?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 12 | 13>,
    /**
     * Tipo do documento
     */
    tipos?: Array<1 | 2 | 3 | 4>,
    /**
     * Fonte orçamentária
     */
    fontesOrcamentarias?: Array<'estadual' | 'federal' | 'municipal' | 'nao_se_aplica' | 'organismo_internacional'>,
    /**
     * Tipo de margem de preferência
     */
    tiposMargensPreferencia?: Array<'resolucao_cics' | 'resolucao_ciia_pac'>,
    /**
     * Indica se exige conteúdo nacional
     */
    exigenciaConteudoNacional?: boolean,
  }): CancelablePromise<SearchResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/search/',
      query: {
        'q': q,
        'tipos_documento': tiposDocumento,
        'status': status,
        'ordenacao': ordenacao,
        'pagina': pagina,
        'tam_pagina': tamPagina,
        'orgaos': orgaos,
        'unidades': unidades,
        'esferas': esferas,
        'poderes': poderes,
        'ufs': ufs,
        'municipios': municipios,
        'modalidades': modalidades,
        'tipos': tipos,
        'fontes_orcamentarias': fontesOrcamentarias,
        'tipos_margens_preferencia': tiposMargensPreferencia,
        'exigencia_conteudo_nacional': exigenciaConteudoNacional,
      },
    });
  }
}
