"use client"

import { useCoreApi }               from "@/client/hooks/use-core-api"
import { useContractDetailService }  from "./use-contract-detail.service"
import { useContractFilesService }   from "./use-contract-files.service"
import { useContractHistoryService } from "./use-contract-history.service"
import { useContractTermsService }   from "./use-contract-terms.service"

export { useContractDetailService }  from "./use-contract-detail.service"
export { useContractFilesService }   from "./use-contract-files.service"
export { useContractHistoryService } from "./use-contract-history.service"
export { useContractTermsService }   from "./use-contract-terms.service"

type ContractParams = {
  cnpj:               string
  anoContrato:        number
  sequencialContrato: number
  enabled?:           boolean
}

export function useContractService({ cnpj, anoContrato, sequencialContrato, enabled = true }: ContractParams) {
  const api  = useCoreApi()
  const data = { cnpj, anoContrato, sequencialContrato }

  const detail  = useContractDetailService(api).get({ data, enabled })
  const files   = useContractFilesService(api).get({ data, enabled })
  const history = useContractHistoryService(api).get({ data, enabled })
  const terms   = useContractTermsService(api).get({ data, enabled })

  return { detail, files, history, terms }
}
