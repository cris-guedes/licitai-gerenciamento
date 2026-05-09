"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  Building2,
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Layers3,
  Target,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { ScrollArea } from "@/client/components/ui/scroll-area"
import { Separator } from "@/client/components/ui/separator"
import { Skeleton } from "@/client/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { cn } from "@/client/main/lib/utils"
import type {
  LicitacaoWorkspaceResponse,
  OportunidadeBoardItem,
  WorkflowNode,
} from "../../services/use-licitacao.service"
import { OportunidadeWorkflowActions } from "./OportunidadeWorkflowActions"

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

type ResponsavelOption = {
  id: string
  name: string
  email: string
}

type WorkflowMetadata = {
  boardColumnKindKey: string
  primaryBadgeKindKey: string
  secondaryBadgeKindKey: string
}

type QuickUpdatePatch = {
  responsavelUserId?: string | null
  phaseNodeId?: string
  statusNodeId?: string
  situationNodeId?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: OportunidadeBoardItem | null
  workspace: LicitacaoWorkspaceResponse | null
  isLoading: boolean
  errorMessage: string | null
  moveOptions: MoveOption[]
  isMoving: boolean
  isUpdating: boolean
  responsavelOptions: ResponsavelOption[]
  workflowNodes: WorkflowNode[]
  workflowMetadata: WorkflowMetadata
  onQuickUpdate: (patch: QuickUpdatePatch) => Promise<void>
  onMove: (targetNodeId: string) => Promise<void>
  workspaceHref: string | null
}

const UNASSIGNED_RESPONSAVEL_VALUE = "__unassigned"
const EMPTY_PHASE_VALUE = "__empty_phase"
const EMPTY_STATUS_VALUE = "__empty_status"
const EMPTY_SITUATION_VALUE = "__empty_situation"

