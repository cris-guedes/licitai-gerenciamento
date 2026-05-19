"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/client/components/ui/breadcrumb"
import { cn } from "@/client/main/lib/utils"

export type PageHeaderBreadcrumb = {
  label: ReactNode
  href?: string
}

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: PageHeaderBreadcrumb[]
  actions?: ReactNode
  className?: string
  contentClassName?: string
  titleClassName?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  contentClassName,
  titleClassName,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border/70 pb-3", className)}>
      <div className={cn("flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-between", contentClassName)}>
        <div className="min-w-0">
          {breadcrumbs?.length ? (
            <Breadcrumb className="mb-1.5">
              <BreadcrumbList className="gap-1 text-[11px] leading-none text-muted-foreground">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1

                  return (
                    <div key={`${String(item.label)}-${index}`} className="contents">
                      <BreadcrumbItem>
                        {item.href && !isLast ? (
                          <BreadcrumbLink asChild className="font-medium text-muted-foreground">
                            <Link href={item.href}>{item.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="font-medium text-muted-foreground">
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {!isLast ? <BreadcrumbSeparator /> : null}
                    </div>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : null}

          <h1 className={cn("text-xl font-semibold leading-7 text-foreground md:text-2xl", titleClassName)}>
            {title}
          </h1>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-[13px] leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
