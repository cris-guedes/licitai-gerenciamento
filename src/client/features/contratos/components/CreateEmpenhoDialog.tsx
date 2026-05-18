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
import { Loader2 } from "lucide-react";
import type { ContratoItem } from "../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    contratoId: string;
    items: ContratoItem[];
};

const schema = z.object({
    numeroEmpenho: z.string().min(1, "Campo obrigatório"),
    valor: z.coerce.number().min(0, "Valor não pode ser negativo"),
    dataEmissao: z.string().optional(),
    orgaoNome: z.string().optional(),
    observacao: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function CreateEmpenhoDialog({ open, onOpenChange, companyId, contratoId, items }: Props) {
    const queryClient = useQueryClient();
    const api = useCoreApi();
    const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            numeroEmpenho: "",
            valor: 0,
            dataEmissao: new Date().toISOString().split('T')[0],
        },
    });

    const selectedItems = useMemo(() => {
        return items
            .map((item) => {
                const quantidade = Number(itemQuantities[item.id] || 0);
                const valorUnitario = Number(item.valorUnitario ?? 0);
                return {
                    contratoItemId: item.id,
                    quantidade,
                    valorUnitario,
                    valorTotal: quantidade * valorUnitario,
                };
            })
            .filter(item => item.quantidade > 0);
    }, [itemQuantities, items]);

    const selectedTotal = selectedItems.reduce((acc, item) => acc + item.valorTotal, 0);

    const mutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const valor = data.valor > 0 ? data.valor : selectedTotal;
            return api.empenhos.postCoreContratosContratoIdEmpenhos({
                requestBody: {
                    companyId,
                    contratoId,
                    numeroEmpenho: data.numeroEmpenho,
                    valor,
                    dataEmissao: data.dataEmissao,
                    orgaoNome: data.orgaoNome,
                    observacao: data.observacao,
                    itens: selectedItems,
                }
            });
        },
        onSuccess: () => {
            toast.success("Empenho criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
            onOpenChange(false);
            setItemQuantities({});
            form.reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao criar empenho");
        }
    });

    const onSubmit = (data: FormValues) => {
        for (const item of items) {
            const quantidade = Number(itemQuantities[item.id] || 0);
            const saldo = Number(item.quantidadeContratada ?? 0) - Number(item.quantidadeEmpenhada ?? 0);
            if (quantidade > saldo) {
                toast.error(`Quantidade excede o saldo do item ${item.itemNumero ?? ""}`);
                return;
            }
        }

        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Novo Empenho</DialogTitle>
                    <DialogDescription>
                        Registre uma nova nota de empenho vinculada a este contrato.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="numeroEmpenho">Número do Empenho</Label>
                        <Input id="numeroEmpenho" placeholder="Ex: 2026NE0001" {...form.register("numeroEmpenho")} />
                        {form.formState.errors.numeroEmpenho && (
                            <p className="text-sm text-red-500">{form.formState.errors.numeroEmpenho.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="valor">Valor Total</Label>
                        <Input 
                            id="valor" 
                            type="number" 
                            step="0.01" 
                            {...form.register("valor")} 
                        />
                        {form.formState.errors.valor && (
                            <p className="text-sm text-red-500">{form.formState.errors.valor.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataEmissao">Data de Emissão</Label>
                        <Input id="dataEmissao" type="date" {...form.register("dataEmissao")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="orgaoNome">Órgão emissor</Label>
                        <Input id="orgaoNome" {...form.register("orgaoNome")} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label>Itens reservados</Label>
                            <span className="text-xs text-slate-500">
                                Total selecionado: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedTotal)}
                            </span>
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
                            {items.length === 0 ? (
                                <p className="px-3 py-4 text-center text-sm text-slate-500">
                                    Este contrato ainda não possui itens vinculados.
                                </p>
                            ) : (
                                items.map((item) => {
                                    const saldo = Math.max(0, Number(item.quantidadeContratada ?? 0) - Number(item.quantidadeEmpenhada ?? 0));
                                    return (
                                        <div key={item.id} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    #{item.itemNumero ?? "-"} {item.descricao}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Saldo: {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(saldo)} {item.unidadeMedida ?? ""}
                                                </p>
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={itemQuantities[item.id] ?? ""}
                                                onChange={(event) => setItemQuantities(current => ({
                                                    ...current,
                                                    [item.id]: event.target.value,
                                                }))}
                                                placeholder="Qtd"
                                                className="bg-white"
                                            />
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
