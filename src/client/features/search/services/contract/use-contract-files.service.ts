"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export namespace useContractFilesServiceParams {
  export type GetFiles = {
    data: Parameters<CoreApiClient['search']['fetchExternalContractFiles']>[0]
    enabled?: boolean
  }
}

export function useContractFilesService(api: CoreApiClient) {
  const get = (params: useContractFilesServiceParams.GetFiles) => {
    const { data, enabled = true } = params
    const canFetch = enabled && !!data.cnpj && !!data.anoContrato && !!data.sequencialContrato

    return useQuery({
      queryKey:  ["contract-files", data.cnpj, data.anoContrato, data.sequencialContrato],
      queryFn:   () => api.search.fetchExternalContractFiles(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}
