"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export namespace useContractTermsServiceParams {
  export type GetTerms = {
    data: Parameters<CoreApiClient['search']['fetchExternalContractTerms']>[0]
    enabled?: boolean
  }
}

export function useContractTermsService(api: CoreApiClient) {
  const get = (params: useContractTermsServiceParams.GetTerms) => {
    const { data, enabled = true } = params
    const canFetch = enabled && !!data.cnpj && !!data.anoContrato && !!data.sequencialContrato

    return useQuery({
      queryKey:  ["contract-terms", data.cnpj, data.anoContrato, data.sequencialContrato],
      queryFn:   () => api.search.fetchExternalContractTerms(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
