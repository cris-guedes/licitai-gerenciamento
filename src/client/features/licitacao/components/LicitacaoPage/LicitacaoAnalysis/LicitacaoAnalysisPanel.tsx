"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/client/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { ScrollArea } from "@/client/components/ui/scroll-area"
import { Separator } from "@/client/components/ui/separator"
import { Plus, Sparkles, CheckCheck, ChevronRight, Loader2 } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useAnalysisService } from "../../../services/use-analysis.service"
import { AddDocumentDialog } from "./AddDocumentDialog"
import { EditalAnalysisReview } from "./EditalAnalysisReview"
import type { EditalAnalysisResponse } from "@/client/main/infra/apis/api-core"

type Props = {
  editalId: string
}

export function LicitacaoAnalysisPanel({ editalId }: Props) {
  const api = useCoreApi()
  const { orgAtiva, empresaAtiva } = useAppContext()
  const analysisService = useAnalysisService(api)

  const orgId     = orgAtiva?.id     ?? ""
  const companyId = empresaAtiva?.id ?? ""

  const [addDocOpen,         setAddDocOpen]         = useState(false)
  const [selectedDocIds,     setSelectedDocIds]      = useState<string[]>([])
  const [selectedAnalysisId, setSelectedAnalysisId]  = useState<string | null>(null)

  const listQuery = analysisService.listAnalyses({ orgId, editalId })
  const analyses  = listQuery.data?.analyses ?? []

  const selectedAnalysis = selectedAnalysisId
    ? analyses.find((a) => a.id === selectedAnalysisId) ?? analyses[0]
    : analyses[0]

  function handleDocumentAdded(documentId: string) {
    setSelectedDocIds((prev) => [...prev, documentId])
  }

  async function handleRunAnalysis() {
    if (selectedDocIds.length === 0) {
      return toast.error("Adicione pelo menos um documento antes de analisar.")
    }
    try {
      await analysisService.runAnalysis.mutateAsync({ orgId, companyId, editalId, documentIds: selectedDocIds })
      toast.success("Análise iniciada com sucesso.")
      setSelectedDocIds([])
    } catch {
      toast.error("Erro ao iniciar análise.")
    }
  }

  async function handleApprove(analysis: EditalAnalysisResponse) {
    try {
      await analysisService.approveAnalysis.mutateAsync({ editalAnalysisId: analysis.id, editalId })
      toast.success("Dados aprovados e promovidos para o edital.")
    } catch {
      toast.error("Erro ao aprovar análise.")
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary/70" />
          <h2 className="text-sm font-semibold">Análise de Edital</h2>
          {analyses.length > 0 && (
            <span className="text-xs text-muted-foreground">({analyses.length} análise{analyses.length !== 1 ? "s" : ""})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddDocOpen(true)}>
            <Plus className="size-3.5" />
            Documento
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleRunAnalysis}
            disabled={analysisService.runAnalysis.isPending || selectedDocIds.length === 0}
          >
            {analysisService.runAnalysis.isPending
              ? <Loader2 className="size-3.5 animate-spin" />
              : <Sparkles className="size-3.5" />
            }
            Analisar ({selectedDocIds.length})
          </Button>
        </div>
      </div>

      {selectedDocIds.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b text-xs text-blue-700 flex items-center gap-2">
          <CheckCheck className="size-3.5" />
          {selectedDocIds.length} documento{selectedDocIds.length !== 1 ? "s" : ""} selecionado{selectedDocIds.length !== 1 ? "s" : ""} para análise.
          <button className="ml-auto text-blue-500 hover:underline" onClick={() => setSelectedDocIds([])}>Limpar</button>
        </div>
      )}

      {analyses.length === 0 && !listQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-2">
          <Sparkles className="size-8 opacity-20" strokeWidth={1} />
          <p className="text-sm font-medium">Nenhuma análise ainda</p>
          <p className="text-xs">Adicione documentos e clique em "Analisar" para começar.</p>
        </div>
      ) : (
        <div className="flex min-h-[340px]">
          {/* Sidebar com lista de análises */}
          <div className="w-44 border-r shrink-0">
            <ScrollArea className="h-full">
              <div className="py-2">
                {analyses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAnalysisId(a.id)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                      selectedAnalysis?.id === a.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">Versão {a.version}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{a.status}</p>
                    </div>
                    <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Detalhe da análise selecionada */}
          <div className="flex-1 min-w-0">
            {selectedAnalysis ? (
              <div className="p-4">
                <ScrollArea className="max-h-[600px]">
                  <EditalAnalysisReview analysis={selectedAnalysis} />
                </ScrollArea>

                {selectedAnalysis.status === "completed" && (
                  <>
                    <Separator className="my-4" />
                    <Button
                      className="w-full gap-1.5"
                      onClick={() => handleApprove(selectedAnalysis)}
                      disabled={analysisService.approveAnalysis.isPending}
                    >
                      {analysisService.approveAnalysis.isPending
                        ? <Loader2 className="size-4 animate-spin" />
                        : <CheckCheck className="size-4" />
                      }
                      Aprovar e aplicar ao Edital
                    </Button>
                  </>
                )}

                {selectedAnalysis.status === "approved" && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCheck className="size-4" />
                    Dados aplicados ao edital
                    {selectedAnalysis.approvedAt && (
                      <span className="text-muted-foreground ml-auto text-xs">
                        {new Date(selectedAnalysis.approvedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <AddDocumentDialog
        open={addDocOpen}
        editalId={editalId}
        onClose={() => setAddDocOpen(false)}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  )
}
