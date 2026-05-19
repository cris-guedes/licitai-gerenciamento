"use client"

/* eslint-disable @next/next/no-img-element */
import React, { Fragment, useState } from "react"
import { Check, ChevronDown, ChevronUp, Link2, MoreHorizontal, Pencil, X } from "lucide-react"
import type { OportunidadeItemStatus } from "@/client/features/licitacoes/services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu"
import { Input } from "@/client/components/ui/input"
import { Switch } from "@/client/components/ui/switch"
import type { UpdateOportunidadeItemPayload } from "@/client/features/licitacoes/services/use-licitacao.service"
import { cn } from "@/client/main/lib/utils"
import { formatCurrency } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

type WorkspaceItem = NonNullable<NonNullable<OportunidadeWorkspaceModel["licitacaoWorkspace"]>["edital"]>["itens"][number]

type ParentItemDraft = {
  numeroItem: string
  descricao: string
  tipoItem: "MATERIAL" | "SERVICO" | ""
  lote: string
  quantidadeTotal: string
  unidadeMedida: string
  valorUnitarioEstimado: string
  valorTotalEstimado: string
}

type PricingDraft = {
  quantidadeAdesao: string
  precoOfertaUnitario: string
  custoUnitarioSnapshot: string
  valorMinimoLance: string
  ultimoLance: string
  ofertaMarca: string
  ofertaModelo: string
  garantiaDescricao: string
  status: OportunidadeItemStatus
}

type Props = {
  items: WorkspaceItem[]
  expandedItemIds: Record<string, boolean>
  isUpdating: boolean
  onToggleExpanded: (itemId: string) => void
  onToggleItem: (item: WorkspaceItem, checked: boolean) => Promise<void>
  onSaveItem: (item: WorkspaceItem, data: UpdateOportunidadeItemPayload["data"]) => Promise<void>
  onOpenAttach: (itemId: string) => void
  onDeleteItem: (oportunidadeItemId: string) => Promise<void>
  isAddingItem?: boolean
  onCancelAddingItem?: () => void
  onSubmitAddingItem?: (data: UpdateOportunidadeItemPayload["data"]) => Promise<void>
}

