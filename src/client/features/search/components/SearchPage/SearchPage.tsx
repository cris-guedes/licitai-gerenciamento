"use client"

import { useMemo, useState } from "react"
import {
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/client/components/ui/sheet"
import { SearchFilters } from "./SearchFilters"
import { SearchResultStack } from "./SearchResultStack"
import { useSearchPage } from "./hooks/useSearchPage"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useSearchService } from "../../services/search"
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
  type Ordenacao,
  type SearchFilters as SearchFiltersType,
} from "../../types/search-filters"

const SORT_OPTIONS: { key: Ordenacao; label: string }[] = [
  { key: "relevancia", label: "Relevância" },
  { key: "-data", label: "Mais recentes" },
  { key: "data", label: "Mais antigas" },
]

function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function countActiveFilters(filters: SearchFiltersType) {
  return (
    (filters.q.trim() ? 1 : 0) +
    (filters.status && filters.status !== SEARCH_FILTERS_DEFAULT.status ? 1 : 0) +
    filters.tiposDocumento.length +
    filters.ufs.length +
    filters.modalidades.length +
    filters.esferas.length +
    filters.poderes.length +
    filters.tipos.length +
    filters.fontesOrcamentarias.length +
    filters.tiposMargensPreferencia.length +
    (filters.exigenciaConteudoNacional !== null ? 1 : 0) +
    (filters.dataAberturaInicio || filters.dataAberturaFim ? 1 : 0) +
    (filters.dataEncerramentoInicio || filters.dataEncerramentoFim ? 1 : 0)
  )
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(value => value !== item) : [...arr, item]
}

