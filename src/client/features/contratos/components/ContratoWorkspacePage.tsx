"use client"

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    AlertTriangle,
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    FolderKanban,
    HandCoins,
    PackageSearch,
    Pencil,
    Plus,
    ReceiptText,
    Truck,
} from "lucide-react";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Progress } from "@/client/components/ui/progress";
import { WorkspaceHeader, WorkspaceShell, WorkspaceSidebarTabs, type WorkspaceSidebarTabItem } from "@/client/components/workspace";
import { useCoreApi } from "@/client/hooks/use-core-api";
import { cn, formatCurrency, formatDate } from "@/client/main/lib/utils";
import { ContratoItemsDataTable } from "./ContratoItemsDataTable";
import { CreateEmpenhoDialog } from "./CreateEmpenhoDialog";
import { EditContratoDialog } from "./EditContratoDialog";
import {
    CONTRATO_STATUS_LABEL,
    type ContratoEmpenho,
    type ContratoItem,
    type ContratoWorkspaceResponse,
    type EmpenhoEntrega,
} from "../types";

type Summary = ReturnType<typeof buildContratoSummary>;
type ContratoSectionId = "overview" | "items" | "empenhos" | "entregas";
type EntregaSnapshot = EmpenhoEntrega & {
    empenhoId: string;
    empenhoNumero: string;
    itemDescricao: string | null;
};

