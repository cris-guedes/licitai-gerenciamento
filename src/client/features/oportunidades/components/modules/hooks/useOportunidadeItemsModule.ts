"use client"

import { useMemo, useState } from "react"
import type { OportunidadeWorkspaceItem, UpdateOportunidadeItemPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
import type { useOportunidadeCatalogService } from "@/client/features/oportunidades/services/use-oportunidade-catalog.service"
import type { OportunidadeWorkspaceModel } from "../../../types/oportunidade-workspace"

export type OportunidadeItemsFilter = "ALL" | "PENDING" | "READY" | "BIDDING" | "CLOSED"

type Deps = {
  workspace: OportunidadeWorkspaceModel
  isUpdating: boolean
  onUpdateItem: (payload: Omit<UpdateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onCreateItem: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").CreateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onDeleteItem: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").DeleteOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  catalogService: ReturnType<typeof useOportunidadeCatalogService>
}

export function useOportunidadeItemsModule({
  workspace,
  isUpdating,
  onUpdateItem,
  onCreateItem,
  onDeleteItem,
  catalogService,
}: Deps) {
  const sourceItems = useMemo(
    () => workspace.licitacaoWorkspace?.edital?.itens ?? [],
    [workspace.licitacaoWorkspace?.edital?.itens],
  )
  const companyItemsQuery = catalogService.useCompanyItems({
    companyId: workspace.companyId,
    enabled: Boolean(workspace.companyId),
  })

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [attachingItemId, setAttachingItemId] = useState<string | null>(null)
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<OportunidadeItemsFilter>("ALL")
  const [isAddingItem, setIsAddingItem] = useState(false)

  const companyItems = useMemo(() => {
    return [...(companyItemsQuery.data?.companyItems ?? [])].sort((a, b) => {
      if (a.codigo !== b.codigo) return a.codigo.localeCompare(b.codigo)
      return a.descricao.localeCompare(b.descricao)
    })
  }, [companyItemsQuery.data?.companyItems])
  const orderedItems = useMemo(() => {
    return [...sourceItems].sort((a, b) => {
      const loteA = a.lote ?? ""
      const loteB = b.lote ?? ""
      if (loteA !== loteB) return loteA.localeCompare(loteB)

      const numeroA = Number(a.numeroItem ?? Number.MAX_SAFE_INTEGER)
      const numeroB = Number(b.numeroItem ?? Number.MAX_SAFE_INTEGER)
      if (numeroA !== numeroB) return numeroA - numeroB

      return (a.descricao ?? "").localeCompare(b.descricao ?? "")
    })
  }, [sourceItems])
  const items = useMemo(() => {
    const normalizedSearch = normalizeText(search)

    return orderedItems.filter(item => {
      if (!matchesFilter(item, filter)) return false
      if (!normalizedSearch) return true

      const haystack = normalizeText([
        item.numeroItem,
        item.lote,
        item.descricao,
        item.companyItem?.codigo,
        item.companyItem?.descricao,
      ].filter(Boolean).join(" "))

      return haystack.includes(normalizedSearch)
    })
  }, [filter, orderedItems, search])
  const editingItem = orderedItems.find(item => item.id === editingItemId) ?? null
  const attachingItem = orderedItems.find(item => item.id === attachingItemId) ?? null
  const selectedItems = sourceItems.filter(item => item.isSelected)
  const selectedTotal = selectedItems.reduce((sum, item) => {
    return sum + toNumber(item.pricing?.precoOfertaTotal ?? item.valorTotalEstimado)
  }, 0)
  const mappedCount = sourceItems.filter(item => item.companyItem).length
  const pricedCount = sourceItems.filter(item => item.pricing?.precoOfertaUnitario).length
  const pendingCount = sourceItems.filter(item => isPendingItem(item)).length
  const readyCount = sourceItems.filter(item => item.status === "READY_FOR_BID").length
  const biddingCount = sourceItems.filter(item => item.status === "IN_BIDDING").length
  const closedCount = sourceItems.filter(item => isClosedStatus(item.status)).length

  async function handleToggleItem(item: OportunidadeWorkspaceItem, checked: boolean) {
    if (!item.oportunidadeItemId || isUpdating) return

    await onUpdateItem({
      oportunidadeItemId: item.oportunidadeItemId,
      data: {
        isSelected: checked,
      },
    })
  }

  async function handleSaveItem(data: UpdateOportunidadeItemPayload["data"]) {
    if (!editingItem?.oportunidadeItemId) return

    await onUpdateItem({
      oportunidadeItemId: editingItem.oportunidadeItemId,
      data,
    })

    setEditingItemId(null)
  }

  async function handleSaveInlineItem(
    item: OportunidadeWorkspaceItem,
    data: UpdateOportunidadeItemPayload["data"],
  ) {
    if (!item.oportunidadeItemId || isUpdating) return

    await onUpdateItem({
      oportunidadeItemId: item.oportunidadeItemId,
      data,
    })
  }

  async function handleAttachCompanyItem(companyItemId: string) {
    if (!attachingItem?.oportunidadeItemId || isUpdating) return

    await onUpdateItem({
      oportunidadeItemId: attachingItem.oportunidadeItemId,
      data: {
        companyItemId,
      },
    })

    setExpandedItemIds(current => ({
      ...current,
      [attachingItem.id]: true,
    }))
    setAttachingItemId(null)
  }

  function handleCreateItemClick() {
    setIsAddingItem(true);
  }

  function handleCancelCreateItem() {
    setIsAddingItem(false);
  }

  async function handleSubmitNewItem(data: Omit<UpdateOportunidadeItemPayload["data"], "companyItemId" | "isSelected" | "status" | "observacaoInterna" | "pricing" | "disputa">) {
    if (isUpdating) return;

    await onCreateItem({
      data: {
        ...data.editalItem,
        quantidadeTotal: data.editalItem?.quantidadeTotal ?? 1,
      } as any
    });

    setIsAddingItem(false);
  }

  async function handleDeleteItem(oportunidadeItemId: string) {
    if (isUpdating || !oportunidadeItemId) return
    await onDeleteItem({ oportunidadeItemId })
  }

  function toggleExpandedItem(itemId: string) {
    setExpandedItemIds(current => ({
      ...current,
      [itemId]: !current[itemId],
    }))
  }

  return {
    items,
    totalItems: sourceItems.length,
    visibleCount: items.length,
    companyItems,
    editingItem,
    attachingItem,
    selectedItems,
    selectedTotal,
    mappedCount,
    pricedCount,
    pendingCount,
    readyCount,
    biddingCount,
    closedCount,
    search,
    setSearch,
    filter,
    setFilter,
    isCatalogLoading: companyItemsQuery.isLoading,
    openEditItem: setEditingItemId,
    closeEditItem: () => setEditingItemId(null),
    openAttachItem: setAttachingItemId,
    closeAttachItem: () => setAttachingItemId(null),
    expandedItemIds,
    toggleExpandedItem,
    handleToggleItem,
    handleSaveItem,
    handleSaveInlineItem,
    handleAttachCompanyItem,
    isAddingItem,
    handleCreateItemClick,
    handleCancelCreateItem,
    handleSubmitNewItem,
    handleDeleteItem,
  }
}

function toNumber(value: string | null | undefined) {
  if (!value) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}


function matchesFilter(item: OportunidadeWorkspaceItem, filter: OportunidadeItemsFilter) {
  if (filter === "ALL") return true
  if (filter === "PENDING") return isPendingItem(item)
  if (filter === "READY") return item.status === "READY_FOR_BID"
  if (filter === "BIDDING") return item.status === "IN_BIDDING"
  return isClosedStatus(item.status)
}

function isPendingItem(item: OportunidadeWorkspaceItem) {
  return !item.companyItem || item.status === "PENDING_PRICING"
}

function isClosedStatus(status: OportunidadeWorkspaceItem["status"]) {
  return status === "WON" || status === "LOST" || status === "DISCARDED"
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}
