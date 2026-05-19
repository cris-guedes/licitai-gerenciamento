"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Checkbox } from "@/client/components/ui/checkbox"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Separator } from "@/client/components/ui/separator"
import { FilterSection } from "@/client/components/common/FilterSection"
import { cn } from "@/client/main/lib/utils"
import {
  ESFERA_OPTIONS,
  FONTE_ORCAMENTARIA_OPTIONS,
  MARGEM_PREFERENCIA_OPTIONS,
  MODALIDADE_OPTIONS,
  PODER_OPTIONS,
  SEARCH_FILTERS_DEFAULT,
  STATUS_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  TIPO_OPTIONS,
  UF_OPTIONS,
  type SearchFilters,
} from "../../../types/search-filters"

type Props = {
  value: SearchFilters
  onChange: (next: SearchFilters) => void
  onSearch: () => void
  onReset: () => void
  activeCount: number
}

type Option<T> = {
  value: T
  label: string
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(value => value !== item) : [...arr, item]
}

function formatDateInputValue(value: string) {
  return value || ""
}

function FilterCheckboxList<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[]
  value: T[]
  onChange: (next: T[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(option => {
        const checked = value.includes(option.value)

        return (
          <label
            key={String(option.value)}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => onChange(toggleItem(value, option.value))}
              aria-label={option.label}
            />
            <span className="truncate">{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function StatusDot({ status }: { status: SearchFilters["status"] }) {
  return (
    <span
      className={cn(
        "size-2 rounded-full bg-muted-foreground/40",
        status === "recebendo_proposta" && "bg-emerald-500",
        status === "propostas_encerradas" && "bg-blue-500",
        status === "encerrada" && "bg-slate-500"
      )}
    />
  )
}

function getStatusDisplayLabel(status: SearchFilters["status"], fallback: string) {
  if (status === "recebendo_proposta") return "Abertas / recebendo"
  if (status === "propostas_encerradas") return "Em julgamento"
  if (status === "encerrada") return "Encerradas"
  return fallback
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          id={id}
          type="date"
          value={formatDateInputValue(value)}
          onChange={event => onChange(event.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>
    </div>
  )
}

export function SearchFilters({
  value,
  onChange,
  onSearch,
  onReset,
  activeCount,
}: Props) {
  const [ufSearch, setUfSearch] = useState("")

  function set<K extends keyof SearchFilters>(key: K, nextValue: SearchFilters[K]) {
    onChange({ ...value, [key]: nextValue })
  }

  const filteredUfs = useMemo(() => {
    const query = ufSearch.trim().toLowerCase()
    if (!query) return UF_OPTIONS

    return UF_OPTIONS.filter(option => (
      option.value.toLowerCase().includes(query) ||
      option.label.toLowerCase().includes(query)
    ))
  }, [ufSearch])

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-border/70 bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
            <p className="text-xs text-muted-foreground">Refine as oportunidades</p>
          </div>
        </div>
        {activeCount > 0 ? (
          <Badge variant="secondary" className="shrink-0">
            {activeCount}
          </Badge>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <FilterSection title="Situação" collapsible defaultOpen>
          <div className="flex flex-col gap-1">
            {STATUS_OPTIONS.map(option => {
              const active = value.status === option.value

              return (
                <button
                  key={option.value || "todos"}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("status", option.value)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <StatusDot status={option.value} />
                    <span className="truncate">{getStatusDisplayLabel(option.value, option.label)}</span>
                  </span>
                  {active ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                </button>
              )
            })}
          </div>
        </FilterSection>

        <FilterSection
          title="Modalidade"
          collapsible
          action={value.modalidades.length ? <Badge variant="secondary">{value.modalidades.length}</Badge> : null}
        >
          <FilterCheckboxList
            options={MODALIDADE_OPTIONS}
            value={value.modalidades}
            onChange={next => set("modalidades", next)}
          />
        </FilterSection>

        <FilterSection
          title="Tipo de instrumento"
          collapsible
          action={value.tiposDocumento.length ? <Badge variant="secondary">{value.tiposDocumento.length}</Badge> : null}
        >
          <FilterCheckboxList
            options={TIPO_DOCUMENTO_OPTIONS}
            value={value.tiposDocumento}
            onChange={next => set("tiposDocumento", next)}
          />
        </FilterSection>

        <FilterSection
          title="Estado / UF"
          collapsible
          action={value.ufs.length ? <Badge variant="secondary">{value.ufs.length}</Badge> : null}
        >
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={ufSearch}
                onChange={event => setUfSearch(event.target.value)}
                placeholder="Buscar UF..."
                className="h-9 pl-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {filteredUfs.map(option => {
                const active = value.ufs.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.label}
                    onClick={() => set("ufs", toggleItem(value.ufs, option.value))}
                    className={cn(
                      "h-8 rounded-md border text-xs font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 text-foreground hover:bg-muted"
                    )}
                  >
                    {option.value}
                  </button>
                )
              })}
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Esfera"
          collapsible
          action={value.esferas.length ? <Badge variant="secondary">{value.esferas.length}</Badge> : null}
        >
          <FilterCheckboxList
            options={ESFERA_OPTIONS}
            value={value.esferas}
            onChange={next => set("esferas", next)}
          />
        </FilterSection>

        <FilterSection
          title="Poder"
          collapsible
          action={value.poderes.length ? <Badge variant="secondary">{value.poderes.length}</Badge> : null}
        >
          <FilterCheckboxList
            options={PODER_OPTIONS}
            value={value.poderes}
            onChange={next => set("poderes", next)}
          />
        </FilterSection>

        <FilterSection
          title="Objeto"
          collapsible
          action={value.tipos.length ? <Badge variant="secondary">{value.tipos.length}</Badge> : null}
        >
          <FilterCheckboxList
            options={TIPO_OPTIONS}
            value={value.tipos}
            onChange={next => set("tipos", next)}
          />
        </FilterSection>

        <FilterSection
          title="Datas das propostas"
          collapsible
          action={value.dataAberturaInicio || value.dataAberturaFim || value.dataEncerramentoInicio || value.dataEncerramentoFim ? <Badge variant="secondary">Ativo</Badge> : null}
        >
          <div className="flex flex-col gap-3">
            <DateField
              id="data-abertura-inicio"
              label="Abertura de"
              value={value.dataAberturaInicio}
              onChange={next => set("dataAberturaInicio", next)}
            />
            <DateField
              id="data-abertura-fim"
              label="Abertura até"
              value={value.dataAberturaFim}
              onChange={next => set("dataAberturaFim", next)}
            />
            <Separator />
            <DateField
              id="data-encerramento-inicio"
              label="Encerramento de"
              value={value.dataEncerramentoInicio}
              onChange={next => set("dataEncerramentoInicio", next)}
            />
            <DateField
              id="data-encerramento-fim"
              label="Encerramento até"
              value={value.dataEncerramentoFim}
              onChange={next => set("dataEncerramentoFim", next)}
            />
          </div>
        </FilterSection>

        <FilterSection
          title="Especial"
          collapsible
          action={value.fontesOrcamentarias.length + value.tiposMargensPreferencia.length + (value.exigenciaConteudoNacional !== null ? 1 : 0) > 0 ? (
            <Badge variant="secondary">
              {value.fontesOrcamentarias.length + value.tiposMargensPreferencia.length + (value.exigenciaConteudoNacional !== null ? 1 : 0)}
            </Badge>
          ) : null}
        >
          <div className="flex flex-col gap-4">
            <FilterCheckboxList
              options={FONTE_ORCAMENTARIA_OPTIONS}
              value={value.fontesOrcamentarias}
              onChange={next => set("fontesOrcamentarias", next)}
            />
            <Separator />
            <FilterCheckboxList
              options={MARGEM_PREFERENCIA_OPTIONS}
              value={value.tiposMargensPreferencia}
              onChange={next => set("tiposMargensPreferencia", next)}
            />
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-foreground">Conteúdo nacional</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { label: "Todos", value: null },
                  { label: "Sim", value: true },
                  { label: "Não", value: false },
                ] as const).map(option => {
                  const active = value.exigenciaConteudoNacional === option.value

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => set("exigenciaConteudoNacional", option.value)}
                      className={cn(
                        "h-8 rounded-md border text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/40 text-foreground hover:bg-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </FilterSection>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border/70 p-4">
        <Button type="button" onClick={onSearch} className="w-full">
          <SlidersHorizontal data-icon="inline-start" />
          Aplicar filtros
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setUfSearch("")
            onReset()
          }}
          disabled={activeCount === 0 && value.status === SEARCH_FILTERS_DEFAULT.status}
          className="w-full"
        >
          <RotateCcw data-icon="inline-start" />
          Limpar filtros
        </Button>
      </div>
    </div>
  )
}