export function OportunidadeItemsDataTable({
  items,
  expandedItemIds,
  isUpdating,
  onToggleExpanded,
  onToggleItem,
  onSaveItem,
  onOpenAttach,
  onDeleteItem,
  isAddingItem,
  onCancelAddingItem,
  onSubmitAddingItem,
}: Props) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [parentDraft, setParentDraft] = useState<ParentItemDraft | null>(null)
  const [pricingDraft, setPricingDraft] = useState<PricingDraft | null>(null)
  const [newItemDraft, setNewItemDraft] = useState<ParentItemDraft | null>(null)

  // Initialize new item draft when `isAddingItem` becomes true
  React.useEffect(() => {
    if (isAddingItem && !newItemDraft) {
      const maxNumber = items.reduce((max, item) => {
        const num = Number(item.numeroItem);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      setNewItemDraft({
        numeroItem: String(maxNumber + 1),
        descricao: "Novo Item",
        tipoItem: "MATERIAL",
        lote: "",
        quantidadeTotal: "1",
        unidadeMedida: "UN",
        valorUnitarioEstimado: "",
        valorTotalEstimado: "",
      })
    } else if (!isAddingItem && newItemDraft) {
      setNewItemDraft(null)
    }
  }, [isAddingItem, newItemDraft, items]);

  function startEdit(item: WorkspaceItem) {
    setEditingItemId(item.id)
    setParentDraft(createParentItemDraft(item))
    setPricingDraft(createPricingDraft(item))
  }

  function cancelEdit() {
    setEditingItemId(null)
    setParentDraft(null)
    setPricingDraft(null)
  }

  async function saveEdit(item: WorkspaceItem) {
    if (!parentDraft || !pricingDraft) return

    await onSaveItem(item, {
      editalItem: {
        numeroItem: parentDraft.numeroItem,
        descricao: parentDraft.descricao,
        tipoItem: parentDraft.tipoItem || null,
        lote: parentDraft.lote,
        quantidadeTotal: parentDraft.quantidadeTotal,
        unidadeMedida: parentDraft.unidadeMedida,
        valorUnitarioEstimado: parentDraft.valorUnitarioEstimado,
        valorTotalEstimado: parentDraft.valorTotalEstimado,
      },
      status: pricingDraft.status,
      pricing: {
        quantidadeAdesao: pricingDraft.quantidadeAdesao,
        precoOfertaUnitario: pricingDraft.precoOfertaUnitario,
        custoUnitarioSnapshot: pricingDraft.custoUnitarioSnapshot,
        valorMinimoLance: pricingDraft.valorMinimoLance,
        ofertaMarca: pricingDraft.ofertaMarca,
        ofertaModelo: pricingDraft.ofertaModelo,
        garantiaDescricao: pricingDraft.garantiaDescricao,
      },
      disputa: {
        ultimoLance: pricingDraft.ultimoLance,
      },
    })

    cancelEdit()
  }

  async function saveNewItem() {
    if (!newItemDraft || !onSubmitAddingItem) return

    await onSubmitAddingItem({
      editalItem: {
        numeroItem: newItemDraft.numeroItem,
        descricao: newItemDraft.descricao,
        tipoItem: newItemDraft.tipoItem || null,
        lote: newItemDraft.lote,
        quantidadeTotal: newItemDraft.quantidadeTotal,
        unidadeMedida: newItemDraft.unidadeMedida,
        valorUnitarioEstimado: newItemDraft.valorUnitarioEstimado,
        valorTotalEstimado: newItemDraft.valorTotalEstimado,
      },
    })
    
    setNewItemDraft(null)
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden bg-white">
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="min-w-[1180px] w-full table-auto text-xs">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground border-b border-border/40">
              <th className="w-8 px-3 py-2.5" />
              <th className="w-10 px-2 py-2.5 text-center text-[10px] font-semibold text-muted-foreground whitespace-nowrap">Ativo</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Lote</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">#</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-foreground">Descrição</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Tipo</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Qtd</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Un.</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Vl. Unit.</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Total</th>
              <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Ações</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {isAddingItem && newItemDraft ? (
              <tr className="bg-sky-50/50 hover:bg-sky-50/50 transition-colors [&>td]:border-t [&>td]:border-border/30 [&>td:first-child]:rounded-tl-md [&>td:first-child]:border-l [&>td:last-child]:rounded-tr-md [&>td:last-child]:border-r">
                <td className="px-3 py-2.5 w-8">
                  {/* Empty chevron column */}
                </td>
                <td className="w-10 px-2 py-2.5 text-center whitespace-nowrap">
                   {/* Empty switch column */}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                  <InlineInput
                    className="w-20"
                    value={newItemDraft.lote}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, lote: value }) : current)}
                  />
                </td>
                <td className="px-3 py-2.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  <InlineInput
                    className="w-14"
                    value={newItemDraft.numeroItem}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, numeroItem: value }) : current)}
                  />
                </td>
                <td className="w-full min-w-[320px] px-3 py-2.5 align-top">
                  <InlineTextarea
                    value={newItemDraft.descricao}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, descricao: value }) : current)}
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] italic text-muted-foreground whitespace-nowrap">
                  <InlineSelect
                    value={newItemDraft.tipoItem}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, tipoItem: value as ParentItemDraft["tipoItem"] }) : current)}
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] font-semibold text-foreground whitespace-nowrap">
                  <InlineInput
                    className="ml-auto w-20 text-right"
                    value={newItemDraft.quantidadeTotal}
                    onChange={value => setNewItemDraft(current => updateParentDraftWithTotals(current, "quantidadeTotal", value))}
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                  <InlineInput
                    className="ml-auto w-16 text-right"
                    value={newItemDraft.unidadeMedida}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, unidadeMedida: value }) : current)}
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                  <InlineInput
                    className="ml-auto w-24 text-right"
                    value={newItemDraft.valorUnitarioEstimado}
                    onChange={value => setNewItemDraft(current => updateParentDraftWithTotals(current, "valorUnitarioEstimado", value))}
                  />
                </td>
                <td className="px-3 py-2.5 text-right text-[11px] font-bold text-foreground whitespace-nowrap">
                  <InlineInput
                    className="ml-auto w-24 text-right"
                    value={newItemDraft.valorTotalEstimado}
                    onChange={value => setNewItemDraft(current => current ? ({ ...current, valorTotalEstimado: value }) : current)}
                  />
                </td>
                <td className="px-3 py-2.5">
                  <InlineEditActions
                    disabled={isUpdating}
                    onCancel={() => onCancelAddingItem?.()}
                    onSave={() => void saveNewItem()}
                  />
                </td>
              </tr>
            ) : null}

            {items.length ? items.map((item, index) => {
              const isExpanded = Boolean(expandedItemIds[item.id] && item.companyItem)
              const numeroItem = item.numeroItem ?? index + 1
              const displayStatus = resolveDisplayStatus(item)
              const isEditing = editingItemId === item.id
              const activeParentDraft = isEditing ? parentDraft : null
              const activePricingDraft = isEditing ? pricingDraft : null

              return (
                <Fragment key={item.id}>
                  <tr className="bg-white hover:bg-white transition-colors [&>td]:border-t [&>td]:border-border/30 [&>td:first-child]:rounded-tl-md [&>td:first-child]:border-l [&>td:last-child]:rounded-tr-md [&>td:last-child]:border-r">
                    <td className="px-3 py-2.5 w-8">
                      {item.companyItem ? (
                        <button
                          type="button"
                          onClick={() => onToggleExpanded(item.id)}
                          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          title={isExpanded ? "Ocultar item interno" : "Ver item interno"}
                        >
                          {isExpanded
                            ? <ChevronUp size={14} className="transition-transform duration-200" />
                            : <ChevronDown size={14} className="transition-transform duration-200" />}
                        </button>
                      ) : null}
                    </td>

                    <td className="w-10 px-2 py-2.5 text-center whitespace-nowrap">
                      <div className="flex justify-center">
                        <Switch
                          
                          checked={item.isSelected}
                          disabled={isUpdating || !item.oportunidadeItemId}
                          onCheckedChange={checked => void onToggleItem(item, checked)}
                          aria-label={`Marcar interesse no item ${numeroItem}`}
                        />
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="w-20"
                          value={activeParentDraft.lote}
                          onChange={value => setParentDraft(current => current ? ({ ...current, lote: value }) : current)}
                        />
                      ) : item.lote || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="w-14"
                          value={activeParentDraft.numeroItem}
                          onChange={value => setParentDraft(current => current ? ({ ...current, numeroItem: value }) : current)}
                        />
                      ) : numeroItem}
                    </td>

                    <td className="w-full min-w-[320px] px-3 py-2.5 align-top">
                      {item.beneficioTributario || item.criterioJulgamentoItem ? (
                        <div className="mb-1 flex flex-wrap items-center gap-1.5">
                          {item.criterioJulgamentoItem ? (
                            <span className="inline-block rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold text-sky-700">
                              {item.criterioJulgamentoItem}
                            </span>
                          ) : null}
                          {item.beneficioTributario ? (
                          <span className="inline-block rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-semibold text-teal-700">
                            {item.beneficioTributario}
                          </span>
                          ) : null}
                        </div>
                      ) : null}
                      {activeParentDraft ? (
                        <InlineTextarea
                          value={activeParentDraft.descricao}
                          onChange={value => setParentDraft(current => current ? ({ ...current, descricao: value }) : current)}
                        />
                      ) : (
                        <p className="line-clamp-3 text-[11px] font-medium leading-5 text-foreground">
                          {item.descricao || "Item sem descrição"}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] leading-4 text-muted-foreground">
                        {item.codigoCatmatCatser ? <span>CATMAT/CATSER: {item.codigoCatmatCatser}</span> : null}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-right text-[11px] italic text-muted-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineSelect
                          value={activeParentDraft.tipoItem}
                          onChange={value => setParentDraft(current => current ? ({ ...current, tipoItem: value as ParentItemDraft["tipoItem"] }) : current)}
                        />
                      ) : formatTipoItem(item.tipoItem)}
                    </td>

                    <td className="px-3 py-2.5 text-right text-[11px] font-semibold text-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="ml-auto w-20 text-right"
                          value={activeParentDraft.quantidadeTotal}
                          onChange={value => setParentDraft(current => updateParentDraftWithTotals(current, "quantidadeTotal", value))}
                        />
                      ) : formatNumber(item.quantidadeTotal)}
                    </td>

                    <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="ml-auto w-16 text-right"
                          value={activeParentDraft.unidadeMedida}
                          onChange={value => setParentDraft(current => current ? ({ ...current, unidadeMedida: value }) : current)}
                        />
                      ) : item.unidadeMedida || "—"}
                    </td>

                    <td className="px-3 py-2.5 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="ml-auto w-24 text-right"
                          value={activeParentDraft.valorUnitarioEstimado}
                          onChange={value => setParentDraft(current => updateParentDraftWithTotals(current, "valorUnitarioEstimado", value))}
                        />
                      ) : formatCurrency(item.valorUnitarioEstimado ?? null) ?? "—"}
                    </td>

                    <td className="px-3 py-2.5 text-right text-[11px] font-bold text-foreground whitespace-nowrap">
                      {activeParentDraft ? (
                        <InlineInput
                          className="ml-auto w-24 text-right"
                          value={activeParentDraft.valorTotalEstimado}
                          onChange={value => setParentDraft(current => current ? ({ ...current, valorTotalEstimado: value }) : current)}
                        />
                      ) : formatCurrency(item.valorTotalEstimado ?? null) ?? "—"}
                    </td>

                    <td className="px-3 py-2.5">
                      {activeParentDraft ? (
                        <InlineEditActions
                          disabled={isUpdating || !item.oportunidadeItemId}
                          onCancel={cancelEdit}
                          onSave={() => void saveEdit(item)}
                        />
                      ) : (
                        <ParentItemActionsMenu
                          item={item}
                          disabled={!item.oportunidadeItemId}
                          onOpenAttach={onOpenAttach}
                          onStartEdit={startEdit}
                          onDeleteItem={onDeleteItem}
                        />
                      )}
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr>
                      <td colSpan={11} className="border-x border-border/30 px-0 py-0">
                        <div className="max-w-full overflow-x-auto overscroll-x-contain border-t border-border/30 bg-white px-6 py-2.5">
                          <table className="min-w-[760px] w-full text-xs">
                            <thead>
                              <tr className="bg-muted/30 text-muted-foreground border-b border-border/30">
                                <th className="text-left py-1.5 pr-4 text-[11px] font-semibold">Item Interno</th>
                                <th className="text-left py-1.5 pr-4 text-[11px] font-semibold">Marca</th>
                                <th className="text-left py-1.5 pr-4 text-[11px] font-semibold">Unid.</th>
                                <th className="text-right py-1.5 pr-4 text-[11px] font-semibold">Preço Ref.</th>
                                <th className="text-right py-1.5 pr-4 text-[11px] font-semibold">Atualizado</th>
                                <th className="text-right py-1.5 text-[11px] font-semibold">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-white hover:bg-white">
                                <td className="py-2 pr-4">
                                  <div className="flex items-start gap-3">
                                    {item.companyItem?.imageUrl ? (
                                      <img
                                        src={item.companyItem.imageUrl}
                                        alt={item.companyItem.descricao}
                                        className="size-11 rounded-md border border-border/30 bg-background object-cover"
                                      />
                                    ) : (
                                      <div className="size-11 rounded-md border border-border/30 bg-background" />
                                    )}

                                    <div className="min-w-0">
                                      <p className="text-[11px] font-medium text-foreground">{item.companyItem?.codigo}</p>
                                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                                        {item.companyItem?.descricao || "Item interno sem descrição"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-2 pr-4 text-[11px] text-muted-foreground whitespace-nowrap">
                                  {item.companyItem?.marca || "—"}
                                </td>

                                <td className="py-2 pr-4 text-[11px] text-muted-foreground whitespace-nowrap">
                                  {item.companyItem?.unidadeMedida || "—"}
                                </td>

                                <td className="py-2 pr-4 text-right text-[11px] font-semibold text-foreground whitespace-nowrap">
                                  {formatCurrencyFromNumber(resolveReferenceUnit(item)) ?? "—"}
                                </td>

                                <td className="py-2 pr-4 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                                  {formatShortDate(item.companyItem?.updatedAt)}
                                </td>

                                <td className="py-2">
                                  <CompanyItemActionsMenu
                                    item={item}
                                    disabled={!item.oportunidadeItemId}
                                    onOpenAttach={onOpenAttach}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  ) : null}

                  <tr>
                    <td colSpan={11} className="rounded-b-md border-x border-b border-border/30 px-0 py-0">
                      <div className="max-w-full overflow-x-auto overscroll-x-contain border-t border-border/20 bg-white px-4 py-1.5">
                        <table className="min-w-[1040px] w-full text-xs">
                          <thead>
                            <tr className="bg-muted/30 text-muted-foreground border-b border-border/30">
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Qtd.</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Ref.</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Oferta</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Custo</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Min.</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Lance</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Marg. U.</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Marg. T.</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Total</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Marca</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Modelo</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Garantia</th>
                              <th className="text-left px-2 py-1.5 text-[10px] font-semibold">Sit.</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-16"
                                    type="number"
                                    value={activePricingDraft.quantidadeAdesao}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, quantidadeAdesao: value }) : current)}
                                  />
                                ) : formatNumber(item.pricing?.quantidadeAdesao ?? null)}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">{formatCurrencyFromNumber(resolveReferenceUnit(item)) ?? "—"}</td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    type="number"
                                    value={activePricingDraft.precoOfertaUnitario}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, precoOfertaUnitario: value }) : current)}
                                  />
                                ) : formatCurrencyFromNumber(resolveOfferUnit(item)) ?? "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    type="number"
                                    value={activePricingDraft.custoUnitarioSnapshot}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, custoUnitarioSnapshot: value }) : current)}
                                  />
                                ) : formatCurrency(item.pricing?.custoUnitarioSnapshot ?? null) ?? "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    type="number"
                                    value={activePricingDraft.valorMinimoLance}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, valorMinimoLance: value }) : current)}
                                  />
                                ) : formatCurrency(item.pricing?.valorMinimoLance ?? null) ?? "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    type="number"
                                    value={activePricingDraft.ultimoLance}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, ultimoLance: value }) : current)}
                                  />
                                ) : formatCurrency(item.disputa?.ultimoLance ?? null) ?? "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">{formatCurrencyFromNumber(calculateMarginUnit(item, activePricingDraft)) ?? "—"}</td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">{formatCurrencyFromNumber(calculateMarginTotal(item, activePricingDraft)) ?? "—"}</td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">{formatCurrencyFromNumber(calculateOfferTotal(item, activePricingDraft)) ?? "—"}</td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    value={activePricingDraft.ofertaMarca}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, ofertaMarca: value }) : current)}
                                  />
                                ) : item.pricing?.ofertaMarca || item.companyItem?.marca || "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-20"
                                    value={activePricingDraft.ofertaModelo}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, ofertaModelo: value }) : current)}
                                  />
                                ) : item.pricing?.ofertaModelo || "—"}
                              </td>
                              <td className="px-2 py-1.5 text-[10px] font-medium text-foreground whitespace-nowrap">
                                {activePricingDraft ? (
                                  <InlineInput
                                    className="w-14"
                                    type="number"
                                    value={activePricingDraft.garantiaDescricao}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, garantiaDescricao: value }) : current)}
                                  />
                                ) : item.pricing?.garantiaDescricao || "—"}
                              </td>
                              <td className="px-2 py-1.5">
                                {activePricingDraft ? (
                                  <InlineStatusSelect
                                    value={activePricingDraft.status}
                                    onChange={value => setPricingDraft(current => current ? ({ ...current, status: value as OportunidadeItemStatus }) : current)}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                                      getStatusClassName(displayStatus),
                                    )}>
                                      {formatItemStatus(displayStatus)}
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>

                  {index < items.length - 1 ? (
                    <tr>
                      <td colSpan={11} className="h-3 bg-white p-0" />
                    </tr>
                  ) : null}
                </Fragment>
              )
            }) : !isAddingItem ? (
              <tr>
                <td colSpan={11} className="h-24 text-center text-sm text-muted-foreground">
                  Nenhum item corresponde aos filtros atuais.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ParentItemActionsMenu({
  item,
  disabled,
  onOpenAttach,
  onStartEdit,
  onDeleteItem,
}: {
  item: WorkspaceItem
  disabled: boolean
  onOpenAttach: (itemId: string) => void
  onStartEdit: (item: WorkspaceItem) => void
  onDeleteItem: (oportunidadeItemId: string) => Promise<void>
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            disabled={disabled}
            aria-label="Abrir ações do item"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onStartEdit(item)}>
            <Pencil className="size-3.5" />
            Editar item
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onOpenAttach(item.id)}>
            <Link2 className="size-3.5" />
            {item.companyItem ? "Trocar item" : "Adicionar item"}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-xs text-red-600 focus:text-red-600" onSelect={() => {
            if (item.oportunidadeItemId) {
              if (window.confirm("Deseja realmente excluir este item?")) {
                void onDeleteItem(item.oportunidadeItemId)
              }
            }
          }}>
            <X className="size-3.5" />
            Excluir item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function CompanyItemActionsMenu({
  item,
  disabled,
  onOpenAttach,
}: {
  item: WorkspaceItem
  disabled: boolean
  onOpenAttach: (itemId: string) => void
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            disabled={disabled}
            aria-label="Abrir ações do item interno"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onOpenAttach(item.id)}>
            <Link2 className="size-3.5" />
            Trocar item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function InlineEditActions({
  disabled,
  onCancel,
  onSave,
}: {
  disabled: boolean
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-md text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        onClick={onCancel}
        aria-label="Cancelar edição"
      >
        <X className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-md text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
        disabled={disabled}
        onClick={onSave}
        aria-label="Salvar edição"
      >
        <Check className="size-3.5" />
      </Button>
    </div>
  )
}

function InlineInput({
  value,
  onChange,
  className,
  type = "text",
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  type?: "text" | "number"
}) {
  return (
    <Input
      type={type}
      step={type === "number" ? "any" : undefined}
      value={value}
      onChange={event => onChange(event.target.value)}
      className={cn("h-7 min-w-0 max-w-full rounded-md border-border/60 bg-white px-2 text-[11px] shadow-none", className)}
    />
  )
}

function InlineTextarea({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      onChange={event => onChange(event.target.value)}
      className="min-h-16 w-full min-w-0 max-w-full resize-y rounded-md border border-border/60 bg-white px-2 py-1.5 text-[11px] leading-5 text-foreground outline-none transition-colors focus:border-ring"
    />
  )
}

function InlineSelect({
  value,
  onChange,
}: {
  value: ParentItemDraft["tipoItem"]
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-7 rounded-md border border-border/60 bg-white px-2 text-[11px] text-foreground outline-none transition-colors focus:border-ring"
    >
      <option value="">—</option>
      <option value="MATERIAL">Material</option>
      <option value="SERVICO">Serviço</option>
    </select>
  )
}

function InlineStatusSelect({
  value,
  onChange,
}: {
  value: OportunidadeItemStatus
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-7 rounded-md border border-border/60 bg-white px-2 text-[11px] text-foreground outline-none transition-colors focus:border-ring"
    >
      <option value="PENDING_PRICING">Pendente</option>
      <option value="READY_FOR_BID">Pronto</option>
      <option value="IN_BIDDING">Em disputa</option>
      <option value="WON">Ganho</option>
      <option value="LOST">Perdido</option>
      <option value="DISCARDED">Descartado</option>
    </select>
  )
}

function formatNumber(value: string | null) {
  if (!value) return "—"
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return value
  return parsed.toLocaleString("pt-BR", { maximumFractionDigits: 4 })
}

function formatTipoItem(value: WorkspaceItem["tipoItem"]) {
  if (!value) return "—"
  const labels: Record<string, string> = {
    MATERIAL: "Material",
    SERVICO: "Serviço",
  }

  return labels[value] ?? value
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date)
}

