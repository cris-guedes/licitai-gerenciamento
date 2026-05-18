"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LoaderCircle, MessageSquareText, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Textarea } from "@/client/components/ui/textarea"
import { WorkspacePanel } from "@/client/components/workspace"
import { useApp } from "@/client/hooks/app/useApp"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "@/client/features/licitacoes/services/use-licitacao.service"
import { formatDate, initials } from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

const QUICK_COMMENT_PRESETS = [
  "Ficou bom!",
  "Precisa de ajuda?",
  "Este item está bloqueado...",
] as const

export function OportunidadeNotesModule({
  workspace,
  companyId,
  oportunidadeId,
  embedded = false,
}: {
  workspace: OportunidadeWorkspaceModel
  companyId: string
  oportunidadeId: string
  embedded?: boolean
}) {
  const api = useCoreApi()
  const { user } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const canMutate = Boolean(companyId && oportunidadeId)
  const currentUserName = user?.name?.trim() || "Você"

  const invalidateWorkspace = () => {
    void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, oportunidadeId] })
    void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
  }

  const createNoteMutation = useMutation({
    mutationFn: async () => licitacaoService.createOportunidadeNote({
      companyId,
      oportunidadeId,
      content: content.trim(),
    }),
    onSuccess: () => {
      setContent("")
      toast.success("Comentário salvo.")
      invalidateWorkspace()
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível salvar o comentário."))
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => licitacaoService.deleteOportunidadeNote({
      companyId,
      oportunidadeId,
      noteId,
    }),
    onSuccess: () => {
      toast.success("Comentário removido.")
      invalidateWorkspace()
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível excluir o comentário."))
    },
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() !== "m") return

      const target = event.target
      if (
        target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      textareaRef.current?.focus()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const applyPreset = (preset: string) => {
    setContent(current => current.trim() ? `${current.trim()}\n${preset}` : preset)
    textareaRef.current?.focus()
  }

  const contentNode = (
    <div className={embedded ? "space-y-4" : "space-y-5"}>
      <div className="flex items-start gap-3">
        <Avatar className="mt-1 bg-amber-400 text-amber-950">
          <AvatarFallback className="bg-amber-400 text-xs font-semibold text-amber-950">
            {initials(currentUserName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-slate-300 bg-white px-4 py-4 shadow-none">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={event => setContent(event.target.value)}
              placeholder="Adicionar comentário..."
              disabled={!canMutate || createNoteMutation.isPending}
              className="min-h-[84px] border-0 bg-transparent px-0 py-0 text-[15px] leading-6 shadow-none focus-visible:border-transparent focus-visible:ring-0"
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {QUICK_COMMENT_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  onClick={() => applyPreset(preset)}
                  disabled={!canMutate || createNoteMutation.isPending}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pl-1">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Dica de ouro:</span> aperte{" "}
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700">M</kbd>{" "}
              para fazer comentários
            </p>

            <Button
              type="button"
              size="sm"
              disabled={!canMutate || !content.trim() || createNoteMutation.isPending}
              onClick={() => void createNoteMutation.mutateAsync()}
            >
              {createNoteMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />}
              Salvar comentário
            </Button>
          </div>
        </div>
      </div>

      {workspace.notes.length ? (
        <div className="space-y-5">
          {workspace.notes.map(note => (
            <article key={note.id} className="flex items-start gap-3">
              <Avatar className="mt-0.5 bg-amber-400 text-amber-950">
                <AvatarFallback className="bg-amber-400 text-xs font-semibold text-amber-950">
                  {initials(note.createdBy.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold text-slate-900">{note.createdBy.name}</p>
                      <span className="text-sm text-slate-500">{formatRelativeDate(note.createdAt)}</span>
                      {note.updatedAt !== note.createdAt ? (
                        <Badge variant="secondary" className="rounded-full border-0 bg-slate-100 text-[10px] text-slate-600 shadow-none">
                          editado
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-800">
                      {note.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-700"
                    onClick={() => void deleteNoteMutation.mutateAsync(note.id)}
                    disabled={deleteNoteMutation.isPending}
                    aria-label="Excluir comentário"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
          Ainda não há comentários internos registrados para esta oportunidade.
        </div>
      )}
    </div>
  )

  if (embedded) return contentNode

  return (
    <WorkspacePanel
      title="Notas"
      description="Contexto interno rápido para registrar decisões, alinhamentos e observações desta oportunidade."
      actions={
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
          {workspace.notes.length} comentário{workspace.notes.length === 1 ? "" : "s"}
        </Badge>
      }
    >
      {contentNode}
    </WorkspacePanel>
  )
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return formatDate(value)

  const diffMs = date.getTime() - Date.now()
  const diffSeconds = Math.round(diffMs / 1000)
  const absSeconds = Math.abs(diffSeconds)
  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

  if (absSeconds < 60) return formatter.format(diffSeconds, "second")

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute")

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour")

  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 30) return formatter.format(diffDays, "day")

  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) return formatter.format(diffMonths, "month")

  const diffYears = Math.round(diffDays / 365)
  return formatter.format(diffYears, "year")
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}
