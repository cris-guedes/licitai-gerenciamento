"use client"

import { useCoreApi }                        from "@/client/hooks/use-core-api"
import type { LicitacaoItem }                from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useProcurementAtasService }         from "./use-procurement-atas.service"
import { useProcurementContractsService }    from "./use-procurement-contracts.service"
import { useProcurementDetailService }       from "./use-procurement-detail.service"
import { useProcurementFilesService }        from "./use-procurement-files.service"
import { useProcurementHistoryService }      from "./use-procurement-history.service"
import { useProcurementItemsService }        from "./use-procurement-items.service"
import { useProcurementItemResultsService }  from "./use-procurement-item-results.service"

export { useProcurementAtasService }         from "./use-procurement-atas.service"
export { useProcurementContractsService }    from "./use-procurement-contracts.service"
export { useProcurementDetailService }       from "./use-procurement-detail.service"
export { useProcurementFilesService }        from "./use-procurement-files.service"
export { useProcurementHistoryService }      from "./use-procurement-history.service"
export { useProcurementItemResultsService }  from "./use-procurement-item-results.service"
export { useProcurementItemsService }        from "./use-procurement-items.service"

export function useProcurementService(item: LicitacaoItem, enabled = true) {
  const api = useCoreApi()

  const detail      = useProcurementDetailService(api).get({ item, enabled })
  const items       = useProcurementItemsService(api).get({ item, enabled })
  const files       = useProcurementFilesService(api).get({ item, enabled })
  const atas        = useProcurementAtasService(api).get({ item, enabled })
  const contracts   = useProcurementContractsService(api).get({ item, enabled })
  const history     = useProcurementHistoryService(api).get({ item, enabled })
  // itemResults needs a dynamic `numeroItem` — call .get() at the component level
  const itemResults = useProcurementItemResultsService(api)

  return { detail, items, itemResults, files, atas, contracts, history }
}
