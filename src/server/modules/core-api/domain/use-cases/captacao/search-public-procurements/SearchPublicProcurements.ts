import { PncpSearchProvider } from "@/server/shared/infra/providers/pnpc/busca/pncp-search-provider";
import type { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas";

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

    async execute(params: SearchPublicProcurements.Params): Promise<SearchPublicProcurements.Response> {
        // Arrays pré-unidos com "|" — ver descoberta #2.
        // tiposDocumento tem default obrigatório — ver descoberta #1.
        const serialized: any = {
            ...params,
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
        };
        return this.provider.searchDocuments(serialized);
    }
}

export namespace SearchPublicProcurements {
    export type Params = SearchPublicProcurementsControllerSchemas.Input;
    export type Response = PncpSearchProvider.Response<"searchDocuments">;
}
