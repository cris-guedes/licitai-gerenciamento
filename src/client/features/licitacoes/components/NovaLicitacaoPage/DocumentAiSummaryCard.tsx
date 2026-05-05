"use client"

import { FileText, ShieldAlert, Sparkles, TimerReset } from "lucide-react"
import { DocumentChatSourcesCard } from "./DocumentChatSourcesCard"
import type { GenerateDocumentSummaryResponse } from "../../services/use-document-summary.service"

type Props = {
  summary: GenerateDocumentSummaryResponse
}

export function DocumentAiSummaryCard({ summary }: Props) {
  return (
    <div className="min-w-0 space-y-4 rounded-[1.2rem] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Resumo do documento</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Gerado em {new Date(summary.generatedAt).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Visão geral</p>
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
          {summary.summary.overview}
        </p>
      </section>

      <SummaryList
        icon={FileText}
        title="Principais pontos"
        items={summary.summary.keyPoints}
      />

      <SummaryList
        icon={TimerReset}
        title="Prazos e datas críticas"
        items={summary.summary.deadlines}
      />

      <SummaryList
        icon={FileText}
        title="Requisitos relevantes"
        items={summary.summary.requirements}
      />

      <SummaryList
        icon={ShieldAlert}
        title="Pontos de atenção"
        items={summary.summary.risks}
      />

      {summary.sources.length > 0 ? <DocumentChatSourcesCard sources={summary.sources} /> : null}
    </div>
  )
}

function SummaryList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Sparkles
  title: string
  items: string[]
}) {
  if (!items.length) return null

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        <Icon className="size-3.5" />
        <span>{title}</span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-3">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
