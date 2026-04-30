"use client"

import { useCoreApi } from "@/client/hooks/use-core-api"
import { ExtractEditalModal } from "./ExtractEditalModal"
import { NovaLicitacaoForm } from "./NovaLicitacaoForm"
import { useNovaLicitacaoPage } from "./hooks/useNovaLicitacaoPage"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { Button } from "@/client/components/ui/button"
import { Bot } from "lucide-react"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"

export function NovaLicitacaoPage() {
  const api = useCoreApi()
  const licitacaoService = useLicitacaoService(api)
  const page = useNovaLicitacaoPage({ licitacaoService })
  const { handleResetForm, setIsExtractModalOpen } = page

  return (
    <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-4 pt-4 md:pt-5 pb-10">
      <DashboardHeaderActions>
        <Button
          type="button"
          variant="ghost"
          onClick={handleResetForm}
          className="px-3 text-[13px] text-secondary hover:text-secondary"
        >
          Limpar formulário
        </Button>
        <Button type="button" onClick={() => setIsExtractModalOpen(true)} className="min-w-52">
          <Bot className="mr-2 size-4" />
          Extrair campos com IA
        </Button>
      </DashboardHeaderActions>

      <NovaLicitacaoForm form={page.form} />

      <ExtractEditalModal
        open={page.isExtractModalOpen}
        onOpenChange={page.setIsExtractModalOpen}
        onExtractFile={page.handleExtractFile}
        onApplyExtraction={page.handleApplyExtraction}
        result={page.extractionResult}
        isPending={page.extraction.isPending}
        error={page.extraction.error}
        progress={page.extraction.progress}
        preview={page.extraction.preview}
      />
    </div>
  )
}
