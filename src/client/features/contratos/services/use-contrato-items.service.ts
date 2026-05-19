"use client"

import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export type CreateContratoItemPayload = Parameters<CoreApiClient["contratos"]["postCoreContratosItens"]>[0]["requestBody"]
export type UpdateContratoItemPayload = Parameters<CoreApiClient["contratos"]["postCoreContratosItensUpdate"]>[0]["requestBody"]
export type DeleteContratoItemPayload = Parameters<CoreApiClient["contratos"]["postCoreContratosItensDelete"]>[0]["requestBody"]
export type UpdateOportunidadeItemPayload = Parameters<CoreApiClient["oportunidade"]["updateOportunidadeItem"]>[0]["requestBody"]
export type CreateCompanyItemPayload = Parameters<CoreApiClient["companyItem"]["createCompanyItem"]>[0]["requestBody"]
export type UpdateCompanyItemPayload = Parameters<CoreApiClient["companyItem"]["updateCompanyItem"]>[0]["requestBody"]

export function useContratoItemsService(api: CoreApiClient) {
  return {
    listCompanyItems: (companyId: string) => api.companyItem.listCompanyItems({ companyId }),
    createContratoItem: (requestBody: CreateContratoItemPayload) =>
      api.contratos.postCoreContratosItens({ requestBody }),
    updateContratoItem: (requestBody: UpdateContratoItemPayload) =>
      api.contratos.postCoreContratosItensUpdate({ requestBody }),
    deleteContratoItem: (requestBody: DeleteContratoItemPayload) =>
      api.contratos.postCoreContratosItensDelete({ requestBody }),
    updateOportunidadeItem: (requestBody: UpdateOportunidadeItemPayload) =>
      api.oportunidade.updateOportunidadeItem({ requestBody }),
    createCompanyItem: (requestBody: CreateCompanyItemPayload) =>
      api.companyItem.createCompanyItem({ requestBody }),
    updateCompanyItem: (requestBody: UpdateCompanyItemPayload) =>
      api.companyItem.updateCompanyItem({ requestBody }),
  }
}
