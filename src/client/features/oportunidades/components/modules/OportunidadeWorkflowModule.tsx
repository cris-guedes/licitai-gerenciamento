"use client"

import { Separator } from "@/client/components/ui/separator"
import { SelectItem } from "@/client/components/ui/select"
import { WorkspacePanel } from "@/client/components/workspace"
import { OportunidadeWorkflowActions } from "@/client/features/licitacoes/components/LicitacoesPage/OportunidadeWorkflowActions"
import type {
  OportunidadeBoardItem,
  WorkflowNode,
} from "@/client/features/licitacoes/services/use-licitacao.service"
import {
  EMPTY_PHASE_VALUE,
  EMPTY_SITUATION_VALUE,
  EMPTY_STATUS_VALUE,
  SidebarSelectField,
} from "../../lib/oportunidade-workspace"

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

export function OportunidadeWorkflowModule({
  item,
  phaseOptions,
  statusOptions,
  situationOptions,
  moveOptions,
  isMoving,
  isUpdating,
  onQuickUpdate,
  onMove,
}: {
  item: OportunidadeBoardItem
  phaseOptions: WorkflowNode[]
  statusOptions: WorkflowNode[]
  situationOptions: WorkflowNode[]
  moveOptions: MoveOption[]
  isMoving: boolean
  isUpdating: boolean
  onQuickUpdate: (patch: {
    phaseNodeId?: string
    statusNodeId?: string
    situationNodeId?: string
  }) => Promise<void>
  onMove: (targetNodeId: string) => Promise<void>
}) {
  const controlsDisabled = isMoving || isUpdating
  const phaseValue = item.workflow.phase?.id && phaseOptions.some(option => option.id === item.workflow.phase?.id)
    ? item.workflow.phase.id
    : EMPTY_PHASE_VALUE
  const statusValue = item.workflow.status?.id && statusOptions.some(option => option.id === item.workflow.status?.id)
    ? item.workflow.status.id
    : EMPTY_STATUS_VALUE
  const situationValue = item.workflow.situation?.id && situationOptions.some(option => option.id === item.workflow.situation?.id)
    ? item.workflow.situation.id
    : EMPTY_SITUATION_VALUE

  return (
    <WorkspacePanel
      title="Fluxo"
      description="Ajuste fase, status, situação e avance a oportunidade pelos próximos passos válidos."
    >
      <div className="space-y-3">
        <SidebarSelectField
          label="Fase"
          value={phaseValue}
          disabled={controlsDisabled || phaseOptions.length === 0}
          onValueChange={nodeId => {
            if (nodeId === EMPTY_PHASE_VALUE || nodeId === item.workflow.phase?.id) return
            void onQuickUpdate({ phaseNodeId: nodeId })
          }}
        >
          <SelectItem value={EMPTY_PHASE_VALUE} disabled>
            {item.workflow.phase?.label ?? "Sem fase"}
          </SelectItem>
          {phaseOptions.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SidebarSelectField>

        <SidebarSelectField
          label="Status"
          value={statusValue}
          disabled={controlsDisabled || statusOptions.length === 0}
          onValueChange={nodeId => {
            if (nodeId === EMPTY_STATUS_VALUE || nodeId === item.workflow.status?.id) return
            void onQuickUpdate({ statusNodeId: nodeId })
          }}
        >
          <SelectItem value={EMPTY_STATUS_VALUE} disabled>
            {item.workflow.status?.label ?? "Sem status"}
          </SelectItem>
          {statusOptions.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SidebarSelectField>

        <SidebarSelectField
          label="Situação"
          value={situationValue}
          disabled={controlsDisabled || situationOptions.length === 0}
          onValueChange={nodeId => {
            if (nodeId === EMPTY_SITUATION_VALUE || nodeId === item.workflow.situation?.id) return
            void onQuickUpdate({ situationNodeId: nodeId })
          }}
        >
          <SelectItem value={EMPTY_SITUATION_VALUE} disabled>
            {item.workflow.situation?.label ?? "Sem situação"}
          </SelectItem>
          {situationOptions.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SidebarSelectField>

        <Separator />

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Próximos passos
          </p>
          <OportunidadeWorkflowActions
            item={item}
            moveOptions={moveOptions}
            isMoving={controlsDisabled}
            onMove={onMove}
          />
        </div>
      </div>
    </WorkspacePanel>
  )
}
