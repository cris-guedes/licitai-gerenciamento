import Fuse      from "fuse.js"
import { useMemo } from "react"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Segment     = { text: string; highlighted: boolean }
export type GetSegments = (field: string, text: string) => Segment[]

// ─── Search configuration ─────────────────────────────────────────────────────
//
// This is the ONLY place you need to change to add/remove search fields.
// Fields with higher weight rank higher in results when matched.
//
export const SEARCH_CONFIG = [
  { field: "title"          as const, weight: 0.50 },
  { field: "orgao_nome"     as const, weight: 0.25 },
  { field: "unidade_nome"   as const, weight: 0.10 },
  { field: "description"    as const, weight: 0.10 },
  { field: "municipio_nome" as const, weight: 0.05 },
] satisfies ReadonlyArray<{ field: keyof LicitacaoItem; weight: number }>

// ─── Fuse setup ───────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Splits a field value into individual words so Fuse matches word-by-word. */
function tokenize(value: unknown): string[] {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Transforms the user query for word-prefix matching in Fuse extended search.
 * "soft"      → "^soft"
 * "soft gest" → "^soft ^gest"  (Fuse: both words must be present)
 */
function toFuseQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => `^${w}`)
    .join(" ")
}

function makeFuse(items: LicitacaoItem[]): Fuse<LicitacaoItem> {
  return new Fuse(items, {
    keys: SEARCH_CONFIG.map(c => ({ name: c.field, weight: c.weight })),

    // Tokenize each field into words so ^ prefix-matching works per word
    getFn: (item, path) => {
      const field = (Array.isArray(path) ? path[0] : path) as keyof LicitacaoItem
      return tokenize(item[field])
    },

    useExtendedSearch: true, // enables ^ operator
    threshold:         0.0,  // exact prefix match only — no fuzzy drift
    ignoreLocation:    true, // position in the token list doesn't matter
    includeMatches:    false, // we compute highlight positions via regex (more accurate)
  })
}

// ─── Highlight helpers ────────────────────────────────────────────────────────

/**
 * Converts a text string + match index ranges into Segment[].
 * Pure — no React, no Fuse dependency.
 */
export function buildSegments(
  text:    string,
  indices: ReadonlyArray<[number, number]>,
): Segment[] {
  if (!indices.length) return [{ text, highlighted: false }]

  const sorted = [...indices].sort((a, b) => a[0] - b[0])
  const out: Segment[] = []
  let cursor = 0

  for (const [start, end] of sorted) {
    if (cursor < start) out.push({ text: text.slice(cursor, start), highlighted: false })
    out.push({ text: text.slice(start, end + 1), highlighted: true })
    cursor = end + 1
  }

  if (cursor < text.length) out.push({ text: text.slice(cursor), highlighted: false })
  return out
}

/**
 * Finds all word-prefix match positions for each query word.
 * Uses \b boundary so "so" matches "software" but not "also" or "verso".
 */
function getHighlightIndices(text: string, queryWords: string[]): [number, number][] {
  const indices: [number, number][] = []

  for (const word of queryWords) {
    const pattern = new RegExp(`\\b${escapeRegex(word)}`, "gi")
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      indices.push([match.index, match.index + match[0].length - 1])
    }
  }

  return indices
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const NO_HIGHLIGHT: GetSegments = (_field, text) => [{ text, highlighted: false }]

/**
 * Filters `items` using Fuse.js word-prefix matching and returns:
 * - `results`        — matched items sorted by Fuse relevance
 * - `getSegmentsFor` — returns a GetSegments fn for a given item (used by cards)
 *
 * When `query` is empty, returns original items and a no-op GetSegments.
 */
export function useTextFilter(
  items: LicitacaoItem[],
  query: string,
): {
  results:        LicitacaoItem[]
  getSegmentsFor: (item: LicitacaoItem) => GetSegments
} {
  return useMemo(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      return { results: items, getSegmentsFor: () => NO_HIGHLIGHT }
    }

    const fuseResults  = makeFuse(items).search(toFuseQuery(trimmed))
    const matchedItems = fuseResults.map(r => r.item)
    const queryWords   = trimmed.split(/\s+/).filter(Boolean)

    // getSegmentsFor is the same for all matched items:
    // highlights are computed from the query words + field text via regex.
    const getSegmentsFor = (_item: LicitacaoItem): GetSegments =>
      (_field, text) => buildSegments(text, getHighlightIndices(text, queryWords))

    return { results: matchedItems, getSegmentsFor }
  }, [items, query])
}
