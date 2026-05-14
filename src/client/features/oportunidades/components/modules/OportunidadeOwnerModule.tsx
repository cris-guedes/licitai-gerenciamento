"use client"

import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeBoardItem } from "@/client/features/licitacoes/services/use-licitacao.service"
import { initials, UNASSIGNED_RESPONSAVEL_VALUE } from "../../lib/oportunidade-workspace"

export function OportunidadeOwnerModule({
  item,
  responsavelOptions,
  disabled,
  onQuickUpdate,
}: {
  item: OportunidadeBoardItem
  responsavelOptions: Array<{ id: string; name: string; email: string }>
  disabled: boolean
  onQuickUpdate: (patch: { responsavelUserId?: string | null }) => Promise<void>
}) {
  const responsavelValue = item.responsavel?.id ?? UNASSIGNED_RESPONSAVEL_VALUE

  return (
    <WorkspacePanel
      title="Responsável"
      description="Quem está conduzindo esta oportunidade agora."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initials(item.responsavel?.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {item.responsavel?.name ?? "Sem responsável"}
            </p>
            <p className="truncate text-sm text-slate-500">
              {item.responsavel?.email ?? "Aguardando atribuição"}
            </p>
          </div>
        </div>

        <Select
          value={responsavelValue}
          disabled={disabled}
          onValueChange={value => {
            const nextResponsavelId = value === UNASSIGNED_RESPONSAVEL_VALUE ? null : value
            if ((item.responsavel?.id ?? null) === nextResponsavelId) return
            void onQuickUpdate({ responsavelUserId: nextResponsavelId })
          }}
        >
          <SelectTrigger size="sm" className="h-10 rounded-xl border-slate-200 bg-white shadow-none">
            <SelectValue placeholder="Selecionar responsável" />
          </SelectTrigger>
          <SelectContent align="start" className="max-h-72">
            <SelectItem value={UNASSIGNED_RESPONSAVEL_VALUE}>Sem responsável</SelectItem>
            {responsavelOptions.map(responsavel => (
              <SelectItem key={responsavel.id} value={responsavel.id}>
                <span className="min-w-0 truncate">{responsavel.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </WorkspacePanel>
  )
}
