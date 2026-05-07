"use client"

import React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bell,
  Bot,
  Building2,
  FileText,
  Lock,
  MessageSquare,
  Radar,
  Scale,
  Search,
  Settings,
  Sparkles,
  Target,
  User,
  Users,
  Wand2,
  Zap,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { useDashboard } from "@/client/features/dashboard/context/dashboard-context"

type Badge = "disponivel" | "roadmap"
type ToolTone = "default" | "ai" | "muted"

type FeatureLocation = {
  label: string
  helper: string
  href: string
}

interface Ferramenta {
  icon: React.ElementType
  label: string
  description: string
  href?: string
  badge?: Badge
  tone?: ToolTone
  featureLocations?: FeatureLocation[]
}

interface Categoria {
  icon: React.ElementType
  title: string
  description: string
  eyebrow: string
  tone?: ToolTone
  ferramentas: Ferramenta[]
}

function ToolBadge({ type }: { type?: Badge }) {
  if (type === "disponivel") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Disponível
      </span>
    )
  }

  if (type === "roadmap") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span className="size-1.5 rounded-full bg-slate-400" />
        Em breve
      </span>
    )
  }

  return null
}

function getToolToneClasses(tone: ToolTone, disabled: boolean) {
  if (disabled) {
    return "border-slate-200/80 bg-white/70 text-slate-400 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.4)]"
  }

  if (tone === "ai") {
    return "border-emerald-200/70 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(232,250,242,0.95)_58%,rgba(221,244,235,0.96))] text-slate-900 shadow-[0_18px_36px_rgba(16,185,129,0.12)] hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(16,185,129,0.18)]"
  }

  return "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] text-slate-900 shadow-[0_16px_34px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.1)]"
}

function getIconToneClasses(tone: ToolTone, disabled: boolean) {
  if (disabled) {
    return "bg-slate-100 text-slate-400"
  }

  if (tone === "ai") {
    return "bg-emerald-500/12 text-emerald-700"
  }

  if (tone === "muted") {
    return "bg-slate-100 text-slate-600"
  }

  return "bg-primary/10 text-primary"
}

function FeatureDiscoveryDialog({
  feature,
  open,
  onOpenChange,
}: {
  feature: Ferramenta | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const locations = feature?.featureLocations ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[1.5rem] border-slate-200/80 bg-white p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)]">
        <DialogHeader className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(236,253,245,0.96),rgba(255,255,255,0.98)_58%)] px-6 py-6 text-left">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700">
              {feature?.icon ? <feature.icon className="size-5" /> : <Sparkles className="size-5" />}
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
                {feature?.label ?? "Feature de IA"}
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {feature?.description ?? "Descubra onde essa feature pode ser usada dentro da operação."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6">
          <div className="rounded-[1.25rem] border border-emerald-200/70 bg-emerald-50/70 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Onde encontrar
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Essa feature já aparece nas telas abaixo.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {locations.map(location => (
              <Link
                key={`${feature?.label}-${location.href}`}
                href={location.href}
                className="group rounded-[1.25rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{location.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{location.helper}</p>
                  </div>
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200/80 px-6 py-4">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToolCard({
  icon: Icon,
  label,
  description,
  href,
  badge,
  tone = "default",
  featureLocations,
  onFeatureClick,
}: Ferramenta & {
  onFeatureClick?: (feature: Ferramenta) => void
}) {
  const opensDialog = Boolean(featureLocations?.length)
  const disabled = !href && !opensDialog
  const rootClassName = `group relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.5rem] border px-5 py-5 text-left transition-all ${getToolToneClasses(tone, disabled)}`

  const content = (
    <>
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.52),transparent_70%)]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] ${getIconToneClasses(tone, disabled)}`}>
          <Icon className="size-5" strokeWidth={1.8} />
        </div>
        <ToolBadge type={badge} />
      </div>

      <div className="relative mt-8">
        <p className={`text-[1.05rem] font-semibold tracking-[-0.02em] ${disabled ? "text-slate-400" : "text-slate-950"}`}>
          {label}
        </p>
        <p className={`mt-2 text-sm leading-6 ${disabled ? "text-slate-400" : "text-slate-600"}`}>
          {description}
        </p>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${disabled ? "text-slate-400" : tone === "ai" ? "text-emerald-700" : "text-slate-500"}`}>
          {opensDialog ? "Ver telas" : disabled ? "Roadmap" : "Abrir"}
        </span>
        <div className={`flex size-9 items-center justify-center rounded-full transition-all ${disabled ? "bg-slate-100 text-slate-400" : tone === "ai" ? "bg-emerald-500/12 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white" : "bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white"}`}>
          <ArrowRight className="size-4" />
        </div>
      </div>
    </>
  )

  if (opensDialog) {
    return (
      <button
        type="button"
        onClick={() => onFeatureClick?.({ icon: Icon, label, description, href, badge, tone, featureLocations })}
        className={rootClassName}
      >
        {content}
      </button>
    )
  }

  if (href && !disabled) {
    return (
      <Link href={href} className={rootClassName}>
        {content}
      </Link>
    )
  }

  return <div className={rootClassName}>{content}</div>
}

