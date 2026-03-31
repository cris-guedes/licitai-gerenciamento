"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

export namespace useProcurementItemResultsServiceParams {
  export type Get = {
    item: LicitacaoItem
    numeroItem: number | undefined
    enabled?: boolean
  }
}

export function useProcurementItemResultsService(api: CoreApiClient) {
  const get = (params: useProcurementItemResultsServiceParams.Get) => {
    const { item, numeroItem, enabled = true } = params
    const canFetch = enabled && !!item.orgao_cnpj && !!item.ano && !!item.numero_sequencial && !!numeroItem

    return useQuery({
      queryKey: ["procurement-item-results", item.orgao_cnpj, item.ano, item.numero_sequencial, numeroItem],
      queryFn:  () => api.search.fetchExternalProcurementItemResults({
        cnpj:       item.orgao_cnpj!,
        ano:        Number(item.ano!),
        sequencial: Number(item.numero_sequencial!),
        numeroItem: numeroItem!,
      }),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
