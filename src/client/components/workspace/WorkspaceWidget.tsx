"use client"

import type { ReactNode } from "react"
import { cn } from "@/client/main/lib/utils"

type WorkspaceWidgetProps = {
  children: ReactNode
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  status?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
}

export function WorkspaceWidget({
  children,
  title,
  description,
  icon,
  status,
  actions,
  footer,
  className,
  bodyClassName,
}: WorkspaceWidgetProps) {
  const hasHeader = title || description || icon || status || actions

  return (
    <section className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      {hasHeader ? (
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                {icon}
              </div>
            ) : null}

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {title ? (
                  <h3 className="break-words text-sm font-semibold text-slate-900">
                    {title}
                  </h3>
                ) : null}
                {status}
              </div>
              {description ? (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}

      <div className={cn("min-h-0 flex-1", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div className="shrink-0 border-t border-slate-200 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
