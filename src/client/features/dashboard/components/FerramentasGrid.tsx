"use client"

import React from "react"
import Link from "next/link"
import {
  Search, Bell, Target, Users, FileText,
  Bot, Scale, FileSearch, MessageSquare, Zap,
  User, Lock, Radar, Building2, Settings
} from "lucide-react"
import { useAppContext } from "@/client/hooks/app"

// ─── Types ────────────────────────────────────────────────────────────────────

type Badge = "novidade" | "assine" | "em-breve"

interface Ferramenta {
  icon:   React.ElementType
  label:  string
  href?:  string
  badge?: Badge
}

interface Categoria {
  icon:        React.ElementType
  title:       string
  highlight?:  boolean
  ferramentas: Ferramenta[]
}

// ─── Badge component ──────────────────────────────────────────────────────────

function ToolBadge({ type }: { type: Badge }) {
  if (type === "novidade") return (
    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm whitespace-nowrap">
      Novidade
    </span>
  )
  if (type === "assine") return (
    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-foreground text-background shadow-sm whitespace-nowrap">
      Assine
    </span>
  )
  if (type === "em-breve") return (
    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60 whitespace-nowrap">
      Em breve
    </span>
  )
  return null
}

// ─── Tool card ────────────────────────────────────────────────────────────────

function ToolCard({ icon: Icon, label, href, badge }: Ferramenta) {
  const disabled = !href || badge === "em-breve" || badge === "assine"

  const inner = (
    <div className={`relative flex flex-col items-center justify-center gap-2.5 rounded-xl border px-4 py-5 min-w-[110px] transition-all select-none
      ${disabled
        ? "border-border/40 bg-background/60 opacity-60 cursor-default"
        : "border-border/50 bg-background hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
      }`}
    >
      {badge && <ToolBadge type={badge} />}
      <Icon className={`size-6 ${disabled ? "text-muted-foreground/50" : "text-primary/70"}`} strokeWidth={1.5} />
      <span className={`text-[11px] font-medium text-center leading-snug ${disabled ? "text-muted-foreground/60" : "text-foreground/80"}`}>
        {label}
      </span>
    </div>
  )

  if (href && !disabled) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ icon: Icon, title, highlight, ferramentas }: Categoria) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-4
      ${highlight
        ? "bg-emerald-50/60 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40"
        : "bg-card border-border/50"
      }`}
    >
      <h3 className={`flex items-center gap-2 text-sm font-bold ${highlight ? "text-emerald-800 dark:text-emerald-300" : "text-foreground/80"}`}>
        <Icon className="size-4" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-4">
        {ferramentas.map(f => (
          <ToolCard key={f.label} {...f} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FerramentasGrid() {
  const { orgAtiva, empresaAtiva } = useAppContext()
  const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

  const categorias: Categoria[] = [
    {
      icon: Radar,
      title: "Captação",
      ferramentas: [
        { icon: Search,      label: "Encontrar Licitações",    href: `${base}/search` },
        { icon: Bell,        label: "Alertas Personalizados",  badge: "em-breve" },
        { icon: Target,      label: "Licitações Estratégicas", badge: "em-breve" },
      ],
    },
    {
      icon: Bot,
      title: "Inteligência Artificial",
      highlight: true,
      ferramentas: [
        { icon: Bot,          label: "Assistente IA",      badge: "em-breve" },
        { icon: Scale,        label: "Consultor Jurídico", badge: "em-breve" },
        { icon: FileText,     label: "Resumo do Edital",   badge: "em-breve" },
        { icon: MessageSquare, label: "Pergunte ao Edital", badge: "em-breve" },
      ],
    },
    {
      icon: Building2,
      title: "Minha Empresa",
      ferramentas: [
        { icon: Users,    label: "Gerenciar Time",       href: `${base}/time` },
        { icon: Settings, label: "Gerenciar Empresas",    href: `${base}/empresa` },
        { icon: FileText, label: "Gerenciar Documentos", badge: "em-breve"   },
        { icon: User,     label: "Minha Conta",          href: `${base}/conta` },
      ],
    },
    {
      icon: Zap,
      title: "Automação",
      ferramentas: [
        { icon: Zap,  label: "Robô de Lance",    badge: "em-breve" },
        { icon: Lock, label: "Monitorar Portais", badge: "em-breve" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categorias.map(c => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
    </div>
  )
}
