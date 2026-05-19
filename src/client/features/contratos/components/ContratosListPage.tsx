"use client"

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { 
    Handshake,
    ChevronRight,
    RotateCcw,
    ListFilter,
    Plus,
    Search,
    Pencil,
    CircleDollarSign,
    CalendarClock,
} from "lucide-react";
import { Input } from "@/client/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select";
import { formatDate, formatCurrency } from "@/client/main/lib/utils";
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell";
import { useMemo, useState, type ReactNode } from "react";
import { CreateContratoDialog } from "./OportunidadeContratosTab/CreateContratoDialog";
import { EditContratoDialog } from "./EditContratoDialog";
import { CONTRATO_STATUS_LABEL, type ContratoListItem, type ContratosListResponse, type ContratoStatus } from "../types";

export default function ContratosListPage() {
    const params = useParams();
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingContrato, setEditingContrato] = useState<ContratoListItem | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | ContratoStatus>("all");
    const [currentTime] = useState(() => Date.now());
    const { orgId, companyId } = params as { orgId: string; companyId: string };
    const api = useCoreApi();

    const { data: contratos, isLoading } = useQuery({
        queryKey: ["contratos", companyId],
        queryFn: async () => api.contratos.getCoreContratosList({
            companyId,
        }) as Promise<ContratosListResponse>,
    });

    const filteredContratos = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (contratos?.data ?? []).filter((contrato) => {
            const matchesStatus = statusFilter === "all" || contrato.status === statusFilter;
            const searchable = [
                contrato.numeroContrato,
                contrato.processo,
                contrato.objetoContrato,
                contrato.oportunidade?.title,
                contrato.oportunidade?.orgaoNome,
            ].filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = !term || searchable.includes(term);
            return matchesStatus && matchesSearch;
        });
    }, [contratos?.data, search, statusFilter]);

    const totalValue = filteredContratos.reduce((acc, contrato) => acc + Number(contrato.valorTotal ?? contrato.valorGlobal ?? 0), 0);
    const activeCount = filteredContratos.filter(contrato => contrato.status === "VIGENTE").length;
    const expiringCount = filteredContratos.filter((contrato) => {
        if (!contrato.dataVigenciaFim) return false;
        const end = new Date(contrato.dataVigenciaFim).getTime();
        const days = (end - currentTime) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
    }).length;

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
    };

    return (
        <div className="space-y-6">
            <DashboardHeaderActions>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
                    <Plus className="mr-2 size-4" />
                    Novo Contrato
                </Button>
            </DashboardHeaderActions>

            <section className="min-w-0 max-w-full">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] p-4 shadow-[0_18px_40px_rgba(4,22,39,0.05)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input 
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-12 rounded-xl border-slate-200 bg-white pl-11 text-[0.95rem] shadow-none" 
                                placeholder="Buscar por número, órgão, processo ou objeto..." 
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ContratoStatus)}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white shadow-none lg:w-[190px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                {Object.entries(CONTRATO_STATUS_LABEL).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" className="rounded-xl text-slate-500" onClick={clearFilters}>
                            <RotateCcw className="mr-2 size-4" />
                            Limpar
                        </Button>
                        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 lg:inline-flex">
                            <ListFilter className="size-4" />
                            {filteredContratos.length} contrato(s)
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    icon={<Handshake className="size-5 text-sky-700" />}
                    label="Contratos filtrados"
                    value={String(filteredContratos.length)}
                    description={`${activeCount} vigente(s)`}
                />
                <MetricCard
                    icon={<CircleDollarSign className="size-5 text-emerald-700" />}
                    label="Valor global"
                    value={formatCurrency(totalValue)}
                    description="Soma dos contratos listados"
                />
                <MetricCard
                    icon={<CalendarClock className="size-5 text-amber-700" />}
                    label="Vencendo em 30 dias"
                    value={String(expiringCount)}
                    description="Com vigência próxima do fim"
                />
            </section>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl border" />
                    ))}
                </div>
            ) : filteredContratos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <Handshake className="size-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Nenhum contrato encontrado</h3>
                    <p className="text-slate-500 max-w-xs mt-2">
                        Ajuste os filtros ou registre um contrato a partir de uma oportunidade ativa.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Contrato</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Oportunidade</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Vigência</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Valor</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredContratos.map((contrato) => (
                                <tr key={contrato.id} className="hover:bg-slate-50/50 group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">#{contrato.numeroContrato || "Sem número"}</span>
                                            {contrato.processo && (
                                                <span className="text-xs text-slate-500">Processo {contrato.processo}</span>
                                            )}
                                            <span className="text-xs text-slate-500">Criado em {formatDate(contrato.createdAt)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-sm">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {contrato.oportunidade?.title || contrato.objetoContrato || "Oportunidade vinculada"}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {contrato.orgaoContratante?.razaoSocial || contrato.oportunidade?.orgaoNome || "Órgão não informado"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={getStatusClassName(contrato.status)}>
                                            {CONTRATO_STATUS_LABEL[contrato.status] ?? contrato.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {contrato.dataVigenciaFim ? formatDate(contrato.dataVigenciaFim) : "Sem vigência"}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">
                                        {formatCurrency(contrato.valorTotal ?? contrato.valorGlobal)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingContrato(contrato)}
                                                className="rounded-lg group-hover:bg-slate-100"
                                                title="Editar contrato"
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => router.push(`/org/${orgId}/${companyId}/contratos/${contrato.id}`)}
                                                className="rounded-lg group-hover:bg-slate-100"
                                            >
                                                Workspace
                                                <ChevronRight className="ml-2 size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CreateContratoDialog 
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                companyId={companyId}
            />

            {editingContrato && (
                <EditContratoDialog
                    open={Boolean(editingContrato)}
                    onOpenChange={(open) => {
                        if (!open) setEditingContrato(null);
                    }}
                    companyId={companyId}
                    contrato={editingContrato}
                />
            )}
        </div>
    );
}

function MetricCard({ icon, label, value, description }: {
    icon: ReactNode;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-2">{icon}</div>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
    );
}

function getStatusClassName(status: ContratoStatus) {
    switch (status) {
        case "VIGENTE":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";
        case "RASCUNHO":
            return "bg-slate-50 text-slate-700 border-slate-200";
        case "ENCERRADO":
            return "bg-blue-50 text-blue-700 border-blue-100";
        case "RESCINDIDO":
        case "CANCELADO":
            return "bg-rose-50 text-rose-700 border-rose-100";
        default:
            return "bg-slate-50 text-slate-700 border-slate-200";
    }
}
