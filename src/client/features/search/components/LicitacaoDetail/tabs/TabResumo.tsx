"use client"

import { useState } from "react"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { SectionTitle } from "../shared"

type Props = {
  d: any
  item: LicitacaoItem
}

export function TabResumo({ d, item }: Props) {
  const [expandedDesc, setExpandedDesc] = useState(false)
  const titulo = d?.objetoCompra ?? item.title ?? item.description ?? ""
  const detalhes = d?.informacaoComplementar ?? ""
  const DESC_LIMIT = 280

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Resumo & Descrição Completa</SectionTitle>

      {titulo && (
        <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-border pl-3">{titulo}</p>
      )}

      {detalhes ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-border pl-3">
            {expandedDesc || detalhes.length <= DESC_LIMIT ? detalhes : `${detalhes.slice(0, DESC_LIMIT)}…`}
          </p>
          {detalhes.length > DESC_LIMIT && (
            <button
              type="button"
              onClick={() => setExpandedDesc(value => !value)}
              className="text-xs font-semibold text-primary hover:opacity-70 transition-opacity self-start"
            >
              {expandedDesc ? "Ler menos" : "Ler mais"}
            </button>
          )}
        </div>
      ) : (
        !titulo && <p className="text-sm text-muted-foreground italic">Sem descrição disponível.</p>
      )}
    </div>
  )
}
