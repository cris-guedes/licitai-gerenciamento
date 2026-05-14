"use client"

import type { ReactNode } from "react"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import type {
  LicitacaoWorkspaceResponse,
  OportunidadeBoardItem,
  WorkflowNode,
} from "@/client/features/licitacoes/services/use-licitacao.service"
import type { OportunidadeWorkspaceModel } from "../types/oportunidade-workspace"

export const UNASSIGNED_RESPONSAVEL_VALUE = "__unassigned"
export const EMPTY_PHASE_VALUE = "__empty_phase"
export const EMPTY_STATUS_VALUE = "__empty_status"
export const EMPTY_SITUATION_VALUE = "__empty_situation"

export function buildOportunidadeWorkspaceModel(params: {
  companyId: string
  item: OportunidadeBoardItem
  workspace: LicitacaoWorkspaceResponse | null
}): OportunidadeWorkspaceModel {
  const { companyId, item, workspace } = params
  const resumo = item.objetoResumo ?? workspace?.oportunidade.draftPreview?.objetoResumo ?? workspace?.licitacao.draftPreview?.objetoResumo ?? null
  const documents = workspace?.documents ?? []
  const ready = documents.filter(document => document.status === "READY").length
  const processing = documents.filter(document => document.status === "PROCESSING").length
  const failed = documents.filter(document => document.status === "FAILED").length

  return {
    companyId,
    oportunidade: item,
    licitacaoWorkspace: workspace,
    resumo,
    latestSyncAt: workspace?.licitacao.updatedAt ?? workspace?.oportunidade.updatedAt ?? null,
    documents,
    documentsSummary: {
      total: documents.length,
      ready,
      processing,
      failed,
    },
    registration: {
      oportunidadeStatus: item.oportunidadeStatus,
      licitacaoStatus: workspace?.licitacao.status ?? null,
      editalStatus: workspace?.edital?.status ?? null,
      hasLicitacao: Boolean(item.licitacaoId),
      hasEdital: Boolean(item.editalId),
      hasDocuments: documents.length > 0,
      hasReadyDocuments: ready > 0,
    },
  }
}

export function buildOportunidadeWorkspacePreview(params: {
  companyId: string
  item: OportunidadeBoardItem
}): OportunidadeWorkspaceModel {
  return buildOportunidadeWorkspaceModel({
    companyId: params.companyId,
    item: params.item,
    workspace: null,
  })
}

export function formatDate(date: string | null) {
  if (!date) return "Sem data"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

export function formatCurrency(value: string | null) {
  if (!value) return null

  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return null

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(numericValue)
}

export function formatStatusLabel(status: string | null | undefined) {
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

export function formatDocumentType(type: string) {
  const labels: Record<string, string> = {
    EDITAL: "Edital",
    ANEXO: "Anexo",
    OUTRO: "Outro",
  }

  return labels[type] ?? type
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function initials(name: string | undefined) {
  if (!name) return "?"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function getDocumentStatusClassName(status: string) {
  const tones: Record<string, string> = {
    FAILED: "border border-rose-200 bg-rose-50 text-rose-700",
    PROCESSING: "border border-amber-200 bg-amber-50 text-amber-700",
    READY: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  }

  return tones[status] ?? "border border-slate-200 bg-slate-50 text-slate-700"
}

export function describeAnalyses(document: NonNullable<LicitacaoWorkspaceResponse["documents"]>[number]) {
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

export function sortWorkflowNodes(a: WorkflowNode, b: WorkflowNode) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

export function isWorkflowNodeDescendant(
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

export function getResponsavelOptions(
  options: Array<{ id: string; name: string; email: string }>,
  current: OportunidadeBoardItem["responsavel"],
) {
  const byId = new Map<string, { id: string; name: string; email: string }>()

  for (const option of options) byId.set(option.id, option)
  if (current) byId.set(current.id, current)

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export function SidebarSelectField({
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
