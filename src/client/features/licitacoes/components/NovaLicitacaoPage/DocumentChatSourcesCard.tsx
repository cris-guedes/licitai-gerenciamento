"use client"

import { ChevronDown, FileSearch } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/client/components/ui/collapsible"
import type { DocumentChatSource } from "../../services/use-document-chat.service"

type Props = {
  sources: DocumentChatSource[]
}

export function DocumentChatSourcesCard({ sources }: Props) {
  return (
    <Collapsible className="border-t border-slate-200/80 pt-3">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-[1rem] border border-slate-200/80 bg-white px-3 py-3 text-left transition-colors hover:bg-slate-50"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <FileSearch className="size-3.5" />
              <span>Fontes</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {sources.length} {sources.length === 1 ? "trecho recuperado" : "trechos recuperados"}
            </p>
          </div>

          <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 overflow-x-hidden pt-2">
        {sources.map(source => (
          <div key={source.id} className="min-w-0 overflow-hidden rounded-[1rem] border border-slate-200/80 bg-white px-3 py-3">
            <div className="flex flex-wrap items-center gap-2 break-words text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 [overflow-wrap:anywhere]">
              {source.page != null ? <span>Página {source.page}</span> : null}
              {source.heading ? <span>{source.heading}</span> : null}
              <span>Score {source.score.toFixed(2)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
              {source.snippet}
            </p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