function formatCurrencyFromNumber(value: number | string | null) {
  if (value === null) return null
  return formatCurrency(String(value))
}

function formatItemStatus(value: WorkspaceItem["status"]) {
  const labels: Record<WorkspaceItem["status"], string> = {
    PENDING_PRICING: "Pendente",
    READY_FOR_BID: "Pronto",
    IN_BIDDING: "Em disputa",
    WON: "Ganho",
    LOST: "Perdido",
    DISCARDED: "Descartado",
  }

  return labels[value]
}

function getStatusClassName(status: WorkspaceItem["status"]) {
  const tones: Record<WorkspaceItem["status"], string> = {
    PENDING_PRICING: "bg-amber-100 text-amber-700",
    READY_FOR_BID: "bg-emerald-100 text-emerald-700",
    IN_BIDDING: "bg-blue-100 text-blue-700",
    WON: "bg-emerald-100 text-emerald-700",
    LOST: "bg-rose-100 text-rose-700",
    DISCARDED: "bg-slate-100 text-slate-600",
  }

  return tones[status]
}

function resolveDisplayStatus(item: WorkspaceItem): WorkspaceItem["status"] {
  if (item.status !== "PENDING_PRICING") return item.status
  if (item.companyItem && resolveOfferUnit(item) !== null) return "READY_FOR_BID"
  return item.status
}

