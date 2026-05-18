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

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    contratoId: string;
    empenhoId: string;
};

const schema = z.object({
    orgaoNome: z.string().optional(),
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().optional(),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(1, "Estado é obrigatório"),
    contatoNome: z.string().optional(),
});

export function CreateLocalEntregaDialog({ open, onOpenChange, companyId, contratoId, empenhoId }: Props) {
    const queryClient = useQueryClient();
    const api = useCoreApi();

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof schema>) => {
            return api.empenhos.postCoreContratosContratoIdEmpenhosEmpenhoIdLocais({
                requestBody: {
                    companyId,
                    contratoId,
                    empenhoId,
                    ...data,
                }
            });
        },
        onSuccess: () => {
            toast.success("Local de entrega adicionado!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
            onOpenChange(false);
            form.reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao adicionar local");
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Local de Entrega</DialogTitle>
                    <DialogDescription>
                        Informe onde os itens deste empenho devem ser entregues.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="orgaoNome">Nome do Local / Órgão</Label>
                        <Input id="orgaoNome" placeholder="Ex: Almoxarifado Central" {...form.register("orgaoNome")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="logradouro">Logradouro</Label>
                            <Input id="logradouro" {...form.register("logradouro")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numero">Número</Label>
                            <Input id="numero" {...form.register("numero")} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input id="cidade" {...form.register("cidade")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Input id="estado" placeholder="Ex: SP" {...form.register("estado")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contatoNome">Nome do Contato</Label>
                        <Input id="contatoNome" {...form.register("contatoNome")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Salvar Local
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
