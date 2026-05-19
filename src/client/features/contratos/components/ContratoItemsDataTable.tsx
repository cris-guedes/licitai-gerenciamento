"use client"

/* eslint-disable @next/next/no-img-element */
import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronUp, ImageIcon, Link2, MoreHorizontal, Pencil, Plus, ReceiptText, Search, Trash2, Unlink, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { Input } from "@/client/components/ui/input";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { cn, formatCurrency, formatDate } from "@/client/main/lib/utils";
import type { CompanyItem } from "@/client/main/infra/apis/api-core/models/CompanyItem";
import { CompanyItemFormDialog } from "@/client/features/company-items/components/CompanyItemsPage/CompanyItemFormDialog/CompanyItemFormDialog";
import type { CompanyItemFormValues } from "@/client/features/company-items/schemas/company-item.schema";
import type { ContratoItem, ContratoOpportunityItem } from "../types";
import { useContratoItemsService } from "../services/use-contrato-items.service";

type ItemFilter = "ALL" | "BALANCE" | "COMMITTED" | "DELIVERY" | "DONE";

type EditDraft = {
    quantidadeContratada: string;
    valorUnitario: string;
    valorTotal: string;
};

type NewItemDraft = EditDraft & {
    oportunidadeItemId: string;
};

type Props = {
    companyId: string;
    contratoId: string;
    oportunidadeId: string;
    items: ContratoItem[];
    availableItems?: ContratoOpportunityItem[];
    onCreateEmpenho: () => void;
};

