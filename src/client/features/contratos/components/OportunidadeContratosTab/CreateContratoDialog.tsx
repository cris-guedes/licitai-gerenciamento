import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { Building2, Loader2, PackageCheck } from "lucide-react";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { toast } from "sonner";
import { Button } from "@/client/components/ui/button";
import { Checkbox } from "@/client/components/ui/checkbox";
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
import { formatCurrency } from "@/client/main/lib/utils";
import type { OportunidadeWorkspaceModel } from "@/client/features/oportunidades/types/oportunidade-workspace";
import { CONTRATO_STATUS_LABEL, type ContratoStatus } from "../../types";

type Workspace = NonNullable<OportunidadeWorkspaceModel["licitacaoWorkspace"]>;
type WorkspaceEdital = NonNullable<Workspace["edital"]>;
type WorkspaceItem = WorkspaceEdital["itens"][number];
type WorkspaceOrgao = WorkspaceEdital["orgaos"][number];

type OrgaoOption = {
    id: string;
    editalOrgaoId?: string;
    orgaoId?: string;
    papel?: string;
    cnpj?: string | null;
    razaoSocial?: string | null;
    codigoUnidade?: string | null;
    nomeUnidade?: string | null;
    municipio?: string | null;
    uf?: string | null;
    esfera?: string | null;
    poder?: string | null;
    editalItemIds: Set<string>;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    oportunidadeId?: string;
    workspace?: OportunidadeWorkspaceModel;
};

