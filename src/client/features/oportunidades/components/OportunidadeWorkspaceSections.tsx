"use client"

import { useState } from "react"
import { CalendarDays, ClipboardList, FileText, FolderKanban, Landmark, PackageSearch, ReceiptText, ShieldCheck } from "lucide-react"
import { WorkspaceSidebarTabs } from "@/client/components/workspace"
import type { WorkspaceSidebarTabItem } from "@/client/components/workspace"
import { cn } from "@/client/main/lib/utils"
import type { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import type { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import type { OportunidadeBoardItem, UpdateOportunidadeDetailsPayload, UpdateOportunidadeItemPayload, WorkflowNode } from "@/client/features/licitacoes/services/use-licitacao.service"
import { OportunidadeHabilitacaoModule } from "./modules/OportunidadeHabilitacaoModule"
import type { OportunidadeWorkspaceModel } from "../types/oportunidade-workspace"
import { OportunidadeScheduleModule } from "./modules/OportunidadeScheduleModule"
import { OportunidadeDataModule } from "./modules/OportunidadeDataModule"
import { OportunidadeDocumentsModule } from "./modules/OportunidadeDocumentsModule"
import { OportunidadeExecutionModule } from "./modules/OportunidadeExecutionModule"
import { OportunidadeItemsModule } from "./modules/OportunidadeItemsModule"
import { OportunidadeOrgaosModule } from "./modules/OportunidadeOrgaosModule"
import { OportunidadeOverviewModule } from "./modules/OportunidadeOverviewModule"
import { OportunidadeRulesModule } from "./modules/OportunidadeRulesModule"

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
  isUpdatingItem = false,
  documentsErrorMessage,
  documentsLoading = false,
  documentChatService,
  documentSummaryService,
  onQuickUpdate,
  onUpdateItem = async () => {},
  onCreateItem = async () => {},
  onDeleteItem = async () => {},
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
  isUpdatingItem?: boolean
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
  onUpdateItem?: (payload: Omit<UpdateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onCreateItem?: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").CreateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onDeleteItem?: (payload: Omit<import("@/client/features/licitacoes/services/use-licitacao.service").DeleteOportunidadeItemPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onUpdateDetails?: (patch: Omit<UpdateOportunidadeDetailsPayload, "companyId" | "oportunidadeId">) => Promise<void>
  onMove: (targetNodeId: string) => Promise<void>
}) {
  const cronogramaCount = [
    workspace.licitacaoWorkspace?.licitacao.dataPublicacao,
    workspace.licitacaoWorkspace?.edital?.cronograma?.acolhimentoInicio,
    workspace.licitacaoWorkspace?.edital?.cronograma?.acolhimentoFim,
    workspace.licitacaoWorkspace?.edital?.cronograma?.esclarecimentosAte,
    workspace.licitacaoWorkspace?.edital?.cronograma?.impugnacaoAte,
    workspace.licitacaoWorkspace?.edital?.dataAbertura ?? workspace.licitacaoWorkspace?.licitacao.dataAberturaProposta,
    workspace.licitacaoWorkspace?.edital?.cronograma?.sessaoPublicaEm,
    workspace.licitacaoWorkspace?.edital?.dataEncerramento ?? workspace.licitacaoWorkspace?.licitacao.dataEncerramentoProposta,
  ].filter(Boolean).length

  const sections: WorkspaceSidebarTabItem[] = [
    { id: "overview", label: "Visão Geral", icon: <FolderKanban className="size-3.5" /> },
    {
      id: "schedule",
      label: "Cronograma",
      icon: <CalendarDays className="size-3.5" />,
      badge: cronogramaCount > 0 ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {cronogramaCount}
        </span>
      ) : null,
    },
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
    {
      id: "qualification",
      label: "Habilitação",
      icon: <ShieldCheck className="size-3.5" />,
      badge: workspace.qualificationSummary.total > 0 ? (
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
          {workspace.qualificationSummary.total}
        </span>
      ) : null,
    },
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
    { id: "execution", label: "Contratos", icon: <ReceiptText className="size-3.5" /> },
  ]
  const [activeSection, setActiveSection] = useState<string>("overview")
  const isFullHeightSection = activeSection === "overview" || activeSection === "documents"

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-transparent">
      <WorkspaceSidebarTabs
        items={sections}
        activeId={activeSection}
        onChange={setActiveSection}
        className="pr-2"
      />

      <div className={cn("min-h-0 flex-1 min-w-0 overflow-y-auto overflow-x-hidden", isFullHeightSection && "overflow-hidden")}>
        <div className={cn("px-3 py-3 sm:px-4 sm:py-4", isFullHeightSection && "min-h-0 h-full")}>
          {activeSection === "overview" ? (
            <OportunidadeOverviewModule
              workspace={workspace}
              item={item}
              companyId={companyId}
              oportunidadeId={oportunidadeId}
              phaseOptions={phaseOptions}
              statusOptions={statusOptions}
              situationOptions={situationOptions}
              responsavelOptions={responsavelOptions}
              moveOptions={moveOptions}
              isMoving={isMoving}
              isUpdating={isUpdating}
              onQuickUpdate={onQuickUpdate}
              onMove={onMove}
            />
          ) : null}

          {activeSection === "data" ? (
            <OportunidadeDataModule
              workspace={workspace}
              isUpdating={isUpdatingDetails}
              onUpdateDetails={onUpdateDetails}
            />
          ) : null}

          {activeSection === "schedule" ? (
            <OportunidadeScheduleModule workspace={workspace} />
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

          {activeSection === "qualification" ? (
            <div className="space-y-4">
              <OportunidadeHabilitacaoModule workspace={workspace} />
              <OportunidadeRulesModule workspace={workspace} />
            </div>
          ) : null}

          {activeSection === "items" ? (
            <OportunidadeItemsModule
              workspace={workspace}
              isUpdating={isUpdatingItem}
              onUpdateItem={onUpdateItem}
              onCreateItem={onCreateItem}
              onDeleteItem={onDeleteItem}
            />
          ) : null}

          {activeSection === "orgaos" ? (
            <OportunidadeOrgaosModule workspace={workspace} />
          ) : null}

          {activeSection === "execution" ? (
            <OportunidadeExecutionModule
              companyId={companyId}
              oportunidadeId={oportunidadeId}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
