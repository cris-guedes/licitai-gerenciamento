"use client"

import { useQuery } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export function useOportunidadeCatalogService(api: CoreApiClient) {
  const useCompanyItems = ({
    companyId,
    enabled = true,
  }: {
    companyId: string
    enabled?: boolean
  }) => useQuery({
    queryKey: ["oportunidades", "company-catalog", companyId],
    queryFn: () => api.companyItem.listCompanyItems({ companyId }),
    enabled: enabled && !!companyId,
  })

  return {
    useCompanyItems,
  }
}
