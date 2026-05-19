import { AlertCircle, ChevronLeft, ChevronRight, FileSearch, SearchX } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/client/components/ui/empty"
import { Skeleton } from "@/client/components/ui/skeleton"
import { SearchResultCard } from "./SearchResultCard"
import { useTextFilter } from "../../../services/search"
import type { useSearchPage } from "../hooks/useSearchPage"

type Props = ReturnType<typeof useSearchPage>

function SkeletonRow() {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}

export function SearchResultStack({
  filters,
  results,
  totalPages,
  pagina,
  isLoading,
  isError,
  submitted,
  changePage,
}: Props) {
  const textFilter = filters.q.trim()
  const { getSegmentsFor } = useTextFilter(results, textFilter)

  if (!submitted) {
    return (
      <Empty className="h-full min-h-[320px] border border-border/70 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSearch />
          </EmptyMedia>
          <EmptyTitle>Pronto para buscar</EmptyTitle>
          <EmptyDescription>
            Use a busca e os filtros para encontrar oportunidades públicas em todo o Brasil.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (isLoading) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card">
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <Empty className="h-full min-h-[320px] border border-border/70 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Erro ao carregar resultados</EmptyTitle>
          <EmptyDescription>
            Verifique sua conexão e tente pesquisar novamente.
          </EmptyDescription>
        </EmptyHeader>
        <Button type="button" variant="outline" size="sm" onClick={() => changePage(pagina)}>
          Tentar novamente
        </Button>
      </Empty>
    )
  }

  if (results.length === 0) {
    return (
      <Empty className="h-full min-h-[320px] border border-border/70 bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Nenhum resultado encontrado</EmptyTitle>
          <EmptyDescription>
            Ajuste os filtros ou tente uma busca mais ampla.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {results.map((item, index) => (
            <SearchResultCard
              key={item.id ?? index}
              item={item}
              getSegments={textFilter ? getSegmentsFor(item) : undefined}
            />
          ))}
        </div>
      </div>

      {totalPages > 1 ? (
        <div className="flex shrink-0 items-center justify-between border-t border-border/70 bg-card px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Página {pagina} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => changePage(pagina - 1)}
            >
              <ChevronLeft data-icon="inline-start" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagina >= totalPages}
              onClick={() => changePage(pagina + 1)}
            >
              Próxima
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
