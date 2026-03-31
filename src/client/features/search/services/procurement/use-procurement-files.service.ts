"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

export namespace useProcurementFilesServiceParams {
  export type Get = {
    item: LicitacaoItem
    enabled?: boolean
  }
}

export function useProcurementFilesService(api: CoreApiClient) {
  const get = (params: useProcurementFilesServiceParams.Get) => {
    const { item, enabled = true } = params
    const canFetch = enabled && !!item.orgao_cnpj && !!item.ano && !!item.numero_sequencial

    return useQuery({
      queryKey: ["procurement-files", item.orgao_cnpj, item.ano, item.numero_sequencial],
      queryFn:  () => api.search.fetchExternalProcurementFiles({
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
