"use client"

import { useMemo, useState } from "react"
import { formatDeadline } from "@/client/main/lib/utils/deadline"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useProcurementItemsService } from "../../../../../services/procurement"

const DOC_LABELS: Record<string, string> = {
  edital: "Edital",
  aviso_licitacao: "Aviso de Licitação",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
  contrato: "Contrato",
}

type SearchResultCardDeps = {
  procurementItemsService: ReturnType<typeof useProcurementItemsService>
}

export function useSearchResultCard(item: LicitacaoItem, deps: SearchResultCardDeps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [itemsExpanded, setItemsExpanded] = useState(false)
  const itemsQuery = deps.procurementItemsService.get({ item, enabled: itemsExpanded })

  const docLabel = item.document_type ? (DOC_LABELS[item.document_type] ?? item.document_type) : null
  const editTitle = useMemo(() => {
    const raw = item.numero_controle_pncp
    if (!raw) return null

    const lastPart = raw.split("-").pop() ?? ""
    const [num, ano] = lastPart.split("/")
    if (!num || !ano) return null

    return `${docLabel ?? "Edital"} nº ${parseInt(num, 10)}/${ano}`
  }, [docLabel, item.numero_controle_pncp])

  const location = [item.municipio_nome, item.uf].filter(Boolean).join(" / ")
  const fimDate = item.data_fim_vigencia ? new Date(item.data_fim_vigencia).toLocaleDateString("pt-BR") : null
  const daysLeft = item.data_fim_vigencia
    ? Math.ceil((new Date(item.data_fim_vigencia).getTime() - Date.now()) / 86_400_000)
    : null
  const urgency = daysLeft != null && daysLeft >= 0
    ? daysLeft <= 2
      ? "text-red-500"
      : daysLeft <= 7
        ? "text-orange-500"
        : "text-muted-foreground"
    : null

  return {
    sheetOpen,
    setSheetOpen,
    itemsExpanded,
    setItemsExpanded,
    itemsQuery,
    docLabel,
    editTitle,
    location,
    fimDate,
    urgency,
    deadlineLabel: formatDeadline(item.data_fim_vigencia),
  }
}
