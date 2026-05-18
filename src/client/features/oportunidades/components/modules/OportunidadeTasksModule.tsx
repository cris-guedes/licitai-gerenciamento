"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, CheckCircle2, Circle, LoaderCircle, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { WorkspacePanel } from "@/client/components/workspace"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useLicitacaoService } from "@/client/features/licitacoes/services/use-licitacao.service"
import { cn } from "@/client/main/lib/utils"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeTasksModule({
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
  const licitacaoService = useLicitacaoService(api)
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const canMutate = Boolean(companyId && oportunidadeId)
  const tasks = useMemo(
    () => [...workspace.tasks].sort((a, b) => {
      if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1
      if (a.dueAt !== b.dueAt) {
        if (!a.dueAt) return 1
        if (!b.dueAt) return -1
        return parseTaskDate(a.dueAt).getTime() - parseTaskDate(b.dueAt).getTime()
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }),
    [workspace.tasks],
  )

  const invalidateWorkspace = () => {
    void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, oportunidadeId] })
    void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
  }

  const createTaskMutation = useMutation({
    mutationFn: async () => licitacaoService.createOportunidadeTask({
      companyId,
      oportunidadeId,
      title: title.trim(),
      dueAt: null,
    }),
    onSuccess: () => {
      setTitle("")
      toast.success("Tarefa adicionada.")
      invalidateWorkspace()
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível criar a tarefa."))
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: "OPEN" | "DONE" }) => licitacaoService.toggleOportunidadeTask({
      companyId,
      oportunidadeId,
      taskId,
      status,
    }),
    onSuccess: (_response, variables) => {
      toast.success(variables.status === "DONE" ? "Tarefa concluída." : "Tarefa reaberta.")
      invalidateWorkspace()
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar a tarefa."))
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => licitacaoService.deleteOportunidadeTask({
      companyId,
      oportunidadeId,
      taskId,
    }),
    onSuccess: () => {
      toast.success("Tarefa removida.")
      invalidateWorkspace()
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a tarefa."))
    },
  })

  const isBusy = createTaskMutation.isPending || toggleTaskMutation.isPending || deleteTaskMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canMutate || !title.trim() || createTaskMutation.isPending) return
    void createTaskMutation.mutateAsync()
  }

  const contentNode = (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Adicionar tarefa"
            disabled={!canMutate || createTaskMutation.isPending}
            className="h-10 bg-white"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={!canMutate || !title.trim() || createTaskMutation.isPending}
            className="shrink-0 sm:self-stretch"
            aria-label="Adicionar tarefa"
          >
            {createTaskMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        </div>
      </form>

      {tasks.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {tasks.map((task, index) => {
            const dueState = getDueState(task)

            return (
              <article
                key={task.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  index > 0 ? "border-t border-slate-100" : "",
                  task.status === "DONE" ? "bg-slate-50/55" : "bg-white",
                )}
              >
                <button
                  type="button"
                  className="shrink-0 text-slate-400 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void toggleTaskMutation.mutateAsync({
                    taskId: task.id,
                    status: task.status === "DONE" ? "OPEN" : "DONE",
                  })}
                  disabled={isBusy}
                  aria-label={task.status === "DONE" ? "Reabrir tarefa" : "Concluir tarefa"}
                >
                  {task.status === "DONE"
                    ? <CheckCircle2 className="size-4 text-emerald-600" />
                    : <Circle className="size-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm",
                    task.status === "DONE"
                      ? "text-slate-400 line-through"
                      : "text-slate-900",
                  )}>
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>{task.createdBy.name}</span>
                    {dueState ? (
                      <span className={cn("inline-flex items-center gap-1 font-medium", dueState.className)}>
                        <CalendarDays className="size-3.5" />
                        {dueState.label}
                      </span>
                    ) : null}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 rounded-lg text-slate-400 hover:text-rose-700"
                  onClick={() => void deleteTaskMutation.mutateAsync(task.id)}
                  disabled={isBusy}
                  aria-label="Excluir tarefa"
                >
                  <Trash2 className="size-4" />
                </Button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nenhuma tarefa ainda.
        </div>
      )}
    </div>
  )

  if (embedded) return contentNode

  return (
    <WorkspacePanel>
      {contentNode}
    </WorkspacePanel>
  )
}

function formatTaskDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: hasExplicitTime(value) ? "short" : undefined,
  }).format(parseTaskDate(value))
}

function hasExplicitTime(value: string) {
  return value.includes("T")
}

function parseTaskDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`)
  return new Date(value)
}

function isOverdue(value: string | null) {
  if (!value) return false

  const dueDate = parseTaskDate(value)
  if (Number.isNaN(dueDate.getTime())) return false

  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  return dueDate.getTime() < endOfToday.getTime()
}

function isToday(value: string | null) {
  if (!value) return false

  const date = parseTaskDate(value)
  if (Number.isNaN(date.getTime())) return false

  const now = new Date()

  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

function getDueState(task: OportunidadeWorkspaceModel["tasks"][number]) {
  if (!task.dueAt) return null
  if (task.status === "DONE") return { label: formatTaskDate(task.dueAt), className: "text-slate-400" }
  if (isOverdue(task.dueAt)) return { label: `Atrasada · ${formatTaskDate(task.dueAt)}`, className: "text-rose-600" }
  if (isToday(task.dueAt)) return { label: `Hoje · ${formatTaskDate(task.dueAt)}`, className: "text-amber-600" }
  return { label: formatTaskDate(task.dueAt), className: "text-slate-500" }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}
