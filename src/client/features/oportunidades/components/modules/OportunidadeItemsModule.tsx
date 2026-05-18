"use client"

import { Plus, Search } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { WorkspacePanel } from "@/client/components/workspace"
import { useCoreApi } from "@/client/hooks/use-core-api"
import type { UpdateOportunidadeItemPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
import { useOportunidadeCatalogService } from "@/client/features/oportunidades/services/use-oportunidade-catalog.service"
import { formatCurrency } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"
import { OportunidadeItemAttachDialog } from "./OportunidadeItemAttachDialog"
import { OportunidadeItemsDataTable } from "./OportunidadeItemsDataTable"
import { OportunidadeItemPricingDialog } from "./OportunidadeItemPricingDialog"
import { useOportunidadeItemsModule } from "./hooks/useOportunidadeItemsModule"

export function OportunidadeItemsModule({
  workspace,
  isUpdating,
  onUpdateItem,
  onCreateItem,
  onDeleteItem,
}: {
  workspace: OportunidadeWorkspaceModel
  isUpdating: boolean
  onUpdateItem: (payload: Omit<UpdateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onCreateItem?: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").CreateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onDeleteItem?: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").DeleteOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
}) {
  const api = useCoreApi()
  const catalogService = useOportunidadeCatalogService(api)
  const itemsModule = useOportunidadeItemsModule({
    workspace,
    isUpdating,
    onUpdateItem,
    onCreateItem: onCreateItem || (async () => {}),
    onDeleteItem: onDeleteItem || (async () => {}),
    catalogService,
  })

  return (
    <WorkspacePanel>
      <div className="min-w-0 space-y-5">
        <div className="space-y-4 bg-white pb-2">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex w-full min-w-0 items-center gap-3 xl:max-w-4xl">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={itemsModule.search}
                  onChange={event => itemsModule.setSearch(event.target.value)}
                  placeholder="Buscar por item, lote, descrição ou código interno"
                  className="h-10 rounded-lg border-slate-200 bg-white pl-9 shadow-none w-full"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10"
                onClick={() => itemsModule.handleCreateItemClick()} 
                disabled={isUpdating}
              >
                <Plus className="mr-2 size-4" />
                Adicionar item
              </Button>
            </div>
          </div>

          <Tabs value={itemsModule.filter} onValueChange={value => itemsModule.setFilter(value as typeof itemsModule.filter)} className="gap-0">
            <TabsList variant="line" className="w-full justify-start gap-5 rounded-none bg-transparent p-0">
              <TabsTrigger value="ALL" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                Todos
              </TabsTrigger>
              <TabsTrigger value="PENDING" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="READY" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                Prontos
              </TabsTrigger>
              <TabsTrigger value="BIDDING" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                Em disputa
              </TabsTrigger>
              <TabsTrigger value="CLOSED" className="h-auto flex-none rounded-none border-0 px-0 pb-2 pt-0 text-sm font-medium text-slate-500 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-slate-900">
                Encerrados
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <OportunidadeItemsDataTable
          items={itemsModule.items}
          expandedItemIds={itemsModule.expandedItemIds}
          isUpdating={isUpdating}
          onToggleExpanded={itemsModule.toggleExpandedItem}
          onToggleItem={itemsModule.handleToggleItem}
          onSaveItem={itemsModule.handleSaveInlineItem}
          onOpenAttach={itemsModule.openAttachItem}
          onDeleteItem={itemsModule.handleDeleteItem}
          isAddingItem={itemsModule.isAddingItem}
          onCancelAddingItem={itemsModule.handleCancelCreateItem}
          onSubmitAddingItem={itemsModule.handleSubmitNewItem}
        />
      </div>

      <OportunidadeItemPricingDialog
        key={`${itemsModule.editingItem?.id ?? "empty"}:${Boolean(itemsModule.editingItem)}`}
        open={Boolean(itemsModule.editingItem)}
        item={itemsModule.editingItem}
        companyItems={itemsModule.companyItems}
        isPending={isUpdating || itemsModule.isCatalogLoading}
        onClose={itemsModule.closeEditItem}
        onSubmit={itemsModule.handleSaveItem}
      />

      <OportunidadeItemAttachDialog
        open={Boolean(itemsModule.attachingItem)}
        item={itemsModule.attachingItem}
        companyItems={itemsModule.companyItems}
        isPending={isUpdating || itemsModule.isCatalogLoading}
        onClose={itemsModule.closeAttachItem}
        onSelect={itemsModule.handleAttachCompanyItem}
      />
    </WorkspacePanel>
  )
}
