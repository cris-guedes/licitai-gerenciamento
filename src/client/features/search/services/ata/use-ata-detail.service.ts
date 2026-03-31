"use client"

import { useQuery } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
export function useAtaDetailService(api: CoreApiClient) {
  const get = (params: useAtaDetailServiceParams.GetDetail) => {
    const { data, enabled = true } = params;
    const canFetch = enabled && !!data.cnpj && !!data.anoCompra && !!data.sequencialCompra && !!data.sequencialAta

    return useQuery({
      queryKey: ["ata-detail", data.cnpj, data.anoCompra, data.sequencialCompra, data.sequencialAta],
      queryFn: () => api.search.fetchExternalAtaDetail(data),
      enabled: canFetch,
      staleTime: 10 * 60 * 1000,
      retry: 1,
    })
  }

  return { get }
}

export namespace useAtaDetailServiceParams {

  export type GetDetail = {
    data: Parameters<CoreApiClient['search']['fetchExternalAtaDetail']>[0]
    enabled?: boolean
  }
}
