"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
export function useAtaHistoryService(api: CoreApiClient) {
  const get = (params: useAtaHistoryServiceParams.GetHistory) => {
    const { data, enabled = true } = params;
    const canFetch = enabled && !!data.cnpj && !!data.anoCompra && !!data.sequencialCompra && !!data.sequencialAta

    return useQuery({
      queryKey:  ["ata-history", data.cnpj, data.anoCompra, data.sequencialCompra, data.sequencialAta],
      queryFn:   () => api.search.fetchExternalAtaHistory(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}

export namespace useAtaHistoryServiceParams {
  export type GetHistory = {
    data: Parameters<CoreApiClient['search']['fetchExternalAtaHistory']>[0]
    enabled?: boolean
  }
}

