"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

const licitacaoKeys = {
  list: (orgId: string, companyId: string) => ["licitacao", "list", orgId, companyId] as const,
}

export function useLicitacaoService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  const list = (params: { orgId: string; companyId: string; enabled?: boolean }) =>
    useQuery({
      queryKey: licitacaoKeys.list(params.orgId, params.companyId),
      queryFn: () => api.licitacao.listLicitacoes({ orgId: params.orgId, companyId: params.companyId }),
      enabled: (params.enabled ?? true) && !!params.orgId && !!params.companyId,
    })

  const create = useMutation({
    mutationFn: (data: Parameters<typeof api.licitacao.createLicitacao>[0]["requestBody"]) =>
      api.licitacao.createLicitacao({ requestBody: data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: licitacaoKeys.list(result.tender.orgId, result.tender.companyId),
      })
    },
  })

  return { list, create }
}
