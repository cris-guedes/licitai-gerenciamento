"use client"

import React, { useMemo, useState } from "react"
import { Archive, ChevronDown, Globe, History, Info, Pencil, Plus, Trash2 } from "lucide-react"
import { useProcurementService } from "../../../services/procurement"
import { EmptyState, LoadingState, SectionTitle } from "../shared"

type HistoryEntry = {
  dataInclusao?: string
  tipoLogManutencaoNome?: string
  categoriaLogManutencaoNome?: string
  justificativa?: string
  usuarioNome?: string
  documentoTitulo?: string
  itemNumero?: number
}

type HistoryGroup = { date: string; entries: HistoryEntry[] }

const STATUS_CONFIG: Record<string, { color: string; bg: string; Icon: React.ElementType }> = {
  "Inclusão": { color: "#2B86F0", bg: "#EBF3FF", Icon: Plus },
  "Retificação": { color: "#F29E2E", bg: "#FFF4E0", Icon: Pencil },
  "Exclusão": { color: "#E04B4B", bg: "#FFECEC", Icon: Trash2 },
  "Publicação": { color: "#6A4CFF", bg: "#F0EEFF", Icon: Globe },
  "Arquivada": { color: "#8A99A8", bg: "#F0F3F6", Icon: Archive },
}

const DEFAULT_STATUS = { color: "#8A99A8", bg: "#F0F3F6", Icon: Info }

function getStatusConfig(status?: string) {
  if (!status) return DEFAULT_STATUS
  return STATUS_CONFIG[status] ?? DEFAULT_STATUS
}

function toDateKey(str?: string) {
  if (!str) return "unknown"
  return str.slice(0, 10)
}

function groupByDate(entries: HistoryEntry[]): HistoryGroup[] {
  const map = new Map<string, HistoryEntry[]>()
  for (const entry of entries) {
    const key = toDateKey(entry.dataInclusao)
    const arr = map.get(key) ?? []
    arr.push(entry)
    map.set(key, arr)
  }

  const seen = new Set<string>()
  const groups: HistoryGroup[] = []
  for (const entry of entries) {
    const key = toDateKey(entry.dataInclusao)
    if (!seen.has(key)) {
      seen.add(key)
      groups.push({ date: key, entries: map.get(key)! })
    }
  }
  return groups
}

function fmtDateLeft(str?: string) {
  if (!str) return { dayMonth: "—", year: "" }
  const d = new Date(str)
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit" })
  const mon = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
  const year = d.toLocaleDateString("pt-BR", { year: "numeric" })
  return { dayMonth: `${day} ${mon}`, year }
}

