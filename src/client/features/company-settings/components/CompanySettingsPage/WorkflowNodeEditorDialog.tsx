"use client"

import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Checkbox } from "@/client/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { Textarea } from "@/client/components/ui/textarea"
import { cn } from "@/client/main/lib/utils"
import type { WorkflowNode, WorkflowNodeDraft } from "../../types/workflow"

const COLOR_SWATCHES = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#0f172a"]

export function WorkflowNodeEditorDialog({
  open,
  node,
  nodeDraft,
  isSaving,
  hasNodeDraftChanges,
  selectedNodeHasChildren,
  childKindLabel,
  onOpenChange,
  onDraftChange,
  onSave,
  onDelete,
  onAddChild,
}: {
  open: boolean
  node: WorkflowNode | null
  nodeDraft: WorkflowNodeDraft
  isSaving: boolean
  hasNodeDraftChanges: boolean
  selectedNodeHasChildren: boolean
  childKindLabel: string | null
  onOpenChange: (open: boolean) => void
  onDraftChange: (patch: Partial<WorkflowNodeDraft>) => void
  onSave: () => Promise<unknown>
  onDelete: () => Promise<unknown>
  onAddChild: () => void
}) {
  if (!node) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[1.35rem] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(4,22,39,0.16)]">
        <DialogHeader className="border-b border-slate-200/80 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-slate-950">{node.label}</DialogTitle>
          <DialogDescription className="text-sm leading-6 text-slate-600">
            Edite este item da estrutura do workflow. Os filhos respeitam a hierarquia conceitual configurada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">{node.kind.label}</p>
            <p className="mt-1 text-sm text-slate-600">{node.path}</p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">Rótulo</span>
            <Input
              value={nodeDraft.label}
              onChange={event => onDraftChange({ label: event.target.value })}
              maxLength={80}
              className="h-10 rounded-xl border-slate-200 bg-white shadow-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">Descrição</span>
            <Textarea
              value={nodeDraft.description}
              onChange={event => onDraftChange({ description: event.target.value })}
              maxLength={240}
              className="min-h-24 rounded-xl border-slate-200 bg-white shadow-none"
            />
          </label>

          <div className="space-y-2">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">Cor</span>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Selecionar ${swatch}`}
                  className={cn(
                    "size-7 rounded-full border border-white shadow-[0_0_0_1px_rgba(15,23,42,0.14)] ring-offset-2 transition",
                    nodeDraft.color === swatch && "ring-2 ring-sky-500",
                  )}
                  style={{ backgroundColor: swatch }}
                  onClick={() => onDraftChange({ color: swatch })}
                />
              ))}
              <input
                type="color"
                value={nodeDraft.color}
                aria-label="Cor personalizada"
                className="size-7 cursor-pointer rounded-full border border-slate-200 bg-white p-0.5"
                onChange={event => onDraftChange({ color: event.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-sm font-medium text-slate-700">Inicial</span>
              <Checkbox
                checked={nodeDraft.isInitial}
                onCheckedChange={value => onDraftChange({ isInitial: Boolean(value) })}
              />
            </label>
            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-sm font-medium text-slate-700">Final</span>
              <Checkbox
                checked={nodeDraft.isTerminal}
                onCheckedChange={value => onDraftChange({ isTerminal: Boolean(value) })}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200/80 px-6 py-5 sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            {childKindLabel ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={isSaving}
                onClick={onAddChild}
              >
                <Plus className="size-4" />
                Adicionar {childKindLabel.toLowerCase()}
              </Button>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="rounded-xl"
              disabled={isSaving}
              onClick={() => {
                const confirmed = window.confirm(
                  selectedNodeHasChildren
                    ? "Excluir esta etapa também remove seus filhos. Deseja continuar?"
                    : "Deseja excluir esta etapa?",
                )

                if (confirmed) void onDelete()
              }}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            disabled={!hasNodeDraftChanges || isSaving || !nodeDraft.label.trim()}
            onClick={() => void onSave()}
          >
            {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

