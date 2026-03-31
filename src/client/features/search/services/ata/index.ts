"use client"

import { useCoreApi }           from "@/client/hooks/use-core-api"
import { useAtaDetailService }  from "./use-ata-detail.service"
import { useAtaFilesService }   from "./use-ata-files.service"
import { useAtaHistoryService } from "./use-ata-history.service"

export { useAtaDetailService }  from "./use-ata-detail.service"
export { useAtaFilesService }   from "./use-ata-files.service"
export { useAtaHistoryService } from "./use-ata-history.service"

type AtaParams = {
  cnpj:             string
  anoCompra:        number
  sequencialCompra: number
  sequencialAta:    number
  enabled?:         boolean
}

export function useAtaService({ cnpj, anoCompra, sequencialCompra, sequencialAta, enabled = true }: AtaParams) {
  const api  = useCoreApi()
  const data = { cnpj, anoCompra, sequencialCompra, sequencialAta }

  const detail  = useAtaDetailService(api).get({ data, enabled })
  const files   = useAtaFilesService(api).get({ data, enabled })
  const history = useAtaHistoryService(api).get({ data, enabled })

  return { detail, files, history }
}
