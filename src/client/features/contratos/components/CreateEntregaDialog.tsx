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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ContratoEmpenhoItem } from "../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    contratoId: string;
    empenhoId: string;
    empenhoItems: ContratoEmpenhoItem[];
};

const schema = z.object({
    empenhoItemId: z.string().min(1, "Selecione um item"),
    quantidade: z.coerce.number().min(0.01, "Quantidade deve ser maior que zero"),
    dataPrevista: z.string().optional(),
    observacoes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function CreateEntregaDialog({ open, onOpenChange, companyId, contratoId, empenhoId, empenhoItems }: Props) {
    const queryClient = useQueryClient();
    const api = useCoreApi();

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            empenhoItemId: "",
            dataPrevista: new Date().toISOString().split('T')[0],
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: FormValues) => {
            return api.empenhos.postCoreContratosContratoIdEmpenhosEmpenhoIdEntregas({
                requestBody: {
                    companyId,
                    contratoId,
                    empenhoId,
                    ...data,
                }
            });
        },
        onSuccess: () => {
            toast.success("Entrega registrada no pipeline!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
            onOpenChange(false);
            form.reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao registrar entrega");
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Entrega no Pipeline</DialogTitle>
                    <DialogDescription>
                        Inicie o processo de entrega de um item deste empenho.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Item do Empenho</Label>
                        <Select onValueChange={(val) => form.setValue("empenhoItemId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o item..." />
                            </SelectTrigger>
                            <SelectContent>
                                {empenhoItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.contratoItem?.descricao || 'Item'} ({item.quantidade} total)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.empenhoItemId && (
                            <p className="text-sm text-red-500">{form.formState.errors.empenhoItemId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade a Entregar</Label>
                        <Input 
                            id="quantidade" 
                            type="number" 
                            step="0.01" 
                            {...form.register("quantidade")} 
                        />
                        {form.formState.errors.quantidade && (
                            <p className="text-sm text-red-500">{form.formState.errors.quantidade.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataPrevista">Previsão de Entrega</Label>
                        <Input id="dataPrevista" type="date" {...form.register("dataPrevista")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input id="observacoes" {...form.register("observacoes")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
