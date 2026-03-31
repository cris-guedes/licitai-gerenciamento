"use client"

import { daysUntil, formatDeadline } from "@/client/main/lib/utils/deadline"
import { formatCurrency } from "@/client/main/lib/utils/format"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { SectionTitle, formatDate, formatDateShort } from "../shared"

type Props = {
  d: any
  item: LicitacaoItem
}

export function TabDados({ d, item }: Props) {
  const modalidadeNome = d?.modalidadeNome ?? item.modalidade_licitacao_nome
  const municipioNome = d?.municipioNome ?? item.municipio_nome
  const uf = d?.uf ?? item.uf
  const deadlineStr = d?.dataEncerramentoProposta ?? item.data_fim_vigencia ?? null
  const daysLeft = daysUntil(deadlineStr)

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Dados Gerais</SectionTitle>
      <div className="rounded-xl border border-border/40 divide-y divide-border/30 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border/30">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Modalidade</span>
            <span className="text-sm font-semibold">{modalidadeNome ?? "—"}</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Valor Estimado</span>
            <span className="text-sm font-bold text-primary">{d?.valorTotal != null ? formatCurrency(d.valorTotal) : "—"}</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Data de Abertura</span>
            <span className="text-sm font-medium">{formatDate(d?.dataAberturaProposta) ?? "—"}</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Localização</span>
            <span className="text-sm font-medium">{[municipioNome, uf].filter(Boolean).join(" - ") || "—"}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border/30">
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Encerramento de Propostas</span>
            <span className="text-sm font-medium flex items-center gap-2">
              {formatDate(d?.dataEncerramentoProposta) ?? "—"}
              {daysLeft && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  {formatDeadline(deadlineStr)}
                </span>
              )}
            </span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Publicado no PNCP</span>
            <span className="text-sm font-medium">{formatDateShort(d?.dataPublicacaoPncp) ?? "—"}</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Nº do Processo</span>
            <span className="text-sm font-medium">{d?.processo ?? "—"}</span>
          </div>
        </div>
      </div>

      {(d?.valorTotal != null || d?.valorTotalHomologado != null) && (
        <div className="flex flex-wrap gap-3">
          {d.valorTotal != null && (
            <div className="rounded-xl bg-primary/5 border border-primary/15 px-5 py-4 flex flex-col gap-1 min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">Valor Total Estimado da Compra</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(d.valorTotal)}</span>
            </div>
          )}
          {d.valorTotalHomologado != null && (
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-5 py-4 flex flex-col gap-1 min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/60">Valor Total Homologado da Compra</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(d.valorTotalHomologado)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
