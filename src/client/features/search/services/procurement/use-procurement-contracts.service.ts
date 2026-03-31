"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

export namespace useProcurementContractsServiceParams {
  export type Get = {
    item: LicitacaoItem
    enabled?: boolean
  }
}

export function useProcurementContractsService(api: CoreApiClient) {
  const get = (params: useProcurementContractsServiceParams.Get) => {
    const { item, enabled = true } = params
    const canFetch = enabled && !!item.orgao_cnpj && !!item.ano && !!item.numero_sequencial

    return useQuery({
      queryKey: ["procurement-contracts", item.orgao_cnpj, item.ano, item.numero_sequencial],
      queryFn:  () => api.search.fetchExternalProcurementContracts({
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
