"use client"

import { Plus, Search } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useCompanyItemsService } from "../../services/company-item"
import { CompanyItemDeleteDialog } from "./CompanyItemDeleteDialog/CompanyItemDeleteDialog"
import { CompanyItemFormDialog } from "./CompanyItemFormDialog/CompanyItemFormDialog"
import { CompanyItemTable } from "./CompanyItemTable/CompanyItemTable"
import { useCompanyItemsPage } from "./hooks/useCompanyItemsPage"

export function CompanyItemsPage() {
  const api = useCoreApi()
  const companyItemsService = useCompanyItemsService(api)
  const { empresaAtiva } = useAppContext()

  const page = useCompanyItemsPage({
    companyId: empresaAtiva?.id ?? null,
    companyItemsService,
  })

  return (
    <div className="min-h-full space-y-6 bg-white">
      <DashboardHeaderActions>
        <Button onClick={() => page.setCreateOpen(true)} className="h-10 rounded-lg px-4">
          <Plus className="mr-2 size-4" />
          Novo item
        </Button>
      </DashboardHeaderActions>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="space-y-1">
          <h1 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-950">
            Produtos
          </h1>
          <p className="text-sm text-slate-600">
            Catalogo interno da empresa {empresaAtiva?.name ?? "selecionada"}.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={page.search}
              onChange={(event) => page.setSearch(event.target.value)}
              className="h-11 rounded-lg border-slate-200 bg-white pl-10 shadow-none"
              placeholder="Buscar por codigo, descricao ou unidade..."
            />
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>{page.items.length} produtos</span>
            <span>{page.activeCount} ativos</span>
            <span>{page.inactiveCount} inativos</span>
          </div>
        </div>
      </section>

      <CompanyItemTable
        items={page.filteredItems}
        isLoading={page.isLoading}
        onEdit={page.setEditingItem}
        onDelete={page.setDeletingItem}
      />

      <CompanyItemFormDialog
        open={page.createOpen}
        mode="create"
        item={null}
        isPending={page.isCreating}
        onClose={() => page.setCreateOpen(false)}
        onSubmit={page.handleCreate}
      />

      <CompanyItemFormDialog
        open={Boolean(page.editingItem)}
        mode="edit"
        item={page.editingItem}
        isPending={page.isUpdating}
        onClose={() => page.setEditingItem(null)}
        onSubmit={page.handleUpdate}
      />

      <CompanyItemDeleteDialog
        open={Boolean(page.deletingItem)}
        item={page.deletingItem}
        isPending={page.isDeleting}
        onClose={() => page.setDeletingItem(null)}
        onConfirm={page.handleDelete}
      />
    </div>
  )
}
