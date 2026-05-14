"use client"

import type { ReactNode } from "react"
import { Download, ExternalLink, FileText } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { DocumentSurface } from "@/client/components/document"
import { WorkspaceWidget } from "@/client/components/workspace"
import { cn } from "@/client/main/lib/utils"
import type { DocumentWorkspace } from "../types/document-workspace"

type DocumentWorkspaceWidgetProps = {
  workspace: DocumentWorkspace
  aiPanel?: ReactNode
  surface?: ReactNode
  actions?: ReactNode
  className?: string
  surfaceClassName?: string
  layout?: "preview" | "preview-with-ai"
}

const PROCESSING_LABEL: Record<DocumentWorkspace["processing"]["state"], string> = {
  FAILED: "Falhou",
  NOT_PROCESSED: "Nao processado",
  PROCESSING: "Processando",
  READY: "Pronto",
}

export function DocumentWorkspaceWidget({
  workspace,
  aiPanel,
  surface,
  actions,
  className,
  surfaceClassName,
  layout = aiPanel ? "preview-with-ai" : "preview",
}: DocumentWorkspaceWidgetProps) {
  const { document, preview, processing } = workspace
  const showAiPanel = layout === "preview-with-ai" && aiPanel

  return (
    <WorkspaceWidget
      className={cn("h-full min-h-[520px]", className)}
      bodyClassName="overflow-hidden"
      icon={<FileText className="size-4" />}
      title={document.title || document.originalName}
      description={document.originalName}
      status={
        <Badge variant="outline" className={cn(
          "rounded-md",
          processing.state === "READY" && "border-emerald-200 bg-emerald-50 text-emerald-700",
          processing.state === "PROCESSING" && "border-blue-200 bg-blue-50 text-blue-700",
          processing.state === "FAILED" && "border-rose-200 bg-rose-50 text-rose-700",
        )}>
          {PROCESSING_LABEL[processing.state]}
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2">
          {actions}
          {preview.url ? (
            <Button type="button" variant="outline" size="icon" asChild className="size-9">
              <a href={preview.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir documento">
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
          {preview.downloadUrl ?? preview.url ? (
            <Button type="button" variant="outline" size="icon" asChild className="size-9">
              <a href={preview.downloadUrl ?? preview.url} download={preview.filename} aria-label="Baixar documento">
                <Download className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      }
    >
      <div
        className={cn(
          "grid h-full min-h-0",
          showAiPanel && "lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]",
        )}
      >
        {surface ?? (
          <DocumentSurface
            url={preview.url}
            title={document.title || document.originalName}
            className={cn("min-h-[520px]", surfaceClassName)}
          />
        )}

        {showAiPanel ? (
          <div className="min-h-0 border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
            {aiPanel}
          </div>
        ) : null}
      </div>
    </WorkspaceWidget>
  )
}
