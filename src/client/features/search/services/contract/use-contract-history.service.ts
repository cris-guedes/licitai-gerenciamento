"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export namespace useContractHistoryServiceParams {
  export type GetHistory = {
    data: Parameters<CoreApiClient['search']['fetchExternalContractHistory']>[0]
    enabled?: boolean
  }
}

export function useContractHistoryService(api: CoreApiClient) {
  const get = (params: useContractHistoryServiceParams.GetHistory) => {
    const { data, enabled = true } = params
    const canFetch = enabled && !!data.cnpj && !!data.anoContrato && !!data.sequencialContrato

    return useQuery({
      queryKey:  ["contract-history", data.cnpj, data.anoContrato, data.sequencialContrato],
      queryFn:   () => api.search.fetchExternalContractHistory(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
