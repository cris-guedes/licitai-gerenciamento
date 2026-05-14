"use client"

import Link from "next/link"
import { Building2, CircleDollarSign, ExternalLink, Layers3 } from "lucide-react"
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
import { Skeleton } from "@/client/components/ui/skeleton"
import { WorkspacePanel } from "@/client/components/workspace"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useDocumentChatService } from "../../services/use-document-chat.service"
import { useDocumentSummaryService } from "../../services/use-document-summary.service"
import { buildOportunidadeWorkspaceModel, formatCurrency, formatStatusLabel, isWorkflowNodeDescendant, sortWorkflowNodes } from "@/client/features/oportunidades/lib/oportunidade-workspace"
import { OportunidadeWorkspaceSections } from "@/client/features/oportunidades/components/OportunidadeWorkspaceSections"
import type {
  LicitacaoWorkspaceResponse,
  OportunidadeBoardItem,
  WorkflowNode,
} from "../../services/use-licitacao.service"

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
  const api = useCoreApi()
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
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

  const workspaceModel = item
    ? buildOportunidadeWorkspaceModel({
      companyId: workspace?.companyId ?? "",
      item,
      workspace,
    })
    : null

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
            <div className="border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex min-h-12 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="min-w-0 max-w-full truncate text-base font-semibold text-primary lg:max-w-[640px]">
                      {item.title}
                    </h2>
                    <Badge variant="secondary" className="rounded-full bg-sky-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.06em] text-sky-800">
                      {formatStatusLabel(item.oportunidadeStatus)}
                    </Badge>
                    {item.workflow.phase ? (
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2 py-0.5 text-[0.65rem] text-slate-700">
                        {item.workflow.phase.label}
                      </Badge>
                    ) : null}
                    {item.workflow.situation ? (
                      <Badge variant="outline" className="rounded-full border-rose-100 bg-rose-50 px-2 py-0.5 text-[0.65rem] text-rose-700">
                        {item.workflow.situation.label}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {item.modalidade ? <span>{item.modalidade}</span> : null}
                    {item.numero ? <span>{item.numero}</span> : null}
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-slate-400" />
                      {item.orgaoNome ?? "Órgão não identificado"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CircleDollarSign className="size-3.5 text-slate-400" />
                      {formatCurrency(item.valorEstimado) ?? "Valor a definir"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers3 className="size-3.5 text-slate-400" />
                      {item.itemCount} item{item.itemCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {workspaceHref ? (
                    <Button asChild variant="outline" size="sm" className="rounded-lg">
                      <Link href={workspaceHref}>
                        Abrir workspace
                        <ExternalLink className="ml-2 size-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => onOpenChange(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="px-4 py-4 sm:px-5">
                {isLoading || !workspaceModel ? (
                  <OportunidadeDetailSkeleton />
                ) : (
                  <OportunidadeWorkspaceSections
                    workspace={workspaceModel}
                    item={item}
                    companyId={workspaceModel.companyId}
                    oportunidadeId={item.oportunidadeId}
                    phaseOptions={phaseOptions}
                    statusOptions={statusOptions}
                    situationOptions={situationOptions}
                    responsavelOptions={responsavelOptions}
                    moveOptions={moveOptions}
                    isMoving={isMoving}
                    isUpdating={isUpdating}
                    documentsLoading={false}
                    documentsErrorMessage={errorMessage}
                    documentChatService={documentChatService}
                    documentSummaryService={documentSummaryService}
                    onQuickUpdate={onQuickUpdate}
                    onMove={onMove}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function OportunidadeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <WorkspacePanel>
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>
      </WorkspacePanel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
