"use client"

import type { ReactNode } from "react"
import { cn } from "@/client/main/lib/utils"

type WorkspacePanelProps = {
  children: ReactNode
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function WorkspacePanel({
  children,
  title,
  description,
  icon,
  actions,
  className,
  headerClassName,
  contentClassName,
}: WorkspacePanelProps) {
  const hasHeader = title || description || icon || actions

  return (
    <section className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      {hasHeader ? (
        <div className={cn("flex min-w-0 flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between", headerClassName)}>
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                {icon}
              </div>
            ) : null}

            <div className="min-w-0">
              {title ? (
                <h2 className="break-words text-sm font-semibold text-slate-900">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={cn("min-w-0 p-5", contentClassName)}>
        {children}
      </div>
    </section>
  )
}
