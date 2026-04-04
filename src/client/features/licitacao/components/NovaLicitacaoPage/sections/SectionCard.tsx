import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/client/main/lib/utils"

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SectionCard({ icon: Icon, title, description, children, className }: Props) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      <div className="flex items-start gap-3 px-5 py-4 border-b bg-muted/30">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 mt-0.5">
          <Icon className="size-4 text-primary/70" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-none">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}
