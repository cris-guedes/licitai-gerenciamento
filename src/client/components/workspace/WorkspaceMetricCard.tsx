"use client"

import type { ReactNode } from "react"
import { cn } from "@/client/main/lib/utils"

type WorkspaceMetricGridProps = {
  children: ReactNode
  className?: string
}

export function WorkspaceMetricGrid({ children, className }: WorkspaceMetricGridProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  )
}

type WorkspaceMetricCardProps = {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: ReactNode
  trend?: ReactNode
  className?: string
  valueClassName?: string
}

export function WorkspaceMetricCard({
  label,
  value,
  description,
  icon,
  trend,
  className,
  valueClassName,
}: WorkspaceMetricCardProps) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-5", className)}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <div className={cn("mt-2 break-words text-2xl font-bold tracking-tight text-slate-900", valueClassName)}>
            {value}
          </div>
        </div>

        {icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </div>
        ) : null}
      </div>

      {(description || trend) ? (
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-500">
          {description ? <span className="min-w-0 break-words">{description}</span> : null}
          {trend}
        </div>
      ) : null}
    </section>
  )
}
