"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Scale } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/client/components/ui/sheet"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { LicitacaoList } from "./LicitacaoList/LicitacaoList"
import { LicitacaoAnalysisPanel } from "./LicitacaoAnalysis/LicitacaoAnalysisPanel"
import type { LicitacaoListItem } from "@/client/main/infra/apis/api-core"

export function LicitacaoPage() {
  const router = useRouter()
  const api = useCoreApi()
  const { orgAtiva, empresaAtiva } = useAppContext()
  const licitacaoService = useLicitacaoService(api)

  const [selectedEdital, setSelectedEdital] = useState<LicitacaoListItem | null>(null)

  const orgId     = orgAtiva?.id     ?? ""
  const companyId = empresaAtiva?.id ?? ""

  const listQuery = licitacaoService.list({ orgId, companyId })

  const licitacoes = listQuery.data?.licitacoes ?? []

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Scale className="size-5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold leading-none">Licitações</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {licitacoes.length > 0
                ? `${licitacoes.length} licitaç${licitacoes.length === 1 ? "ão" : "ões"} cadastrada${licitacoes.length === 1 ? "" : "s"}`
                : "Gerencie seus processos licitatórios"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => router.push(`/org/${orgId}/${companyId}/licitacoes/nova`)}
        >
          <Plus className="size-4" />
          Nova licitação
        </Button>
      </div>

      {/* List */}
      <LicitacaoList
        items={licitacoes}
        isLoading={listQuery.isLoading}
        onSelect={setSelectedEdital}
      />

      {/* Analysis sheet */}
      <Sheet open={!!selectedEdital} onOpenChange={(v) => { if (!v) setSelectedEdital(null) }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base line-clamp-2">
              {selectedEdital?.object ?? "Detalhes da Licitação"}
            </SheetTitle>
          </SheetHeader>
          {selectedEdital && (
            <LicitacaoAnalysisPanel editalId={selectedEdital.id} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
