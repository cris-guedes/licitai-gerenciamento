import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { toast } from "sonner";
import { Button } from "@/client/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/client/components/ui/dialog";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import { Loader2, Minus, Plus } from "lucide-react";
import type { ContratoEmpenhoItem, EmpenhoLocalEntrega } from "../types";
import { useContratoEntregasService } from "../services/use-contrato-entregas.service";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    contratoId: string;
    empenhoId: string;
    empenhoItems: ContratoEmpenhoItem[];
    locaisEntrega: EmpenhoLocalEntrega[];
    defaultLocalName?: string | null;
};

type LocalDraft = {
    orgaoNome: string;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
    contatoNome: string;
};

const NEW_LOCAL_VALUE = "__new";

export function CreateEntregaDialog({
    open,
    onOpenChange,
    companyId,
    contratoId,
    empenhoId,
    empenhoItems,
    locaisEntrega,
    defaultLocalName,
}: Props) {
    const queryClient = useQueryClient();
    const api = useCoreApi();
    const contratoEntregasService = useContratoEntregasService(api);
    const activeItems = useMemo(() => empenhoItems.filter(item => getEntregaSaldo(item) > 0), [empenhoItems]);
    const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});
    const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});
    const [localChoice, setLocalChoice] = useState<string | null>(null);
    const [localDraft, setLocalDraft] = useState<LocalDraft>(() => createLocalDraft(defaultLocalName));
    const [dataPrevista, setDataPrevista] = useState(getTodayInputValue());
    const [observacoes, setObservacoes] = useState("");

    const selectedLocalId = localChoice ?? locaisEntrega[0]?.id ?? NEW_LOCAL_VALUE;
    const isCreatingLocal = selectedLocalId === NEW_LOCAL_VALUE;

    const selectedItems = useMemo(() => {
        return activeItems
            .filter(item => isItemSelected(item, selectedItemIds))
            .map(item => ({
                empenhoItemId: item.id,
                quantidade: Number(itemQuantities[item.id] ?? getEntregaSaldo(item)),
            }))
            .filter(item => item.quantidade > 0);
    }, [activeItems, itemQuantities, selectedItemIds]);
    const selectedTotalQuantity = selectedItems.reduce((total, item) => total + item.quantidade, 0);

    const mutation = useMutation({
        mutationFn: async () => {
            let localEntregaId = selectedLocalId !== NEW_LOCAL_VALUE ? selectedLocalId : undefined;

            if (selectedItems.length === 0) {
                throw new Error("Selecione ao menos um item para a entrega.");
            }

            for (const item of activeItems) {
                if (!isItemSelected(item, selectedItemIds)) continue;

                const quantidade = Number(itemQuantities[item.id] ?? getEntregaSaldo(item));
                const saldo = getEntregaSaldo(item);

                if (quantidade <= 0) {
                    throw new Error(`Informe uma quantidade para o item ${item.contratoItem?.itemNumero ?? ""}.`);
                }

                if (quantidade > saldo) {
                    throw new Error(`Quantidade excede o saldo do item ${item.contratoItem?.itemNumero ?? ""}.`);
                }
            }

            if (isCreatingLocal) {
                const normalizedLocal = normalizeLocalDraft(localDraft);
                if (!normalizedLocal.logradouro || !normalizedLocal.cidade || !normalizedLocal.estado) {
                    throw new Error("Informe logradouro, cidade e estado para cadastrar o local de entrega.");
                }

                const createdLocal = await contratoEntregasService.createLocalEntrega({
                    companyId,
                    contratoId,
                    empenhoId,
                    ...normalizedLocal,
                });
                localEntregaId = createdLocal.id;
            }

            return contratoEntregasService.createEntrega({
                companyId,
                contratoId,
                empenhoId,
                localEntregaId,
                dataPrevista,
                observacoes,
                itens: selectedItems,
            });
        },
        onSuccess: () => {
            toast.success("Entrega registrada no pipeline!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
            resetDraft();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Erro ao registrar entrega");
        },
    });

    function resetDraft() {
        setSelectedItemIds({});
        setItemQuantities({});
        setLocalChoice(null);
        setLocalDraft(createLocalDraft(defaultLocalName));
        setDataPrevista(getTodayInputValue());
        setObservacoes("");
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) resetDraft();
        onOpenChange(nextOpen);
    }

    function toggleItem(item: ContratoEmpenhoItem, checked: boolean) {
        setSelectedItemIds(current => ({
            ...current,
            [item.id]: checked,
        }));

        setItemQuantities(current => {
            if (!checked) {
                const next = { ...current };
                delete next[item.id];
                return next;
            }

            return {
                ...current,
                [item.id]: current[item.id] ?? String(getEntregaSaldo(item)),
            };
        });
    }

    function stepQuantity(item: ContratoEmpenhoItem, delta: number) {
        setSelectedItemIds(current => ({
            ...current,
            [item.id]: true,
        }));
        setItemQuantities(current => {
            const saldo = getEntregaSaldo(item);
            const currentValue = Number(current[item.id] ?? saldo);
            const nextValue = Math.max(0, Math.min(saldo, currentValue + delta));

            return {
                ...current,
                [item.id]: String(nextValue),
            };
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
                <DialogHeader>
                    <DialogTitle>Nova Entrega no Pipeline</DialogTitle>
                    <DialogDescription>
                        Os itens com saldo já vêm selecionados com a quantidade total disponível.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(event) => {
                    event.preventDefault();
                    mutation.mutate();
                }} className="space-y-5">
                    <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                        <div className="space-y-2">
                            <Label htmlFor="localEntrega">Local de entrega</Label>
                            <select
                                id="localEntrega"
                                value={selectedLocalId}
                                onChange={event => setLocalChoice(event.target.value)}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400"
                            >
                                {locaisEntrega.map(local => (
                                    <option key={local.id} value={local.id}>
                                        {formatLocalLabel(local)}
                                    </option>
                                ))}
                                <option value={NEW_LOCAL_VALUE}>+ Cadastrar novo local</option>
                            </select>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Qtd. selecionada</p>
                            <p className="mt-1 text-xl font-bold text-slate-950">{formatQuantity(selectedTotalQuantity)}</p>
                            <p className="mt-1 text-xs text-slate-500">{selectedItems.length} item(ns)</p>
                        </div>
                    </section>

                    {isCreatingLocal ? (
                        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-slate-900">Novo local de entrega</p>
                                <p className="text-xs text-slate-500">Este local ficará salvo no empenho para as próximas entregas.</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="localNome">Nome do local / órgão</Label>
                                    <Input
                                        id="localNome"
                                        value={localDraft.orgaoNome}
                                        onChange={event => setLocalDraft(current => ({ ...current, orgaoNome: event.target.value }))}
                                        placeholder="Ex: Almoxarifado Central"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="logradouro">Logradouro</Label>
                                    <Input
                                        id="logradouro"
                                        value={localDraft.logradouro}
                                        onChange={event => setLocalDraft(current => ({ ...current, logradouro: event.target.value }))}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="numero">Número</Label>
                                    <Input
                                        id="numero"
                                        value={localDraft.numero}
                                        onChange={event => setLocalDraft(current => ({ ...current, numero: event.target.value }))}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input
                                        id="cidade"
                                        value={localDraft.cidade}
                                        onChange={event => setLocalDraft(current => ({ ...current, cidade: event.target.value }))}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Input
                                        id="estado"
                                        value={localDraft.estado}
                                        onChange={event => setLocalDraft(current => ({ ...current, estado: event.target.value }))}
                                        placeholder="Ex: SP"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label htmlFor="contatoNome">Contato</Label>
                                    <Input
                                        id="contatoNome"
                                        value={localDraft.contatoNome}
                                        onChange={event => setLocalDraft(current => ({ ...current, contatoNome: event.target.value }))}
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        </section>
                    ) : null}

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label>Itens da entrega</Label>
                            <span className="text-xs text-slate-500">Saldo disponível de cada item do empenho.</span>
                        </div>
                        <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                            {activeItems.length === 0 ? (
                                <p className="px-3 py-4 text-center text-sm text-slate-500">
                                    Este empenho não possui itens com saldo disponível para entrega.
                                </p>
                            ) : activeItems.map(item => {
                                const saldo = getEntregaSaldo(item);
                                const isSelected = isItemSelected(item, selectedItemIds);
                                const quantity = itemQuantities[item.id] ?? String(saldo);

                                return (
                                    <div key={item.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[auto_minmax(0,1fr)_170px] sm:items-center">
                                        <Switch
                                            checked={isSelected}
                                            onCheckedChange={checked => toggleItem(item, checked)}
                                            aria-label={`Selecionar item ${item.contratoItem?.itemNumero ?? ""}`}
                                        />
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                #{item.contratoItem?.itemNumero ?? "-"} {item.contratoItem?.descricao || "Item do empenho"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Empenhado: {formatQuantity(item.quantidade)} {item.contratoItem?.unidadeMedida ?? ""} · Saldo para entrega: {formatQuantity(saldo)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-8 rounded-md bg-white"
                                                disabled={!isSelected}
                                                onClick={() => stepQuantity(item, -1)}
                                            >
                                                <Minus className="size-3.5" />
                                            </Button>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={saldo}
                                                step="1"
                                                value={quantity}
                                                disabled={!isSelected}
                                                onChange={event => setItemQuantities(current => ({
                                                    ...current,
                                                    [item.id]: event.target.value,
                                                }))}
                                                className="h-8 w-20 bg-white text-right"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-8 rounded-md bg-white"
                                                disabled={!isSelected}
                                                onClick={() => stepQuantity(item, 1)}
                                            >
                                                <Plus className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dataPrevista">Previsão de Entrega</Label>
                            <Input
                                id="dataPrevista"
                                type="date"
                                value={dataPrevista}
                                onChange={event => setDataPrevista(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Input
                                id="observacoes"
                                value={observacoes}
                                onChange={event => setObservacoes(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Registrar Entrega
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function createLocalDraft(defaultLocalName?: string | null): LocalDraft {
    return {
        orgaoNome: defaultLocalName ?? "",
        logradouro: "",
        numero: "",
        cidade: "",
        estado: "",
        contatoNome: "",
    };
}

function normalizeLocalDraft(draft: LocalDraft) {
    return {
        orgaoNome: normalizeText(draft.orgaoNome),
        logradouro: normalizeText(draft.logradouro) ?? "",
        numero: normalizeText(draft.numero) ?? undefined,
        cidade: normalizeText(draft.cidade) ?? "",
        estado: normalizeText(draft.estado) ?? "",
        contatoNome: normalizeText(draft.contatoNome) ?? undefined,
    };
}

function normalizeText(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function getEntregaSaldo(item: ContratoEmpenhoItem) {
    const quantidade = toNumber(item.quantidade);
    const quantidadeRegistrada = Math.max(
        toNumber(item.quantidadeEntregue),
        (item.entregas ?? [])
            .filter(entrega => entrega.status !== "REJEITADO")
            .reduce((total, entrega) => total + toNumber(entrega.quantidadeEntregue ?? entrega.quantidade), 0),
    );

    return Math.max(0, quantidade - quantidadeRegistrada);
}

function isItemSelected(item: ContratoEmpenhoItem, selectedItemIds: Record<string, boolean>) {
    return selectedItemIds[item.id] ?? true;
}

function formatLocalLabel(local: EmpenhoLocalEntrega) {
    const address = [local.logradouro, local.numero].filter(Boolean).join(", ");
    const city = [local.cidade, local.estado].filter(Boolean).join(" - ");
    return [local.orgaoNome || "Local de entrega", address, city].filter(Boolean).join(" · ");
}

function getTodayInputValue() {
    return new Date().toISOString().split("T")[0];
}

function toNumber(value: string | number | null | undefined) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatQuantity(value: string | number | null | undefined) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(toNumber(value));
}
