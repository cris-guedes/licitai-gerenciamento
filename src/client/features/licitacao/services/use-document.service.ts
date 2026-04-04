"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export function useDocumentService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  // Register a document by URL (Caminho A)
  const registerDocument = useMutation({
    mutationFn: (data: {
      orgId: string
      companyId: string
      editalId: string
      type: string
      url: string
      publishedAt?: string | null
    }) => api.document.registerDocument({ requestBody: data }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["documents", result.editalId] })
    },
  })

  // Upload a file to R2 (Caminho B) — uses fetch directly (multipart not in generated client)
  const uploadDocument = useMutation({
    mutationFn: async (data: {
      orgId: string
      companyId: string
      editalId: string
      type: string
      publishedAt?: string | null
      file: File
    }) => {
      const formData = new FormData()
      formData.append("orgId",      data.orgId)
      formData.append("companyId",  data.companyId)
      formData.append("editalId",   data.editalId)
      formData.append("type",       data.type)
      if (data.publishedAt) formData.append("publishedAt", data.publishedAt)
      formData.append("file", data.file)

      const res = await fetch("/api/core/document/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
      if (!res.ok) throw new Error("Erro ao enviar o arquivo")
      return res.json() as Promise<{ id: string; editalId: string; url: string }>
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["documents", result.editalId] })
    },
  })

  return { registerDocument, uploadDocument }
}
