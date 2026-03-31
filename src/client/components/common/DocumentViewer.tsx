"use client"

import { useState } from "react"
import { Download, ExternalLink, FileText, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { cn }    from "@/client/main/lib/utils"

interface Props {
  url:       string
  title?:    string
  className?: string
}

function googleDocsViewerUrl(url: string) {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

export function DocumentViewer({ url, title, className }: Props) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")

  const viewerUrl = googleDocsViewerUrl(url)

  return (
    <div className={cn("flex flex-col h-full", className)}>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate text-muted-foreground">
            {title ?? "Documento"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              Abrir
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} download>
              <Download className="size-3.5 mr-1.5" />
              Download
            </a>
          </Button>
        </div>
      </div>

      {/* ── Viewer ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 bg-muted/5">

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground z-10 bg-background/80">
            <Loader2 className="size-5 animate-spin" />
            Carregando documento...
          </div>
        )}

        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <AlertCircle className="size-10 opacity-30" />
            <p className="text-sm">Não foi possível pré-visualizar este documento.</p>
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1.5" />
                Abrir no navegador
              </a>
            </Button>
          </div>
        ) : (
          <iframe
            key={url}
            src={viewerUrl}
            className="w-full h-full border-0"
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
            title={title ?? "Documento"}
          />
        )}
      </div>
    </div>
  )
}
