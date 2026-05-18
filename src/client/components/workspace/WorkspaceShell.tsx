"use client"

import type { ReactNode } from "react"
import { cn } from "@/client/main/lib/utils"

type WorkspaceShellProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  variant?: "page" | "embedded"
}

export function WorkspaceShell({
  children,
  className,
  contentClassName,
  variant = "page",
}: WorkspaceShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-slate-50/50",
        variant === "page" ? "min-h-screen" : "h-full overflow-hidden border border-slate-200 bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          variant === "page" ? "px-4 py-6 sm:px-6 lg:px-8" : "overflow-hidden",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

type WorkspaceContentProps = {
  children: ReactNode
  className?: string
  layout?: "single" | "sidebar-right" | "sidebar-left"
}

export function WorkspaceContent({
  children,
  className,
  layout = "single",
}: WorkspaceContentProps) {
  return (
    <div
      className={cn(
        "min-h-0 w-full",
        layout === "single" && "space-y-6",
        layout !== "single" && "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]",
        layout === "sidebar-left" && "lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

type WorkspaceColumnProps = {
  children: ReactNode
  className?: string
}

export function WorkspaceMain({ children, className }: WorkspaceColumnProps) {
  return <main className={cn("min-w-0 space-y-6", className)}>{children}</main>
}

export function WorkspaceSidebar({ children, className }: WorkspaceColumnProps) {
  return <aside className={cn("min-w-0 space-y-6", className)}>{children}</aside>
}