function createParentItemDraft(item: WorkspaceItem): ParentItemDraft {
  return {
    numeroItem: item.numeroItem !== null && item.numeroItem !== undefined ? String(item.numeroItem) : "",
    descricao: item.descricao ?? "",
    tipoItem: item.tipoItem === "MATERIAL" || item.tipoItem === "SERVICO" ? item.tipoItem : "",
    lote: item.lote ?? "",
    quantidadeTotal: item.quantidadeTotal ?? "",
    unidadeMedida: item.unidadeMedida ?? "",
    valorUnitarioEstimado: item.valorUnitarioEstimado ?? "",
    valorTotalEstimado: item.valorTotalEstimado ?? "",
  }
}

function createPricingDraft(item: WorkspaceItem): PricingDraft {
  return {
    quantidadeAdesao: item.pricing?.quantidadeAdesao ?? "",
    precoOfertaUnitario: item.pricing?.precoOfertaUnitario ?? item.companyItem?.precoReferencia ?? "",
    custoUnitarioSnapshot: item.pricing?.custoUnitarioSnapshot ?? "",
    valorMinimoLance: item.pricing?.valorMinimoLance ?? "",
    ultimoLance: item.disputa?.ultimoLance ?? "",
    ofertaMarca: item.pricing?.ofertaMarca ?? item.companyItem?.marca ?? "",
    ofertaModelo: item.pricing?.ofertaModelo ?? "",
    garantiaDescricao: item.pricing?.garantiaDescricao ?? "",
    status: item.status,
  }
}