const schema = z.object({
    oportunidadeId: z.string().min(1, "Selecione uma oportunidade"),
    numeroContrato: z.string().optional(),
    processo: z.string().optional(),
    objetoContrato: z.string().optional(),
    dataAssinatura: z.string().optional(),
    dataVigenciaInicio: z.string().optional(),
    dataVigenciaFim: z.string().optional(),
    status: z.enum(["RASCUNHO", "VIGENTE", "ENCERRADO", "RESCINDIDO", "CANCELADO"]).default("RASCUNHO"),
    valorTotal: z.coerce.number().min(0, "Valor não pode ser negativo").default(0),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

function emptyToUndefined(value: string | undefined) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

export function CreateContratoDialog({ open, onOpenChange, companyId, oportunidadeId, workspace }: Props) {
    const router = useRouter();
    const params = useParams();
    const orgId = params.orgId as string | undefined;
    const queryClient = useQueryClient();
    const api = useCoreApi();
    const [selectedOrgaoId, setSelectedOrgaoId] = useState("");
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string> | null>(null);

    const form = useForm<FormInput, unknown, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            oportunidadeId: oportunidadeId ?? "",
            numeroContrato: "",
            processo: "",
            objetoContrato: "",
            status: "RASCUNHO",
            valorTotal: 0,
        },
    });
    const selectedOportunidadeId = useWatch({ control: form.control, name: "oportunidadeId" });
    const selectedStatus = useWatch({ control: form.control, name: "status" });

    const orgaoOptions = useMemo(() => buildOrgaoOptions(workspace), [workspace]);
    const defaultOrgaoId = useMemo(
        () => (orgaoOptions.find(orgao => orgao.papel === "GERENCIADOR") ?? orgaoOptions[0] ?? null)?.id ?? "",
        [orgaoOptions],
    );
    const currentOrgaoId = selectedOrgaoId || defaultOrgaoId;
    const selectedOrgao = useMemo(
        () => orgaoOptions.find(orgao => orgao.id === currentOrgaoId) ?? null,
        [currentOrgaoId, orgaoOptions],
    );
    const activeItems = useMemo(() => {
        return (workspace?.licitacaoWorkspace?.edital?.itens ?? [])
            .filter(item => item.isSelected && Boolean(item.oportunidadeItemId));
    }, [workspace]);
    const orgaoScopedItems = useMemo(
        () => filterItemsByOrgao(activeItems, selectedOrgao),
        [activeItems, selectedOrgao],
    );
    const defaultSelectedItemIds = useMemo(() => {
        return new Set(
            orgaoScopedItems
                .map(item => item.oportunidadeItemId)
                .filter((id): id is string => Boolean(id)),
        );
    }, [orgaoScopedItems]);
    const currentSelectedItemIds = selectedItemIds ?? defaultSelectedItemIds;

    useEffect(() => {
        if (!open) return;

        form.setValue("oportunidadeId", oportunidadeId ?? "");

        const edital = workspace?.licitacaoWorkspace?.edital;
        if (edital?.processo) form.setValue("processo", edital.processo);
        if (edital?.objeto) form.setValue("objetoContrato", edital.objeto);

    }, [form, open, oportunidadeId, workspace]);

    useEffect(() => {
        if (!open || !workspace) return;

        form.setValue("valorTotal", calculateSelectedItemsTotal(activeItems, currentSelectedItemIds), {
            shouldDirty: false,
        });
    }, [activeItems, currentSelectedItemIds, form, open, workspace]);

    const oportunidadesQuery = useQuery({
        queryKey: ["contratos", "oportunidades-disponiveis", companyId],
        queryFn: () => api.oportunidade.listOportunidadesBoard({ companyId }),
        enabled: open && !oportunidadeId,
    });

    const mutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const itemPayload = workspace
                ? activeItems
                    .filter(item => item.oportunidadeItemId && currentSelectedItemIds.has(item.oportunidadeItemId))
                    .map(toContratoItemPayload)
                : [];
            type CreateContratoRequestBody = Parameters<typeof api.contratos.postCoreContratos>[0]["requestBody"] & {
                orgaoContratante?: ReturnType<typeof toOrgaoContratantePayload>;
            };
            const requestBody: CreateContratoRequestBody = {
                companyId,
                oportunidadeId: data.oportunidadeId,
                numeroContrato: emptyToUndefined(data.numeroContrato),
                processo: emptyToUndefined(data.processo),
                objetoContrato: emptyToUndefined(data.objetoContrato),
                dataAssinatura: emptyToUndefined(data.dataAssinatura),
                dataVigenciaInicio: emptyToUndefined(data.dataVigenciaInicio),
                dataVigenciaFim: emptyToUndefined(data.dataVigenciaFim),
                status: data.status,
                valorTotal: data.valorTotal,
                valorGlobal: data.valorTotal,
                orgaoContratante: selectedOrgao ? toOrgaoContratantePayload(selectedOrgao) : undefined,
                itens: itemPayload,
            };

            return api.contratos.postCoreContratos({
                requestBody,
            });
        },
        onSuccess: (response) => {
            toast.success("Contrato criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["contratos", companyId, oportunidadeId] });
            queryClient.invalidateQueries({ queryKey: ["contratos", companyId] });
            onOpenChange(false);
            form.reset();
            setSelectedOrgaoId("");
            setSelectedItemIds(null);
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
        if (workspace && activeItems.length === 0) {
            toast.error("A oportunidade ainda não possui itens ativos para vincular ao contrato.");
            return;
        }

        if (workspace && currentSelectedItemIds.size === 0) {
            toast.error("Selecione ao menos um item ativo da oportunidade.");
            return;
        }

        mutation.mutate(data);
    };

    const oportunidades = oportunidadesQuery.data?.items ?? [];

    function handleToggleItem(item: WorkspaceItem, checked: boolean) {
        if (!item.oportunidadeItemId) return;

        setSelectedItemIds(current => {
            const next = new Set(current ?? currentSelectedItemIds);
            if (checked) next.add(item.oportunidadeItemId!);
            else next.delete(item.oportunidadeItemId!);

            form.setValue("valorTotal", calculateSelectedItemsTotal(activeItems, next), {
                shouldDirty: true,
            });
            return next;
        });
    }

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                setSelectedOrgaoId("");
                setSelectedItemIds(null);
            }
            onOpenChange(nextOpen);
        }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
                <DialogHeader>
                    <DialogTitle>Registrar Novo Contrato</DialogTitle>
                    <DialogDescription>
                        Crie o contrato com o básico da oportunidade. Os demais dados podem ser completados depois.
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

                    {workspace && orgaoOptions.length > 0 ? (
                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Building2 className="size-4 text-slate-500" />
                                Órgão contratante
                            </div>
                            <Select value={currentOrgaoId} onValueChange={(value) => {
                                setSelectedOrgaoId(value);
                                setSelectedItemIds(null);
                            }}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione o órgão da oportunidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgaoOptions.map((orgao) => (
                                        <SelectItem key={orgao.id} value={orgao.id}>
                                            {getOrgaoLabel(orgao)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedOrgao ? (
                                <p className="text-xs text-slate-500">{getOrgaoSubtitle(selectedOrgao)}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {workspace ? (
                        <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                    <PackageCheck className="size-4 text-slate-500" />
                                    Itens do contrato
                                </div>
                                <span className="text-xs text-slate-500">
                                    {currentSelectedItemIds.size} de {orgaoScopedItems.length} selecionado(s)
                                </span>
                            </div>

                            {orgaoScopedItems.length > 0 ? (
                                <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-100">
                                    {orgaoScopedItems.map((item) => {
                                        const itemId = item.oportunidadeItemId;
                                        if (!itemId) return null;

                                        return (
                                            <label
                                                key={itemId}
                                                className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0 hover:bg-slate-50"
                                            >
                                                <Checkbox
                                                    checked={currentSelectedItemIds.has(itemId)}
                                                    onCheckedChange={(checked) => handleToggleItem(item, checked === true)}
                                                    className="mt-0.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        <span className="text-xs font-semibold text-slate-900">
                                                            Item {item.numeroItem ?? "-"}
                                                        </span>
                                                        {item.lote ? (
                                                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                                                Lote {item.lote}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                                                        {item.descricao ?? "Item sem descrição"}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                                        <span>Qtd. {formatNumber(resolveItemQuantity(item))}</span>
                                                        <span>Unit. {formatOptionalCurrency(resolveItemUnitPrice(item))}</span>
                                                        <span>Total {formatOptionalCurrency(resolveItemTotal(item))}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                                    Nenhum item ativo encontrado para o órgão selecionado.
                                </div>
                            )}
                        </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="numeroContrato">Número do Contrato</Label>
                            <Input id="numeroContrato" placeholder="Pode preencher depois" {...form.register("numeroContrato")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="processo">Processo</Label>
                            <Input id="processo" placeholder="Ex: PA 45/2026" {...form.register("processo")} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="dataAssinatura">Assinatura</Label>
                            <Input id="dataAssinatura" type="date" {...form.register("dataAssinatura")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataVigenciaInicio">Início da Vigência</Label>
                            <Input id="dataVigenciaInicio" type="date" {...form.register("dataVigenciaInicio")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dataVigenciaFim">Fim da Vigência</Label>
                            <Input id="dataVigenciaFim" type="date" {...form.register("dataVigenciaFim")} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="objetoContrato">Objeto</Label>
                        <Textarea id="objetoContrato" rows={3} {...form.register("objetoContrato")} />
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

function buildOrgaoOptions(workspace?: OportunidadeWorkspaceModel): OrgaoOption[] {
    const edital = workspace?.licitacaoWorkspace?.edital;
    const orgaos = edital?.orgaos ?? [];

    if (orgaos.length > 0) {
        return orgaos.map(toOrgaoOption);
    }

    const fallbackName = edital?.orgaoRazaoSocial ?? workspace?.oportunidade.orgaoNome ?? null;
    if (!fallbackName) return [];

    return [{
        id: "orgao-principal",
        papel: "GERENCIADOR",
        cnpj: edital?.orgaoCnpj ?? null,
        razaoSocial: fallbackName,
        codigoUnidade: edital?.unidadeCodigo ?? null,
        nomeUnidade: edital?.unidadeNome ?? null,
        municipio: edital?.municipio ?? null,
        uf: edital?.uf ?? null,
        esfera: edital?.orgaoEsfera ?? null,
        poder: edital?.orgaoPoder ?? null,
        editalItemIds: new Set(),
    }];
}

function toOrgaoOption(orgao: WorkspaceOrgao): OrgaoOption {
    return {
        id: orgao.id,
        editalOrgaoId: orgao.id,
        orgaoId: orgao.orgao.id,
        papel: orgao.papel,
        cnpj: orgao.orgao.cnpj,
        razaoSocial: orgao.orgao.razaoSocial,
        codigoUnidade: orgao.orgao.codigoUnidade,
        nomeUnidade: orgao.orgao.nomeUnidade,
        municipio: orgao.orgao.municipio,
        uf: orgao.orgao.uf,
        esfera: orgao.orgao.esfera,
        poder: orgao.orgao.poder,
        editalItemIds: new Set(orgao.itens.map(item => item.editalItemId)),
    };
}

function filterItemsByOrgao(items: WorkspaceItem[], orgao: OrgaoOption | null) {
    if (!orgao || orgao.editalItemIds.size === 0) return items;
    return items.filter(item => orgao.editalItemIds.has(item.id));
}

function toOrgaoContratantePayload(orgao: OrgaoOption) {
    return {
        editalOrgaoId: orgao.editalOrgaoId,
        orgaoId: orgao.orgaoId,
        papel: orgao.papel,
        cnpj: orgao.cnpj,
        razaoSocial: orgao.razaoSocial,
        codigoUnidade: orgao.codigoUnidade,
        nomeUnidade: orgao.nomeUnidade,
        municipio: orgao.municipio,
        uf: orgao.uf,
        esfera: orgao.esfera,
        poder: orgao.poder,
    };
}

function toContratoItemPayload(item: WorkspaceItem) {
    return {
        oportunidadeItemId: item.oportunidadeItemId!,
        quantidadeContratada: resolveItemQuantity(item) ?? undefined,
        valorUnitario: resolveItemUnitPrice(item) ?? undefined,
        valorTotal: resolveItemTotal(item) ?? undefined,
    };
}

function calculateSelectedItemsTotal(items: WorkspaceItem[], selectedIds: Set<string>) {
    return Number(items.reduce((total, item) => {
        if (!item.oportunidadeItemId || !selectedIds.has(item.oportunidadeItemId)) return total;
        return total + (resolveItemTotal(item) ?? 0);
    }, 0).toFixed(2));
}

function resolveItemQuantity(item: WorkspaceItem) {
    return toNumber(item.pricing?.quantidadeCotada ?? item.quantidadeTotal);
}

function resolveItemUnitPrice(item: WorkspaceItem) {
    return toNumber(item.pricing?.precoOfertaUnitario ?? item.valorUnitarioEstimado);
}

function resolveItemTotal(item: WorkspaceItem) {
    const storedTotal = toNumber(item.pricing?.precoOfertaTotal ?? item.valorTotalEstimado);
    if (storedTotal !== null) return storedTotal;

    const quantity = resolveItemQuantity(item);
    const unitPrice = resolveItemUnitPrice(item);
    if (quantity === null || unitPrice === null) return null;
    return quantity * unitPrice;
}

function toNumber(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return null;
    const normalized = typeof value === "string" && value.includes(",")
        ? value.replace(/\./g, "").replace(",", ".")
        : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number | null) {
    if (value === null) return "-";
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
}

function formatOptionalCurrency(value: number | null) {
    return value === null ? "-" : formatCurrency(value);
}

function getOrgaoLabel(orgao: OrgaoOption) {
    return orgao.razaoSocial ?? orgao.nomeUnidade ?? orgao.cnpj ?? "Órgão da oportunidade";
}

function getOrgaoSubtitle(orgao: OrgaoOption) {
    return [
        formatPapel(orgao.papel),
        orgao.cnpj,
        orgao.nomeUnidade,
        [orgao.municipio, orgao.uf].filter(Boolean).join("/"),
    ].filter(Boolean).join(" · ");
}

function formatPapel(value: string | undefined) {
    if (value === "GERENCIADOR") return "Gerenciador";
    if (value === "PARTICIPANTE") return "Participante";
    return value ?? null;
}
