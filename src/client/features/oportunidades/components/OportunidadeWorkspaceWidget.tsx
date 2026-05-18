"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Building2, CircleDollarSign, ExternalLink, Layers3 } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { WorkspaceMetricGrid, WorkspaceMetricCard, WorkspaceWidget } from "@/client/components/workspace"
import {
  formatCurrency,
  formatStatusLabel,
} from "../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../types/oportunidade-workspace"

export function OportunidadeWorkspaceWidget({
  workspace,
  href,
  actions,
  footer,
  variant = "default",
  className,
}: {
  workspace: OportunidadeWorkspaceModel
  href?: string
  actions?: ReactNode
  footer?: ReactNode
  variant?: "default" | "compact"
  className?: string
}) {
  const { oportunidade, documentsSummary } = workspace
  const isCompact = variant === "compact"

  return (
    <WorkspaceWidget
      className={className}
      title={href ? (
        <Link
          href={href}
          className="hover:text-primary/80"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
        >
          {oportunidade.title}
        </Link>
      ) : oportunidade.title}
      description={workspace.resumo ?? "Sessão de trabalho da oportunidade."}
      status={
        <Badge variant="outline" className="rounded-full border-sky-100 bg-sky-50 text-sky-700">
          {formatStatusLabel(oportunidade.oportunidadeStatus)}
        </Badge>
      }
      actions={
        <>
          {actions}
          {href ? (
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href={href}>
                Abrir
                <ExternalLink className="ml-2 size-4" />
              </Link>
            </Button>
          ) : null}
        </>
      }
      bodyClassName={isCompact ? "p-3" : "p-4"}
      footer={footer}
    >
      <div className={isCompact ? "space-y-3" : "space-y-4"}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            {oportunidade.orgaoNome ?? "Órgão não identificado"}
          </span>
          {oportunidade.workflow.phase ? (
            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-700">
              {oportunidade.workflow.phase.label}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {oportunidade.workflow.status ? (
            <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
              {oportunidade.workflow.status.label}
            </Badge>
          ) : null}
          {oportunidade.workflow.situation ? (
            <Badge variant="outline" className="rounded-full border-rose-100 bg-rose-50 text-rose-700">
              {oportunidade.workflow.situation.label}
            </Badge>
          ) : null}
        </div>

        <WorkspaceMetricGrid className={isCompact ? "xl:grid-cols-3" : "xl:grid-cols-4"}>
          <WorkspaceMetricCard
            label="Valor"
            value={formatCurrency(oportunidade.valorEstimado) ?? "A definir"}
            valueClassName={isCompact ? "text-sm" : "text-base"}
            icon={<CircleDollarSign className="size-5 text-emerald-600" />}
          />
          <WorkspaceMetricCard
            label="Itens"
            value={`${oportunidade.itemCount}`}
            valueClassName={isCompact ? "text-sm" : "text-base"}
            icon={<Layers3 className="size-5 text-sky-600" />}
          />
          <WorkspaceMetricCard
            label="Documentos"
            value={`${documentsSummary.total}`}
            valueClassName={isCompact ? "text-sm" : "text-base"}
            description={`${documentsSummary.ready} prontos`}
          />
          {!isCompact ? (
            <WorkspaceMetricCard
              label="Status"
              value={oportunidade.workflow.status?.label ?? "Sem status"}
              valueClassName="text-base"
              description={oportunidade.workflow.situation?.label ?? "Sem situação"}
            />
          ) : null}
        </WorkspaceMetricGrid>
      </div>
    </WorkspaceWidget>
  )
}
