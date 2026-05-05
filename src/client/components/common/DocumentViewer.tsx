"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Download, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { cn } from "@/client/main/lib/utils"

interface Props {
  url: string
  title?: string
  className?: string
}

function buildNativeViewerUrl(url: string) {
  const hash = "#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
  return url.includes("#") ? url : `${url}${hash}`
}

export function DocumentViewer({ url, title, className }: Props) {
  const [status, setStatus] = useState<{
    viewerUrl: string
    state: "loading" | "ok" | "error"
  }>({
    viewerUrl: "",
    state: "loading",
  })

  const viewerUrl = useMemo(() => buildNativeViewerUrl(url), [url])
  const currentStatus = status.viewerUrl === viewerUrl ? status.state : "loading"

  return (
    <div className={cn("relative min-h-0 overflow-hidden bg-white", className)}>
      {currentStatus === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/80 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Carregando documento...
        </div>
      )}

      {currentStatus === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center text-muted-foreground">
          <AlertCircle className="size-10 opacity-30" />
          <p className="text-sm">Não foi possível abrir este PDF no visualizador nativo.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 size-4" />
                Abrir no navegador
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={url} download={title}>
                <Download className="mr-2 size-4" />
                Baixar PDF
              </a>
            </Button>
          </div>
        </div>
      )}

      <iframe
        key={viewerUrl}
        src={viewerUrl}
        title={title ?? "Documento"}
        className="h-full w-full border-0"
        onLoad={() => setStatus({ viewerUrl, state: "ok" })}
        onError={() => setStatus({ viewerUrl, state: "error" })}
      />
    </div>
  )
}
