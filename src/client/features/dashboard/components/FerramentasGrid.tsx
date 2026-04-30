"use client"

import React from "react"
import Link from "next/link"
import {
  Search, Bell, Target, Users, FileText,
  Bot, Scale, MessageSquare, Zap,
  User, Lock, Radar, Building2, Settings
} from "lucide-react"
import { useDashboard } from "@/client/features/dashboard/context/dashboard-context"

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
  description: string
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
    <div className={`relative flex h-full min-h-[128px] flex-col items-start justify-between gap-4 rounded-[1.2rem] px-4 py-4 transition-all select-none
      ${disabled
        ? "bg-surface-container-lowest/72 opacity-62 cursor-default shadow-[inset_0_0_0_1px_rgba(196,198,205,0.14)]"
        : "bg-surface-container-lowest hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_34px_rgba(4,22,39,0.08)] cursor-pointer shadow-[inset_0_0_0_1px_rgba(196,198,205,0.12)]"
      }`}
    >
      {badge && <ToolBadge type={badge} />}
      <div className={`flex size-11 items-center justify-center rounded-[1rem] ${disabled ? "bg-surface-container-low text-muted-foreground/50" : "bg-surface-container-high text-primary"}`}>
        <Icon className="size-5" strokeWidth={1.7} />
      </div>
      <span className={`text-sm font-medium leading-snug ${disabled ? "text-muted-foreground/60" : "text-foreground/84"}`}>
        {label}
      </span>
    </div>
  )

  if (href && !disabled) {
    return <Link href={href} className="block h-full">{inner}</Link>
  }
  return inner
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ icon: Icon, title, description, highlight, ferramentas }: Categoria) {
  return (
    <div className={`flex h-full flex-col gap-5 rounded-[1.7rem] p-5
      ${highlight
        ? "bg-[linear-gradient(180deg,rgba(231,246,241,0.95),rgba(240,249,246,0.88))] shadow-[inset_0_0_0_1px_rgba(160,205,188,0.35)]"
        : "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,255,0.86))] shadow-[inset_0_0_0_1px_rgba(196,198,205,0.16)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={`flex items-center gap-2 text-base font-semibold ${highlight ? "text-emerald-900" : "text-primary"}`}>
            <Icon className="size-4" />
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 xl:grid-cols-3">
        {ferramentas.map(f => (
          <ToolCard key={f.label} {...f} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FerramentasGrid() {
  const { orgId, companyId } = useDashboard()
  const base = `/org/${orgId}/${companyId}`

  const categorias: Categoria[] = [
    {
      icon: Radar,
      title: "Captação",
      description: "Descubra oportunidades e acompanhe novas frentes de atuação.",
      ferramentas: [
        { icon: Search,      label: "Encontrar Licitações",    href: `${base}/search` },
        { icon: Bell,        label: "Alertas Personalizados",  badge: "em-breve" },
        { icon: Target,      label: "Licitações Estratégicas", badge: "em-breve" },
      ],
    },
    {
      icon: Bot,
      title: "Inteligência Artificial",
      description: "Ferramentas de leitura, consulta e apoio estratégico ao edital.",
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
      description: "Administre estrutura interna, contas e dados operacionais.",
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
      description: "Recursos futuros para monitoramento e execução assistida.",
      ferramentas: [
        { icon: Zap,  label: "Robô de Lance",    badge: "em-breve" },
        { icon: Lock, label: "Monitorar Portais", badge: "em-breve" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Acesso rápido
        </p>
        <h2 className="font-display text-[1.85rem] font-semibold text-primary">
          Ferramentas da operação
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Navegue pelos módulos principais da plataforma a partir de um painel mais direto e estratégico.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:auto-rows-fr xl:grid-cols-2">
        {categorias.map(c => (
          <CategoryCard key={c.title} {...c} />
        ))}
      </div>
    </div>
  )
}
