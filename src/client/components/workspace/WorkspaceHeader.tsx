"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/main/lib/utils"

export type WorkspaceBreadcrumb = {
  label: ReactNode
  href?: string
}

export type WorkspaceHeaderProps = {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: WorkspaceBreadcrumb[]
  backHref?: string
  backLabel?: string
  eyebrow?: ReactNode
  status?: ReactNode
  metadata?: ReactNode
  actions?: ReactNode
  className?: string
  titleClassName?: string
}

export function WorkspaceHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel = "Voltar",
  eyebrow,
  status,
  metadata,
  actions,
  className,
  titleClassName,
}: WorkspaceHeaderProps) {
  return (
    <header className={cn("border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8", className)}>
      {breadcrumbs?.length ? (
        <nav className="mb-4 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <div key={index} className="flex min-w-0 items-center gap-2">
                {item.href && !isLast ? (
                  <Link href={item.href} className="truncate hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn("truncate", isLast && "font-medium text-slate-900")}>
                    {item.label}
                  </span>
                )}
                {!isLast ? <ChevronRight className="size-3 shrink-0" /> : null}
              </div>
            )
          })}
        </nav>
      ) : null}

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {backHref ? (
            <Button variant="ghost" size="icon" asChild className="mt-0.5 size-9 shrink-0 rounded-full">
              <Link href={backHref} aria-label={backLabel}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          ) : null}

          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {eyebrow}
              </div>
            ) : null}

            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className={cn("min-w-0 break-words text-2xl font-bold tracking-tight text-slate-900", titleClassName)}>
                {title}
              </h1>
              {status}
            </div>

            {description ? (
              <div className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">
                {description}
              </div>
            ) : null}

            {metadata ? (
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                {metadata}
              </div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
