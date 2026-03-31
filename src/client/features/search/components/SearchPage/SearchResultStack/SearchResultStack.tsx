import { useState }  from "react"
import { Search, SearchX, ArrowUpDown, X, FileSearch, AlertCircle, ListChecks, Info } from "lucide-react"
import { Input }  from "@/client/components/ui/input"
import { Button } from "@/client/components/ui/button"
import { Badge }  from "@/client/components/ui/badge"
import { cn }       from "@/client/main/lib/utils"
import { SearchResultCard } from "./SearchResultCard"
import { useTextFilter }      from "../../../services/search"
import type { useSearchPage }  from "../hooks/useSearchPage"
import type { SearchFilters } from "../../../types/search-filters"

type SearchState = ReturnType<typeof useSearchPage>
type Props = SearchState & { onTextChange: (text: string) => void }

// ─── Sort ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SearchFilters["ordenacao"]; label: string }[] = [
  { key: "relevancia", label: "Relevância"   },
  { key: "-data",      label: "Mais Recente" },
  { key: "data",       label: "Mais Antigo"  },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="px-6 py-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded-md bg-muted" />
          <div className="h-5 w-24 rounded-md bg-muted" />
        </div>
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted opacity-50" />
      </div>
      <div className="flex gap-6">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchResultStack({
  results,
  total,
  totalPages,
  pagina,
  ordenacao,
  isLoading,
  isError,
  submitted,
  changePage,
  changeSort,
  onTextChange,
}: Props) {
  const [textFilter, setTextFilter] = useState("")

  function handleTextChange(value: string) {
    setTextFilter(value)
    onTextChange(value)
  }

  const { getSegmentsFor } = useTextFilter(results, textFilter)
  const displayedResults = results

  // ── PRE-SEARCH (Empty state) ──────────────────────────────────────────────
  if (!submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-muted-foreground animate-in fade-in duration-700">
        <div className="size-20 rounded-full bg-muted/40 flex items-center justify-center">
          <FileSearch className="size-10 opacity-10" />
        </div>
        <div className="text-center space-y-1.5 px-10">
          <p className="text-base font-bold text-foreground">Pronto para buscar</p>
          <p className="text-sm max-w-xs mx-auto text-muted-foreground/80">Use os filtros acima para encontrar licitações públicas em todo o Brasil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-card">
      
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-primary flex items-center gap-2.5 uppercase tracking-widest text-[11px]">
          <ListChecks className="size-4 text-primary/70" />
          Resultados Brutos
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-black text-[10px] px-2 py-0.5 h-auto bg-primary text-primary-foreground border-none">
            {total.toLocaleString("pt-BR")}
          </Badge>
          <Info className="size-3.5 text-muted-foreground/30 hover:text-primary transition-colors cursor-help" />
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="p-4 space-y-4 border-b bg-background/40 backdrop-blur-sm shrink-0">
        {/* Filter Input */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Filtrar nesta lista (ex: DNIT, pavimentação...)"
            value={textFilter}
            onChange={e => handleTextChange(e.target.value)}
            className="h-10 pl-10 bg-muted/10 border-border/50 focus:bg-background focus:ring-1 focus:ring-primary/10 transition-all rounded-lg text-sm"
          />
          {textFilter && (
            <button
              onClick={() => handleTextChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Sorting controls */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] shrink-0">
            <ArrowUpDown className="size-3.5 opacity-40 shrink-0" />
            ORDENAR POR
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => changeSort(opt.key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[11px] font-bold border transition-all",
                  ordenacao === opt.key
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

      {/* ── Content Area ──────────────────────────────────────────── */}
      <div className={cn("flex-1 overflow-y-auto min-h-[400px]", (isLoading || isError || displayedResults.length === 0) ? "flex flex-col" : "")}>
        
        {/* Loading skeleton */}
        {isLoading && (
          <div className="divide-y divide-border/40">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground animate-in fade-in">
            <AlertCircle className="size-10 text-destructive/40" />
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-foreground">Erro ao carregar resultados</p>
              <p className="text-xs">Verifique sua conexão e tente pesquisar novamente.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => changePage(pagina)} className="mt-2 h-8 px-4 font-bold text-[10px] uppercase">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty state (post-search) */}
        {!isLoading && !isError && results.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground animate-in fade-in">
            <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center">
              <SearchX className="size-8 opacity-20" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-sm font-bold text-foreground">Nenhum resultado encontrado</p>
              <p className="text-xs max-w-[240px] mx-auto opacity-70">Não encontramos licitações para os filtros selecionados. Tente ajustar sua busca.</p>
            </div>
          </div>
        )}

        {/* No fuzzy matches filter */}
        {!isLoading && !isError && results.length > 0 && displayedResults.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground animate-in zoom-in-95">
            <SearchX className="size-6 opacity-30" />
            <p className="text-sm">Nenhum item filtrado por <span className="font-bold text-foreground">"{textFilter}"</span></p>
            <Button variant="link" size="sm" onClick={() => setTextFilter("")} className="h-auto p-0 text-primary font-bold text-[10px] uppercase tracking-wider">
              Limpar filtro de texto
            </Button>
          </div>
        )}

        {/* Actual Cards */}
        {!isLoading && !isError && displayedResults.length > 0 && (
          <div className="divide-y divide-border/40">
            {displayedResults.map((item, i) => (
              <div
                key={item.id ?? i}
                className="hover:bg-muted/[0.03] transition-colors"
              >
                <SearchResultCard
                  item={item}
                  getSegments={textFilter.trim() ? getSegmentsFor(item) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20 shrink-0">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Página {pagina} de {totalPages}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => changePage(pagina - 1)}
              className="h-8 px-4 font-bold text-[10px] uppercase border-border/80"
            >
              ← Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina >= totalPages}
              onClick={() => changePage(pagina + 1)}
              className="h-8 px-4 font-bold text-[10px] uppercase border-border/80"
            >
              Próxima →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
