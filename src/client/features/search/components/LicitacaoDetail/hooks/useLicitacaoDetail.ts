"use client"

import { useMemo, useState } from "react"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import {
  useProcurementAtasService,
  useProcurementContractsService,
  useProcurementDetailService,
  useProcurementFilesService,
  useProcurementHistoryService,
  useProcurementItemResultsService,
  useProcurementItemsService,
} from "../../../services/procurement"
import { buildPncpUrl, toAbsoluteUrl } from "../../../utils/urls"
import type { TabId } from "../constants"

type Props = {
  item: LicitacaoItem
  isOpen?: boolean
}

type LicitacaoDetailDeps = {
  procurementDetailService: ReturnType<typeof useProcurementDetailService>
  procurementItemsService: ReturnType<typeof useProcurementItemsService>
  procurementFilesService: ReturnType<typeof useProcurementFilesService>
  procurementAtasService: ReturnType<typeof useProcurementAtasService>
  procurementContractsService: ReturnType<typeof useProcurementContractsService>
  procurementHistoryService: ReturnType<typeof useProcurementHistoryService>
  procurementItemResultsService: ReturnType<typeof useProcurementItemResultsService>
}

function getDocumentTitle(item: LicitacaoItem) {
  const raw = item.numero_controle_pncp
  if (!raw) return null

  const lastPart = raw.split("-").pop() ?? ""
  const [num, ano] = lastPart.split("/")
  if (!num || !ano) return null

  const labels: Record<string, string> = {
    edital: "Edital",
    aviso_licitacao: "Aviso de Licitação",
    dispensa: "Dispensa",
    inexigibilidade: "Inexigibilidade",
    contrato: "Contrato",
  }

  const label = item.document_type ? (labels[item.document_type] ?? item.document_type) : "Edital"
  return `${label} nº ${parseInt(num, 10)}/${ano}`
}

export function useLicitacaoDetail({ item, isOpen = true }: Props, deps: LicitacaoDetailDeps) {
  const [activeTab, setActiveTab] = useState<TabId>("visao-geral")

  const detail = deps.procurementDetailService.get({ item, enabled: isOpen })
  const items = deps.procurementItemsService.get({ item, enabled: isOpen && activeTab === "itens" })
  const files = deps.procurementFilesService.get({ item, enabled: isOpen && activeTab === "documentos" })
  const atas = deps.procurementAtasService.get({ item, enabled: isOpen && activeTab === "atas" })
  const contracts = deps.procurementContractsService.get({ item, enabled: isOpen && activeTab === "contratos" })
  const history = deps.procurementHistoryService.get({ item, enabled: isOpen && activeTab === "historico" })
  const itemResults = deps.procurementItemResultsService

  const systemSourceUrl = useMemo(() => {
    if (!detail.data?.linkSistemaOrigem) return null
    return toAbsoluteUrl(detail.data.linkSistemaOrigem)
  }, [detail.data?.linkSistemaOrigem])

  return {
    activeTab,
    setActiveTab,
    documentTitle: getDocumentTitle(item),
    pncpUrl: buildPncpUrl(item),
    systemSourceUrl,
    detail,
    items,
    files,
    atas,
    contracts,
    history,
    itemResults,
  }
}
