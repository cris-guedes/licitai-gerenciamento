"use client"

import { useState } from "react"
import { ChevronLeft, FileText, MessageSquareQuote, Sparkles } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { cn } from "@/client/main/lib/utils"
import type { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import type { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import type { DocumentWorkspaceProcessingState } from "../types/document-workspace"
import { DocumentChatPanel } from "./DocumentChatPanel"
import { DocumentSummaryPanel } from "./DocumentSummaryPanel"

type DocumentChatService = ReturnType<typeof useDocumentChatService>
type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  documentChatService: DocumentChatService
  documentSummaryService: DocumentSummaryService
  processingState?: DocumentWorkspaceProcessingState
  onProcessDocument?: (() => Promise<void>) | (() => void)
}

export function DocumentAiPanel({
  open,
  onOpenChange,
  documentId,
  documentChatService,
  documentSummaryService,
  processingState = "READY",
  onProcessDocument,
}: Props) {
  const [activeTab, setActiveTab] = useState<"chat" | "summary">("chat")

  if (!open) {
    return (
      <aside className="hidden h-full min-h-0 shrink-0 border-l border-slate-100 bg-white lg:flex lg:w-14">
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          disabled={!documentId}
          className={cn(
            "flex h-full w-full flex-col items-center justify-between px-2 py-4 text-slate-500 transition-colors",
            documentId ? "hover:bg-slate-50 hover:text-primary" : "cursor-not-allowed opacity-50",
          )}
          aria-label="Expandir assistente do documento"
        >
          <MessageSquareQuote className="size-5" />
          <span className="rotate-180 text-[11px] font-semibold uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
            Assistente
          </span>
          <ChevronLeft className="size-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-[400px] min-h-0 shrink-0 flex-col overflow-hidden bg-white lg:h-full lg:w-[340px] xl:w-[380px]">
      <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-base font-semibold text-primary">
            <Sparkles className="size-4" />
            <span>Assistente do documento</span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => onOpenChange(false)}
          aria-label="Recolher assistente do documento"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as "chat" | "summary")}
        className="min-h-0 flex-1 gap-0 overflow-hidden"
      >
        <div className="shrink-0 border-b border-slate-100 px-4 pb-2">
          <TabsList  className="grid w-full grid-cols-2 gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="chat"
              className="rounded-none border-0 bg-transparent px-3 py-2 data-[state=active]:bg-transparent"
            >
              <MessageSquareQuote className="size-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="rounded-none border-0 bg-transparent px-3 py-2 data-[state=active]:bg-transparent"
            >
              <FileText className="size-4" />
              Resumo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="mt-0 min-h-0 flex-1 overflow-hidden">
          <DocumentChatPanel
            documentId={documentId}
            documentChatService={documentChatService}
            processingState={processingState}
            onProcessDocument={onProcessDocument}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3">
          <DocumentSummaryPanel
            active={activeTab === "summary"}
            documentId={documentId}
            documentSummaryService={documentSummaryService}
            processingState={processingState}
            onProcessDocument={onProcessDocument}
          />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
