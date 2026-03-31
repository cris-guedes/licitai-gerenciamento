"use client"

import { SearchFilters } from "./SearchFilters"
import { SearchResultStack } from "./SearchResultStack"
import { useSearchPage } from "./hooks/useSearchPage"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { Card } from "@/client/components/ui/card"
import { useSearchService } from "../../services/search"

export function SearchPage() {
  const api = useCoreApi()
  const searchService = useSearchService(api)
  const search = useSearchPage({ searchService })

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <Card className="shadow-sm border-border/50 overflow-hidden py-0">
        <SearchFilters onSearch={search.search} onReset={search.reset} />
      </Card>

      <Card className="shadow-sm border-border/50 overflow-hidden py-0">
        <SearchResultStack {...search} onTextChange={search.updateQ} />
      </Card>
    </div>
  )
}
