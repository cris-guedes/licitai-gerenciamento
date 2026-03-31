"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"

const companyKeys = {
  list: (organizationId: string) => ["company-profile", "list", organizationId] as const,
  detail: (companyId: string) => ["company-profile", "detail", companyId] as const,
  active: (companyId: string) => ["company", companyId] as const,
}

export namespace useCompanyProfileServiceParams {
  export type List = {
    organizationId: string
    enabled?: boolean
  }

  export type Detail = {
    companyId: string
    enabled?: boolean
  }
}

export type CompanyUpsertPayload = {
  organizationId?: string
  cnpj: string
  razao_social: string
  nome_fantasia?: string | null
  email_empresa?: string | null
  telefone_1?: string | null
  situacao_cadastral?: string | null
  data_situacao_cadastral?: string | null
  data_abertura?: string | null
  porte?: string | null
  natureza_juridica?: string | null
  cnae_fiscal_descricao?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  municipio?: string | null
  uf?: string | null
  cep?: string | null
  capital_social?: number | string | null
}

type NormalizedCompanyUpsertPayload = Omit<CompanyUpsertPayload, "capital_social"> & {
  capital_social?: number | null
}

function normalizePayload(data: CompanyUpsertPayload): NormalizedCompanyUpsertPayload {
  return {
    ...data,
    nome_fantasia: data.nome_fantasia || null,
    email_empresa: data.email_empresa || null,
    telefone_1: data.telefone_1 || null,
    situacao_cadastral: data.situacao_cadastral || null,
    data_situacao_cadastral: data.data_situacao_cadastral || null,
    data_abertura: data.data_abertura || null,
    porte: data.porte || null,
    natureza_juridica: data.natureza_juridica || null,
    cnae_fiscal_descricao: data.cnae_fiscal_descricao || null,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    complemento: data.complemento || null,
    bairro: data.bairro || null,
    municipio: data.municipio || null,
    uf: data.uf || null,
    cep: data.cep || null,
    capital_social: typeof data.capital_social === "number" && !Number.isNaN(data.capital_social)
      ? data.capital_social
      : null,
  }
}

export function useCompanyProfileService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  const list = (params: useCompanyProfileServiceParams.List) => {
    const { organizationId, enabled = true } = params

    return useQuery({
      queryKey: companyKeys.list(organizationId),
      queryFn: () => api.company.listCompanies({ organizationId }),
      enabled: enabled && !!organizationId,
    })
  }

  const detail = (params: useCompanyProfileServiceParams.Detail) => {
    const { companyId, enabled = true } = params

    return useQuery({
      queryKey: companyKeys.detail(companyId),
      queryFn: () => api.company.fetchCompanyById({ companyId }),
      enabled: enabled && !!companyId,
    })
  }

  const create = useMutation({
    mutationFn: (data: CompanyUpsertPayload & { organizationId: string }) => {
      const payload = normalizePayload(data)

      return api.company.createCompany({
        requestBody: {
          ...payload,
          organizationId: data.organizationId,
        },
      })
    },
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.list(company.organizationId) })
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(company.id) })
    },
  })

  const update = useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CompanyUpsertPayload }) =>
      api.company.updateCompany({
        requestBody: {
          companyId,
          data: normalizePayload(data),
        },
      }),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.list(company.organizationId) })
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(company.id) })
      queryClient.invalidateQueries({ queryKey: companyKeys.active(company.id) })
    },
  })

  const remove = useMutation({
    mutationFn: ({ companyId }: { companyId: string }) =>
      api.company.deleteCompany({ requestBody: { companyId } }),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.list(company.organizationId) })
      queryClient.removeQueries({ queryKey: companyKeys.detail(company.id) })
      queryClient.invalidateQueries({ queryKey: companyKeys.active(company.id) })
    },
  })

  return {
    list,
    detail,
    create,
    update,
    remove,
  }
}
