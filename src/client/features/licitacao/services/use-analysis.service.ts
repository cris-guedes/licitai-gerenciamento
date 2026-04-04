"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

const analysisKeys = {
  list: (editalId: string) => ["edital-analysis", "list", editalId] as const,
}

export function useAnalysisService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  const listAnalyses = (params: { orgId: string; editalId: string; enabled?: boolean }) =>
    useQuery({
      queryKey: analysisKeys.list(params.editalId),
      queryFn:  () => api.editalAnalysis.listEditalAnalyses({ orgId: params.orgId, editalId: params.editalId }),
      enabled:  (params.enabled ?? true) && !!params.orgId && !!params.editalId,
    })

  const runAnalysis = useMutation({
    mutationFn: (data: { orgId: string; companyId: string; editalId: string; documentIds: string[] }) =>
      api.editalAnalysis.runEditalAnalysis({ requestBody: data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.list(result.editalId) })
    },
  })

  const approveAnalysis = useMutation({
    mutationFn: (data: { editalAnalysisId: string; editalId: string }) =>
      api.editalAnalysis.approveEditalAnalysis({ requestBody: { editalAnalysisId: data.editalAnalysisId } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.list(variables.editalId) })
    },
  })

  const summarizeDocument = useMutation({
    mutationFn: (data: { orgId: string; companyId: string; documentId: string }) =>
      api.document.runDocumentSummary({ requestBody: data }),
  })

  return { listAnalyses, runAnalysis, approveAnalysis, summarizeDocument }
}