function getCategoryToneClasses(tone: ToolTone) {
  if (tone === "ai") {
    return "border-emerald-200/70 bg-[radial-gradient(circle_at_top_left,rgba(236,253,245,0.96),rgba(255,255,255,0.98)_56%,rgba(220,252,231,0.92))] shadow-[0_20px_50px_rgba(16,185,129,0.08)]"
  }

  if (tone === "muted") {
    return "border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.96))] shadow-[0_16px_38px_rgba(15,23,42,0.05)]"
  }

  return "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_16px_38px_rgba(15,23,42,0.06)]"
}

function getCategoryEyebrowClasses(tone: ToolTone) {
  if (tone === "ai") return "text-emerald-700"
  return "text-slate-500"
}

function CategoryCard({
  icon: Icon,
  title,
  description,
  eyebrow,
  tone = "default",
  ferramentas,
  onFeatureClick,
}: Categoria & {
  onFeatureClick?: (feature: Ferramenta) => void
}) {
  return (
    <section className={`relative overflow-hidden rounded-[2rem] border p-6 ${getCategoryToneClasses(tone)}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.5),transparent_38%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${getCategoryEyebrowClasses(tone)}`}>
              {eyebrow}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-[1.2rem] ${tone === "ai" ? "bg-emerald-500/12 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            </div>
          </div>

          {tone === "ai" ? (
            <div className="hidden rounded-full border border-emerald-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 md:inline-flex">
              Recursos ativos
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ferramentas.map(ferramenta => (
            <ToolCard
              key={ferramenta.label}
              {...ferramenta}
              onFeatureClick={onFeatureClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function FerramentasGrid() {
  const { orgId, companyId } = useDashboard()
  const [selectedFeature, setSelectedFeature] = React.useState<Ferramenta | null>(null)
  const base = `/org/${orgId}/${companyId}`

  const iaFeatureLocations = {
    assistant: [
      {
        label: "Nova Licitação",
        helper: "Abra o workspace da IA e use o assistente do documento para conversar e revisar o edital.",
        href: `${base}/licitacoes/nova`,
      },
      {
        label: "Rascunhos",
        helper: "Dentro do preview do rascunho você também encontra o assistente do documento ao lado do PDF.",
        href: `${base}/licitacoes/rascunhos`,
      },
    ],
    summary: [
      {
        label: "Nova Licitação",
        helper: "No assistente do documento, acesse a aba Resumo para gerar a leitura executiva do edital.",
        href: `${base}/licitacoes/nova`,
      },
      {
        label: "Rascunhos",
        helper: "Ao revisar um rascunho, use a aba Resumo dentro do assistente lateral do documento.",
        href: `${base}/licitacoes/rascunhos`,
      },
    ],
    chat: [
      {
        label: "Nova Licitação",
        helper: "Na aba Chat do assistente do documento você pode perguntar diretamente sobre o PDF carregado.",
        href: `${base}/licitacoes/nova`,
      },
      {
        label: "Rascunhos",
        helper: "No workspace do rascunho, o chat do documento continua disponível para leitura assistida.",
        href: `${base}/licitacoes/rascunhos`,
      },
    ],
  }

  const categorias: Categoria[] = [
    {
      icon: Radar,
      title: "Captação",
      eyebrow: "Busca ativa",
      description: "Explore oportunidades, acompanhe radar de mercado e mantenha a operação em movimento.",
      ferramentas: [
        {
          icon: Search,
          label: "Encontrar Licitações",
          description: "Busque editais com filtros e leitura mais contextual do mercado público.",
          href: `${base}/search`,
        },
        {
          icon: Bell,
          label: "Alertas Personalizados",
          description: "Receba sinais automáticos quando novas oportunidades aderirem ao seu perfil.",
          badge: "roadmap",
          tone: "muted",
        },
        {
          icon: Target,
          label: "Licitações Estratégicas",
          description: "Priorize frentes com maior aderência comercial e mais chance de conversão.",
          badge: "roadmap",
          tone: "muted",
        },
      ],
    },
    {
      icon: Wand2,
      title: "Inteligência Artificial",
      eyebrow: "Leitura assistida",
      description: "Descubra onde já usar chat, resumo e apoio especializado dentro do fluxo do edital.",
      tone: "ai",
      ferramentas: [
        {
          icon: Bot,
          label: "Assistente IA",
          description: "Central de apoio para leitura do documento, revisão contextual e navegação assistida.",
          badge: "disponivel",
          tone: "ai",
          featureLocations: iaFeatureLocations.assistant,
        },
        {
          icon: Scale,
          label: "Consultor Jurídico",
          description: "Use o chat do documento para explorar cláusulas, obrigações e riscos jurídicos do edital.",
          badge: "disponivel",
          tone: "ai",
          featureLocations: iaFeatureLocations.chat,
        },
        {
          icon: FileText,
          label: "Resumo do Edital",
          description: "Gere uma leitura executiva com prazos, pontos-chave e requisitos relevantes.",
          badge: "disponivel",
          tone: "ai",
          featureLocations: iaFeatureLocations.summary,
        },
        {
          icon: MessageSquare,
          label: "Pergunte ao Edital",
          description: "Converse com o PDF para esclarecer dúvidas sobre documentos, datas e exigências.",
          badge: "disponivel",
          tone: "ai",
          featureLocations: iaFeatureLocations.chat,
        },
      ],
    },
    {
      icon: Building2,
      title: "Minha Empresa",
      eyebrow: "Estrutura operacional",
      description: "Administre equipe, empresas e dados da conta a partir de um ponto central.",
      ferramentas: [
        {
          icon: Users,
          label: "Gerenciar Time",
          description: "Controle membros, papéis e acesso à operação da organização.",
          href: `${base}/time`,
        },
        {
          icon: Settings,
          label: "Gerenciar Empresas",
          description: "Organize empresas vinculadas e mantenha a base institucional atualizada.",
          href: `${base}/empresa`,
        },
        {
          icon: FileText,
          label: "Gerenciar Documentos",
          description: "Hub futuro para centralizar PDFs, anexos e histórico documental.",
          badge: "roadmap",
          tone: "muted",
        },
        {
          icon: User,
          label: "Minha Conta",
          description: "Ajuste preferências pessoais, dados de acesso e informações da conta.",
          href: `${base}/conta`,
        },
      ],
    },
    {
      icon: Zap,
      title: "Automação",
      eyebrow: "Roadmap",
      description: "Linha futura de execução assistida para monitoramento e automações operacionais.",
      tone: "muted",
      ferramentas: [
        {
          icon: Zap,
          label: "Robô de Lance",
          description: "Camada futura para apoio operacional em estratégias de disputa e acompanhamento.",
          badge: "roadmap",
          tone: "muted",
        },
        {
          icon: Lock,
          label: "Monitorar Portais",
          description: "Monitoramento contínuo de portais e rotinas automatizadas de vigilância.",
          badge: "roadmap",
          tone: "muted",
        },
      ],
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(230,242,255,0.9),rgba(255,255,255,0.98)_36%,rgba(248,250,252,0.96))] px-6 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Acesso rápido
          </p>
          <h2 className="mt-3 font-display text-[2rem] font-semibold tracking-[-0.04em] text-primary md:text-[2.35rem]">
            Ferramentas da operação
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Navegue pelos módulos mais importantes da plataforma com atalhos mais claros, visuais mais fortes e descoberta guiada das features de IA já disponíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {categorias.map(categoria => (
            <CategoryCard
              key={categoria.title}
              {...categoria}
              onFeatureClick={setSelectedFeature}
            />
          ))}
        </div>
      </div>

      <FeatureDiscoveryDialog
        feature={selectedFeature}
        open={Boolean(selectedFeature)}
        onOpenChange={open => {
          if (!open) {
            setSelectedFeature(null)
          }
        }}
      />
    </>
  )
}
