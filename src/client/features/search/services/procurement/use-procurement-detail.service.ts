"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

export namespace useProcurementDetailServiceParams {
  export type Get = {
    item: LicitacaoItem
    enabled?: boolean
  }
}

export function useProcurementDetailService(api: CoreApiClient) {
  const get = (params: useProcurementDetailServiceParams.Get) => {
    const { item, enabled = true } = params
    const canFetch = enabled && !!item.orgao_cnpj && !!item.ano && !!item.numero_sequencial

    return useQuery({
      queryKey: ["procurement-detail", item.orgao_cnpj, item.ano, item.numero_sequencial],
      queryFn:  () => api.search.fetchExternalProcurementDetail({
        cnpj:       item.orgao_cnpj!,
        ano:        Number(item.ano!),
        sequencial: Number(item.numero_sequencial!),
      }),
      enabled:   canFetch,
      staleTime: 5 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
