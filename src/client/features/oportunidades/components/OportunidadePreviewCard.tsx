"use client"

import Link from "next/link"
import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react"
import { MessageSquarePlus, UserRound } from "lucide-react"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { cn, formatCurrency } from "@/client/main/lib/utils"
import type { OportunidadeBoardItem } from "@/client/features/licitacoes/services/use-licitacao.service"
import { initials } from "../lib/oportunidade-workspace"

export function OportunidadePreviewCard({
  item,
  href,
  onOpenDetail,
  action,
  onCreateComment,
  isCreatingComment = false,
  className,
}: {
  item: OportunidadeBoardItem
  href: string
  onOpenDetail: () => void
  action?: ReactNode
  onCreateComment?: (content: string) => Promise<void>
  isCreatingComment?: boolean
  className?: string
}) {
  const summary = item.objetoResumo ?? "Resumo ainda não estruturado."
  const valorEstimado = item.valorEstimado ? formatCurrency(item.valorEstimado) : null
  const tasksSummaryLabel = buildTasksSummaryLabel(item.tasksSummary)
  const latestComment = item.latestNote?.content?.trim() ?? null
  const latestCommentAuthor = item.latestNote?.authorName?.trim() ?? null
  const latestCommentCreatedAt = item.latestNote?.createdAt ?? null
  const numeroLabel = item.numero?.trim() ?? null
  const [commentDraft, setCommentDraft] = useState("")

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(event) => handleCardKeyDown(event, onOpenDetail)}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-base font-bold leading-tight text-slate-800">
            {item.title}
            {item.orgaoNome && (
              <span className="ml-1 text-slate-500 font-semibold block sm:inline">
                - {item.orgaoNome}
              </span>
            )}
          </h1>

          {(item.workflow.status || item.workflow.situation || numeroLabel) ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {item.workflow.status ? (
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full border border-blue-100">
                  {item.workflow.status.label}
                </span>
              ) : null}
              {item.workflow.situation ? (
                <span className="px-2.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-medium rounded-full border border-red-100">
                  {item.workflow.situation.label}
                </span>
              ) : null}
              {numeroLabel ? (
                <span className="text-slate-400 text-[10px] font-medium ml-1">
                  {numeroLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className="shrink-0 p-1 text-slate-400 hover:text-blue-600 transition-colors"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
        >
          {action}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-[12px] leading-relaxed text-slate-600">
        {summary}
      </p>

      {(valorEstimado || item.responsavel?.name) ? (
        <div className="mt-6 grid grid-cols-1 gap-y-4">
          {valorEstimado ? (
            <div className="flex flex-col justify-center border-b border-slate-100 pb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-xxs">Estimado</span>
              <span className="text-xl font-bold text-slate-800">{valorEstimado}</span>
            </div>
          ) : null}

          {item.responsavel?.name ? (
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <UserRound className="size-3.5 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-xxs">Responsável</span>
              </div>
              <span className="text-sm font-semibold text-slate-800 truncate">{item.responsavel.name}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-tight">
            {buildTaskCountLabel(item.tasksSummary.total)}
          </span>
          <span className="text-slate-400 text-[10px] font-medium truncate ml-2">
            {tasksSummaryLabel}
          </span>
        </div>

        <form
          className="flex items-center w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300"
          onSubmit={(event) => void handleCommentSubmit(event, {
            commentDraft,
            isCreatingComment,
            onCreateComment,
            onSuccess: () => setCommentDraft(""),
          })}
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
        >
          <Input
            value={commentDraft}
            onChange={event => setCommentDraft(event.target.value)}
            placeholder="Adicionar comentário..."
            disabled={!onCreateComment || isCreatingComment}
            className="h-6 border-0 bg-transparent px-0 text-[11px] text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!onCreateComment || !commentDraft.trim() || isCreatingComment}
            className="ml-2 h-7 w-7 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-none shrink-0"
          >
            {isCreatingComment ? <MessageSquarePlus className="size-3.5 animate-pulse" /> : <MessageSquarePlus className="size-3.5" />}
          </Button>
        </form>

        {latestComment ? (
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Avatar size="sm" className="mt-0.5 bg-amber-400 text-amber-950">
                <AvatarFallback className="bg-amber-400 text-[10px] font-semibold text-amber-950">
                  {initials(latestCommentAuthor ?? undefined)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[11px] font-semibold text-slate-900">
                    {latestCommentAuthor ?? "Comentário interno"}
                  </p>
                  {latestCommentCreatedAt ? (
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatCompactRelativeTime(latestCommentCreatedAt)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] leading-[1.5] text-slate-700">
                  {latestComment}
                </p>
              </div>
            </div>
          </div>
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

async function handleCommentSubmit(
  event: FormEvent<HTMLFormElement>,
  params: {
    commentDraft: string
    isCreatingComment: boolean
    onCreateComment?: (content: string) => Promise<void>
    onSuccess: () => void
  },
) {
  event.preventDefault()
  const content = params.commentDraft.trim()
  if (!content || !params.onCreateComment || params.isCreatingComment) return
  await params.onCreateComment(content)
  params.onSuccess()
}

function buildTasksSummaryLabel(summary: OportunidadeBoardItem["tasksSummary"]) {
  if (summary.total === 0) return "Nenhuma tarefa registrada"
  if (summary.open === 0) return `${summary.done} concluída${summary.done === 1 ? "" : "s"}`
  if (summary.done === 0) return `${summary.open} pendente${summary.open === 1 ? "" : "s"}`
  return `${summary.done} concluída${summary.done === 1 ? "" : "s"} · ${summary.open} pendente${summary.open === 1 ? "" : "s"}`
}

function buildTaskCountLabel(total: number) {
  if (total === 0) return "Sem tarefas"
  return `${total} tarefa${total === 1 ? "" : "s"}`
}

function formatCompactRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  const diffSeconds = Math.max(0, Math.round(diffMs / 1000))

  if (diffSeconds < 60) return "agora"

  const diffMinutes = Math.round(diffSeconds / 60)
  if (diffMinutes < 60) return `há ${diffMinutes} min`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `há ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `há ${diffDays} d`

  const diffMonths = Math.round(diffDays / 30)
  if (diffMonths < 12) return `há ${diffMonths} m`

  const diffYears = Math.round(diffDays / 365)
  return `há ${diffYears} a`
}
