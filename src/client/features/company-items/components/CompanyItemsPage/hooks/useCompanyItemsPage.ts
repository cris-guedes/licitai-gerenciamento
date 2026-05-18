"use client"

import { useDeferredValue, useState } from "react"
import { toast } from "sonner"
import type { CompanyItem } from "@/client/main/infra/apis/api-core/models/CompanyItem"
import type { CompanyItemFormValues } from "../../../schemas/company-item.schema"
import type { useCompanyItemsService } from "../../../services/company-item"

type Deps = {
  companyId: string | null
  companyItemsService: ReturnType<typeof useCompanyItemsService>
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "body" in error) {
    const body = error.body
    if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
      return body.message
    }
  }

  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function useCompanyItemsPage({ companyId, companyItemsService }: Deps) {
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())
  const [createOpen, setCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CompanyItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<CompanyItem | null>(null)

  const listQuery = companyItemsService.useList({
    companyId: companyId ?? "",
    enabled: !!companyId,
  })

  const items = listQuery.data?.companyItems ?? []
  const filteredItems = items.filter(item => {
    if (!deferredSearch) return true

    const searchable = [
      item.codigo,
      item.descricao,
      item.unidadeMedida,
    ].join(" ").toLowerCase()

    return searchable.includes(deferredSearch)
  })

  const activeCount = items.filter(item => item.ativo).length
  const inactiveCount = items.length - activeCount

  async function handleCreate(values: CompanyItemFormValues) {
    if (!companyId) return

    try {
      await companyItemsService.create.mutateAsync({
        companyId,
        data: values,
      })
      toast.success("Item cadastrado com sucesso.")
      setCreateOpen(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível cadastrar o item."))
    }
  }

  async function handleUpdate(values: CompanyItemFormValues) {
    if (!companyId || !editingItem) return

    try {
      await companyItemsService.update.mutateAsync({
        companyId,
        companyItemId: editingItem.id,
        data: values,
      })
      toast.success("Item atualizado com sucesso.")
      setEditingItem(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível atualizar o item."))
    }
  }

  async function handleDelete() {
    if (!companyId || !deletingItem) return

    try {
      await companyItemsService.remove.mutateAsync({
        companyId,
        companyItemId: deletingItem.id,
      })
      toast.success("Item removido com sucesso.")
      setDeletingItem(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível remover o item."))
    }
  }

  return {
    items,
    filteredItems,
    search,
    createOpen,
    editingItem,
    deletingItem,
    activeCount,
    inactiveCount,
    isLoading: listQuery.isLoading,
    isCreating: companyItemsService.create.isPending,
    isUpdating: companyItemsService.update.isPending,
    isDeleting: companyItemsService.remove.isPending,
    setSearch,
    setCreateOpen,
    setEditingItem,
    setDeletingItem,
    handleCreate,
    handleUpdate,
    handleDelete,
  }
}
