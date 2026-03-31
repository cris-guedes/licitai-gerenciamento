"use client"

import { useQuery }        from "@tanstack/react-query"
import type { CoreApiClient }   from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

/** Document types that have procurement items in PNCP. */
const TYPES_WITH_ITEMS = new Set(["edital", "aviso_licitacao", "dispensa", "inexigibilidade", "aviso_contratacao_direta"])

export namespace useProcurementItemsServiceParams {
  export type Get = {
    item: LicitacaoItem
    enabled?: boolean
  }
}

export function useProcurementItemsService(api: CoreApiClient) {
  const get = (params: useProcurementItemsServiceParams.Get) => {
    const { item, enabled = true } = params
    const canFetch =
      enabled &&
      !!item.orgao_cnpj &&
      !!item.ano &&
      !!item.numero_sequencial &&
      TYPES_WITH_ITEMS.has(item.document_type ?? "")

    return useQuery({
      queryKey: ["procurement-items", item.orgao_cnpj, item.ano, item.numero_sequencial],
      queryFn:  () => api.search.fetchExternalProcurementItems({
        cnpj:       item.orgao_cnpj!,
        ano:        Number(item.ano!),
        sequencial: Number(item.numero_sequencial!),
      }),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
