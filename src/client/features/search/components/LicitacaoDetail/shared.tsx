"use client"

import React from "react"
import { Loader2 } from "lucide-react"

export function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 leading-none">
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{value}</span>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-4">
      {children}
    </h3>
  )
}

export function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground min-h-[300px]">
      <Icon className="size-8 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
      <Loader2 className="size-4 animate-spin" /> {text}
    </div>
  )
}

export function formatDate(str?: string | null) {
  if (!str) return null
  return new Date(str).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateShort(str?: string | null) {
  if (!str) return null
  return new Date(str).toLocaleDateString("pt-BR")
}
