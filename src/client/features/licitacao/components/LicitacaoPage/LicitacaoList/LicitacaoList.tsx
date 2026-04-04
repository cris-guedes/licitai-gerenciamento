"use client"

import type { LicitacaoListItem } from "@/client/main/infra/apis/api-core/models/LicitacaoListItem"
import { Badge } from "@/client/components/ui/badge"
import { cn } from "@/client/main/lib/utils"
import { Building2, CalendarDays, DollarSign } from "lucide-react"

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  open:      "Aberto",
  suspended: "Suspenso",
  cancelled: "Cancelado",
  closed:    "Encerrado",
  awarded:   "Adjudicado",
}

const STATUS_COLOR: Record<string, string> = {
  open:      "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  closed:    "bg-slate-100 text-slate-700 border-slate-200",
  awarded:   "bg-blue-100 text-blue-800 border-blue-200",
}

const PHASE_LABEL: Record<string, string> = {
  edital:   "Edital",
  proposal: "Proposta",
  judgment: "Julgamento",
  awarded:  "Adjudicação",
  contract: "Contrato",
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null
  return (
    <span className={cn(
      "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
      STATUS_COLOR[status] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function PhaseBadge({ phase }: { phase: string | null }) {
  if (!phase) return null
  return (
    <Badge variant="outline" className="text-[10px] h-5">
      {PHASE_LABEL[phase] ?? phase}
    </Badge>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function LicitacaoRow({ item, onSelect }: { item: LicitacaoListItem; onSelect?: (item: LicitacaoListItem) => void }) {
  const value = item.estimatedValue
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.estimatedValue)
    : null

  const opening = item.openingDate
    ? new Date(item.openingDate).toLocaleDateString("pt-BR")
    : null

  return (
    <div
      className="flex items-start gap-4 px-4 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={() => onSelect?.(item)}
    >
      {/* Icon */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 mt-0.5">
        <Building2 className="size-4 text-primary/70" strokeWidth={1.5} />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {item.editalNumber && (
            <span className="text-xs font-semibold text-muted-foreground">{item.editalNumber}</span>
          )}
          {item.portal && (
            <span className="text-[10px] text-muted-foreground/60">{item.portal}</span>
          )}
          <StatusBadge status={item.tender?.status ?? null} />
          <PhaseBadge  phase={item.tender?.phase  ?? null} />
        </div>

        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {item.object ?? "Sem objeto definido"}
        </p>

        <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          {item.modality && <span>{item.modality}</span>}
          {item.state    && <span className="font-medium">{item.sphere && `${item.sphere} · `}{item.state}</span>}
          {opening && (
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {opening}
            </span>
          )}
          {value && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
      <Building2 className="size-10 opacity-20" strokeWidth={1} />
      <p className="text-sm font-medium">Nenhuma licitação cadastrada</p>
      <p className="text-xs">Clique em "Nova licitação" para começar.</p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Props = {
  items: LicitacaoListItem[]
  isLoading: boolean
  onSelect?: (item: LicitacaoListItem) => void
}

export function LicitacaoList({ items, isLoading, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-4">
            <div className="size-9 rounded-lg bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-48 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {items.map((item) => (
        <LicitacaoRow key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  )
}
