"use client"

import { useRef, useState, useEffect } from "react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/client/components/ui/tooltip"

type Props = {
  it: any
  lineClamp?: number
}

export function DescricaoCell({ it, lineClamp = 3 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)
  const truncClass = lineClamp === 2 ? "line-clamp-2" : "line-clamp-3"
  const full = [it.descricao, it.informacaoComplementar].filter(Boolean).join("\n\n")

  useEffect(() => {
    const element = ref.current
    if (element) setTruncated(element.scrollHeight > element.clientHeight)
  }, [it.descricao])

  const content = (
    <div>
      <span ref={ref} className={`${truncClass} leading-relaxed`}>{it.descricao ?? "—"}</span>
      {it.informacaoComplementar && (
        <span className="block text-[10px] text-muted-foreground/70 mt-0.5 italic line-clamp-1">{it.informacaoComplementar}</span>
      )}
    </div>
  )

  if (!truncated) return content

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[320px] whitespace-pre-wrap text-left">
          {full}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
