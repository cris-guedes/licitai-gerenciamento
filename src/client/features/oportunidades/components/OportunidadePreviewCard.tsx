"use client"

import Link from "next/link"
import type { KeyboardEvent, ReactNode } from "react"
import { Building2, UserRound } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { cn } from "@/client/main/lib/utils"
import type { OportunidadeBoardItem } from "@/client/features/licitacoes/services/use-licitacao.service"

export function OportunidadePreviewCard({
  item,
  href,
  onOpenDetail,
  action,
  className,
}: {
  item: OportunidadeBoardItem
  href: string
  onOpenDetail: () => void
  action?: ReactNode
  className?: string
}) {
  const summary = item.objetoResumo ?? "Resumo ainda não estruturado."

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(event) => handleCardKeyDown(event, onOpenDetail)}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.modalidade ? (
              <Badge className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-none">
                {item.modalidade}
              </Badge>
            ) : null}
            {item.workflow.status ? (
              <Badge variant="secondary" className="rounded-full bg-sky-100 text-sky-800">
                {item.workflow.status.label}
              </Badge>
            ) : null}
              {item.workflow.situation ? (
                <Badge variant="outline" className="rounded-full border-rose-100 bg-rose-50 text-rose-700">
                  {item.workflow.situation.label}
                </Badge>
              ) : null}
              {item.numero ? (
                <span className="text-[11px] font-medium text-slate-500">
                  {item.numero}
                </span>
              ) : null}
            </div>

            <div className="mt-3">
              <Link
                href={href}
              className="line-clamp-3 text-base font-semibold leading-6 text-slate-900 hover:text-primary"
              onClick={event => event.stopPropagation()}
              onPointerDown={event => event.stopPropagation()}
            >
              {item.title}
            </Link>
          </div>
        </div>

        <div
          className="shrink-0"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
        >
          {action}
        </div>
      </div>

      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
        {summary}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.06em] text-slate-500">
        <Building2 className="size-3.5 shrink-0" />
        <span className="truncate">{item.orgaoNome ?? "Órgão não identificado"}</span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
        <UserRound className="size-4 shrink-0" />
        <span className="truncate">{item.responsavel?.name ?? "Sem responsável"}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
        <span className="truncate text-xs text-slate-500">
          {[item.numero, item.workflow.phase?.label].filter(Boolean).join(" · ") || "Oportunidade em andamento"}
        </span>
        {item.workflow.phase ? (
          <span className="truncate text-xs font-medium text-slate-600">
            {item.workflow.phase.label}
          </span>
        ) : null}
      </div>
    </article>
  )
}

function handleCardKeyDown(event: KeyboardEvent<HTMLElement>, onOpenDetail: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return
  event.preventDefault()
  onOpenDetail()
}
