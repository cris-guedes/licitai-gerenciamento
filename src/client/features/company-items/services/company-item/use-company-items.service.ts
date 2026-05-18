"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

const companyItemKeys = {
  list: (companyId: string) => ["company-items", "list", companyId] as const,
  detail: (companyId: string, companyItemId: string) => ["company-items", "detail", companyId, companyItemId] as const,
}

export type UseCompanyItemsServiceListParams = {
  companyId: string
  enabled?: boolean
}

export type UseCompanyItemsServiceDetailParams = {
  companyId: string
  companyItemId: string
  enabled?: boolean
}

export type CompanyItemUpsertPayload = {
  codigo: string
  descricao: string
  marca?: string | null
  unidadeMedida: string
  imageUrl?: string | null
  precoReferencia?: string | null
  ativo: boolean
}

function normalizePayload(data: CompanyItemUpsertPayload) {
  const normalizedPrice = data.precoReferencia?.trim()

  return {
    codigo: data.codigo.trim(),
    descricao: data.descricao.trim(),
    marca: data.marca?.trim() ? data.marca.trim() : null,
    unidadeMedida: data.unidadeMedida.trim().toUpperCase(),
    imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : null,
    precoReferencia: normalizedPrice ? Number(normalizedPrice.replace(",", ".")) : null,
    ativo: data.ativo,
  }
}

export function useCompanyItemsService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  const useList = (params: UseCompanyItemsServiceListParams) => {
    const { companyId, enabled = true } = params

    return useQuery({
      queryKey: companyItemKeys.list(companyId),
      queryFn: () => api.companyItem.listCompanyItems({ companyId }),
      enabled: enabled && !!companyId,
    })
  }

  const useDetail = (params: UseCompanyItemsServiceDetailParams) => {
    const { companyId, companyItemId, enabled = true } = params

    return useQuery({
      queryKey: companyItemKeys.detail(companyId, companyItemId),
      queryFn: () => api.companyItem.fetchCompanyItemById({ companyId, companyItemId }),
      enabled: enabled && !!companyId && !!companyItemId,
    })
  }

  const create = useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CompanyItemUpsertPayload }) =>
      api.companyItem.createCompanyItem({
        requestBody: {
          companyId,
          ...normalizePayload(data),
        },
      }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyItemKeys.list(item.companyId) })
      queryClient.invalidateQueries({ queryKey: companyItemKeys.detail(item.companyId, item.id) })
    },
  })

  const update = useMutation({
    mutationFn: ({ companyId, companyItemId, data }: { companyId: string; companyItemId: string; data: CompanyItemUpsertPayload }) =>
      api.companyItem.updateCompanyItem({
        requestBody: {
          companyId,
          companyItemId,
          data: normalizePayload(data),
        },
      }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyItemKeys.list(item.companyId) })
      queryClient.invalidateQueries({ queryKey: companyItemKeys.detail(item.companyId, item.id) })
    },
  })

  const remove = useMutation({
    mutationFn: ({ companyId, companyItemId }: { companyId: string; companyItemId: string }) =>
      api.companyItem.deleteCompanyItem({
        requestBody: { companyId, companyItemId },
      }),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyItemKeys.list(item.companyId) })
      queryClient.removeQueries({ queryKey: companyItemKeys.detail(item.companyId, item.id) })
    },
  })

  return {
    useList,
    useDetail,
    create,
    update,
    remove,
  }
}