function fmtTime(str?: string) {
  if (!str) return ""
  return new Date(str).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function HistoryEntryRow({ entry, isLast, isLatest }: { entry: HistoryEntry; isLast: boolean; isLatest?: boolean }) {
  const cfg = getStatusConfig(entry.tipoLogManutencaoNome)
  const date = fmtDateLeft(entry.dataInclusao)

  return (
    <div role="listitem" className="grid grid-cols-[60px_20px_1fr] gap-x-3">
      <div className="text-right pt-0.5 flex flex-col items-end">
        <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{date.dayMonth}</span>
        <span className="text-[10px] text-muted-foreground/50 leading-tight">{date.year}</span>
      </div>
      <div className="flex flex-col items-center">
        <div
          title={entry.tipoLogManutencaoNome}
          style={{ background: cfg.color, ...(isLatest ? { outline: `2px solid ${cfg.color}`, outlineOffset: 2 } : {}) }}
          className={`rounded-full mt-1 shrink-0 z-10 ${isLatest ? "size-3" : "size-2.5"}`}
          aria-hidden="true"
        />
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: "#E6EDF4" }} />}
      </div>
      <div className={`flex flex-col gap-0.5 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>{entry.tipoLogManutencaoNome}</span>
          {entry.categoriaLogManutencaoNome && <span className="text-[11px] text-muted-foreground">· {entry.categoriaLogManutencaoNome}</span>}
          {isLatest && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ color: cfg.color, borderColor: cfg.color, background: cfg.bg }}>
              Última atualização
            </span>
          )}
        </div>
        {entry.itemNumero != null && <span className="text-[10px] text-muted-foreground">Item nº {entry.itemNumero}</span>}
        {entry.documentoTitulo && <p className="text-xs font-medium text-foreground/80 leading-snug">{entry.documentoTitulo}</p>}
        {entry.justificativa && <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2 mt-0.5 leading-relaxed">{entry.justificativa}</p>}
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground/60">
          {entry.dataInclusao && <span>{fmtTime(entry.dataInclusao)}</span>}
          {entry.usuarioNome && <span>· {entry.usuarioNome}</span>}
        </div>
      </div>
    </div>
  )
}

function HistoryGroupCard({
  group,
  groupIndex,
  expanded,
  onToggle,
  isLatest,
}: {
  group: HistoryGroup
  groupIndex: number
  expanded: boolean
  onToggle: () => void
  isLatest?: boolean
}) {
  const count = group.entries.length
  const id = `hg-${groupIndex}`
  const dateRef = fmtDateLeft(group.entries[0]?.dataInclusao)
  const statusCounts = group.entries.reduce<Record<string, number>>((acc, entry) => {
    const key = entry.tipoLogManutencaoNome ?? "Outro"
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const statusSummary = Object.entries(statusCounts).map(([key, countValue]) => `${countValue} ${key.toLowerCase()}${countValue > 1 ? "s" : ""}`).join(" · ")

  return (
    <div className="grid grid-cols-[60px_20px_1fr] gap-x-3">
      <div className="text-right pt-0.5 flex flex-col items-end">
        <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{dateRef.dayMonth}</span>
        <span className="text-[10px] text-muted-foreground/50 leading-tight">{dateRef.year}</span>
      </div>
      <div className="flex flex-col items-center">
        <div
          style={{ background: "#8A99A8", ...(isLatest ? { outline: "2px solid #8A99A8", outlineOffset: 2 } : {}) }}
          className={`rounded-full z-10 mt-1 shrink-0 ${isLatest ? "size-3" : "size-2.5"}`}
          aria-hidden="true"
        />
        <div className="w-px flex-1 mt-1" style={{ background: "#E6EDF4" }} />
      </div>
      <div className="flex-1 min-w-0 mb-5">
        <button
          type="button"
          onClick={onToggle}
          onKeyDown={event => (event.key === "Enter" || event.key === " ") && onToggle()}
          aria-expanded={expanded}
          aria-controls={id}
          className="w-full text-left rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 flex items-center gap-2 hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-xs font-semibold text-foreground/70 flex-1">{statusSummary}</span>
          {isLatest && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border border-muted-foreground/30 text-muted-foreground">Última atualização</span>}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted-foreground/20 text-muted-foreground" aria-hidden="true">{count}</span>
          <ChevronDown size={14} className="shrink-0 transition-transform duration-200 text-muted-foreground" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} aria-hidden="true" />
        </button>
        <div id={id} role="list" className="overflow-hidden transition-all duration-200" style={{ display: expanded ? "block" : "none" }}>
          <div className="pt-3 pl-2 flex flex-col">
            {group.entries.map((entry, index) => (
              <HistoryEntryRow key={index} entry={entry} isLast={index === group.entries.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TabHistorico({ history: query }: { history: ReturnType<typeof useProcurementService>["history"] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const groups = useMemo(() => {
    if (!query.data?.entries?.length) return []
    const sorted = [...query.data.entries].sort(
      (a, b) => new Date(b.dataInclusao ?? 0).getTime() - new Date(a.dataInclusao ?? 0).getTime()
    )
    return groupByDate(sorted)
  }, [query.data])

  const toggle = (index: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="flex flex-col flex-1">
      <SectionTitle>Histórico de Alterações{groups.length ? ` (${query.data?.entries?.length})` : ""}</SectionTitle>
      {query.isLoading && <LoadingState text="Carregando histórico..." />}
      {query.isError && <p className="text-sm text-destructive text-center py-4">Erro ao carregar histórico.</p>}
      {!query.isLoading && groups.length === 0 && <EmptyState icon={History} text="Nenhum registro encontrado." />}

      {groups.length > 0 && (
        <div role="list" aria-label="Histórico de alterações" className="flex flex-col">
          {groups.map((group, index) =>
            group.entries.length <= 3 ? (
              <React.Fragment key={index}>
                {group.entries.map((entry, groupIndex) => (
                  <HistoryEntryRow
                    key={groupIndex}
                    entry={entry}
                    isLast={index === groups.length - 1 && groupIndex === group.entries.length - 1}
                    isLatest={index === 0 && groupIndex === 0}
                  />
                ))}
              </React.Fragment>
            ) : (
              <div key={index} role="listitem">
                <HistoryGroupCard
                  group={group}
                  groupIndex={index}
                  expanded={expanded.has(index)}
                  onToggle={() => toggle(index)}
                  isLatest={index === 0}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
