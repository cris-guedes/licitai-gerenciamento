import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Minus, Loader2, Plus } from "lucide-react";
import type { ContratoItem, ContratoListItem } from "../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    contratoId: string;
    contrato: ContratoListItem;
    items: ContratoItem[];
};

const schema = z.object({
    numeroEmpenho: z.string().optional(),
    dataEmissao: z.string().optional(),
    orgaoOptionId: z.string().optional(),
    observacao: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function CreateEmpenhoDialog({ open, onOpenChange, companyId, contratoId, contrato, items }: Props) {
    const queryClient = useQueryClient();
    const api = useCoreApi();
    const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});
    const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});
    const activeItems = useMemo(() => items.filter(item => getItemSaldo(item) > 0), [items]);
    const orgaoOptions = useMemo(() => buildOrgaoOptions(contrato), [contrato]);

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            numeroEmpenho: "",
            dataEmissao: getTodayInputValue(),
            orgaoOptionId: orgaoOptions[0]?.id ?? "",
        },
    });

    function resetDraft() {
        setItemQuantities({});
        setSelectedItemIds({});
        form.reset({
            numeroEmpenho: "",
            dataEmissao: getTodayInputValue(),
            orgaoOptionId: orgaoOptions[0]?.id ?? "",
            observacao: "",
        });
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            resetDraft();
        }

        onOpenChange(nextOpen);
    }

    const selectedItems = useMemo(() => {
        return activeItems
            .filter(item => isItemSelected(item, selectedItemIds))
            .map((item) => {
                const quantidade = Number(itemQuantities[item.id] ?? getItemSaldo(item));
                const valorUnitario = Number(item.valorUnitario ?? 0);
                return {
                    contratoItemId: item.id,
                    quantidade,
                    valorUnitario,
                    valorTotal: quantidade * valorUnitario,
                };
            })
            .filter(item => item.quantidade > 0);
    }, [activeItems, itemQuantities, selectedItemIds]);

    const selectedTotal = selectedItems.reduce((acc, item) => acc + item.valorTotal, 0);

    const mutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const selectedOrgao = orgaoOptions.find(option => option.id === data.orgaoOptionId) ?? orgaoOptions[0] ?? null;
            return api.empenhos.postCoreContratosContratoIdEmpenhos({
                requestBody: {
                    companyId,
                    contratoId,
                    numeroEmpenho: data.numeroEmpenho?.trim() ?? "",
                    valor: selectedTotal,
                    dataEmissao: data.dataEmissao,
                    orgaoCnpj: selectedOrgao?.cnpj ?? undefined,
                    orgaoNome: selectedOrgao?.razaoSocial ?? selectedOrgao?.label,
                    orgaoUnidadeNome: selectedOrgao?.nomeUnidade ?? undefined,
                    observacao: data.observacao,
                    itens: selectedItems,
                }
            });
        },
        onSuccess: () => {
            toast.success("Empenho criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
            resetDraft();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao criar empenho");
        }
    });

    const onSubmit = (data: FormValues) => {
        if (selectedItems.length === 0) {
            toast.error("Selecione ao menos um item ativo para criar o empenho.");
            return;
        }

        for (const item of activeItems) {
            if (!isItemSelected(item, selectedItemIds)) continue;

            const quantidade = Number(itemQuantities[item.id] ?? getItemSaldo(item));
            const saldo = getItemSaldo(item);
            if (quantidade <= 0) {
                toast.error(`Informe uma quantidade para o item ${item.itemNumero ?? ""}`);
                return;
            }
            if (quantidade > saldo) {
                toast.error(`Quantidade excede o saldo do item ${item.itemNumero ?? ""}`);
                return;
            }
        }

        mutation.mutate(data);
    };

    function toggleItem(item: ContratoItem, checked: boolean) {
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
                [item.id]: current[item.id] ?? String(getItemSaldo(item)),
            };
        });
    }

    function stepQuantity(item: ContratoItem, delta: number) {
        setSelectedItemIds(current => ({
            ...current,
            [item.id]: true,
        }));
        setItemQuantities(current => {
            const saldo = getItemSaldo(item);
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
                    <DialogTitle>Novo Empenho</DialogTitle>
                    <DialogDescription>
                        Selecione os itens ativos do contrato. O valor total será calculado automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="numeroEmpenho">Número do Empenho</Label>
                            <Input id="numeroEmpenho" placeholder="Automático se deixar em branco" {...form.register("numeroEmpenho")} />
                            <p className="text-xs text-slate-500">
                                Vazio gera algo como EMP-0001/{new Date().getFullYear()}.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataEmissao">Data de Emissão</Label>
                            <Input id="dataEmissao" type="date" {...form.register("dataEmissao")} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                        <div className="space-y-2">
                            <Label htmlFor="orgaoOptionId">Órgão emissor</Label>
                            <select
                                id="orgaoOptionId"
                                {...form.register("orgaoOptionId")}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-400"
                            >
                                {orgaoOptions.length === 0 ? (
                                    <option value="">Órgão não informado no contrato</option>
                                ) : orgaoOptions.map(option => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Valor calculado</p>
                            <p className="mt-1 text-xl font-bold text-slate-950">{formatCurrency(selectedTotal)}</p>
                            <p className="mt-1 text-xs text-slate-500">{selectedItems.length} item(ns) selecionado(s)</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label>Itens reservados</Label>
                            <span className="text-xs text-slate-500">
                                Apenas itens com saldo disponível aparecem aqui.
                            </span>
                        </div>
                        <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                            {activeItems.length === 0 ? (
                                <p className="px-3 py-4 text-center text-sm text-slate-500">
                                    Este contrato não possui itens ativos com saldo para empenhar.
                                </p>
                            ) : (
                                activeItems.map((item) => {
                                    const saldo = getItemSaldo(item);
                                    const isSelected = isItemSelected(item, selectedItemIds);
                                    const quantity = itemQuantities[item.id] ?? String(saldo);
                                    const lineTotal = Number(quantity || 0) * Number(item.valorUnitario ?? 0);

                                    return (
                                        <div key={item.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[auto_minmax(0,1fr)_170px] sm:items-center">
                                            <Switch
                                                checked={isSelected}
                                                onCheckedChange={checked => toggleItem(item, checked)}
                                                aria-label={`Selecionar item ${item.itemNumero ?? ""}`}
                                            />
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        #{item.itemNumero ?? "-"} {item.descricao}
                                                    </p>
                                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                                        {formatCurrency(item.valorUnitario)} / {item.unidadeMedida ?? "un."}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Saldo: {formatQuantity(saldo)} {item.unidadeMedida ?? ""} · Total da linha: {formatCurrency(lineTotal)}
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
                                                    onChange={(event) => setItemQuantities(current => ({
                                                        ...current,
                                                        [item.id]: event.target.value,
                                                    }))}
                                                    placeholder="Qtd"
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
                                })
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacao">Observações</Label>
                        <Input id="observacao" {...form.register("observacao")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Criar Empenho
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type OrgaoOption = {
    id: string;
    label: string;
    cnpj?: string | null;
    razaoSocial?: string | null;
    nomeUnidade?: string | null;
};

function buildOrgaoOptions(contrato: ContratoListItem): OrgaoOption[] {
    const orgao = contrato.orgaoContratante;

    if (orgao?.razaoSocial || orgao?.nomeUnidade || orgao?.cnpj) {
        const label = [
            orgao.razaoSocial ?? orgao.nomeUnidade ?? "Órgão do contrato",
            orgao.cnpj ? `CNPJ ${orgao.cnpj}` : null,
        ].filter(Boolean).join(" · ");

        return [{
            id: "contrato-orgao",
            label,
            cnpj: orgao.cnpj,
            razaoSocial: orgao.razaoSocial ?? orgao.nomeUnidade ?? "Órgão do contrato",
            nomeUnidade: orgao.nomeUnidade,
        }];
    }

    if (contrato.oportunidade?.orgaoNome) {
        return [{
            id: "oportunidade-orgao",
            label: contrato.oportunidade.orgaoNome,
            razaoSocial: contrato.oportunidade.orgaoNome,
        }];
    }

    return [];
}

function getItemSaldo(item: ContratoItem) {
    return Math.max(0, Number(item.quantidadeContratada ?? 0) - Number(item.quantidadeEmpenhada ?? 0));
}

function isItemSelected(item: ContratoItem, selectedItemIds: Record<string, boolean>) {
    return selectedItemIds[item.id] ?? true;
}

function getTodayInputValue() {
    return new Date().toISOString().split("T")[0];
}

function formatCurrency(value: string | number | null | undefined) {
    const parsed = Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(parsed) ? parsed : 0);
}

function formatQuantity(value: string | number | null | undefined) {
    const parsed = Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(Number.isFinite(parsed) ? parsed : 0);
}
