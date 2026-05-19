"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/client/components/ui/collapsible"
import { cn } from "@/client/main/lib/utils"

type FilterSectionProps = {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function FilterSection({
  title,
  description,
  action,
  children,
  collapsible = false,
  defaultOpen = false,
  className,
}: FilterSectionProps) {
  if (collapsible) {
    return (
      <Collapsible
        defaultOpen={defaultOpen}
        className={cn("border-b border-border/60 last:border-b-0", className)}
      >
        <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 [&[data-state=open]>svg]:rotate-180">
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            <ChevronDown className="size-4 text-muted-foreground transition-transform" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <section className={cn("flex flex-col gap-3 border-b border-border/60 px-4 py-4 last:border-b-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
