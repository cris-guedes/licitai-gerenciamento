"use client"

import { GitCommit, GitPullRequestArrow, LoaderCircle, Plus, Save, Trash2, Type, X } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Checkbox } from "@/client/components/ui/checkbox"
import { Input } from "@/client/components/ui/input"
import { Textarea } from "@/client/components/ui/textarea"
import { cn } from "@/client/main/lib/utils"
import type { WorkflowNode, WorkflowTransition } from "../../types/workflow"

const COLOR_SWATCHES = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#0f172a"]

type NodeDraft = {
  label: string
  description: string
  color: string
  isInitial: boolean
  isTerminal: boolean
}

function WorkflowNodeDraftForm({
  title,
  subtitle,
  draft,
  isSaving,
  primaryLabel,
  primaryDisabled,
  onDraftChange,
  onSave,
  onCancel,
}: {
  title: string
  subtitle: string
  draft: NodeDraft
  isSaving: boolean
  primaryLabel: string
  primaryDisabled: boolean
  onDraftChange: (patch: Partial<NodeDraft>) => void
  onSave: () => Promise<unknown>
  onCancel?: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      <label className="block space-y-1.5">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500">
          <Type className="size-3.5" />
          Rótulo
        </span>
        <Input
          value={draft.label}
          onChange={event => onDraftChange({ label: event.target.value })}
          maxLength={80}
          className="h-10 rounded-lg border-slate-200 bg-white shadow-none"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500">
          Descrição
        </span>
        <Textarea
          value={draft.description}
          onChange={event => onDraftChange({ description: event.target.value })}
          maxLength={240}
          className="min-h-20 rounded-lg border-slate-200 bg-white shadow-none"
        />
      </label>

      <div className="space-y-2">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500">Cor</span>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_SWATCHES.map(swatch => (
            <button
              key={swatch}
              type="button"
              aria-label={`Selecionar ${swatch}`}
              className={cn(
                "size-8 rounded-full border border-white shadow-[0_0_0_1px_rgba(15,23,42,0.14)] ring-offset-2 transition",
                draft.color === swatch && "ring-2 ring-secondary",
              )}
              style={{ backgroundColor: swatch }}
              onClick={() => onDraftChange({ color: swatch })}
            />
          ))}
          <input
            type="color"
            value={draft.color}
            aria-label="Cor personalizada"
            className="size-8 cursor-pointer rounded-full border border-slate-200 bg-white p-0.5"
            onChange={event => onDraftChange({ color: event.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm font-semibold text-slate-700">Inicial</span>
          <Checkbox
            checked={draft.isInitial}
            onCheckedChange={value => onDraftChange({ isInitial: Boolean(value) })}
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="text-sm font-semibold text-slate-700">Final</span>
          <Checkbox
            checked={draft.isTerminal}
            onCheckedChange={value => onDraftChange({ isTerminal: Boolean(value) })}
          />
        </label>
      </div>

      <div className="flex gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            disabled={isSaving}
            onClick={onCancel}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1 rounded-lg"
          disabled={primaryDisabled || isSaving || !draft.label.trim()}
          onClick={() => void onSave()}
        >
          {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}

export function WorkflowInspector({
  selectedNode,
  selectedTransition,
  createParentNode,
  createParentNodeId,
  nodeDraft,
  transitionTypeDraft,
  isSaving,
  hasNodeDraftChanges,
  hasTransitionDraftChanges,
  selectedNodeHasChildren,
  selectedNodeCanHaveChildren,
  onNodeDraftChange,
  onTransitionTypeChange,
  onSaveNode,
  onCreateNode,
  onDeleteNode,
  onStartCreateChild,
  onCancelCreateNode,
  onSaveTransition,
  onDeleteTransition,
}: {
  selectedNode: WorkflowNode | null
  selectedTransition: WorkflowTransition | null
  createParentNode: WorkflowNode | null
  createParentNodeId: string | null | undefined
  nodeDraft: NodeDraft
  transitionTypeDraft: string
  isSaving: boolean
  hasNodeDraftChanges: boolean
  hasTransitionDraftChanges: boolean
  selectedNodeHasChildren: boolean
  selectedNodeCanHaveChildren: boolean
  onNodeDraftChange: (patch: Partial<NodeDraft>) => void
  onTransitionTypeChange: (value: string) => void
  onSaveNode: () => Promise<unknown>
  onCreateNode: () => Promise<unknown>
  onDeleteNode: () => Promise<unknown>
  onStartCreateChild: (parentNodeId: string) => void
  onCancelCreateNode: () => void
  onSaveTransition: () => Promise<unknown>
  onDeleteTransition: () => Promise<unknown>
}) {
  const isCreatingNode = createParentNodeId !== undefined

  return (
    <aside className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_30px_rgba(4,22,39,0.04)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-primary">Editor</h2>
          <p className="text-xs text-muted-foreground">Etapas e transições do board.</p>
        </div>
        {selectedNode ? (
          <Badge variant="secondary" className="rounded px-2 py-0.5 text-[0.68rem] font-bold uppercase">
            {selectedNode.kind.label}
          </Badge>
        ) : null}
      </div>

      {isCreatingNode ? (
        <WorkflowNodeDraftForm
          title={createParentNode ? "Nova etapa filha" : "Nova fase"}
          subtitle={createParentNode ? createParentNode.label : "Raiz do workflow"}
          draft={nodeDraft}
          isSaving={isSaving}
          primaryLabel="Criar"
          primaryDisabled={false}
          onDraftChange={onNodeDraftChange}
          onSave={onCreateNode}
          onCancel={onCancelCreateNode}
        />
      ) : selectedNode ? (
        <div className="space-y-4">
          <WorkflowNodeDraftForm
            title={selectedNode.label}
            subtitle={selectedNode.path}
            draft={nodeDraft}
            isSaving={isSaving}
            primaryLabel="Salvar"
            primaryDisabled={!hasNodeDraftChanges}
            onDraftChange={onNodeDraftChange}
            onSave={onSaveNode}
          />

          <div className="grid gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={!selectedNodeCanHaveChildren || isSaving}
              onClick={() => onStartCreateChild(selectedNode.id)}
            >
              <Plus className="size-4" />
              Adicionar filho
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-lg"
              disabled={isSaving}
              onClick={() => {
                const confirmed = window.confirm(
                  selectedNodeHasChildren
                    ? "Excluir esta etapa também remove seus filhos. Deseja continuar?"
                    : "Deseja excluir esta etapa?",
                )
                if (confirmed) void onDeleteNode()
              }}
            >
              <Trash2 className="size-4" />
              Excluir etapa
            </Button>
          </div>
        </div>
      ) : selectedTransition ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <GitPullRequestArrow className="size-4 text-secondary" />
              <p className="text-sm font-bold text-slate-900">Transição</p>
            </div>
            <p className="mt-2 break-all text-xs text-slate-500">{selectedTransition.fromNodeId} → {selectedTransition.toNodeId}</p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500">
              Tipo
            </span>
            <Input
              value={transitionTypeDraft}
              onChange={event => onTransitionTypeChange(event.target.value)}
              maxLength={60}
              className="h-10 rounded-lg border-slate-200 bg-white shadow-none"
            />
          </label>

          <div className="grid gap-2">
            <Button
              type="button"
              className="rounded-lg"
              disabled={!hasTransitionDraftChanges || isSaving}
              onClick={() => void onSaveTransition()}
            >
              {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar transição
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-lg"
              disabled={isSaving}
              onClick={() => {
                if (window.confirm("Deseja excluir esta transição?")) void onDeleteTransition()
              }}
            >
              <Trash2 className="size-4" />
              Excluir transição
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
          <GitCommit className="mb-2 size-5 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Selecione uma etapa ou transição.</p>
        </div>
      )}
    </aside>
  )
}
