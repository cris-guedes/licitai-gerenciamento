"use client"

import { useQuery }      from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export function useAtaFilesService(api: CoreApiClient) {
  const get = (params: useAtaFilesServiceParams.GetFiles) => {
    const { data, enabled = true } = params;
    const canFetch = enabled && !!data.cnpj && !!data.anoCompra && !!data.sequencialCompra && !!data.sequencialAta

    return useQuery({
      queryKey:  ["ata-files", data.cnpj, data.anoCompra, data.sequencialCompra, data.sequencialAta],
      queryFn:   () => api.search.fetchExternalAtaFiles(data),
      enabled:   canFetch,
      staleTime: 10 * 60 * 1000,
      retry:     1,
    })
  }

  return { get }
}

export namespace useAtaFilesServiceParams {
  export type GetFiles = {
    data: Parameters<CoreApiClient['search']['fetchExternalAtaFiles']>[0]
    enabled?: boolean
  }
}

