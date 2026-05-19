import { PncpSearchProvider } from "@/server/shared/infra/providers/pnpc/busca/pncp-search-provider";
import type { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas";
import { filterSearchResponseByProposalDates, hasProposalDateFilters } from "./search-date-filters";

export type SearchPublicProcurementsParams = SearchPublicProcurementsControllerSchemas.Input;
export type SearchPublicProcurementsResponse = PncpSearchProvider.Response<"searchDocuments">;

const DATE_FILTER_SEARCH_PAGE_SIZE = 500;
const DATE_FILTER_MAX_SEARCH_PAGES = 6;

/**
 * DESCOBERTAS EMPÍRICAS — PNCP Search API (/search/)
 * Validadas em produção (pncp.gov.br/api) em 2026-03-01.
 *
 * 1. `tipos_documento` é OBRIGATÓRIO pela API.
 *    Sem ele: { "mensagem": "O filtro tipos_documento é obrigatório" }
 *    → Default ["edital","aviso_licitacao","dispensa","inexigibilidade"] quando omitido.
 *
 * 2. Arrays devem ser pipe-separados (`|`), NÃO repeated params.
 *    O cliente gerado usa key=v1&key=v2 (repeated), que a API ignora (retorna 0 resultados).
 *    Formato correto: key=v1|v2. Tanto `|` literal quanto `%7C` URL-encoded são aceitos.
 *    → Todos os campos array são pré-unidos com "|" antes de chamar o provider.
 *
 * 3. `valor_global` é frequentemente `null` em editais recém-publicados.
 *    O PNCP permite publicar sem informar o valor estimado.
 *
 * 4. `tam_pagina` aceita até 500 (testado). O YAML original dizia 100 (estava errado).
 */
export class SearchPublicProcurements {
    constructor(private readonly provider: typeof PncpSearchProvider) { }

    async execute(params: SearchPublicProcurementsParams): Promise<SearchPublicProcurementsResponse> {
        const shouldFilterByProposalDates = hasProposalDateFilters(params);

        if (shouldFilterByProposalDates) {
            const items: SearchPublicProcurementsResponse["items"] = [];

            for (let pagina = 1; pagina <= DATE_FILTER_MAX_SEARCH_PAGES; pagina += 1) {
                const response = await this.provider.searchDocuments(this.serializeParams(params, {
                    pagina,
                    tamPagina: DATE_FILTER_SEARCH_PAGE_SIZE,
                }));

                items.push(...response.items);

                const fetchedCount = pagina * DATE_FILTER_SEARCH_PAGE_SIZE;
                if (response.items.length === 0 || fetchedCount >= response.total) break;
            }

            return filterSearchResponseByProposalDates({ items, total: items.length }, params);
        }

        const response = await this.provider.searchDocuments(this.serializeParams(params));
        return filterSearchResponseByProposalDates(response, params);
    }

    private serializeParams(
        params: SearchPublicProcurementsParams,
        pagination?: { pagina: number; tamPagina: number },
    ): PncpSearchProvider.Params<"searchDocuments"> {
        // Arrays pré-unidos com "|" — ver descoberta #2.
        // tiposDocumento tem default obrigatório — ver descoberta #1.
        return {
            ...params,
            ...pagination,
            tiposDocumento: (params.tiposDocumento ?? [
                "edital",
                "aviso_licitacao",
                "dispensa",
                "inexigibilidade",
            ]).join("|"),
            orgaos: params.orgaos?.join("|"),
            unidades: params.unidades?.join("|"),
            esferas: params.esferas?.join("|"),
            poderes: params.poderes?.join("|"),
            ufs: params.ufs?.join("|"),
            municipios: params.municipios?.join("|"),
            modalidades: params.modalidades?.join("|"),
            tipos: params.tipos?.join("|"),
            fontesOrcamentarias: params.fontesOrcamentarias?.join("|"),
            tiposMargensPreferencia: params.tiposMargensPreferencia?.join("|"),
            dataAberturaInicio: undefined,
            dataAberturaFim: undefined,
            dataEncerramentoInicio: undefined,
            dataEncerramentoFim: undefined,
        } as unknown as PncpSearchProvider.Params<"searchDocuments">;
    }
}
