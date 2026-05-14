"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Building2, CalendarClock, CircleDollarSign, ExternalLink, Layers3 } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import {
  WorkspaceHeader,
  WorkspacePanel,
  WorkspaceShell,
} from "@/client/components/workspace"
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
} from "../lib/oportunidade-workspace"
import { useOportunidadeWorkspacePage } from "../hooks/useOportunidadeWorkspacePage"
import { OportunidadeWorkspaceSections } from "./OportunidadeWorkspaceSections"

export default function OportunidadeWorkspacePage() {
  const params = useParams() as {
    orgId: string
    companyId: string
    oportunidadeId: string
  }

  const page = useOportunidadeWorkspacePage({
    companyId: params.companyId,
    organizationId: params.orgId,
    oportunidadeId: params.oportunidadeId,
  })

  if (page.isLoading) return <OportunidadeWorkspaceSkeleton />

  if (!page.selectedItem || !page.workspaceModel) {
    return (
      <WorkspaceShell contentClassName="p-0">
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="max-w-md rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm leading-6 text-rose-700">
            {page.errorMessage ?? "Não foi possível carregar esta oportunidade."}
          </div>
        </div>
      </WorkspaceShell>
    )
  }

  const item = page.selectedItem
  const workspace = page.workspaceModel
  const baseHref = `/org/${params.orgId}/${params.companyId}`
  const detailWorkspaceHref = item.editalId || item.licitacaoId
    ? `${baseHref}/workspace-ia?oportunidadeId=${item.oportunidadeId}`
    : null

  return (
    <WorkspaceShell contentClassName="p-0">
      <WorkspaceHeader
        breadcrumbs={[
          { label: "Licitações", href: `${baseHref}/licitacoes` },
          { label: "Oportunidade" },
        ]}
        backHref={`${baseHref}/licitacoes`}
        eyebrow="Workspace da Oportunidade"
        title={item.title}
        description={workspace.resumo ?? "Centralize contexto, documentos, andamento e desdobramentos desta oportunidade."}
        status={
          <Badge variant="outline" className="rounded-full border-sky-100 bg-sky-50 text-sky-700">
            {formatStatusLabel(item.oportunidadeStatus)}
          </Badge>
        }
        metadata={
          <>
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
            <span className="inline-flex items-center gap-2">
              <CalendarClock className="size-4 text-slate-400" />
              Atualizado em {formatDate(item.workflow.updatedAt ?? item.updatedAt)}
            </span>
          </>
        }
        actions={
          <>
            {detailWorkspaceHref ? (
              <Button asChild variant="outline" className="rounded-lg">
                <Link href={detailWorkspaceHref}>
                  Abrir workspace de IA
                  <ExternalLink className="ml-2 size-4" />
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <OportunidadeWorkspaceSections
          workspace={workspace}
          item={item}
          companyId={params.companyId}
          oportunidadeId={params.oportunidadeId}
          phaseOptions={page.phaseOptions}
          statusOptions={page.statusOptions}
          situationOptions={page.situationOptions}
          responsavelOptions={page.responsavelOptions}
          moveOptions={page.moveOptions}
          isMoving={page.isMoving}
          isUpdating={page.isUpdating}
          isUpdatingDetails={page.isUpdatingDetails}
          documentsErrorMessage={page.errorMessage}
          documentChatService={page.documentChatService}
          documentSummaryService={page.documentSummaryService}
          onQuickUpdate={page.updateItem}
          onUpdateDetails={page.updateDetails}
          onMove={page.moveToNode}
        />
      </div>
    </WorkspaceShell>
  )
}

function OportunidadeWorkspaceSkeleton() {
  return (
    <WorkspaceShell contentClassName="p-0">
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <WorkspacePanel>
          <div className="space-y-3">
            <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </WorkspacePanel>
        <section className="flex min-h-[560px] rounded-lg border border-slate-200 bg-white">
          <aside className="w-48 shrink-0 border-r border-slate-200 px-4 py-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => {
                return <div key={index} className="h-9 animate-pulse rounded bg-slate-100" />
              })}
            </div>
          </aside>
          <div className="flex-1 px-6 py-6">
            <div className="space-y-6">
              <div className="h-56 animate-pulse rounded-lg border border-slate-200 bg-white" />
              <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white" />
              <div className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white" />
            </div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  )
}
