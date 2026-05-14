"use client"

import { useState } from "react"
import { ClipboardList, FileText, FolderKanban, GitBranch, History, Landmark, PackageSearch, ReceiptText, ShieldCheck } from "lucide-react"
import { WorkspaceSidebarTabs } from "@/client/components/workspace"
import type { WorkspaceSidebarTabItem } from "@/client/components/workspace"
import type { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import type { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import type { OportunidadeBoardItem, UpdateOportunidadeDetailsPayload, WorkflowNode } from "@/client/features/licitacoes/services/use-licitacao.service"
import type { OportunidadeWorkspaceModel } from "../types/oportunidade-workspace"
import { OportunidadeDataModule } from "./modules/OportunidadeDataModule"
import { OportunidadeDocumentsModule } from "./modules/OportunidadeDocumentsModule"
import { OportunidadeExecutionModule } from "./modules/OportunidadeExecutionModule"
import { OportunidadeHistoryModule } from "./modules/OportunidadeHistoryModule"
import { OportunidadeItemsModule } from "./modules/OportunidadeItemsModule"
import { OportunidadeOrgaosModule } from "./modules/OportunidadeOrgaosModule"
import { OportunidadeOverviewModule } from "./modules/OportunidadeOverviewModule"
import { OportunidadeOwnerModule } from "./modules/OportunidadeOwnerModule"
import { OportunidadeRulesModule } from "./modules/OportunidadeRulesModule"
import { OportunidadeWorkflowModule } from "./modules/OportunidadeWorkflowModule"

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

type DocumentChatService = ReturnType<typeof useDocumentChatService>
type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

export function OportunidadeWorkspaceSections({
  workspace,
  item,
  companyId,
  oportunidadeId,
  phaseOptions,
  statusOptions,
  situationOptions,
  responsavelOptions,
  moveOptions,
  isMoving,
  isUpdating,
  isUpdatingDetails = false,
  documentsErrorMessage,
  documentsLoading = false,
  documentChatService,
  documentSummaryService,
  onQuickUpdate,
  onUpdateDetails,
  onMove,
}: {
  workspace: OportunidadeWorkspaceModel
  item: OportunidadeBoardItem
  companyId: string
  oportunidadeId: string
  phaseOptions: WorkflowNode[]
  statusOptions: WorkflowNode[]
  situationOptions: WorkflowNode[]
  responsavelOptions: Array<{ id: string; name: string; email: string }>
  moveOptions: MoveOption[]
  isMoving: boolean
  isUpdating: boolean
  isUpdatingDetails?: boolean
  documentsErrorMessage: string | null
  documentsLoading?: boolean
  documentChatService: DocumentChatService
  documentSummaryService: DocumentSummaryService
  onQuickUpdate: (patch: {
    responsavelUserId?: string | null
    phaseNodeId?: string
    statusNodeId?: string
    situationNodeId?: string
  }) => Promise<void>
  onUpdateDetails?: (patch: Omit<UpdateOportunidadeDetailsPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onMove: (targetNodeId: string) => Promise<void>
}) {
  const sections: WorkspaceSidebarTabItem[] = [
    { id: "overview", label: "Visão Geral", icon: <FolderKanban className="size-3.5" /> },
    { id: "data", label: "Dados", icon: <ClipboardList className="size-3.5" /> },
    {
      id: "documents",
      label: "Documentos",
      icon: <FileText className="size-3.5" />,
      badge: workspace.documentsSummary.total > 0 ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {workspace.documentsSummary.total}
        </span>
      ) : null,
    },
    { id: "rules", label: "Regras", icon: <ShieldCheck className="size-3.5" /> },
    {
      id: "items",
      label: "Itens",
      icon: <PackageSearch className="size-3.5" />,
      badge: workspace.licitacaoWorkspace?.edital?.itens.length ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {workspace.licitacaoWorkspace.edital.itens.length}
        </span>
      ) : null,
    },
    {
      id: "orgaos",
      label: "Órgãos",
      icon: <Landmark className="size-3.5" />,
      badge: workspace.licitacaoWorkspace?.edital?.orgaos.length ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {workspace.licitacaoWorkspace.edital.orgaos.length}
        </span>
      ) : null,
    },
    { id: "workflow", label: "Fluxo", icon: <GitBranch className="size-3.5" /> },
    { id: "execution", label: "Contratos", icon: <ReceiptText className="size-3.5" /> },
    { id: "history", label: "Histórico", icon: <History className="size-3.5" /> },
  ]
  const [activeSection, setActiveSection] = useState<string>("overview")

  return (
    <div className="flex min-h-0 rounded-lg border border-slate-200 bg-white">
      <WorkspaceSidebarTabs
        items={sections}
        activeId={activeSection}
        onChange={setActiveSection}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {activeSection === "overview" ? (
            <OportunidadeOverviewModule workspace={workspace} />
          ) : null}

          {activeSection === "data" ? (
            <OportunidadeDataModule
              workspace={workspace}
              isUpdating={isUpdatingDetails}
              onUpdateDetails={onUpdateDetails}
            />
          ) : null}

          {activeSection === "documents" ? (
            <OportunidadeDocumentsModule
              workspace={workspace}
              isLoading={documentsLoading}
              errorMessage={documentsErrorMessage}
              documentChatService={documentChatService}
              documentSummaryService={documentSummaryService}
            />
          ) : null}

          {activeSection === "rules" ? (
            <OportunidadeRulesModule workspace={workspace} />
          ) : null}

          {activeSection === "items" ? (
            <OportunidadeItemsModule workspace={workspace} />
          ) : null}

          {activeSection === "orgaos" ? (
            <OportunidadeOrgaosModule workspace={workspace} />
          ) : null}

          {activeSection === "workflow" ? (
            <div className="space-y-6">
              <OportunidadeWorkflowModule
                item={item}
                phaseOptions={phaseOptions}
                statusOptions={statusOptions}
                situationOptions={situationOptions}
                moveOptions={moveOptions}
                isMoving={isMoving}
                isUpdating={isUpdating}
                onQuickUpdate={onQuickUpdate}
                onMove={onMove}
              />
              <OportunidadeOwnerModule
                item={item}
                responsavelOptions={responsavelOptions}
                disabled={isMoving || isUpdating}
                onQuickUpdate={onQuickUpdate}
              />
            </div>
          ) : null}

          {activeSection === "execution" ? (
            <OportunidadeExecutionModule
              companyId={companyId}
              oportunidadeId={oportunidadeId}
            />
          ) : null}

          {activeSection === "history" ? (
            <OportunidadeHistoryModule workspace={workspace} />
          ) : null}
        </div>
      </div>
    </div>
  )
}
