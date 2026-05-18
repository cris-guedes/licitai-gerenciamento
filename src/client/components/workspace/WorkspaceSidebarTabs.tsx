"use client"

import type { ReactNode } from "react"
import { cn } from "@/client/main/lib/utils"

export type WorkspaceSidebarTabItem = {
  id: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
}

type WorkspaceSidebarTabsProps = {
  items: WorkspaceSidebarTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function WorkspaceSidebarTabs({
  items,
  activeId,
  onChange,
  className,
}: WorkspaceSidebarTabsProps) {
  return (
    <aside className={cn("w-44 shrink-0 bg-transparent", className)}>
      <div className="flex flex-col gap-0.5 py-2">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors",
              activeId === item.id
                ? "bg-primary/6 text-slate-900 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]"
                : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-900",
            )}
          >
            {item.icon ? <span className="shrink-0 text-slate-400">{item.icon}</span> : null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? <span className="shrink-0">{item.badge}</span> : null}
          </button>
        ))}
      </div>
    </aside>
  )
}