function updateParentDraftWithTotals(
  current: ParentItemDraft | null,
  key: "quantidadeTotal" | "valorUnitarioEstimado",
  value: string,
) {
  if (!current) return current

  const next = { ...current, [key]: value }
  const quantity = toNumber(next.quantidadeTotal)
  const unit = toNumber(next.valorUnitarioEstimado)

  if (quantity !== null && unit !== null) {
    next.valorTotalEstimado = String(Number((quantity * unit).toFixed(2)))
  }

  return next
}

function toNumber(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveQuantity(item: WorkspaceItem) {
  return toNumber(item.pricing?.quantidadeCotada ?? item.quantidadeTotal)
}

function resolveReferenceUnit(item: WorkspaceItem) {
  return toNumber(item.companyItem?.precoReferencia ?? null)
}

function resolveOfferUnit(item: WorkspaceItem, draft?: PricingDraft | null) {
  return toNumber(draft?.precoOfertaUnitario ?? item.pricing?.precoOfertaUnitario) ?? resolveReferenceUnit(item)
}

function resolveCostUnit(item: WorkspaceItem, draft?: PricingDraft | null) {
  return toNumber(draft?.custoUnitarioSnapshot ?? item.pricing?.custoUnitarioSnapshot)
}

function calculateOfferTotal(item: WorkspaceItem, draft?: PricingDraft | null) {
  if (!draft) {
    const storedTotal = toNumber(item.pricing?.precoOfertaTotal)
    if (storedTotal !== null) return storedTotal
  }

  return (() => {
    const quantity = resolveQuantity(item)
    const unit = resolveOfferUnit(item, draft)
    if (quantity === null || unit === null) return null
    return quantity * unit
  })()
}

function calculateCostTotal(item: WorkspaceItem, draft?: PricingDraft | null) {
  const quantity = resolveQuantity(item)
  const unit = resolveCostUnit(item, draft)
  if (quantity === null || unit === null) return null
  return quantity * unit
}

function calculateMarginUnit(item: WorkspaceItem, draft?: PricingDraft | null) {
  const offerUnit = resolveOfferUnit(item, draft)
  const costUnit = resolveCostUnit(item, draft)
  if (offerUnit === null || costUnit === null) return null
  return offerUnit - costUnit
}

function calculateMarginTotal(item: WorkspaceItem, draft?: PricingDraft | null) {
  const offerTotal = calculateOfferTotal(item, draft)
  const costTotal = calculateCostTotal(item, draft)
  if (offerTotal === null || costTotal === null) return null
  return offerTotal - costTotal
}
