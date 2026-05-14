import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
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
import { Textarea } from "@/client/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { CONTRATO_STATUS_LABEL, type ContratoStatus } from "../../types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    oportunidadeId?: string;
};

const schema = z.object({
    oportunidadeId: z.string().min(1, "Selecione uma oportunidade"),
    numeroContrato: z.string().min(1, "Campo obrigatório"),
    processo: z.string().optional(),
    objetoContrato: z.string().optional(),
    dataAssinatura: z.string().optional(),
    dataVigenciaInicio: z.string().optional(),
    dataVigenciaFim: z.string().optional(),
    status: z.enum(["RASCUNHO", "VIGENTE", "ENCERRADO", "RESCINDIDO", "CANCELADO"]).default("RASCUNHO"),
    valorTotal: z.coerce.number().min(0, "Valor não pode ser negativo"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

function emptyToUndefined(value: string | undefined) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

export function CreateContratoDialog({ open, onOpenChange, companyId, oportunidadeId }: Props) {
    const router = useRouter();
    const params = useParams();
    const orgId = params.orgId as string | undefined;
    const queryClient = useQueryClient();
    const api = useCoreApi();

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            oportunidadeId: oportunidadeId ?? "",
            numeroContrato: "",
            status: "RASCUNHO",
            valorTotal: 0,
        },
    });
    const selectedOportunidadeId = useWatch({ control: form.control, name: "oportunidadeId" });
    const selectedStatus = useWatch({ control: form.control, name: "status" });

    useEffect(() => {
        if (open) {
            form.setValue("oportunidadeId", oportunidadeId ?? "");
        }
    }, [form, open, oportunidadeId]);

    const oportunidadesQuery = useQuery({
        queryKey: ["contratos", "oportunidades-disponiveis", companyId],
        queryFn: () => api.oportunidade.listOportunidadesBoard({ companyId }),
        enabled: open && !oportunidadeId,
    });

    const mutation = useMutation({
        mutationFn: async (data: FormValues) => {
            return api.contratos.postCoreContratos({
                requestBody: {
                    companyId,
                    oportunidadeId: data.oportunidadeId,
                    numeroContrato: data.numeroContrato,
                    processo: emptyToUndefined(data.processo),
                    objetoContrato: emptyToUndefined(data.objetoContrato),
                    dataAssinatura: emptyToUndefined(data.dataAssinatura),
                    dataVigenciaInicio: emptyToUndefined(data.dataVigenciaInicio),
                    dataVigenciaFim: emptyToUndefined(data.dataVigenciaFim),
                    status: data.status,
                    valorTotal: data.valorTotal,
                    valorGlobal: data.valorTotal,
                    // Sem selecao manual por enquanto: o backend vincula os itens da oportunidade automaticamente.
                    itens: [],
                }
            });
        },
        onSuccess: (response) => {
            toast.success("Contrato criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["contratos", companyId, oportunidadeId] });
            queryClient.invalidateQueries({ queryKey: ["contratos", companyId] });
            onOpenChange(false);
            form.reset();
            if (orgId) {
                router.push(`/org/${orgId}/${companyId}/contratos/${response.id}`);
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao criar contrato");
        }
    });

    const onSubmit = (data: FormValues) => {
        mutation.mutate(data);
    };

    const oportunidades = oportunidadesQuery.data?.items ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Registrar Novo Contrato</DialogTitle>
                    <DialogDescription>
                        Crie o contrato originado por esta licitação/oportunidade.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {!oportunidadeId && (
                        <div className="space-y-2">
                            <Label>Oportunidade</Label>
                            <Select
                                value={selectedOportunidadeId}
                                onValueChange={(value) => {
                                    form.setValue("oportunidadeId", value, { shouldDirty: true });
                                    const oportunidade = oportunidades.find(item => item.oportunidadeId === value);
                                    if (Number(form.getValues("valorTotal") ?? 0) === 0 && oportunidade?.valorEstimado) {
                                        form.setValue("valorTotal", Number(oportunidade.valorEstimado), { shouldDirty: true });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={oportunidadesQuery.isLoading ? "Carregando..." : "Selecione a oportunidade"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {oportunidades.map((item) => (
                                        <SelectItem key={item.oportunidadeId} value={item.oportunidadeId}>
                                            {item.numero ? `${item.numero} - ` : ""}{item.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.oportunidadeId && (
                                <p className="text-sm text-red-500">{form.formState.errors.oportunidadeId.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="numeroContrato">Número do Contrato</Label>
                        <Input id="numeroContrato" placeholder="Ex: 123/2026" {...form.register("numeroContrato")} />
                        {form.formState.errors.numeroContrato && (
                            <p className="text-sm text-red-500">{form.formState.errors.numeroContrato.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="processo">Processo</Label>
                            <Input id="processo" placeholder="Ex: PA 45/2026" {...form.register("processo")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataAssinatura">Data de Assinatura</Label>
                            <Input id="dataAssinatura" type="date" {...form.register("dataAssinatura")} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dataVigenciaInicio">Início da Vigência</Label>
                            <Input id="dataVigenciaInicio" type="date" {...form.register("dataVigenciaInicio")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataVigenciaFim">Fim da Vigência</Label>
                            <Input id="dataVigenciaFim" type="date" {...form.register("dataVigenciaFim")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="valorTotal">Valor Global</Label>
                        <Input 
                            id="valorTotal" 
                            type="number" 
                            step="0.01" 
                            {...form.register("valorTotal")} 
                        />
                        {form.formState.errors.valorTotal && (
                            <p className="text-sm text-red-500">{form.formState.errors.valorTotal.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status Inicial</Label>
                        <Select 
                            value={selectedStatus}
                            onValueChange={(val) => form.setValue("status", val as ContratoStatus, { shouldDirty: true })} 
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CONTRATO_STATUS_LABEL).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="objetoContrato">Objeto</Label>
                        <Textarea id="objetoContrato" rows={4} {...form.register("objetoContrato")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Criar Contrato
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
