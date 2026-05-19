"use client"

import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export type CreateLocalEntregaPayload = Parameters<CoreApiClient["empenhos"]["postCoreContratosContratoIdEmpenhosEmpenhoIdLocais"]>[0]["requestBody"]
export type CreateEntregaPayload = Parameters<CoreApiClient["empenhos"]["postCoreContratosContratoIdEmpenhosEmpenhoIdEntregas"]>[0]["requestBody"]

export function useContratoEntregasService(api: CoreApiClient) {
  return {
    createLocalEntrega: (requestBody: CreateLocalEntregaPayload) =>
      api.empenhos.postCoreContratosContratoIdEmpenhosEmpenhoIdLocais({ requestBody }),
    createEntrega: (requestBody: CreateEntregaPayload) =>
      api.empenhos.postCoreContratosContratoIdEmpenhosEmpenhoIdEntregas({ requestBody }),
  }
}
