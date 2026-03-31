"use client"

import { Loader2, SearchX } from "lucide-react"
import { Button }           from "@/client/components/ui/button"
import { SearchResultCard }  from "../SearchResultCard"
import type { useSearchPage } from "../../hooks/useSearchPage"

type Props = ReturnType<typeof useSearchPage>

export function SearchResultList({
  results,
  total,
  totalPages,
  pagina,
  isLoading,
  isError,
  submitted,
  changePage,
}: Props) {

  if (!submitted) return null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin mr-2" />
        Buscando editais...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <SearchX className="size-8" />
        <p className="text-sm">Erro ao buscar editais. Tente novamente.</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
        <SearchX className="size-8" />
        <p className="text-sm">Nenhum resultado encontrado para os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total.toLocaleString("pt-BR")}</span> editais encontrados
      </p>

      {/* Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((item, i) => (
          <SearchResultCard key={item.id ?? i} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina <= 1}
            onClick={() => changePage(pagina - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Página {pagina} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= totalPages}
            onClick={() => changePage(pagina + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
