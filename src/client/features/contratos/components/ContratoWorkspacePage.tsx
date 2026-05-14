"use client"

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { WorkspaceHeader, WorkspaceMetricCard, WorkspaceMetricGrid, WorkspaceShell } from "@/client/components/workspace";
import { 
    FileText, 
    Layers3, 
    CircleDollarSign, 
    Calendar,
    ChevronRight,
    Plus
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/client/main/lib/utils";
import { CreateEmpenhoDialog } from "./CreateEmpenhoDialog";
import { EditContratoDialog } from "./EditContratoDialog";
import { CONTRATO_STATUS_LABEL, type ContratoEmpenho, type ContratoItem, type ContratoWorkspaceResponse } from "../types";

export default function ContratoWorkspacePage() {
    const params = useParams();
    const [isCreateEmpenhoOpen, setIsCreateEmpenhoOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { orgId, companyId, contratoId } = params as { orgId: string; companyId: string; contratoId: string };
    const api = useCoreApi();

    const { data: workspace, isLoading, error } = useQuery({
        queryKey: ["contrato-workspace", contratoId],
        queryFn: async () => api.contratos.getCoreContratosContratoIdWorkspace({
            contratoId,
            companyId,
        }) as Promise<ContratoWorkspaceResponse>,
    });

    if (isLoading) return <ContratoWorkspaceSkeleton />;
    if (error || !workspace?.data) return <div className="p-8 text-center text-rose-600">Erro ao carregar workspace do contrato.</div>;

    const contrato = workspace.data.contrato;
    const empenhos = workspace.data.empenhos;
    const items = workspace.data.itens;
    const totalEmpenhado = empenhos.reduce((acc, e) => acc + Number(e.valor ?? 0), 0);
    const valorTotal = Number(contrato.valorTotal ?? contrato.valorGlobal ?? 0);
    const saldoDisponivel = Math.max(0, valorTotal - totalEmpenhado);
    const progressoFinanceiro = valorTotal > 0 ? Math.min(100, Math.round((totalEmpenhado / valorTotal) * 100)) : 0;

    return (
        <WorkspaceShell contentClassName="p-0">
            <WorkspaceHeader
                breadcrumbs={[
                    { label: "Contratos", href: `/org/${orgId}/${companyId}/contratos` },
                    { label: contrato.numeroContrato },
                ]}
                backHref={`/org/${orgId}/${companyId}/contratos`}
                title={`Contrato ${contrato.numeroContrato}`}
                status={
                    <Badge variant="outline" className="border-sky-100 bg-sky-50 text-sky-700">
                        {CONTRATO_STATUS_LABEL[contrato.status] ?? contrato.status}
                    </Badge>
                }
                metadata={
                    <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Criado em {formatDate(contrato.createdAt)}
                    </span>
                }
                actions={
                    <>
                        <Button variant="outline" className="rounded-lg" onClick={() => setIsEditOpen(true)}>
                            Editar Contrato
                        </Button>
                        <Button className="rounded-lg bg-slate-900" onClick={() => setIsCreateEmpenhoOpen(true)}>
                            <Plus className="mr-2 size-4" />
                            Novo Empenho
                        </Button>
                    </>
                }
            />

            <main className="flex-1 p-8">
                <WorkspaceMetricGrid className="lg:grid-cols-4">
                    <WorkspaceMetricCard
                        label="Valor Total"
                        value={formatCurrency(valorTotal)}
                        icon={<CircleDollarSign className="size-5 text-emerald-600" />}
                        description="Valor total do contrato"
                    />
                    <WorkspaceMetricCard
                        label="Total Empenhado"
                        value={formatCurrency(totalEmpenhado)}
                        icon={<FileText className="size-5 text-blue-600" />}
                        description={`${empenhos.length} notas de empenho`}
                    />
                    <WorkspaceMetricCard
                        label="Saldo Disponível"
                        value={formatCurrency(saldoDisponivel)}
                        icon={<Layers3 className="size-5 text-amber-600" />}
                        description="Saldo para novos empenhos"
                    />
                    <WorkspaceMetricCard
                        label="Itens"
                        value={items.length}
                        icon={<Layers3 className="size-5 text-slate-600" />}
                        description="Itens vinculados"
                    />
                </WorkspaceMetricGrid>

                <div className="mt-8">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-8">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium">Visão Geral</TabsTrigger>
                            <TabsTrigger value="items" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium">Itens ({items.length})</TabsTrigger>
                            <TabsTrigger value="empenhos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-medium">Empenhos ({empenhos.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                             <div className="grid gap-6 lg:grid-cols-3">
                                <div className="lg:col-span-2 space-y-6">
                                    <section className="bg-white rounded-2xl border p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Informações da Oportunidade</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs text-slate-400">Título</p>
                                                <p className="text-sm font-medium">{contrato.oportunidade?.title ?? workspace.data.oportunidade?.edital?.objeto ?? workspace.data.oportunidade?.licitacao?.objetoResumo ?? "Sem título"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Órgão</p>
                                                <p className="text-sm font-medium">{contrato.oportunidade?.orgaoNome ?? workspace.data.oportunidade?.edital?.orgaoRazaoSocial ?? workspace.data.oportunidade?.licitacao?.orgaoGerenciador?.razaoSocial ?? "Não informado"}</p>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-white rounded-2xl border p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Dados do Contrato</h3>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <InfoCell label="Processo" value={contrato.processo ?? "N/A"} />
                                            <InfoCell label="Assinatura" value={formatDate(contrato.dataAssinatura)} />
                                            <InfoCell label="Vigência" value={contrato.dataVigenciaFim ? `Até ${formatDate(contrato.dataVigenciaFim)}` : "N/A"} />
                                        </div>
                                        {contrato.objetoContrato && (
                                            <p className="mt-4 text-sm leading-6 text-slate-600">{contrato.objetoContrato}</p>
                                        )}
                                    </section>
                                </div>
                                <div className="space-y-6">
                                    <section className="bg-white rounded-2xl border p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Execução</h3>
                                        <div className="space-y-4">
                                            {/* Progress Bar placeholder */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Progresso Financeiro</span>
                                                    <span>{progressoFinanceiro}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-emerald-500 h-full" 
                                                        style={{ width: `${progressoFinanceiro}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                             </div>
                        </TabsContent>

                        <TabsContent value="items">
                            <div className="bg-white rounded-2xl border overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Item</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Descrição</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Qtd Contratada</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Qtd Empenhada</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.map((item: ContratoItem) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium">#{item.itemNumero}</td>
                                                <td className="px-6 py-4 text-slate-600 max-w-md truncate">{item.descricao}</td>
                                                <td className="px-6 py-4 text-right">{formatQuantity(item.quantidadeContratada)} {item.unidadeMedida}</td>
                                                <td className="px-6 py-4 text-right text-blue-600">{formatQuantity(item.quantidadeEmpenhada)}</td>
                                                <td className="px-6 py-4 text-right font-semibold">{formatQuantity(Number(item.quantidadeContratada ?? 0) - Number(item.quantidadeEmpenhada ?? 0))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TabsContent>

                        <TabsContent value="empenhos">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {empenhos.map((empenho: ContratoEmpenho) => (
                                    <Link 
                                        key={empenho.id}
                                        href={`/org/${orgId}/${companyId}/contratos/${contratoId}/empenhos/${empenho.id}`}
                                        className="bg-white rounded-2xl border p-5 hover:border-primary transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium">EMPENHO</p>
                                                <h4 className="font-bold text-slate-900 group-hover:text-primary">{empenho.numeroEmpenho}</h4>
                                            </div>
                                            <Badge className="rounded-lg">{empenho.status}</Badge>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Valor</span>
                                                <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(empenho.valor))}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Data</span>
                                                <span>{empenho.dataEmissao ? new Date(empenho.dataEmissao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-slate-400">
                                            <span>Ver detalhes e logística</span>
                                            <ChevronRight className="size-4" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <CreateEmpenhoDialog 
                open={isCreateEmpenhoOpen}
                onOpenChange={setIsCreateEmpenhoOpen}
                companyId={companyId}
                contratoId={contratoId}
                items={items}
            />

            <EditContratoDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                companyId={companyId}
                contrato={contrato}
            />
        </WorkspaceShell>
    );
}

function InfoCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

function formatQuantity(value: string | number | null | undefined) {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(num);
}

function ContratoWorkspaceSkeleton() {
    return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="h-20 bg-slate-200 rounded-2xl w-full" />
            <div className="grid grid-cols-4 gap-6">
                <div className="h-32 bg-slate-200 rounded-2xl" />
                <div className="h-32 bg-slate-200 rounded-2xl" />
                <div className="h-32 bg-slate-200 rounded-2xl" />
                <div className="h-32 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-96 bg-slate-200 rounded-2xl w-full" />
        </div>
    );
}
