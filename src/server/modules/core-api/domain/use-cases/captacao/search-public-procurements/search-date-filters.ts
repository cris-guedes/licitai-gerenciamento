import type { SearchItem, SearchResponse } from "@/server/shared/lib/pncp-search"
import type { SearchPublicProcurementsControllerSchemas } from "./SearchPublicProcurementsControllerSchemas"

type SearchParams = SearchPublicProcurementsControllerSchemas.Input

type DateRange = {
    start?: string
    end?: string
}

export function hasProposalDateFilters(params: SearchParams): boolean {
    return Boolean(
        params.dataAberturaInicio ||
        params.dataAberturaFim ||
        params.dataEncerramentoInicio ||
        params.dataEncerramentoFim
    )
}

export function filterSearchResponseByProposalDates(
    response: SearchResponse,
    params: SearchParams,
): SearchResponse {
    if (!hasProposalDateFilters(params)) return response

    const pageSize = params.tamPagina ?? 20
    const requestedPage = params.pagina ?? 1
    const filtered = response.items.filter(item => matchesProposalDates(item, params))
    const start = (requestedPage - 1) * pageSize

    return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
    }
}

function matchesProposalDates(item: SearchItem, params: SearchParams): boolean {
    return (
        matchesDateRange(item.data_inicio_vigencia, {
            start: params.dataAberturaInicio,
            end: params.dataAberturaFim,
        }) &&
        matchesDateRange(item.data_fim_vigencia, {
            start: params.dataEncerramentoInicio,
            end: params.dataEncerramentoFim,
        })
    )
}

function matchesDateRange(value: string | null | undefined, range: DateRange): boolean {
    if (!range.start && !range.end) return true
    const time = value ? Date.parse(value) : Number.NaN
    if (Number.isNaN(time)) return false
    if (range.start && time < startOfDay(range.start).getTime()) return false
    if (range.end && time > endOfDay(range.end).getTime()) return false
    return true
}

function startOfDay(value: string): Date {
    return new Date(`${value.slice(0, 10)}T00:00:00.000-03:00`)
}

function endOfDay(value: string): Date {
    return new Date(`${value.slice(0, 10)}T23:59:59.999-03:00`)
}
