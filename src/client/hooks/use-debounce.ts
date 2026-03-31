import { useState, useEffect } from "react"

/**
 * Atrasa a atualização de um valor pelo tempo especificado.
 * Útil para evitar excesso de chamadas em inputs de busca.
 *
 * @example
 * const debouncedSearch = useDebounce(searchText, 400)
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