export function OportunidadeDetailDialog({
  open,
  onOpenChange,
  item,
  workspace,
  isLoading,
  errorMessage,
  moveOptions,
  isMoving,
  isUpdating,
  responsavelOptions,
  workflowNodes,
  workflowMetadata,
  onQuickUpdate,
  onMove,
  workspaceHref,
}: Props) {
  const draftPreview = workspace?.oportunidade.draftPreview ?? workspace?.licitacao.draftPreview ?? null
  const resumo = item?.objetoResumo ?? draftPreview?.objetoResumo ?? null
  const documentCount = workspace?.documents.length ?? 0
  const readyDocuments = workspace?.documents.filter(document => document.status === "READY").length ?? 0
  const processingDocuments = workspace?.documents.filter(document => document.status === "PROCESSING").length ?? 0
  const failedDocuments = workspace?.documents.filter(document => document.status === "FAILED").length ?? 0
  const workspaceUpdatedAt = workspace?.licitacao.updatedAt ?? workspace?.oportunidade.updatedAt ?? null
  const controlsDisabled = isMoving || isUpdating
  const workflowNodeById = new Map(workflowNodes.map(node => [node.id, node]))
  const currentPhaseId = item?.workflow.phase?.id ?? null
  const currentStatusId = item?.workflow.status?.id ?? null
  const phaseOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.boardColumnKindKey)
    .sort(sortWorkflowNodes)
  const statusOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.primaryBadgeKindKey)
    .filter(node => currentPhaseId ? isWorkflowNodeDescendant(node, currentPhaseId, workflowNodeById) : true)
    .sort(sortWorkflowNodes)
  const situationOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.secondaryBadgeKindKey)
    .filter(node => {
      if (currentStatusId) return isWorkflowNodeDescendant(node, currentStatusId, workflowNodeById)
      if (currentPhaseId) return isWorkflowNodeDescendant(node, currentPhaseId, workflowNodeById)
      return true
    })
    .sort(sortWorkflowNodes)
  const phaseValue = currentPhaseId && phaseOptions.some(option => option.id === currentPhaseId)
    ? currentPhaseId
    : EMPTY_PHASE_VALUE
  const statusValue = currentStatusId && statusOptions.some(option => option.id === currentStatusId)
    ? currentStatusId
    : EMPTY_STATUS_VALUE
  const currentSituationId = item?.workflow.situation?.id ?? null
  const situationValue = currentSituationId && situationOptions.some(option => option.id === currentSituationId)
    ? currentSituationId
    : EMPTY_SITUATION_VALUE
  const responsavelSelectOptions = getResponsavelOptions(responsavelOptions, item?.responsavel ?? null)
  const responsavelValue = item?.responsavel?.id ?? UNASSIGNED_RESPONSAVEL_VALUE

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[92vh] max-w-none overflow-hidden border-0 bg-white p-0 shadow-[0_30px_80px_rgba(4,22,39,0.18)]"
        style={{
          width: "min(1420px, calc(100vw - 1.5rem))",
          maxWidth: "min(1420px, calc(100vw - 1.5rem))",
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Detalhes da oportunidade</DialogTitle>
          <DialogDescription>
            Acompanhe o contexto, os documentos e o estado atual da oportunidade.
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] px-6 py-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.modalidade ? (
                      <Badge className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white shadow-none">
                        {item.modalidade}
                      </Badge>
                    ) : null}
                    {item.numero ? (
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-slate-600">
                        {item.numero}
                      </Badge>
                    ) : null}
                    <Badge variant="secondary" className="rounded-full bg-sky-100 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-sky-800">
                      {formatStatusLabel(item.oportunidadeStatus)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-primary">
                      {item.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="size-4 text-slate-400" />
                        {item.orgaoNome ?? "Órgão não identificado"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-slate-400" />
                        {formatCurrency(item.valorEstimado) ?? "Valor estimado a definir"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Layers3 className="size-4 text-slate-400" />
                        {item.itemCount} item{item.itemCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.workflow.phase ? (
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                        Fase: {item.workflow.phase.label}
                      </Badge>
                    ) : null}
                    {item.workflow.status ? (
                      <Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                        Status: {item.workflow.status.label}
                      </Badge>
                    ) : null}
                    {item.workflow.situation ? (
                      <Badge variant="outline" className="rounded-full border-rose-100 bg-rose-50 px-2.5 py-1 text-rose-700">
                        Situação: {item.workflow.situation.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {workspaceHref ? (
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href={workspaceHref}>
                        Abrir workspace
                        <ExternalLink className="ml-2 size-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
              </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_330px]">
              <ScrollArea className="min-h-0 border-r border-slate-200">
                <div className="px-6 py-6">
                  <Tabs defaultValue="overview" className="space-y-5">
                    <TabsList variant="line" className="h-10 w-full justify-start border-b border-slate-200 p-0">
                      <TabsTrigger value="overview" className="h-10 flex-none rounded-none px-0 text-sm">
                        Visão geral
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="ml-6 h-10 flex-none rounded-none px-0 text-sm">
                        Documentos
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {documentCount}
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <section className="rounded-2xl border border-slate-200 bg-white">
                        <div className="space-y-4 px-5 py-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Resumo da oportunidade
                            </p>
                            <p className="mt-3 text-sm leading-7 text-slate-700">
                              {resumo ?? "Ainda não há um resumo estruturado para esta oportunidade."}
                            </p>
                          </div>

                          <Separator />

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Valor estimado</p>
                              <p className="mt-2 text-sm font-semibold text-primary">
                                {formatCurrency(item.valorEstimado) ?? "A definir"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Itens</p>
                              <p className="mt-2 text-sm font-semibold text-primary">
                                {item.itemCount} item{item.itemCount === 1 ? "" : "s"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Criada em</p>
                              <p className="mt-2 text-sm font-semibold text-primary">{formatDate(item.createdAt)}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Última atualização</p>
                              <p className="mt-2 text-sm font-semibold text-primary">
                                {formatDate(item.workflow.updatedAt ?? item.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white">
                        <div className="space-y-4 px-5 py-5">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Atividade
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Uma leitura rápida do momento da oportunidade, sem virar uma timeline gigante agora.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                <Target className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-primary">Oportunidade criada</p>
                                <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                                <CalendarClock className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-primary">Última movimentação no workflow</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {formatDate(item.workflow.updatedAt ?? item.updatedAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <FileText className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-primary">Workspace sincronizado</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {workspaceUpdatedAt ? formatDate(workspaceUpdatedAt) : "Ainda não houve sincronização adicional."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0">
                      <section className="rounded-2xl border border-slate-200 bg-white">
                        <div className="space-y-4 px-5 py-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Documentos e contexto
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Edital, anexos e o material já recuperado no workspace desta oportunidade.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                              <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
                                {documentCount} documento{documentCount === 1 ? "" : "s"}
                              </Badge>
                              <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                                {readyDocuments} prontos
                              </Badge>
                              <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
                                {processingDocuments} processando
                              </Badge>
                              {failedDocuments > 0 ? (
                                <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
                                  {failedDocuments} com falha
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          {isLoading ? (
                            <div className="space-y-3">
                              <Skeleton className="h-24 rounded-2xl" />
                              <Skeleton className="h-24 rounded-2xl" />
                              <Skeleton className="h-24 rounded-2xl" />
                            </div>
                          ) : errorMessage ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                              {errorMessage}
                            </div>
                          ) : workspace?.documents.length ? (
                            <div className="space-y-3">
                              {workspace.documents.map(document => (
                                <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                                          <FileText className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-semibold text-primary">
                                            {document.displayName ?? document.originalName}
                                          </p>
                                          <p className="mt-1 truncate text-xs text-slate-500">
                                            {formatDocumentType(document.type)} · {formatBytes(document.sizeBytes)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                        <span>Enviado em {formatDate(document.uploadedAt)}</span>
                                        <span>{describeAnalyses(document)}</span>
                                      </div>
                                    </div>

                                    <Badge className={cn("rounded-full shadow-none", getDocumentStatusClassName(document.status))}>
                                      {formatStatusLabel(document.status)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-muted-foreground">
                              Ainda não há documentos vinculados a esta oportunidade.
                            </div>
                          )}
                        </div>
                      </section>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>

              <ScrollArea className="h-full min-h-0 overflow-hidden bg-slate-50/55">
                <div className="space-y-4 px-5 py-6">
                  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workflow atual
                    </p>
                    <div className="mt-4 space-y-3">
                      <SidebarSelectField
                        label="Fase"
                        value={phaseValue}
                        disabled={controlsDisabled || phaseOptions.length === 0}
                        onValueChange={nodeId => {
                          if (nodeId === EMPTY_PHASE_VALUE || nodeId === item.workflow.phase?.id) return
                          void onQuickUpdate({ phaseNodeId: nodeId })
                        }}
                      >
                        <SelectItem value={EMPTY_PHASE_VALUE} disabled>
                          {item.workflow.phase?.label ?? "Sem fase"}
                        </SelectItem>
                        {phaseOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SidebarSelectField>

                      <SidebarSelectField
                        label="Status"
                        value={statusValue}
                        disabled={controlsDisabled || statusOptions.length === 0}
                        onValueChange={nodeId => {
                          if (nodeId === EMPTY_STATUS_VALUE || nodeId === item.workflow.status?.id) return
                          void onQuickUpdate({ statusNodeId: nodeId })
                        }}
                      >
                        <SelectItem value={EMPTY_STATUS_VALUE} disabled>
                          {item.workflow.status?.label ?? "Sem status"}
                        </SelectItem>
                        {statusOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SidebarSelectField>

                      <SidebarSelectField
                        label="Situação"
                        value={situationValue}
                        disabled={controlsDisabled || situationOptions.length === 0}
                        onValueChange={nodeId => {
                          if (nodeId === EMPTY_SITUATION_VALUE || nodeId === item.workflow.situation?.id) return
                          void onQuickUpdate({ situationNodeId: nodeId })
                        }}
                      >
                        <SelectItem value={EMPTY_SITUATION_VALUE} disabled>
                          {item.workflow.situation?.label ?? "Sem situação"}
                        </SelectItem>
                        {situationOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SidebarSelectField>

                      <Separator />

                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Próximos passos
                      </p>
                      <OportunidadeWorkflowActions
                        item={item}
                        moveOptions={moveOptions}
                        isMoving={controlsDisabled}
                        onMove={onMove}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Responsável
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Avatar size="lg">
                        <AvatarFallback>{initials(item.responsavel?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-primary">
                          {item.responsavel?.name ?? "Sem responsável"}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {item.responsavel?.email ?? "Aguardando atribuição"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Select
                        value={responsavelValue}
                        disabled={controlsDisabled}
                        onValueChange={value => {
                          const nextResponsavelId = value === UNASSIGNED_RESPONSAVEL_VALUE ? null : value
                          if ((item.responsavel?.id ?? null) === nextResponsavelId) return
                          void onQuickUpdate({ responsavelUserId: nextResponsavelId })
                        }}
                      >
                        <SelectTrigger size="sm" className="h-10 rounded-xl border-slate-200 bg-white shadow-none">
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent align="start" className="max-h-72">
                          <SelectItem value={UNASSIGNED_RESPONSAVEL_VALUE}>Sem responsável</SelectItem>
                          {responsavelSelectOptions.map(responsavel => (
                            <SelectItem key={responsavel.id} value={responsavel.id}>
                              <span className="min-w-0 truncate">
                                {responsavel.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Dados-chave
                    </p>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">Oportunidade</dt>
                        <dd className="text-right font-medium text-primary">{formatStatusLabel(item.oportunidadeStatus)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">Licitação</dt>
                        <dd className="text-right font-medium text-primary">{formatStatusLabel(workspace?.licitacao.status)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">Edital</dt>
                        <dd className="text-right font-medium text-primary">{formatStatusLabel(workspace?.edital?.status)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">Valor estimado</dt>
                        <dd className="text-right font-medium text-primary">{formatCurrency(item.valorEstimado) ?? "A definir"}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">Itens</dt>
                        <dd className="text-right font-medium text-primary">{item.itemCount}</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Metadados
                    </p>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">ID da oportunidade</dt>
                        <dd className="max-w-[160px] break-all text-right font-medium text-primary">{item.oportunidadeId}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">ID da licitação</dt>
                        <dd className="max-w-[160px] break-all text-right font-medium text-primary">{item.licitacaoId ?? "Não gerado"}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-muted-foreground">ID do edital</dt>
                        <dd className="max-w-[160px] break-all text-right font-medium text-primary">{item.editalId ?? "Não gerado"}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function SidebarSelectField({
  label,
  value,
  disabled,
  onValueChange,
  children,
}: {
  label: string
  value: string
  disabled: boolean
  onValueChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <Select value={value} disabled={disabled} onValueChange={onValueChange}>
        <SelectTrigger size="sm" className="h-10 rounded-xl border-slate-200 bg-white shadow-none">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent align="start" className="max-h-72">
          {children}
        </SelectContent>
      </Select>
    </div>
  )
}

function getResponsavelOptions(
  options: ResponsavelOption[],
  current: OportunidadeBoardItem["responsavel"],
) {
  const byId = new Map<string, ResponsavelOption>()

  for (const option of options) byId.set(option.id, option)
  if (current) byId.set(current.id, current)

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function sortWorkflowNodes(a: WorkflowNode, b: WorkflowNode) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function isWorkflowNodeDescendant(
  node: WorkflowNode,
  ancestorNodeId: string,
  nodeById: Map<string, WorkflowNode>,
) {
  let cursor: WorkflowNode | null = node

  while (cursor) {
    if (cursor.id === ancestorNodeId) return true
    cursor = cursor.parentId ? nodeById.get(cursor.parentId) ?? null : null
  }

  return false
}

function formatDate(date: string | null) {
  if (!date) return "Sem data"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

function formatCurrency(value: string | null) {
  if (!value) return null

  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return null

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(numericValue)
}

function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "Sem status"

  const labels: Record<string, string> = {
    ACTIVE: "Ativa",
    CANCELLED: "Cancelada",
    COMPLETED: "Concluída",
    DRAFT: "Rascunho",
    FAILED: "Falhou",
    IN_PROGRESS: "Em andamento",
    PROCESSING: "Processando",
    READY: "Pronto",
  }

  return labels[status] ?? status
}

function formatDocumentType(type: string) {
  const labels: Record<string, string> = {
    EDITAL: "Edital",
    ANEXO: "Anexo",
    OUTRO: "Outro",
  }

  return labels[type] ?? type
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function initials(name: string | undefined) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getDocumentStatusClassName(status: string) {
  const tones: Record<string, string> = {
    FAILED: "border border-rose-200 bg-rose-50 text-rose-700",
    PROCESSING: "border border-amber-200 bg-amber-50 text-amber-700",
    READY: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  }

  return tones[status] ?? "border border-slate-200 bg-slate-50 text-slate-700"
}

function describeAnalyses(document: NonNullable<LicitacaoWorkspaceResponse["documents"]>[number]) {
  if (document.analyses.length === 0) return "Sem análises salvas"

  const completed = document.analyses.filter(analysis => analysis.status === "COMPLETED").length
  const running = document.analyses.filter(analysis => analysis.status === "RUNNING").length
  const failed = document.analyses.filter(analysis => analysis.status === "FAILED").length

  const parts = [
    completed > 0 ? `${completed} concluída${completed === 1 ? "" : "s"}` : null,
    running > 0 ? `${running} em andamento` : null,
    failed > 0 ? `${failed} com falha` : null,
  ].filter(Boolean)

  return parts.join(" · ") || `${document.analyses.length} análise(s)`
}
