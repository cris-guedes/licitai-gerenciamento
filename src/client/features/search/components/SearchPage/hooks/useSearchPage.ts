"use client"

import { useState } from "react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useSearchService } from "../../../services/search"
import { type SearchFilters, SEARCH_FILTERS_DEFAULT } from "../../../types/search-filters"

const PAGE_SIZE = 20

function hasActiveFilter(filters: SearchFilters): boolean {
  return (
    !!filters.q ||
    !!filters.status ||
    filters.tiposDocumento.length > 0 ||
    filters.ufs.length > 0 ||
    filters.modalidades.length > 0 ||
    filters.esferas.length > 0 ||
    filters.poderes.length > 0 ||
    filters.tipos.length > 0 ||
    filters.fontesOrcamentarias.length > 0 ||
    filters.tiposMargensPreferencia.length > 0 ||
    filters.exigenciaConteudoNacional !== null
  )
}

type SearchPageDeps = {
  searchService?: ReturnType<typeof useSearchService>
}

export function useSearchPage(deps?: SearchPageDeps) {
  const api = useCoreApi()
  const searchService = deps?.searchService ?? useSearchService(api)

  const [filters, setFilters] = useState<SearchFilters>(SEARCH_FILTERS_DEFAULT)
  const [submitted, setSubmitted] = useState(false)

  const query = searchService.search({
    data: {
      q: filters.q || undefined,
      status: filters.status || undefined,
      tiposDocumento: filters.tiposDocumento.length ? filters.tiposDocumento : undefined,
      ufs: filters.ufs.length ? filters.ufs : undefined,
      modalidades: filters.modalidades.length ? filters.modalidades : undefined,
      esferas: filters.esferas.length ? filters.esferas : undefined,
      poderes: filters.poderes.length ? filters.poderes : undefined,
      tipos: filters.tipos.length ? filters.tipos : undefined,
      fontesOrcamentarias: filters.fontesOrcamentarias.length ? filters.fontesOrcamentarias : undefined,
      tiposMargensPreferencia: filters.tiposMargensPreferencia.length ? filters.tiposMargensPreferencia : undefined,
      exigenciaConteudoNacional: filters.exigenciaConteudoNacional ?? undefined,
      ordenacao: filters.ordenacao === "relevancia" ? undefined : filters.ordenacao,
      pagina: filters.pagina,
      tamPagina: PAGE_SIZE,
    },
    enabled: submitted && hasActiveFilter(filters),
  })

  function search(nextFilters: SearchFilters) {
    setFilters({ ...nextFilters, pagina: 1, ordenacao: "relevancia" })
    setSubmitted(true)
  }

  function updateQ(text: string) {
    if (!submitted) return
    setFilters(prev => ({ ...prev, q: text, pagina: 1 }))
  }

  function changePage(page: number) {
    setFilters(prev => ({ ...prev, pagina: page }))
  }

  function changeSort(ordenacao: SearchFilters["ordenacao"]) {
    setFilters(prev => ({ ...prev, ordenacao, pagina: 1 }))
  }

  function reset() {
    setFilters(SEARCH_FILTERS_DEFAULT)
    setSubmitted(false)
  }

  const totalPages = Math.ceil((query.data?.total ?? 0) / PAGE_SIZE)

  return {
    filters,
    results: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages,
    pagina: filters.pagina,
    ordenacao: filters.ordenacao,
    isLoading: query.isLoading,
    isError: query.isError,
    submitted,
    search,
    updateQ,
    changePage,
    changeSort,
    reset,
  }
}
