"use client"

import React, { useState } from "react"
import { Search, SlidersHorizontal, ChevronDown, X, Info } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Input }  from "@/client/components/ui/input"
import { Label }  from "@/client/components/ui/label"
import { Badge }  from "@/client/components/ui/badge"
import { cn }     from "@/client/main/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/client/components/ui/tooltip"

function InfoTip({ text, content }: { text?: string; content?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="size-3 text-muted-foreground/30 hover:text-muted-foreground cursor-help transition-colors shrink-0" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          {content ?? text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const KEYWORD_OPERATORS = [
  {
    example:  "pavimentação",
    label:    "Termo simples",
    desc:     "Busca a palavra em qualquer parte do texto",
  },
  {
    example:  '"consultoria em TI"',
    label:    "Frase exata",
    desc:     "Aspas exigem os termos juntos e na mesma ordem",
  },
  {
    example:  "limpeza vigilância",
    label:    "E (AND)",
    desc:     "Espaço entre termos exige que ambos estejam presentes",
  },
  {
    example:  "limpeza, conservação",
    label:    "OU (OR)",
    desc:     "Vírgula retorna resultados com qualquer um dos termos",
  },
]

function KeywordInfoContent() {
  return (
    <div className="flex flex-col gap-2.5 py-0.5 min-w-[260px]">
      <p className="text-[11px] font-semibold text-foreground/80 border-b border-border/30 pb-1.5">
        Operadores de pesquisa
      </p>
      {KEYWORD_OPERATORS.map(({ example, label, desc }) => (
        <div key={label} className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-0.5 items-start">
          <code className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded row-span-2 self-start mt-0.5 whitespace-nowrap">
            {example}
          </code>
          <span className="text-[10px] font-semibold text-foreground/75 leading-snug">{label}</span>
          <span className="text-[10px] text-muted-foreground leading-snug">{desc}</span>
        </div>
      ))}
    </div>
  )
}
import {
  type SearchFilters,
  SEARCH_FILTERS_DEFAULT,
  STATUS_OPTIONS,
  UF_OPTIONS,
  MODALIDADE_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  ESFERA_OPTIONS,
  PODER_OPTIONS,
  TIPO_OPTIONS,
  FONTE_ORCAMENTARIA_OPTIONS,
  MARGEM_PREFERENCIA_OPTIONS,
} from "../../../types/search-filters"

// ─── helpers ──────────────────────────────────────────────────────────────────

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

type ToggleGroupProps<T> = {
  options: { value: T; label: string }[]
  value:   T[]
  onChange: (next: T[]) => void
}
function ToggleGroup<T>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value.includes(opt.value)
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(toggleItem(value, opt.value))}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  onSearch: (filters: SearchFilters) => void
  onReset:  () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchFilters({ onSearch, onReset }: Props) {
  const [local, setLocal]     = useState<SearchFilters>(SEARCH_FILTERS_DEFAULT)
  const [expanded, setExpanded] = useState(false)

  function set<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function handleSearch() { onSearch(local) }

  function handleReset() {
    setLocal(SEARCH_FILTERS_DEFAULT)
    onReset()
  }

  // ── Active chips ────────────────────────────────────────────────────────────

  const chips = [
    ...local.tiposDocumento.map(v => ({
      key: `td-${v}`, label: TIPO_DOCUMENTO_OPTIONS.find(o => o.value === v)?.label ?? v,
      clear: () => set("tiposDocumento", local.tiposDocumento.filter(x => x !== v)),
    })),
    ...local.modalidades.map(v => ({
      key: `m-${v}`, label: MODALIDADE_OPTIONS.find(o => o.value === v)?.label ?? String(v),
      clear: () => set("modalidades", local.modalidades.filter(x => x !== v)),
    })),
    ...local.ufs.map(v => ({
      key: `uf-${v}`, label: v,
      clear: () => set("ufs", local.ufs.filter(x => x !== v)),
    })),
    ...local.esferas.map(v => ({
      key: `esf-${v}`, label: ESFERA_OPTIONS.find(o => o.value === v)?.label ?? v,
      clear: () => set("esferas", local.esferas.filter(x => x !== v)),
    })),
    ...local.poderes.map(v => ({
      key: `pod-${v}`, label: PODER_OPTIONS.find(o => o.value === v)?.label ?? v,
      clear: () => set("poderes", local.poderes.filter(x => x !== v)),
    })),
    ...local.tipos.map(v => ({
      key: `tp-${v}`, label: TIPO_OPTIONS.find(o => o.value === v)?.label ?? String(v),
      clear: () => set("tipos", local.tipos.filter(x => x !== v)),
    })),
    ...local.fontesOrcamentarias.map(v => ({
      key: `fo-${v}`, label: FONTE_ORCAMENTARIA_OPTIONS.find(o => o.value === v)?.label ?? v,
      clear: () => set("fontesOrcamentarias", local.fontesOrcamentarias.filter(x => x !== v)),
    })),
    ...local.tiposMargensPreferencia.map(v => ({
      key: `mp-${v}`, label: MARGEM_PREFERENCIA_OPTIONS.find(o => o.value === v)?.label ?? v,
      clear: () => set("tiposMargensPreferencia", local.tiposMargensPreferencia.filter(x => x !== v)),
    })),
    ...(local.exigenciaConteudoNacional === true ? [{
      key: "ecn", label: "Conteúdo Nacional",
      clear: () => set("exigenciaConteudoNacional", null),
    }] : []),
  ]

  const advancedCount =
    local.tiposDocumento.length + local.modalidades.length + local.ufs.length +
    local.esferas.length + local.poderes.length + local.tipos.length +
    local.fontesOrcamentarias.length + local.tiposMargensPreferencia.length +
    (local.exigenciaConteudoNacional ? 1 : 0)

  return (
    <div className="flex flex-col">

      {/* ── Busca + Status ──────────────────────────────────────────────────── */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-5">
          {/* Top Row: Search Input + Button */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Keyword */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-1.5 ml-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Palavra-chave
                </Label>
                <InfoTip content={<KeywordInfoContent />} />
              </div>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder='Ex: "consultoria em TI" ou limpeza, conservação'
                  value={local.q}
                  onChange={e => set("q", e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="h-11 pl-10 bg-muted/20 border-border/60 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all rounded-lg"
                />
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="h-11 px-8 font-bold uppercase tracking-widest text-xs gap-2.5 shrink-0 shadow-sm w-full md:w-auto"
            >
              <Search className="size-4" />
              Buscar
            </Button>
          </div>

          {/* Bottom Row: Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 ml-1">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Status
              </Label>
              <InfoTip text="Use 'Recebendo Proposta' para ver apenas oportunidades abertas onde ainda é possível participar." />
            </div>
            <div className="flex flex-wrap items-center gap-5 h-auto min-h-11 px-5 rounded-lg border border-border/60 bg-muted/20 py-2 inline-flex">
              {STATUS_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="radar-status"
                      checked={local.status === opt.value}
                      onChange={() => set("status", opt.value)}
                      className="peer appearance-none size-4 rounded-full border border-muted-foreground/30 checked:border-primary transition-all cursor-pointer bg-background"
                    />
                    <div className="absolute size-2 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced toggle row */}
        <div className="flex items-center justify-between pt-4 border-t border-dashed border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-[0.15em]">
              <SlidersHorizontal className="size-4" />
              Filtros Avançados
            </div>
            {advancedCount > 0 && (
              <Badge className="bg-primary/5 text-primary border border-primary/20 px-2 h-5 text-[9px] font-black tracking-tighter">
                {advancedCount} ATIVOS
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(prev => !prev)}
            className="h-8 pr-1 text-[10px] font-bold text-muted-foreground hover:text-primary hover:bg-transparent gap-1.5 uppercase tracking-widest"
          >
            {expanded ? "Recolher" : "Expandir"}
            <ChevronDown className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* ── Filtros Avançados ───────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border/50 px-6 py-6 space-y-6 bg-muted/10 animate-in slide-in-from-top-2 duration-200">

          {/* Row 1: Tipos de Instrumento | Tipos (Bem/Serviço/Obra) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Tipos de Instrumento
                </Label>
                <InfoTip text="Restrinja por como a contratação foi formalizada. Útil para focar em oportunidades específicas, como dispensas (contratações diretas) ou editais (processos competitivos)." />
              </div>
              <ToggleGroup
                options={TIPO_DOCUMENTO_OPTIONS}
                value={local.tiposDocumento}
                onChange={v => set("tiposDocumento", v as SearchFilters["tiposDocumento"])}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Objeto
                </Label>
                <InfoTip text="Filtre pelo que está sendo contratado. Use 'Serviço' para prestação de serviços, 'Bem' para compra de produtos, ou 'Obra' para construção e reforma." />
              </div>
              <ToggleGroup
                options={TIPO_OPTIONS}
                value={local.tipos}
                onChange={v => set("tipos", v as SearchFilters["tipos"])}
              />
            </div>
          </div>

          {/* Row 2: Modalidades */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                Modalidades
              </Label>
              <InfoTip text="Restrinja pelo rito processual da licitação. Pregão é o mais comum para bens e serviços comuns; Concorrência para contratos de maior complexidade." />
            </div>
            <ToggleGroup
              options={MODALIDADE_OPTIONS}
              value={local.modalidades}
              onChange={v => set("modalidades", v as SearchFilters["modalidades"])}
            />
          </div>

          {/* Row 3: UFs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Estados (UF)
                </Label>
                <InfoTip text="Restrinja a busca a um ou mais estados. Útil quando sua empresa só atende determinadas regiões do Brasil." />
              </div>
              {local.ufs.length > 0 && (
                <span className="text-[10px] normal-case font-bold text-primary tracking-normal">
                  {local.ufs.length} selecionado{local.ufs.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border/40 bg-background/50 max-h-36 overflow-y-auto">
              {UF_OPTIONS.map(opt => {
                const active = local.ufs.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={() => set("ufs", toggleItem(local.ufs, opt.value))}
                    className={cn(
                      "size-9 flex items-center justify-center rounded-md text-[11px] font-bold border transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border/60 hover:border-primary/30"
                    )}
                  >
                    {opt.value}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Row 4: Esferas | Poderes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Esferas
                </Label>
                <InfoTip text="Filtre pelo nível de governo do órgão contratante. Use para focar em oportunidades federais, estaduais ou municipais conforme seu mercado alvo." />
              </div>
              <ToggleGroup
                options={ESFERA_OPTIONS}
                value={local.esferas}
                onChange={v => set("esferas", v as SearchFilters["esferas"])}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Poderes
                </Label>
                <InfoTip text="Filtre pelo poder do órgão contratante. Útil para empresas que focam em segmentos específicos, como tecnologia para o Judiciário ou obras para o Executivo." />
              </div>
              <ToggleGroup
                options={PODER_OPTIONS}
                value={local.poderes}
                onChange={v => set("poderes", v as SearchFilters["poderes"])}
              />
            </div>
          </div>

          {/* Row 5: Fontes Orçamentárias | Margens de Preferência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Fontes Orçamentárias
                </Label>
                <InfoTip text="Filtre pela origem dos recursos financeiros. Útil para identificar contratos financiados por organismos internacionais (BID, Banco Mundial) ou por repasses federais." />
              </div>
              <ToggleGroup
                options={FONTE_ORCAMENTARIA_OPTIONS}
                value={local.fontesOrcamentarias}
                onChange={v => set("fontesOrcamentarias", v as SearchFilters["fontesOrcamentarias"])}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  Margens de Preferência
                </Label>
                <InfoTip text="Filtre por licitações que aplicam margem de preferência para produtos nacionais. Relevante para fabricantes que se beneficiam desse critério competitivo." />
              </div>
              <ToggleGroup
                options={MARGEM_PREFERENCIA_OPTIONS}
                value={local.tiposMargensPreferencia}
                onChange={v => set("tiposMargensPreferencia", v as SearchFilters["tiposMargensPreferencia"])}
              />
            </div>
          </div>

          {/* Row 6: Exigência de Conteúdo Nacional */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                Exigência de Conteúdo Nacional
              </Label>
              <InfoTip text="Use 'Sim' se sua empresa produz no Brasil e quer competir em licitações que exigem conteúdo nacional, geralmente com vantagem sobre importados." />
            </div>
            <div className="flex gap-2">
              {([
                { value: null,  label: "Todos" },
                { value: true,  label: "Sim" },
                { value: false, label: "Não" },
              ] as const).map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => set("exigenciaConteudoNacional", opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold border transition-all",
                    local.exigenciaConteudoNacional === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Active chips ────────────────────────────────────────────────────── */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-6 py-4 bg-muted/5 border-t border-border/40">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">
            Filtros:
          </span>
          {chips.map(chip => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1.5 py-1 px-2.5 text-[11px] font-bold bg-background border border-border/80 text-muted-foreground"
            >
              {chip.label}
              <button onClick={chip.clear} className="hover:text-destructive transition-colors">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-black text-primary hover:text-primary/70 ml-2 uppercase tracking-tighter underline underline-offset-4 decoration-primary/30"
          >
            Limpar tudo
          </button>
        </div>
      )}

    </div>
  )
}