function ActiveFilterSummary({
  filters,
  onReset,
}: {
  filters: SearchFiltersType
  onReset: () => void
}) {
  const chips = useMemo(() => {
    const items: string[] = []
    const optionLabel = <T extends string | number>(
      options: Array<{ value: T; label: string }>,
      value: T,
    ) => options.find(option => option.value === value)?.label ?? String(value)

    if (filters.q.trim()) items.push(`Busca: ${filters.q.trim()}`)
    if (filters.status && filters.status !== SEARCH_FILTERS_DEFAULT.status) {
      items.push(STATUS_OPTIONS.find(option => option.value === filters.status)?.label ?? filters.status)
    }
    filters.modalidades.forEach(value => items.push(optionLabel(MODALIDADE_OPTIONS, value)))
    filters.tiposDocumento.forEach(value => items.push(optionLabel(TIPO_DOCUMENTO_OPTIONS, value)))
    filters.ufs.forEach(value => items.push(optionLabel(UF_OPTIONS, value)))
    filters.esferas.forEach(value => items.push(optionLabel(ESFERA_OPTIONS, value)))
    filters.poderes.forEach(value => items.push(optionLabel(PODER_OPTIONS, value)))
    filters.tipos.forEach(value => items.push(optionLabel(TIPO_OPTIONS, value)))
    filters.fontesOrcamentarias.forEach(value => items.push(`Fonte: ${optionLabel(FONTE_ORCAMENTARIA_OPTIONS, value)}`))
    filters.tiposMargensPreferencia.forEach(value => items.push(optionLabel(MARGEM_PREFERENCIA_OPTIONS, value)))

    if (filters.exigenciaConteudoNacional !== null) {
      items.push(filters.exigenciaConteudoNacional ? "Conteúdo nacional" : "Sem conteúdo nacional")
    }
    if (filters.dataEncerramentoInicio || filters.dataEncerramentoFim) items.push("Encerramento definido")
    if (filters.dataAberturaInicio || filters.dataAberturaFim) items.push("Abertura definida")

    return items
  }, [filters])

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
      <span className="text-xs font-medium text-muted-foreground">Filtros ativos</span>
      {chips.map(chip => (
        <Badge key={chip} variant="secondary" className="font-medium">
          {chip}
        </Badge>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs">
        Limpar
      </Button>
    </div>
  )
}

function QuickFilters({
  filters,
  onApply,
}: {
  filters: SearchFiltersType
  onApply: (next: SearchFiltersType) => void
}) {
  const today = toDateInputValue(new Date())
  const nextWeek = toDateInputValue(addDays(new Date(), 7))
  const pregaoEletronicoValue = MODALIDADE_OPTIONS.find(option => option.label === "Pregão Eletrônico")?.value
  const pregaoValues = pregaoEletronicoValue ? [pregaoEletronicoValue] : []

    const quickFilters = [
    {
      label: "Abertas",
      active: filters.status === "recebendo_proposta",
      apply: () => ({ ...filters, status: "recebendo_proposta" as const, pagina: 1 }),
    },
    {
      label: "Edital",
      active: filters.tiposDocumento.includes("edital"),
      apply: () => ({ ...filters, tiposDocumento: toggleItem(filters.tiposDocumento, "edital"), pagina: 1 }),
    },
    {
      label: "Pregão Eletrônico",
      active: pregaoValues.some(value => filters.modalidades.includes(value)),
      apply: () => {
        const hasAny = pregaoValues.some(value => filters.modalidades.includes(value))
        return {
          ...filters,
          modalidades: hasAny
            ? filters.modalidades.filter(value => !pregaoValues.includes(value))
            : Array.from(new Set([...filters.modalidades, ...pregaoValues])),
          pagina: 1,
        }
      },
    },
    {
      label: "Encerra esta semana",
      active: filters.dataEncerramentoInicio === today && filters.dataEncerramentoFim === nextWeek,
      apply: () => ({
        ...filters,
        dataEncerramentoInicio: filters.dataEncerramentoInicio === today && filters.dataEncerramentoFim === nextWeek ? "" : today,
        dataEncerramentoFim: filters.dataEncerramentoInicio === today && filters.dataEncerramentoFim === nextWeek ? "" : nextWeek,
        pagina: 1,
      }),
    },
    {
      label: "Abre esta semana",
      active: filters.dataAberturaInicio === today && filters.dataAberturaFim === nextWeek,
      apply: () => ({
        ...filters,
        dataAberturaInicio: filters.dataAberturaInicio === today && filters.dataAberturaFim === nextWeek ? "" : today,
        dataAberturaFim: filters.dataAberturaInicio === today && filters.dataAberturaFim === nextWeek ? "" : nextWeek,
        pagina: 1,
      }),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {quickFilters.map(item => (
        <Button
          key={item.label}
          type="button"
          variant={item.active ? "default" : "outline"}
          size="sm"
          onClick={() => onApply(item.apply())}
          className="h-7 rounded-full px-3 text-xs"
        >
          {item.label}
        </Button>
      ))}
    </div>
  )
}

export function SearchPage() {
  const api = useCoreApi()
  const searchService = useSearchService(api)
  const search = useSearchPage({ searchService })
  const [draftFilters, setDraftFilters] = useState<SearchFiltersType>(SEARCH_FILTERS_DEFAULT)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCount = countActiveFilters(draftFilters)

  function applySearch(nextFilters = draftFilters) {
    const next = { ...nextFilters, pagina: 1, ordenacao: "relevancia" as const }
    setDraftFilters(next)
    search.search(next)
    setFiltersOpen(false)
  }

  function resetFilters() {
    setDraftFilters(SEARCH_FILTERS_DEFAULT)
    search.reset()
  }

  function updateDraft<K extends keyof SearchFiltersType>(key: K, value: SearchFiltersType[K]) {
    setDraftFilters(prev => ({ ...prev, [key]: value }))
  }

  function applySort(ordenacao: Ordenacao) {
    setDraftFilters(prev => ({ ...prev, ordenacao }))

    if (search.submitted) {
      search.changeSort(ordenacao)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-6rem)] min-h-0 w-full max-w-[1800px] flex-col overflow-hidden">
      <div className="grid h-full min-h-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden min-h-0 lg:block">
          <div className="h-full min-h-0">
            <SearchFilters
              value={draftFilters}
              onChange={setDraftFilters}
              onSearch={() => applySearch()}
              onReset={resetFilters}
              activeCount={activeCount}
            />
          </div>
        </div>

        <main className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
          <div className="flex shrink-0 flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={draftFilters.q}
                  onChange={event => updateDraft("q", event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") applySearch()
                  }}
                  placeholder="Buscar por objeto, órgão, número do edital, palavra-chave..."
                  className="h-11 rounded-lg bg-card pl-10 text-sm shadow-xs"
                />
              </div>
              <Button type="button" onClick={() => applySearch()} className="h-11 px-5">
                <Search data-icon="inline-start" />
                Buscar
              </Button>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" className="h-11 lg:hidden">
                    <Filter data-icon="inline-start" />
                    Filtros
                    {activeCount > 0 ? <Badge variant="secondary">{activeCount}</Badge> : null}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(100vw,24rem)] gap-0 p-0 sm:max-w-md">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Filtros de captação</SheetTitle>
                    <SheetDescription>Refine a busca de oportunidades públicas.</SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto p-3">
                    <SearchFilters
                      value={draftFilters}
                      onChange={setDraftFilters}
                      onSearch={() => applySearch()}
                      onReset={resetFilters}
                      activeCount={activeCount}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <QuickFilters filters={draftFilters} onApply={applySearch} />
              <ActiveFilterSummary filters={draftFilters} onReset={resetFilters} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-lg border border-border/70 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {search.submitted ? `${search.total.toLocaleString("pt-BR")} resultados` : "Resultados"}
              </span>
              {search.submitted ? (
                <span className="text-xs text-muted-foreground">
                  página {search.pagina} de {Math.max(search.totalPages, 1)}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Ordenar por</span>
              <Select value={draftFilters.ordenacao} onValueChange={value => applySort(value as Ordenacao)}>
                <SelectTrigger size="sm" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <SearchResultStack {...search} />
          </div>
        </main>
      </div>
    </div>
  )
}
