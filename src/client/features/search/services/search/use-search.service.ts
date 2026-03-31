"use client"

import { useQuery }           from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export namespace useSearchServiceParams {
  export type Search = {
    data: Parameters<CoreApiClient['search']['searchPublicProcurements']>[0]
    enabled?: boolean
  }
}

export function useSearchService(api: CoreApiClient) {
  const search = (params: useSearchServiceParams.Search) => {
    const { data, enabled = true } = params

    return useQuery({
      queryKey: ["search", data],
      queryFn:  () => api.search.searchPublicProcurements(data),
      enabled,
    })
  }

  return { search }
}
