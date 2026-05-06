"use client"

import Link from "next/link"
import { Clock3, Eye, Plus } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useApp } from "@/client/hooks/app/useApp"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { DocumentAssistantSidebar } from "../NovaLicitacaoPage/DocumentAssistantSidebar"
import { useDocumentChatService } from "../../services/use-document-chat.service"
import { useDocumentSummaryService } from "../../services/use-document-summary.service"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { LicitacaoDraftPreviewDialog } from "./LicitacaoDraftPreviewDialog"
import { useLicitacaoDraftsPage } from "./hooks/useLicitacaoDraftsPage"

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

function formatDraftPreviewMeta(draft: {
  draftPreview: {
    modalidade: string | null
    orgaoNome: string | null
  } | null
}) {
  return [draft.draftPreview?.modalidade, draft.draftPreview?.orgaoNome]
    .filter(Boolean)
    .join(" · ")
}

export function LicitacaoDraftsPage() {
  const api = useCoreApi()
  const { empresaAtiva, orgAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
  const page = useLicitacaoDraftsPage({
    licitacaoService,
    companyId: empresaAtiva?.id ?? null,
  })

  const base = `/org/${orgAtiva?.id}/${empresaAtiva?.id}`

  return (
    <div className="space-y-6">
      <DashboardHeaderActions>
        <Button asChild>
          <Link href={`${base}/licitacoes/nova`}>
            <Plus className="mr-2 size-4" />
            Nova Licitação
          </Link>
        </Button>
      </DashboardHeaderActions>

      {page.isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Clock3 className="size-8 text-primary/70" />
            <p className="font-medium text-muted-foreground">Carregando rascunhos em andamento...</p>
          </CardContent>
        </Card>
      ) : page.drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Clock3 className="size-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">Nenhum rascunho em andamento</p>
            <p className="text-sm text-muted-foreground/70">
              Quando uma licitação for iniciada e interrompida no meio do fluxo, ela aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-none border border-slate-200/80 bg-white shadow-sm">
          {page.drafts.map(draft => (
            <button
              key={draft.licitacaoId}
              type="button"
              onClick={() => void page.openPreview(draft.licitacaoId)}
              className="grid w-full grid-cols-[minmax(0,1.6fr)_110px_110px_130px_150px] items-center gap-4 border-b border-slate-200/80 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-50/70"
            >
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-primary">
                  {draft.primaryDocumentName ?? "Licitação em andamento"}
                </p>
                {formatDraftPreviewMeta(draft) ? (
                  <p className="mt-1 truncate text-sm text-slate-700">
                    {formatDraftPreviewMeta(draft)}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-muted-foreground">
                  Última atualização em {formatDate(draft.updatedAt)}
                </p>
              </div>

              <SimpleMetric label="Docs" value={draft.documentCount} />
              <SimpleMetric label="Prontos" value={draft.readyDocuments} />
              <SimpleMetric label="Processando" value={draft.processingDocuments} />

              <div className="flex items-center justify-end gap-3">
                <div className="inline-flex min-w-[122px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  <Clock3 className="size-3.5" />
                  Em andamento
                </div>
                <Eye className="size-4 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      <LicitacaoDraftPreviewDialog
        open={Boolean(page.previewDraftId)}
        onOpenChange={open => {
          if (!open) page.closePreview()
        }}
        isLoading={page.isPreviewLoading}
        documents={page.previewDocuments}
        selectedDocument={page.selectedDocument}
        onSelectDocument={page.setSelectedDocumentId}
        continueHref={page.previewDraftId ? `${base}/licitacoes/nova?licitacaoId=${page.previewDraftId}` : `${base}/licitacoes/nova`}
        draftPreview={page.draftPreview}
        assistantSidebar={(
          <DocumentAssistantSidebar
            open
            onOpenChange={() => undefined}
            documentId={page.selectedDocument?.documentId ?? null}
            documentChatService={documentChatService}
            documentSummaryService={documentSummaryService}
          />
        )}
      />
    </div>
  )
}

function SimpleMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-primary">{value}</p>
    </div>
  )
}
