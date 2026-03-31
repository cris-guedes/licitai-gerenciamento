"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/client/components/ui/tooltip"
import { PORTE_TOOLTIP, SITUACAO_RESULTADO_TOOLTIP } from "./constants"

export function SituacaoResultadoCell({ nome }: { nome?: string }) {
  if (!nome) return <span className="text-muted-foreground/40">—</span>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground cursor-default">
            {nome}
            <Info size={10} className="opacity-40 shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center">
          {SITUACAO_RESULTADO_TOOLTIP[nome] ?? "Situação atual do resultado deste item."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PorteCell({ nome }: { nome?: string }) {
  if (!nome) return <span className="text-muted-foreground/40">—</span>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground cursor-default">
            {nome}
            <Info size={10} className="opacity-40 shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center">
          {PORTE_TOOLTIP[nome] ?? "Porte do fornecedor conforme enquadramento tributário."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