export default function ContratoWorkspacePage() {
    const params = useParams();
    const [isCreateEmpenhoOpen, setIsCreateEmpenhoOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<ContratoSectionId>("overview");
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
    const availableItems = workspace.data.itensDisponiveis ?? [];
    const summary = buildContratoSummary(workspace.data);
    const entregas = buildEntregaSnapshots(empenhos);
    const sections: WorkspaceSidebarTabItem[] = [
        { id: "overview", label: "Visão Geral", icon: <FolderKanban className="size-3.5" /> },
        {
            id: "items",
            label: "Itens",
            icon: <PackageSearch className="size-3.5" />,
            badge: items.length > 0 ? <CountBadge value={items.length} /> : null,
        },
        {
            id: "empenhos",
            label: "Empenhos",
            icon: <ReceiptText className="size-3.5" />,
            badge: empenhos.length > 0 ? <CountBadge value={empenhos.length} /> : null,
        },
        {
            id: "entregas",
            label: "Entregas",
            icon: <Truck className="size-3.5" />,
            badge: entregas.length > 0 ? <CountBadge value={entregas.length} /> : null,
        },
    ];
    const oportunidadeTitle = contrato.oportunidade?.title
        ?? workspace.data.oportunidade?.edital?.objeto
        ?? workspace.data.oportunidade?.licitacao?.objetoResumo
        ?? "Oportunidade vinculada";
    const orgaoNome = contrato.orgaoContratante?.razaoSocial
        ?? contrato.oportunidade?.orgaoNome
        ?? workspace.data.oportunidade?.edital?.orgaoRazaoSocial
        ?? workspace.data.oportunidade?.licitacao?.orgaoGerenciador?.razaoSocial
        ?? "Órgão não informado";

    return (
        <WorkspaceShell className="bg-white" contentClassName="p-0">
            <WorkspaceHeader
                backHref={`/org/${orgId}/${companyId}/contratos`}
                title={`Contrato ${contrato.numeroContrato ?? "sem número"}`}
                className="border-slate-100 px-4 py-3 sm:px-6 lg:px-8"
                titleClassName="text-xl"
                status={
                    <Badge variant="outline" className={cn("rounded-full", getStatusClassName(contrato.status))}>
                        {CONTRATO_STATUS_LABEL[contrato.status] ?? contrato.status}
                    </Badge>
                }
                metadata={
                    <>
                        <span className="inline-flex items-center gap-1.5">
                            <ReceiptText className="size-4 text-slate-400" />
                            {orgaoNome}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="size-4 text-slate-400" />
                            Criado em {formatDate(contrato.createdAt)}
                        </span>
                    </>
                }
                actions={
                    <>
                        <Button variant="outline" className="rounded-lg" onClick={() => setIsEditOpen(true)}>
                            <Pencil className="mr-2 size-4" />
                            Editar
                        </Button>
                        <Button className="rounded-lg bg-slate-900" onClick={() => setIsCreateEmpenhoOpen(true)}>
                            <Plus className="mr-2 size-4" />
                            Novo Empenho
                        </Button>
                    </>
                }
            />

            <main className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
                <WorkspaceSidebarTabs
                    items={sections}
                    activeId={activeSection}
                    onChange={(id) => setActiveSection(id as ContratoSectionId)}
                    className="w-full lg:sticky lg:top-6 lg:h-fit lg:w-44 lg:pr-2"
                />

                <section className="min-w-0 flex-1">
                    {activeSection === "overview" ? (
                        <div className="space-y-6">
                            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    <MetricTile
                                        label="Contrato"
                                        value={formatCurrency(summary.valorContrato)}
                                        detail="Valor global"
                                        icon={<CircleDollarSign className="size-4" />}
                                    />
                                    <MetricTile
                                        label="Empenhado"
                                        value={formatCurrency(summary.totalEmpenhado)}
                                        detail={`${summary.financeiroPct}% do contrato`}
                                        icon={<HandCoins className="size-4" />}
                                        tone="blue"
                                    />
                                    <MetricTile
                                        label="Saldo a empenhar"
                                        value={formatCurrency(summary.saldoEmpenhar)}
                                        detail={`${summary.empenhosAtivos} empenho(s) ativo(s)`}
                                        icon={<ReceiptText className="size-4" />}
                                        tone="amber"
                                    />
                                    <MetricTile
                                        label="Entregas"
                                        value={`${summary.entregasConcluidas}/${summary.entregasTotal}`}
                                        detail={`${summary.entregaPct}% concluído`}
                                        icon={<Truck className="size-4" />}
                                        tone="emerald"
                                    />
                                </div>

                                <section className="rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Situação rápida</p>
                                            <h2 className="mt-2 text-lg font-bold text-slate-900">{summary.stage.label}</h2>
                                        </div>
                                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", summary.stage.className)}>
                                            {summary.stage.badge}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{summary.stage.description}</p>
                                    <div className="mt-4 space-y-3">
                                        <ProgressLine label="Financeiro" value={summary.financeiroPct} />
                                        <ProgressLine label="Itens empenhados" value={summary.itensPct} />
                                        <ProgressLine label="Entregas" value={summary.entregaPct} />
                                    </div>
                                </section>
                            </section>

                            <OverviewTab
                                contratoId={contratoId}
                                companyId={companyId}
                                orgId={orgId}
                                summary={summary}
                                contrato={contrato}
                                items={items}
                                empenhos={empenhos}
                                oportunidadeTitle={oportunidadeTitle}
                                orgaoNome={orgaoNome}
                            />
                        </div>
                    ) : null}

                    {activeSection === "items" ? (
                        <ContratoItemsDataTable
                            companyId={companyId}
                            contratoId={contratoId}
                            oportunidadeId={contrato.oportunidadeId}
                            items={items}
                            availableItems={availableItems}
                            onCreateEmpenho={() => setIsCreateEmpenhoOpen(true)}
                        />
                    ) : null}

                    {activeSection === "empenhos" ? (
                        <EmpenhosGrid orgId={orgId} companyId={companyId} contratoId={contratoId} empenhos={empenhos} />
                    ) : null}

                    {activeSection === "entregas" ? (
                        <EntregasGrid
                            orgId={orgId}
                            companyId={companyId}
                            contratoId={contratoId}
                            entregas={entregas}
                        />
                    ) : null}
                </section>
            </main>

            <CreateEmpenhoDialog
                open={isCreateEmpenhoOpen}
                onOpenChange={setIsCreateEmpenhoOpen}
                companyId={companyId}
                contratoId={contratoId}
                contrato={contrato}
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

function OverviewTab({
    contratoId,
    companyId,
    orgId,
    summary,
    contrato,
    items,
    empenhos,
    oportunidadeTitle,
    orgaoNome,
}: {
    contratoId: string;
    companyId: string;
    orgId: string;
    summary: Summary;
    contrato: ContratoWorkspaceResponse["data"]["contrato"];
    items: ContratoItem[];
    empenhos: ContratoEmpenho[];
    oportunidadeTitle: string;
    orgaoNome: string;
}) {
    return (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Informações da licitação</p>
                            <h2 className="mt-2 line-clamp-2 text-lg font-bold text-slate-950">{oportunidadeTitle}</h2>
                            <p className="mt-2 text-sm text-slate-600">{orgaoNome}</p>
                        </div>
                        <Badge variant="outline" className="w-fit rounded-full border-slate-200 bg-slate-50 text-slate-700">
                            {contrato.tipoContrato ?? "Contrato"}
                        </Badge>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <InfoCell label="Processo" value={contrato.processo ?? "N/A"} />
                        <InfoCell label="Assinatura" value={formatDate(contrato.dataAssinatura)} />
                        <InfoCell label="Vigência" value={contrato.dataVigenciaFim ? `Até ${formatDate(contrato.dataVigenciaFim)}` : "N/A"} />
                    </div>

                    {contrato.objetoContrato ? (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Objeto</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{contrato.objetoContrato}</p>
                        </div>
                    ) : null}
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Financeiro</p>
                            <h2 className="mt-2 text-lg font-bold text-slate-950">Empenhos, saldo e execução</h2>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{summary.financeiroPct}% empenhado</span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <MiniAmount label="Contrato" value={summary.valorContrato} />
                        <MiniAmount label="Empenhado" value={summary.totalEmpenhado} tone="blue" />
                        <MiniAmount label="Saldo" value={summary.saldoEmpenhar} tone="amber" />
                        <MiniAmount label="Entregue estim." value={summary.valorEntregue} tone="emerald" />
                        <MiniAmount label="A receber" value={summary.valorAReceber} />
                    </div>

                    <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                            <span>Progresso financeiro</span>
                            <span>{formatCurrency(summary.totalEmpenhado)} de {formatCurrency(summary.valorContrato)}</span>
                        </div>
                        <Progress value={summary.financeiroPct} className="h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600" />
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Itens críticos</p>
                            <h2 className="mt-1 text-lg font-bold text-slate-950">Saldo e andamento dos itens</h2>
                        </div>
                        <Badge variant="outline" className="rounded-full">
                            {summary.itensComSaldo} com saldo
                        </Badge>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {summary.itemSnapshots.slice(0, 5).map(item => (
                            <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">Item {item.numero ?? "-"} · {item.descricao}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Contratado {formatQuantity(item.quantidadeContratada)} · Empenhado {formatQuantity(item.quantidadeEmpenhada)} · Entregue {formatQuantity(item.quantidadeEntregue)}
                                    </p>
                                </div>
                                <ProgressLine label={`${item.percentual}%`} value={item.percentual} compact />
                            </div>
                        ))}
                        {items.length === 0 ? (
                            <div className="px-5 py-8 text-center text-sm text-slate-500">Nenhum item vinculado ao contrato.</div>
                        ) : null}
                    </div>
                </section>
            </div>

            <aside className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Vigência</p>
                    <div className="mt-4 grid gap-3">
                        <InfoCell label="Início" value={formatDate(contrato.dataVigenciaInicio)} />
                        <InfoCell label="Fim" value={formatDate(contrato.dataVigenciaFim)} />
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                            <p className="text-xs text-slate-500">Situação</p>
                            <p className={cn("mt-1 text-sm font-bold", summary.daysRemaining !== null && summary.daysRemaining <= 30 ? "text-amber-700" : "text-emerald-700")}>
                                {formatDaysRemaining(summary.daysRemaining)}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Próximas ações</p>
                    <div className="mt-4 space-y-3">
                        {summary.nextActions.map(action => (
                            <div key={action.label} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-3">
                                <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", action.className)}>
                                    {action.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Empenhos recentes</p>
                        <Link href={`/org/${orgId}/${companyId}/contratos/${contratoId}`} className="text-xs font-semibold text-slate-500">
                            {empenhos.length}
                        </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {empenhos.slice(0, 4).map(empenho => (
                            <Link
                                key={empenho.id}
                                href={`/org/${orgId}/${companyId}/contratos/${contratoId}/empenhos/${empenho.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{empenho.numeroEmpenho}</p>
                                    <p className="text-xs text-slate-500">{formatCurrency(empenho.valor)}</p>
                                </div>
                                <ChevronRight className="size-4 shrink-0 text-slate-400" />
                            </Link>
                        ))}
                        {empenhos.length === 0 ? (
                            <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">Nenhum empenho criado ainda.</p>
                        ) : null}
                    </div>
                </section>
            </aside>
        </div>
    );
}

function EntregasGrid({
    orgId,
    companyId,
    contratoId,
    entregas,
}: {
    orgId: string;
    companyId: string;
    contratoId: string;
    entregas: EntregaSnapshot[];
}) {
    if (entregas.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Nenhuma entrega registrada para os empenhos deste contrato.
            </div>
        );
    }

    return (
        <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Entregas</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">Pipeline consolidado do contrato</h2>
                </div>
                <Badge variant="outline" className="w-fit rounded-full border-slate-200 bg-slate-50 text-slate-700">
                    {entregas.length} registro(s)
                </Badge>
            </div>

            <div className="divide-y divide-slate-100">
                {entregas.map(entrega => (
                    <Link
                        key={entrega.id}
                        href={`/org/${orgId}/${companyId}/contratos/${contratoId}/empenhos/${entrega.empenhoId}`}
                        className="grid gap-3 px-5 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_180px_150px] md:items-center"
                    >
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={cn("rounded-full", getEntregaStatusClassName(entrega.status))}>
                                    {formatEntregaStatus(entrega.status)}
                                </Badge>
                                <span className="text-xs font-semibold text-slate-500">
                                    Empenho {entrega.empenhoNumero}
                                </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">
                                {entrega.itemDescricao ?? "Item do empenho"}
                            </p>
                            {entrega.observacoes ? (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{entrega.observacoes}</p>
                            ) : null}
                        </div>

                        <div className="text-sm">
                            <p className="text-xs font-medium text-slate-500">Quantidade</p>
                            <p className="mt-1 font-semibold text-slate-900">
                                {formatQuantity(entrega.quantidadeEntregue ?? entrega.quantidade)}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm md:justify-end">
                            <div className="text-left md:text-right">
                                <p className="text-xs font-medium text-slate-500">Criado em</p>
                                <p className="mt-1 font-semibold text-slate-900">{formatDate(entrega.createdAt)}</p>
                            </div>
                            <ChevronRight className="size-4 shrink-0 text-slate-400" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function EmpenhosGrid({
    orgId,
    companyId,
    contratoId,
    empenhos,
}: {
    orgId: string;
    companyId: string;
    contratoId: string;
    empenhos: ContratoEmpenho[];
}) {
    if (empenhos.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Nenhum empenho criado ainda.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {empenhos.map((empenho) => (
                <Link
                    key={empenho.id}
                    href={`/org/${orgId}/${companyId}/contratos/${contratoId}/empenhos/${empenho.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                    <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Empenho</p>
                            <h4 className="mt-1 truncate font-bold text-slate-900">{empenho.numeroEmpenho}</h4>
                        </div>
                        <Badge variant="outline" className="h-fit rounded-full">{empenho.status}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Valor</span>
                            <span className="font-semibold text-slate-900">{formatCurrency(empenho.valor)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Data</span>
                            <span>{formatDate(empenho.dataEmissao)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">Entregas</span>
                            <span>{empenho.entregas.length}</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                        <span>Ver detalhes</span>
                        <ArrowRight className="size-4" />
                    </div>
                </Link>
            ))}
        </div>
    );
}

function CountBadge({ value }: { value: number }) {
    return (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {value}
        </span>
    );
}

function MetricTile({
    label,
    value,
    detail,
    icon,
    tone = "slate",
}: {
    label: string;
    value: ReactNode;
    detail: ReactNode;
    icon: ReactNode;
    tone?: "slate" | "blue" | "amber" | "emerald";
}) {
    const toneClass = {
        slate: "bg-slate-100 text-slate-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-700",
        emerald: "bg-emerald-50 text-emerald-700",
    }[tone];

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    <div className="mt-2 truncate text-xl font-bold text-slate-950">{value}</div>
                    <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClass)}>
                    {icon}
                </div>
            </div>
        </section>
    );
}

function MiniAmount({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "blue" | "amber" | "emerald" }) {
    const toneClass = {
        slate: "border-slate-200 bg-slate-50",
        blue: "border-blue-100 bg-blue-50/70",
        amber: "border-amber-100 bg-amber-50/70",
        emerald: "border-emerald-100 bg-emerald-50/70",
    }[tone];

    return (
        <div className={cn("rounded-lg border px-3 py-3", toneClass)}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-950">{formatCurrency(value)}</p>
        </div>
    );
}

function ProgressLine({ label, value, compact = false }: { label: string; value: number; compact?: boolean }) {
    return (
        <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                <span>{label}</span>
                {!compact ? <span>{value}%</span> : null}
            </div>
            <Progress value={value} className="h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-slate-900" />
        </div>
    );
}

function InfoCell({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function buildContratoSummary(data: ContratoWorkspaceResponse["data"]) {
    const contrato = data.contrato;
    const items = data.itens;
    const empenhos = data.empenhos;
    const valorContrato = toNumber(contrato.valorTotal ?? contrato.valorGlobal);
    const totalEmpenhado = empenhos.reduce((acc, empenho) => acc + toNumber(empenho.valor), 0);
    const saldoEmpenhar = Math.max(0, valorContrato - totalEmpenhado);
    const financeiroPct = toPercent(totalEmpenhado, valorContrato);
    const empenhosAtivos = empenhos.filter(empenho => empenho.status !== "CANCELADO").length;
    const entregas = empenhos.flatMap(empenho => empenho.entregas ?? []);
    const entregasTotal = entregas.length;
    const entregasConcluidas = entregas.filter(entrega => isDoneEntregaStatus(entrega.status)).length;
    const entregaPct = toPercent(entregasConcluidas, entregasTotal);
    const totalQuantidadeContratada = items.reduce((acc, item) => acc + toNumber(item.quantidadeContratada), 0);
    const totalQuantidadeEmpenhada = items.reduce((acc, item) => acc + toNumber(item.quantidadeEmpenhada), 0);
    const itensPct = toPercent(totalQuantidadeEmpenhada, totalQuantidadeContratada);
    const itensComSaldo = items.filter(item => toNumber(item.quantidadeContratada) > toNumber(item.quantidadeEmpenhada)).length;
    const valorEntregue = items.reduce((acc, item) => acc + (toNumber(item.quantidadeEntregue) * toNumber(item.valorUnitario)), 0);
    const valorPago = items.reduce((acc, item) => acc + (toNumber(item.quantidadePaga) * toNumber(item.valorUnitario)), 0);
    const valorAReceber = Math.max(0, totalEmpenhado - valorPago);
    const daysRemaining = getDaysRemaining(contrato.dataVigenciaFim);
    const itemSnapshots = items.map(item => {
        const quantidadeContratada = toNumber(item.quantidadeContratada);
        const quantidadeEmpenhada = toNumber(item.quantidadeEmpenhada);
        return {
            id: item.id,
            numero: item.itemNumero,
            descricao: item.descricao,
            quantidadeContratada,
            quantidadeEmpenhada,
            quantidadeEntregue: toNumber(item.quantidadeEntregue),
            percentual: toPercent(quantidadeEmpenhada, quantidadeContratada),
        };
    }).sort((left, right) => left.percentual - right.percentual);

    return {
        valorContrato,
        totalEmpenhado,
        saldoEmpenhar,
        financeiroPct,
        empenhosAtivos,
        entregasTotal,
        entregasConcluidas,
        entregaPct,
        itensPct,
        itensComSaldo,
        valorEntregue,
        valorPago,
        valorAReceber,
        daysRemaining,
        itemSnapshots,
        stage: resolveStage({
            contratoStatus: contrato.status,
            totalEmpenhado,
            valorContrato,
            entregasTotal,
            entregasConcluidas,
            daysRemaining,
        }),
        nextActions: buildNextActions({
            totalEmpenhado,
            saldoEmpenhar,
            entregasTotal,
            entregasConcluidas,
            daysRemaining,
            itensComSaldo,
        }),
    };
}

function buildEntregaSnapshots(empenhos: ContratoEmpenho[]): EntregaSnapshot[] {
    return empenhos.flatMap(empenho =>
        (empenho.entregas ?? []).map(entrega => ({
            ...entrega,
            empenhoId: empenho.id,
            empenhoNumero: empenho.numeroEmpenho,
            itemDescricao: entrega.empenhoItem?.contratoItem?.descricao ?? null,
        })),
    ).sort((left, right) => {
        const leftDate = new Date(left.createdAt).getTime();
        const rightDate = new Date(right.createdAt).getTime();
        return rightDate - leftDate;
    });
}

function resolveStage(params: {
    contratoStatus: string;
    totalEmpenhado: number;
    valorContrato: number;
    entregasTotal: number;
    entregasConcluidas: number;
    daysRemaining: number | null;
}) {
    if (params.contratoStatus === "ENCERRADO") {
        return {
            label: "Contrato encerrado",
            badge: "Encerrado",
            description: "Acompanhe apenas saldos residuais, pagamentos e histórico.",
            className: "bg-slate-100 text-slate-700",
        };
    }

    if (params.daysRemaining !== null && params.daysRemaining <= 30) {
        return {
            label: "Vigência próxima do fim",
            badge: "Atenção",
            description: "Revise prorrogação, saldo e entregas pendentes antes do encerramento.",
            className: "bg-amber-100 text-amber-800",
        };
    }

    if (params.totalEmpenhado <= 0) {
        return {
            label: "Aguardando empenho",
            badge: "Inicial",
            description: "O contrato foi criado, mas ainda não há empenho registrado para iniciar a execução.",
            className: "bg-slate-100 text-slate-700",
        };
    }

    if (params.entregasTotal > 0 && params.entregasConcluidas < params.entregasTotal) {
        return {
            label: "Em execução logística",
            badge: "Entregas",
            description: "Existem entregas em andamento. O foco agora é acompanhar aceite e pendências.",
            className: "bg-blue-100 text-blue-800",
        };
    }

    return {
        label: "Execução em dia",
        badge: "Operando",
        description: "O contrato tem empenhos registrados e não há alerta crítico de vigência.",
        className: "bg-emerald-100 text-emerald-800",
    };
}

function buildNextActions(params: {
    totalEmpenhado: number;
    saldoEmpenhar: number;
    entregasTotal: number;
    entregasConcluidas: number;
    daysRemaining: number | null;
    itensComSaldo: number;
}) {
    const actions: Array<{
        label: string;
        description: string;
        icon: ReactNode;
        className: string;
    }> = [];

    if (params.totalEmpenhado <= 0) {
        actions.push({
            label: "Criar primeiro empenho",
            description: "Vincule itens e valores para iniciar a execução do contrato.",
            icon: <Plus className="size-4" />,
            className: "bg-blue-50 text-blue-700",
        });
    }

    if (params.saldoEmpenhar > 0 && params.itensComSaldo > 0) {
        actions.push({
            label: "Analisar saldo disponível",
            description: `${formatCurrency(params.saldoEmpenhar)} ainda pode virar empenho neste contrato.`,
            icon: <HandCoins className="size-4" />,
            className: "bg-amber-50 text-amber-700",
        });
    }

    if (params.entregasTotal > params.entregasConcluidas) {
        actions.push({
            label: "Acompanhar entregas",
            description: `${params.entregasTotal - params.entregasConcluidas} entrega(s) ainda precisam avançar.`,
            icon: <Truck className="size-4" />,
            className: "bg-emerald-50 text-emerald-700",
        });
    }

    if (params.daysRemaining !== null && params.daysRemaining <= 30) {
        actions.push({
            label: "Revisar vigência",
            description: "A data final está próxima. Confira prorrogação ou encerramento.",
            icon: <AlertTriangle className="size-4" />,
            className: "bg-rose-50 text-rose-700",
        });
    }

    if (actions.length === 0) {
        actions.push({
            label: "Contrato sem alertas",
            description: "Nenhuma ação urgente encontrada com os dados atuais.",
            icon: <CheckCircle2 className="size-4" />,
            className: "bg-emerald-50 text-emerald-700",
        });
    }

    return actions.slice(0, 4);
}

function toNumber(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value: number, total: number) {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Number(((value / total) * 100).toFixed(1))));
}

function getDaysRemaining(value: string | null | undefined) {
    if (!value) return null;
    const end = new Date(value).getTime();
    if (!Number.isFinite(end)) return null;
    return Math.ceil((end - Date.now()) / 86_400_000);
}

function isDoneEntregaStatus(status: string) {
    return ["ENTREGUE", "ACEITE_PROVISORIO", "ACEITE_DEFINITIVO", "PAGO"].includes(status);
}

function getEntregaStatusClassName(status: string) {
    switch (status) {
        case "PENDENTE":
            return "border-amber-100 bg-amber-50 text-amber-700";
        case "ENTREGUE":
            return "border-blue-100 bg-blue-50 text-blue-700";
        case "ACEITE_PROVISORIO":
        case "ACEITE_DEFINITIVO":
        case "PAGO":
            return "border-emerald-100 bg-emerald-50 text-emerald-700";
        case "REJEITADO":
            return "border-rose-100 bg-rose-50 text-rose-700";
        default:
            return "border-slate-200 bg-slate-50 text-slate-700";
    }
}

function formatEntregaStatus(status: string) {
    const labels: Record<string, string> = {
        PENDENTE: "Pendente",
        ENTREGUE: "Entregue",
        ACEITE_PROVISORIO: "Aceite provisório",
        ACEITE_DEFINITIVO: "Aceite definitivo",
        PAGO: "Pago",
        REJEITADO: "Rejeitado",
    };

    return labels[status] ?? status;
}

function formatDaysRemaining(value: number | null) {
    if (value === null) return "Sem data final";
    if (value < 0) return `${Math.abs(value)} dia(s) vencido`;
    if (value === 0) return "Vence hoje";
    return `${value} dia(s) restantes`;
}

function formatQuantity(value: string | number | null | undefined) {
    const num = Number(value ?? 0);
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 4 }).format(num);
}

function getStatusClassName(status: string) {
    switch (status) {
        case "VIGENTE":
            return "border-emerald-100 bg-emerald-50 text-emerald-700";
        case "RASCUNHO":
            return "border-slate-200 bg-slate-50 text-slate-700";
        case "ENCERRADO":
            return "border-blue-100 bg-blue-50 text-blue-700";
        case "RESCINDIDO":
        case "CANCELADO":
            return "border-rose-100 bg-rose-50 text-rose-700";
        default:
            return "border-slate-200 bg-slate-50 text-slate-700";
    }
}

function ContratoWorkspaceSkeleton() {
    return (
        <WorkspaceShell className="bg-white" contentClassName="p-0">
            <div className="border-b border-slate-200 bg-white px-8 py-6">
                <div className="h-7 w-72 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="space-y-6 px-8 py-6">
                <div className="grid gap-4 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-lg bg-slate-200" />
                    ))}
                </div>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
                </div>
            </div>
        </WorkspaceShell>
    );
}