export function ContratoItemsDataTable({
    companyId,
    contratoId,
    oportunidadeId,
    items,
    availableItems = [],
    onCreateEmpenho,
}: Props) {
    const api = useCoreApi();
    const contratoItemsService = useContratoItemsService(api);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<ItemFilter>("ALL");
    const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
    const [newItemDraft, setNewItemDraft] = useState<NewItemDraft | null>(null);
    const [attachingItemId, setAttachingItemId] = useState<string | null>(null);
    const [editingCompanyItem, setEditingCompanyItem] = useState<CompanyItem | null>(null);
    const [creatingCompanyItemFor, setCreatingCompanyItemFor] = useState<ContratoItem | null>(null);

    const companyItemsQuery = useQuery({
        queryKey: ["oportunidades", "company-catalog", companyId],
        queryFn: () => contratoItemsService.listCompanyItems(companyId),
        enabled: Boolean(companyId),
    });
    const companyItems = useMemo(() => {
        return [...(companyItemsQuery.data?.companyItems ?? [])]
            .sort((left, right) => {
                if (left.ativo !== right.ativo) return left.ativo ? -1 : 1;
                if (left.codigo !== right.codigo) return left.codigo.localeCompare(right.codigo);
                return left.descricao.localeCompare(right.descricao);
            }) as CompanyItem[];
    }, [companyItemsQuery.data?.companyItems]);

    const visibleItems = useMemo(() => {
        const normalizedSearch = normalizeText(search);

        return [...items]
            .sort(sortContratoItems)
            .filter(item => {
                if (!matchesFilter(item, filter)) return false;
                if (!normalizedSearch) return true;

                const haystack = normalizeText([
                    item.itemNumero,
                    item.lote,
                    item.descricao,
                    item.companyItem?.codigo,
                    item.companyItem?.descricao,
                    item.marca,
                    item.modelo,
                ].filter(Boolean).join(" "));

                return haystack.includes(normalizedSearch);
            });
    }, [filter, items, search]);

    const createMutation = useMutation({
        mutationFn: async (payload: {
            oportunidadeItemId: string;
            quantidadeContratada: number | null;
            valorUnitario: number | null;
            valorTotal: number | null;
        }) => {
            return contratoItemsService.createContratoItem({
                companyId,
                contratoId,
                ...payload,
            });
        },
        onSuccess: async () => {
            toast.success("Item adicionado ao contrato.");
            setNewItemDraft(null);
            await queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
        },
        onError: () => toast.error("Não foi possível adicionar o item ao contrato."),
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: {
            contratoItemId: string;
            quantidadeContratada: number | null;
            valorUnitario: number | null;
            valorTotal: number | null;
        }) => {
            return contratoItemsService.updateContratoItem({
                companyId,
                contratoId,
                ...payload,
            });
        },
        onSuccess: async () => {
            toast.success("Item atualizado.");
            setEditingItemId(null);
            setEditDraft(null);
            await queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
        },
        onError: () => toast.error("Não foi possível atualizar o item."),
    });

    const deleteMutation = useMutation({
        mutationFn: async (contratoItemId: string) => {
            return contratoItemsService.deleteContratoItem({
                companyId,
                contratoId,
                contratoItemId,
            });
        },
        onSuccess: async () => {
            toast.success("Item removido do contrato.");
            await queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
        },
        onError: () => toast.error("Não foi possível remover o item. Verifique se ele já possui empenhos."),
    });

    const linkCompanyItemMutation = useMutation({
        mutationFn: async (payload: { item: ContratoItem; companyItemId: string | null }) => {
            return contratoItemsService.updateOportunidadeItem({
                companyId,
                oportunidadeId,
                oportunidadeItemId: payload.item.oportunidadeItemId,
                data: {
                    companyItemId: payload.companyItemId,
                },
            });
        },
        onSuccess: async (_, variables) => {
            toast.success(variables.companyItemId ? "Item interno vinculado." : "Item interno desvinculado.");
            setAttachingItemId(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] }),
                queryClient.invalidateQueries({ queryKey: ["oportunidades", "company-catalog", companyId] }),
            ]);
        },
        onError: () => toast.error("Não foi possível atualizar o vínculo do item interno."),
    });

    const updateCompanyItemMutation = useMutation({
        mutationFn: async (payload: { companyItemId: string; values: CompanyItemFormValues }) => {
            return contratoItemsService.updateCompanyItem({
                companyId,
                companyItemId: payload.companyItemId,
                data: toCompanyItemMutationData(payload.values),
            });
        },
        onSuccess: async () => {
            toast.success("Item interno atualizado.");
            setEditingCompanyItem(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] }),
                queryClient.invalidateQueries({ queryKey: ["oportunidades", "company-catalog", companyId] }),
            ]);
        },
        onError: () => toast.error("Não foi possível atualizar o item interno."),
    });

    const createAndLinkCompanyItemMutation = useMutation({
        mutationFn: async (payload: { item: ContratoItem; values: CompanyItemFormValues }) => {
            const created = await contratoItemsService.createCompanyItem({
                companyId,
                ...toCompanyItemMutationData(payload.values),
                codigo: payload.values.codigo.trim(),
                descricao: payload.values.descricao.trim(),
                unidadeMedida: payload.values.unidadeMedida.trim(),
            });

            await contratoItemsService.updateOportunidadeItem({
                companyId,
                oportunidadeId,
                oportunidadeItemId: payload.item.oportunidadeItemId,
                data: {
                    companyItemId: created.id,
                },
            });

            return created;
        },
        onSuccess: async () => {
            toast.success("Item interno criado e vinculado.");
            setCreatingCompanyItemFor(null);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] }),
                queryClient.invalidateQueries({ queryKey: ["oportunidades", "company-catalog", companyId] }),
            ]);
        },
        onError: () => toast.error("Não foi possível criar o item interno."),
    });

    const isMutating = createMutation.isPending
        || updateMutation.isPending
        || deleteMutation.isPending
        || linkCompanyItemMutation.isPending
        || updateCompanyItemMutation.isPending
        || createAndLinkCompanyItemMutation.isPending;

    function startEdit(item: ContratoItem) {
        setEditingItemId(item.id);
        setEditDraft(createEditDraft(item));
    }

    function cancelEdit() {
        setEditingItemId(null);
        setEditDraft(null);
    }

    async function saveEdit(item: ContratoItem) {
        if (!editDraft) return;

        const payload = parseDraft(editDraft);
        if (!payload) return;

        await updateMutation.mutateAsync({
            contratoItemId: item.id,
            ...payload,
        });
    }

    function startAdd() {
        const first = availableItems[0];
        setNewItemDraft(first ? createNewItemDraft(first) : {
            oportunidadeItemId: "",
            quantidadeContratada: "",
            valorUnitario: "",
            valorTotal: "",
        });
    }

    function selectNewOpportunityItem(oportunidadeItemId: string) {
        const item = availableItems.find(candidate => candidate.id === oportunidadeItemId);
        if (item) {
            setNewItemDraft(createNewItemDraft(item));
            return;
        }

        setNewItemDraft(current => current ? ({ ...current, oportunidadeItemId }) : current);
    }

    async function saveNewItem() {
        if (!newItemDraft?.oportunidadeItemId) {
            toast.error("Selecione um item da oportunidade.");
            return;
        }

        const payload = parseDraft(newItemDraft);
        if (!payload) return;

        await createMutation.mutateAsync({
            oportunidadeItemId: newItemDraft.oportunidadeItemId,
            ...payload,
        });
    }

    async function deleteItem(item: ContratoItem) {
        if (!window.confirm("Deseja remover este item do contrato? Itens já empenhados não podem ser removidos.")) return;
        await deleteMutation.mutateAsync(item.id);
    }

    async function linkCompanyItem(item: ContratoItem, companyItemId: string | null) {
        await linkCompanyItemMutation.mutateAsync({ item, companyItemId });
    }

    function handleCompanyItemSubmit(values: CompanyItemFormValues) {
        if (editingCompanyItem) {
            updateCompanyItemMutation.mutate({
                companyItemId: editingCompanyItem.id,
                values,
            });
            return;
        }

        if (creatingCompanyItemFor) {
            createAndLinkCompanyItemMutation.mutate({
                item: creatingCompanyItemFor,
                values,
            });
        }
    }

    return (
        <>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Buscar por item, lote, descrição ou código interno"
                        className="h-10 rounded-lg border-slate-200 pl-9 shadow-none"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg"
                    disabled={isMutating || Boolean(newItemDraft) || availableItems.length === 0}
                    onClick={startAdd}
                >
                    <Plus className="mr-2 size-4" />
                    Adicionar item
                </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 border-b border-slate-100">
                {FILTERS.map(option => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilter(option.value)}
                        className={cn(
                            "border-b-2 px-0 pb-2 text-sm font-medium transition-colors",
                            filter === option.value
                                ? "border-slate-950 text-slate-950"
                                : "border-transparent text-slate-500 hover:text-slate-800",
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="mt-5 max-w-full overflow-x-auto">
                <table className="min-w-[1180px] w-full table-auto text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                            <th className="w-8 px-3 py-2.5" />
                            <th className="w-14 px-3 py-2.5 text-left font-semibold">Sit.</th>
                            <th className="px-3 py-2.5 text-left font-semibold">Lote</th>
                            <th className="px-3 py-2.5 text-left font-semibold">#</th>
                            <th className="px-3 py-2.5 text-left font-semibold">Descrição</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Tipo</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Qtd</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Un.</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Vl. Unit.</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                            <th className="px-3 py-2.5 text-right font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {newItemDraft ? (
                            <NewItemRow
                                draft={newItemDraft}
                                availableItems={availableItems}
                                disabled={isMutating}
                                onSelectItem={selectNewOpportunityItem}
                                onChange={setNewItemDraft}
                                onCancel={() => setNewItemDraft(null)}
                                onSave={() => void saveNewItem()}
                            />
                        ) : null}

                        {visibleItems.map((item, index) => {
                            const isExpanded = Boolean(expandedItemIds[item.id]);
                            const isEditing = editingItemId === item.id;
                            const activeDraft = isEditing ? editDraft : null;
                            const status = resolveItemStatus(item);

                            return (
                                <Fragment key={item.id}>
                                    <tr className="border-x border-t border-slate-100 bg-white hover:bg-slate-50/50">
                                        <td className="w-8 px-3 py-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedItemIds(current => ({ ...current, [item.id]: !current[item.id] }))}
                                                className="flex items-center justify-center text-slate-500 hover:text-slate-900"
                                                title={isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                                            >
                                                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                                <span className={cn("size-2 rounded-full", status.dotClassName)} />
                                                {status.shortLabel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{item.lote || "—"}</td>
                                        <td className="px-3 py-2.5 font-medium text-slate-600 whitespace-nowrap">{item.itemNumero ?? index + 1}</td>
                                        <td className="min-w-[360px] px-3 py-2.5">
                                            <p className="line-clamp-2 font-semibold leading-5 text-slate-950">{item.descricao}</p>
                                            {item.companyItem ? (
                                                <p className="mt-1 text-[10px] text-slate-500">
                                                    Interno: {item.companyItem.codigo} · {item.companyItem.descricao}
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2.5 text-right italic text-slate-500 whitespace-nowrap">{formatTipoItem(item.tipoItem)}</td>
                                        <td className="px-3 py-2.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                                            {activeDraft ? (
                                                <InlineInput
                                                    className="ml-auto w-20 text-right"
                                                    value={activeDraft.quantidadeContratada}
                                                    onChange={value => setEditDraft(current => updateDraftWithTotals(current, "quantidadeContratada", value))}
                                                />
                                            ) : formatQuantity(item.quantidadeContratada)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-slate-500 whitespace-nowrap">{item.unidadeMedida || "—"}</td>
                                        <td className="px-3 py-2.5 text-right text-slate-600 whitespace-nowrap">
                                            {activeDraft ? (
                                                <InlineInput
                                                    className="ml-auto w-24 text-right"
                                                    value={activeDraft.valorUnitario}
                                                    onChange={value => setEditDraft(current => updateDraftWithTotals(current, "valorUnitario", value))}
                                                />
                                            ) : formatOptionalCurrency(item.valorUnitario)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold text-slate-950 whitespace-nowrap">
                                            {activeDraft ? (
                                                <InlineInput
                                                    className="ml-auto w-24 text-right"
                                                    value={activeDraft.valorTotal}
                                                    onChange={value => setEditDraft(current => current ? ({ ...current, valorTotal: value }) : current)}
                                                />
                                            ) : formatOptionalCurrency(item.valorTotal)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {activeDraft ? (
                                                <InlineEditActions
                                                    disabled={isMutating}
                                                    onCancel={cancelEdit}
                                                    onSave={() => void saveEdit(item)}
                                                />
                                            ) : (
                                                <ItemActionsMenu
                                                    disabled={isMutating}
                                                    item={item}
                                                    onStartEdit={startEdit}
                                                    onCreateEmpenho={onCreateEmpenho}
                                                    onDeleteItem={(target) => void deleteItem(target)}
                                                />
                                            )}
                                        </td>
                                    </tr>

                                    {isExpanded ? (
                                        <tr>
                                            <td colSpan={11} className="border-x border-b border-slate-100 bg-white px-5 pb-3">
                                                <ItemDetails
                                                    item={item}
                                                    status={status}
                                                    companyItems={companyItems}
                                                    isAttaching={attachingItemId === item.id}
                                                    isMutating={isMutating}
                                                    onStartAttach={() => setAttachingItemId(item.id)}
                                                    onCancelAttach={() => setAttachingItemId(null)}
                                                    onLinkCompanyItem={(companyItemId) => void linkCompanyItem(item, companyItemId)}
                                                    onCreateCompanyItem={() => setCreatingCompanyItemFor(item)}
                                                    onEditCompanyItem={(companyItem) => setEditingCompanyItem(companyItem)}
                                                    onDetachCompanyItem={() => void linkCompanyItem(item, null)}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={11} className="h-3 p-0" />
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}

                        {visibleItems.length === 0 && !newItemDraft ? (
                            <tr>
                                <td colSpan={11} className="h-28 text-center text-sm text-slate-500">
                                    Nenhum item corresponde aos filtros atuais.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </section>
        <CompanyItemFormDialog
            open={Boolean(editingCompanyItem)}
            mode="edit"
            item={editingCompanyItem}
            isPending={updateCompanyItemMutation.isPending}
            onClose={() => setEditingCompanyItem(null)}
            onSubmit={handleCompanyItemSubmit}
        />
        <CompanyItemFormDialog
            open={Boolean(creatingCompanyItemFor)}
            mode="create"
            item={null}
            isPending={createAndLinkCompanyItemMutation.isPending}
            onClose={() => setCreatingCompanyItemFor(null)}
            onSubmit={handleCompanyItemSubmit}
        />
        </>
    );
}

function NewItemRow({
    draft,
    availableItems,
    disabled,
    onSelectItem,
    onChange,
    onCancel,
    onSave,
}: {
    draft: NewItemDraft;
    availableItems: ContratoOpportunityItem[];
    disabled: boolean;
    onSelectItem: (oportunidadeItemId: string) => void;
    onChange: (draft: NewItemDraft | null | ((current: NewItemDraft | null) => NewItemDraft | null)) => void;
    onCancel: () => void;
    onSave: () => void;
}) {
    const selected = availableItems.find(item => item.id === draft.oportunidadeItemId) ?? null;

    return (
        <tr className="border-x border-t border-sky-100 bg-sky-50/60">
            <td className="px-3 py-2.5" />
            <td className="px-3 py-2.5">
                <Badge variant="outline" className="rounded-full border-sky-100 bg-white text-[10px] text-sky-700">Novo</Badge>
            </td>
            <td className="px-3 py-2.5 text-slate-500">{selected?.lote || "—"}</td>
            <td className="px-3 py-2.5 font-medium text-slate-600">{selected?.itemNumero ?? "—"}</td>
            <td className="min-w-[360px] px-3 py-2.5">
                <select
                    value={draft.oportunidadeItemId}
                    onChange={event => onSelectItem(event.target.value)}
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-900 outline-none"
                >
                    <option value="">Selecione um item da oportunidade</option>
                    {availableItems.map(item => (
                        <option key={item.id} value={item.id}>
                            #{item.itemNumero ?? "-"} {item.descricao}
                        </option>
                    ))}
                </select>
            </td>
            <td className="px-3 py-2.5 text-right italic text-slate-500">{formatTipoItem(selected?.tipoItem)}</td>
            <td className="px-3 py-2.5 text-right">
                <InlineInput
                    className="ml-auto w-20 text-right"
                    value={draft.quantidadeContratada}
                    onChange={value => onChange(current => updateDraftWithTotals(current, "quantidadeContratada", value))}
                />
            </td>
            <td className="px-3 py-2.5 text-right text-slate-500">{selected?.unidadeMedida || "—"}</td>
            <td className="px-3 py-2.5 text-right">
                <InlineInput
                    className="ml-auto w-24 text-right"
                    value={draft.valorUnitario}
                    onChange={value => onChange(current => updateDraftWithTotals(current, "valorUnitario", value))}
                />
            </td>
            <td className="px-3 py-2.5 text-right">
                <InlineInput
                    className="ml-auto w-24 text-right"
                    value={draft.valorTotal}
                    onChange={value => onChange(current => current ? ({ ...current, valorTotal: value }) : current)}
                />
            </td>
            <td className="px-3 py-2.5">
                <InlineEditActions disabled={disabled} onCancel={onCancel} onSave={onSave} />
            </td>
        </tr>
    );
}

function ItemDetails({
    item,
    status,
    companyItems,
    isAttaching,
    isMutating,
    onStartAttach,
    onCancelAttach,
    onLinkCompanyItem,
    onCreateCompanyItem,
    onEditCompanyItem,
    onDetachCompanyItem,
}: {
    item: ContratoItem;
    status: ReturnType<typeof resolveItemStatus>;
    companyItems: CompanyItem[];
    isAttaching: boolean;
    isMutating: boolean;
    onStartAttach: () => void;
    onCancelAttach: () => void;
    onLinkCompanyItem: (companyItemId: string) => void;
    onCreateCompanyItem: () => void;
    onEditCompanyItem: (companyItem: CompanyItem) => void;
    onDetachCompanyItem: () => void;
}) {
    const quantity = toNumber(item.quantidadeContratada);
    const committed = toNumber(item.quantidadeEmpenhada);
    const paid = toNumber(item.quantidadePaga);
    const balance = Math.max(0, quantity - committed);
    const committedPct = toPercent(committed, quantity);

    return (
        <div className="space-y-3 rounded-md bg-slate-50 p-3">
            <InternalItemPreview
                item={item}
                companyItems={companyItems}
                isAttaching={isAttaching}
                isMutating={isMutating}
                onStartAttach={onStartAttach}
                onCancelAttach={onCancelAttach}
                onLinkCompanyItem={onLinkCompanyItem}
                onCreateCompanyItem={onCreateCompanyItem}
                onEditCompanyItem={onEditCompanyItem}
                onDetachCompanyItem={onDetachCompanyItem}
            />
            <div className="grid min-w-[980px] grid-cols-[repeat(10,minmax(86px,1fr))] border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-500">
                <span>Contratado</span>
                <span>Empenhado</span>
                <span>Entregue</span>
                <span>Pago</span>
                <span>Saldo</span>
                <span>Referência</span>
                <span>Total</span>
                <span>Marca</span>
                <span>Modelo</span>
                <span>Sit.</span>
            </div>
            <div className="grid min-w-[980px] grid-cols-[repeat(10,minmax(86px,1fr))] px-3 py-2 text-[11px] font-medium text-slate-900">
                <span>{formatQuantity(item.quantidadeContratada)}</span>
                <span>{formatQuantity(item.quantidadeEmpenhada)} · {committedPct}%</span>
                <span>{formatQuantity(item.quantidadeEntregue)}</span>
                <span>{formatQuantity(item.quantidadePaga)}</span>
                <span>{formatQuantity(balance)}</span>
                <span>{formatOptionalCurrency(item.valorReferencia)}</span>
                <span>{formatOptionalCurrency(item.valorTotal)}</span>
                <span>{item.marca || item.companyItem?.marca || "—"}</span>
                <span>{item.modelo || "—"}</span>
                <span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", status.className)}>
                        {status.label}
                    </span>
                </span>
            </div>
            {paid > 0 ? (
                <div className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
                    Quantidade paga registrada: {formatQuantity(paid)}
                </div>
            ) : null}
        </div>
    );
}

function InternalItemPreview({
    item,
    companyItems,
    isAttaching,
    isMutating,
    onStartAttach,
    onCancelAttach,
    onLinkCompanyItem,
    onCreateCompanyItem,
    onEditCompanyItem,
    onDetachCompanyItem,
}: {
    item: ContratoItem;
    companyItems: CompanyItem[];
    isAttaching: boolean;
    isMutating: boolean;
    onStartAttach: () => void;
    onCancelAttach: () => void;
    onLinkCompanyItem: (companyItemId: string) => void;
    onCreateCompanyItem: () => void;
    onEditCompanyItem: (companyItem: CompanyItem) => void;
    onDetachCompanyItem: () => void;
}) {
    const companyItem = item.companyItem ?? null;

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {companyItem?.imageUrl ? (
                            <img
                                src={companyItem.imageUrl}
                                alt={companyItem.descricao}
                                className="size-full object-cover"
                            />
                        ) : (
                            <ImageIcon className="size-5 text-slate-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Item interno
                            </p>
                            {companyItem ? (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "rounded-full text-[10px]",
                                        companyItem.ativo
                                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 bg-slate-50 text-slate-500",
                                    )}
                                >
                                    {companyItem.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="rounded-full border-amber-100 bg-amber-50 text-[10px] text-amber-700">
                                    Não vinculado
                                </Badge>
                            )}
                        </div>

                        {companyItem ? (
                            <>
                                <p className="mt-1 truncate text-sm font-bold text-slate-950">
                                    {companyItem.codigo} · {companyItem.descricao}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                    <span>Marca: {companyItem.marca || "—"}</span>
                                    <span>Un.: {companyItem.unidadeMedida || "—"}</span>
                                    <span>Preço ref.: {formatOptionalCurrency(companyItem.precoReferencia)}</span>
                                    <span>Atualizado: {formatDate(companyItem.updatedAt)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mt-1 text-sm font-bold text-slate-950">
                                    Nenhum item interno vinculado
                                </p>
                                <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
                                    Vincule este item do contrato ao catálogo interno para ver referência, marca, imagem e custo operacional em todos os fluxos.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {companyItem ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs"
                                disabled={isMutating}
                                onClick={() => onEditCompanyItem(companyItem)}
                            >
                                <Pencil className="mr-1.5 size-3.5" />
                                Editar interno
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs"
                                disabled={isMutating}
                                onClick={onStartAttach}
                            >
                                <Link2 className="mr-1.5 size-3.5" />
                                Trocar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-lg text-xs text-slate-500"
                                disabled={isMutating}
                                onClick={onDetachCompanyItem}
                            >
                                <Unlink className="mr-1.5 size-3.5" />
                                Desvincular
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 rounded-lg text-xs"
                                disabled={isMutating || companyItems.length === 0}
                                onClick={onStartAttach}
                            >
                                <Link2 className="mr-1.5 size-3.5" />
                                Vincular existente
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="h-8 rounded-lg bg-slate-900 text-xs"
                                disabled={isMutating}
                                onClick={onCreateCompanyItem}
                            >
                                <Plus className="mr-1.5 size-3.5" />
                                Criar interno
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isAttaching ? (
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <select
                        defaultValue={companyItem?.id ?? ""}
                        className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none"
                        disabled={isMutating}
                        onChange={event => {
                            if (event.target.value) onLinkCompanyItem(event.target.value);
                        }}
                    >
                        <option value="">Selecione um item do catálogo</option>
                        {companyItems.map(candidate => (
                            <option key={candidate.id} value={candidate.id}>
                                {candidate.codigo} · {candidate.descricao}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 rounded-lg text-xs"
                        onClick={onCancelAttach}
                    >
                        Cancelar
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

function ItemActionsMenu({
    item,
    disabled,
    onStartEdit,
    onCreateEmpenho,
    onDeleteItem,
}: {
    item: ContratoItem;
    disabled: boolean;
    onStartEdit: (item: ContratoItem) => void;
    onCreateEmpenho: () => void;
    onDeleteItem: (item: ContratoItem) => void;
}) {
    const canDelete = toNumber(item.quantidadeEmpenhada) <= 0;

    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-7 rounded-md" disabled={disabled}>
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 text-xs" onSelect={() => onStartEdit(item)}>
                        <Pencil className="size-3.5" />
                        Editar item
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-xs" onSelect={onCreateEmpenho}>
                        <ReceiptText className="size-3.5" />
                        Criar empenho
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={!canDelete}
                        className="gap-2 text-xs text-red-600 focus:text-red-600"
                        onSelect={() => onDeleteItem(item)}
                    >
                        <Trash2 className="size-3.5" />
                        Remover item
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function InlineEditActions({
    disabled,
    onCancel,
    onSave,
}: {
    disabled: boolean;
    onCancel: () => void;
    onSave: () => void;
}) {
    return (
        <div className="flex items-center justify-end gap-1">
            <Button type="button" variant="ghost" size="icon" className="size-7 rounded-md" onClick={onCancel}>
                <X className="size-3.5" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-md text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                disabled={disabled}
                onClick={onSave}
            >
                <Check className="size-3.5" />
            </Button>
        </div>
    );
}

function InlineInput({
    value,
    onChange,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}) {
    return (
        <Input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={event => onChange(event.target.value)}
            className={cn("h-7 min-w-0 rounded-md border-slate-200 bg-white px-2 text-[11px] shadow-none", className)}
        />
    );
}

const FILTERS: Array<{ value: ItemFilter; label: string }> = [
    { value: "ALL", label: "Todos" },
    { value: "BALANCE", label: "Com saldo" },
    { value: "COMMITTED", label: "Empenhados" },
    { value: "DELIVERY", label: "Em entrega" },
    { value: "DONE", label: "Concluídos" },
];

function matchesFilter(item: ContratoItem, filter: ItemFilter) {
    const quantity = toNumber(item.quantidadeContratada);
    const committed = toNumber(item.quantidadeEmpenhada);
    const delivered = toNumber(item.quantidadeEntregue);
    const paid = toNumber(item.quantidadePaga);

    if (filter === "ALL") return true;
    if (filter === "BALANCE") return Math.max(0, quantity - committed) > 0;
    if (filter === "COMMITTED") return committed > 0;
    if (filter === "DELIVERY") return committed > 0 && delivered < committed;
    return quantity > 0 && (delivered >= quantity || paid >= quantity);
}

function resolveItemStatus(item: ContratoItem) {
    const quantity = toNumber(item.quantidadeContratada);
    const committed = toNumber(item.quantidadeEmpenhada);
    const delivered = toNumber(item.quantidadeEntregue);
    const paid = toNumber(item.quantidadePaga);

    if (quantity > 0 && (paid >= quantity || delivered >= quantity)) {
        return {
            label: "Concluído",
            shortLabel: "Pronto",
            className: "bg-emerald-100 text-emerald-700",
            dotClassName: "bg-emerald-500",
        };
    }

    if (committed > 0 && delivered < committed) {
        return {
            label: "Em entrega",
            shortLabel: "Entrega",
            className: "bg-blue-100 text-blue-700",
            dotClassName: "bg-blue-500",
        };
    }

    if (committed > 0) {
        return {
            label: "Empenhado",
            shortLabel: "Emp.",
            className: "bg-sky-100 text-sky-700",
            dotClassName: "bg-sky-500",
        };
    }

    return {
        label: "Pendente",
        shortLabel: "Pend.",
        className: "bg-amber-100 text-amber-700",
        dotClassName: "bg-amber-500",
    };
}

function createEditDraft(item: ContratoItem): EditDraft {
    return {
        quantidadeContratada: item.quantidadeContratada ?? "",
        valorUnitario: item.valorUnitario ?? "",
        valorTotal: item.valorTotal ?? "",
    };
}

function createNewItemDraft(item: ContratoOpportunityItem): NewItemDraft {
    const quantidadeContratada = item.pricing?.quantidadeCotada ?? item.quantidadeTotal ?? "";
    const valorUnitario = item.pricing?.precoOfertaUnitario ?? item.valorUnitarioEstimado ?? "";
    const valorTotal = item.pricing?.precoOfertaTotal
        ?? calculateTotalString(quantidadeContratada, valorUnitario)
        ?? item.valorTotalEstimado
        ?? "";

    return {
        oportunidadeItemId: item.id,
        quantidadeContratada,
        valorUnitario,
        valorTotal,
    };
}

function updateDraftWithTotals<T extends EditDraft | null>(
    current: T,
    key: "quantidadeContratada" | "valorUnitario",
    value: string,
): T {
    if (!current) return current;

    const next = { ...current, [key]: value };
    const total = calculateTotalString(next.quantidadeContratada, next.valorUnitario);

    return {
        ...next,
        valorTotal: total ?? next.valorTotal,
    } as T;
}

function parseDraft(draft: EditDraft) {
    const quantidadeContratada = parseNumber(draft.quantidadeContratada);
    const valorUnitario = parseNumber(draft.valorUnitario);
    const valorTotal = parseNumber(draft.valorTotal);

    if (quantidadeContratada === undefined || valorUnitario === undefined || valorTotal === undefined) {
        toast.error("Confira os valores numéricos do item.");
        return null;
    }

    return {
        quantidadeContratada,
        valorUnitario,
        valorTotal,
    };
}

function parseNumber(value: string): number | null | undefined {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const normalized = trimmed.includes(",")
        ? trimmed.replace(/\./g, "").replace(",", ".")
        : trimmed;
    const parsed = Number(normalized);

    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return parsed;
}

function calculateTotalString(quantityValue: string, unitValue: string) {
    const quantity = parseNumber(quantityValue);
    const unit = parseNumber(unitValue);

    if (quantity === null || quantity === undefined || unit === null || unit === undefined) return null;
    return String(Number((quantity * unit).toFixed(2)));
}

function sortContratoItems(left: ContratoItem, right: ContratoItem) {
    const loteA = left.lote ?? "";
    const loteB = right.lote ?? "";
    if (loteA !== loteB) return loteA.localeCompare(loteB);

    const numberA = left.itemNumero ?? Number.MAX_SAFE_INTEGER;
    const numberB = right.itemNumero ?? Number.MAX_SAFE_INTEGER;
    if (numberA !== numberB) return numberA - numberB;

    return left.descricao.localeCompare(right.descricao);
}

function toNumber(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value: number, total: number) {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

function formatQuantity(value: string | number | null | undefined) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(toNumber(value));
}

function formatOptionalCurrency(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return "—";
    return formatCurrency(value);
}

function formatTipoItem(value: string | null | undefined) {
    if (!value) return "—";
    const labels: Record<string, string> = {
        MATERIAL: "Material",
        SERVICO: "Serviço",
    };

    return labels[value] ?? value;
}

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();
}

function toCompanyItemMutationData(values: CompanyItemFormValues) {
    return {
        codigo: values.codigo.trim(),
        descricao: values.descricao.trim(),
        marca: normalizeOptionalText(values.marca),
        unidadeMedida: values.unidadeMedida.trim(),
        imageUrl: normalizeOptionalText(values.imageUrl),
        precoReferencia: parseCompanyItemPrice(values.precoReferencia),
        ativo: values.ativo,
    };
}

function normalizeOptionalText(value: string | null | undefined) {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function parseCompanyItemPrice(value: string | null | undefined) {
    if (value === null || value === undefined || value.trim() === "") return null;
    const normalized = value.includes(",")
        ? value.replace(/\./g, "").replace(",", ".")
        : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}
