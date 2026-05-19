"use client"

import { useMemo, useState } from "react"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useProcurementItemsService } from "../../../../../services/procurement"

const DOC_LABELS: Record<string, string> = {
  edital: "Edital",
  aviso_licitacao: "Aviso de Licitação",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
  contrato: "Contrato",
}

function formatDateTimeWhenPresent(value?: string | null): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const hasTime = /T\d{2}:\d{2}/.test(value)
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(hasTime ? { timeStyle: "short" as const } : {}),
  }).format(date)
}

type SearchResultCardDeps = {
  procurementItemsService: ReturnType<typeof useProcurementItemsService>
}

export function useSearchResultCard(item: LicitacaoItem, deps: SearchResultCardDeps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [itemsExpanded, setItemsExpanded] = useState(false)
  const [now] = useState(() => Date.now())
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
  const aberturaDate = formatDateTimeWhenPresent(item.data_inicio_vigencia)
  const encerramentoDate = formatDateTimeWhenPresent(item.data_fim_vigencia)
  const publicacaoDate = formatDateTimeWhenPresent(item.data_publicacao_pncp)
  const daysUntilOpening = item.data_inicio_vigencia
    ? Math.ceil((new Date(item.data_inicio_vigencia).getTime() - now) / 86_400_000)
    : null
  const daysLeft = item.data_fim_vigencia
    ? Math.ceil((new Date(item.data_fim_vigencia).getTime() - now) / 86_400_000)
    : null
  const openingLevel = daysUntilOpening != null && daysUntilOpening >= 0
    ? (daysUntilOpening <= 2 ? 2 : daysUntilOpening <= 7 ? 1 : 0)
    : 0
  const closingLevel = daysLeft != null && daysLeft >= 0
    ? (daysLeft <= 2 ? 2 : daysLeft <= 7 ? 1 : 0)
    : 0

  return {
    sheetOpen,
    setSheetOpen,
    itemsExpanded,
    setItemsExpanded,
    itemsQuery,
    docLabel,
    editTitle,
    location,
    aberturaDate,
    encerramentoDate,
    publicacaoDate,
    openingLevel,
    closingLevel,
  }
}
