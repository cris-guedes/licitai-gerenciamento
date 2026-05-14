"use client"

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { toast } from "sonner";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { WorkspaceHeader, WorkspaceShell } from "@/client/components/workspace";
import { 
    CircleDollarSign,
    MapPin, 
    Truck, 
    Plus,
    Package
} from "lucide-react";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useState } from "react";
import { CreateLocalEntregaDialog } from "./CreateLocalEntregaDialog";
import { CreateEntregaDialog } from "./CreateEntregaDialog";
import { formatDate } from "@/client/main/lib/utils";
import type { ContratoEmpenho, ContratoEmpenhoItem, ContratoWorkspaceResponse, EmpenhoEntrega, EmpenhoLocalEntrega } from "../types";

type EmpenhoEntregaStatus = "PENDENTE" | "ENTREGUE" | "ACEITE_PROVISORIO" | "ACEITE_DEFINITIVO" | "PAGO" | "REJEITADO";

export default function EmpenhoWorkspacePage() {
    const params = useParams();
    const [isLocalOpen, setIsLocalOpen] = useState(false);
    const [isEntregaOpen, setIsEntregaOpen] = useState(false);
    const { orgId, companyId, contratoId, empenhoId } = params as { orgId: string; companyId: string; contratoId: string; empenhoId: string };
    const queryClient = useQueryClient();
    const api = useCoreApi();

    const statusMutation = useMutation({
        mutationFn: async ({ entregaId, status }: { entregaId: string, status: EmpenhoEntregaStatus }) => {
            return api.empenhos.postCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatus({
                requestBody: {
                    companyId,
                    contratoId,
                    empenhoId,
                    entregaId,
                    status,
                }
            });
        },
        onSuccess: () => {
            toast.success("Status atualizado!");
            queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contratoId] });
        },
    });

    // Reusing the workspace query to get context
    const { data: workspace, isLoading } = useQuery({
        queryKey: ["contrato-workspace", contratoId],
        queryFn: async () => api.contratos.getCoreContratosContratoIdWorkspace({
            contratoId,
            companyId,
        }) as Promise<ContratoWorkspaceResponse>,
    });

    const workspaceData = workspace?.data;
    const empenho = workspaceData?.empenhos.find((e: ContratoEmpenho) => e.id === empenhoId);
    
    // We would ideally have a "get empenho workspace" but we can use the main one for now
    // or fetch specific empenho data if needed. 
    // In our backend, findWorkspaceById returns empenhos with items and entregas.

    if (isLoading) return <Skeleton className="h-screen w-full" />;
    if (!workspaceData || !empenho) return <div className="p-8 text-center text-rose-600">Empenho não encontrado.</div>;

    const entregas = empenho.entregas || [];
    const locais = empenho.locaisEntrega || [];
    const itens = empenho.itens || [];

    return (
        <WorkspaceShell contentClassName="p-0">
            <WorkspaceHeader
                breadcrumbs={[
                    {
                        label: `Contrato ${workspaceData.contrato.numeroContrato}`,
                        href: `/org/${orgId}/${companyId}/contratos/${contratoId}`,
                    },
                    { label: "Empenhos" },
                    { label: empenho.numeroEmpenho },
                ]}
                backHref={`/org/${orgId}/${companyId}/contratos/${contratoId}`}
                title={`Empenho ${empenho.numeroEmpenho}`}
                status={<Badge>{empenho.status}</Badge>}
                metadata={
                    <span className="flex items-center gap-1">
                        <CircleDollarSign className="size-3" />
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(empenho.valor))}
                    </span>
                }
            />

            <main className="flex-1 p-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Items and Locations */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-2xl border overflow-hidden">
                            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Package className="size-4 text-slate-500" />
                                    Itens do Empenho
                                </h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/30 border-b">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">Descrição</th>
                                        <th className="px-6 py-3 font-medium text-slate-500 text-right">Qtd</th>
                                        <th className="px-6 py-3 font-medium text-slate-500 text-right">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {itens.map((item: ContratoEmpenhoItem) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">{item.contratoItem?.descricao || 'Item de Contrato'}</td>
                                            <td className="px-6 py-4 text-right font-medium">{item.quantidade}</td>
                                            <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.valorTotal))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        <section className="bg-white rounded-2xl border p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <MapPin className="size-4 text-slate-500" />
                                    Locais de Entrega
                                </h3>
                                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setIsLocalOpen(true)}>
                                    <Plus className="mr-2 size-4" />
                                    Adicionar Local
                                </Button>
                            </div>
                            {locais.length === 0 ? (
                                <div className="text-center py-8 border border-dashed rounded-xl text-slate-400 text-sm">
                                    Nenhum local de entrega registrado para este empenho.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {locais.map((local: EmpenhoLocalEntrega) => (
                                        <div key={local.id} className="border rounded-xl p-4 bg-slate-50/30">
                                            <p className="font-semibold text-slate-900 text-sm">{local.orgaoNome || 'Endereço Principal'}</p>
                                            <p className="text-xs text-slate-500 mt-1">{local.logradouro}, {local.numero}</p>
                                            <p className="text-xs text-slate-500">{local.cidade} - {local.estado}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Pipeline/Deliveries */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-2xl border p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Truck className="size-4 text-slate-500" />
                                    Pipeline de Entregas
                                </h3>
                                <Button size="sm" className="rounded-xl" onClick={() => setIsEntregaOpen(true)}>
                                    <Plus className="mr-2 size-4" />
                                    Nova Entrega
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {entregas.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">
                                        Nenhuma entrega pendente.
                                    </div>
                                ) : (
                                    entregas.map((entrega: EmpenhoEntrega) => (
                                        <div key={entrega.id} className="border rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className={getStatusColor(entrega.status)}>
                                                    {entrega.status}
                                                </Badge>
                                                <span className="text-xs text-slate-400">{formatDate(entrega.createdAt)}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{entrega.quantidade} unidades</p>
                                                <p className="text-xs text-slate-500 truncate">{entrega.empenhoItem?.contratoItem?.descricao}</p>
                                            </div>
                                            
                                            <div className="pt-2 flex gap-2">
                                                {entrega.status === 'PENDENTE' && (
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 rounded-lg"
                                                        onClick={() => statusMutation.mutate({ entregaId: entrega.id, status: 'ENTREGUE' })}
                                                        disabled={statusMutation.isPending}
                                                    >
                                                        Confirmar Saída
                                                    </Button>
                                                )}
                                                {entrega.status === 'ENTREGUE' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="flex-1 rounded-lg border-emerald-200 text-emerald-700 bg-emerald-50"
                                                        onClick={() => statusMutation.mutate({ entregaId: entrega.id, status: 'ACEITE_DEFINITIVO' })}
                                                        disabled={statusMutation.isPending}
                                                    >
                                                        Confirmar Aceite
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <CreateLocalEntregaDialog 
                open={isLocalOpen}
                onOpenChange={setIsLocalOpen}
                companyId={companyId}
                contratoId={contratoId}
                empenhoId={empenhoId}
            />

            <CreateEntregaDialog 
                open={isEntregaOpen}
                onOpenChange={setIsEntregaOpen}
                companyId={companyId}
                contratoId={contratoId}
                empenhoId={empenhoId}
                empenhoItems={itens}
            />
        </WorkspaceShell>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'PENDENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'ENTREGUE': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'ACEITE_DEFINITIVO': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
}
