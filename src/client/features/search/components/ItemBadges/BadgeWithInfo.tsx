"use client"

import { Info } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/client/components/ui/tooltip"

type Props = {
  label: string
  colorClass: string
  tooltip: string
}

export function BadgeWithInfo({ label, colorClass, tooltip }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full cursor-default ${colorClass}`}>
            {label}
            <Info size={9} className="opacity-60 shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
