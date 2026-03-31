"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export namespace useContractDetailServiceParams {
  export type GetDetail = {
    data: Parameters<CoreApiClient['search']['fetchExternalContractDetail']>[0]
    enabled?: boolean
  }
}

export function useContractDetailService(api: CoreApiClient) {
  const get = (params: useContractDetailServiceParams.GetDetail) => {
    const { data, enabled = true } = params
    const canFetch = enabled && !!data.cnpj && !!data.anoContrato && !!data.sequencialContrato

    return useQuery({
      queryKey:  ["contract-detail", data.cnpj, data.anoContrato, data.sequencialContrato],
      queryFn:   () => api.search.fetchExternalContractDetail(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
