"use client"

import { useEffect, useState } from "react"
import { Download, FileText } from "lucide-react"
import { DocumentViewer } from "@/client/components/common/DocumentViewer"
import { useProcurementService } from "../../../services/procurement"
import { EmptyState, LoadingState } from "../shared"

export function TabDocumentos({ files: query, d }: { files: ReturnType<typeof useProcurementService>["files"]; d: any }) {
  const [selected, setSelected] = useState<{ url: string; title: string } | null>(null)

  const allFiles = [
    ...(query.data?.files ?? []).map((file: any) => ({ url: file.url, title: file.titulo ?? "Documento", sub: file.tipoDocumentoNome })),
    ...(d?.linkProcessoEletronico ? [{ url: d.linkProcessoEletronico, title: "Processo Eletrônico", sub: null }] : []),
  ]

  const firstFileUrl = allFiles[0]?.url
  useEffect(() => {
    if (!selected && firstFileUrl) {
      const file = allFiles[0]
      setSelected({ url: file.url, title: file.title })
    }
  }, [allFiles, firstFileUrl, selected])

  return (
    <div className="flex flex-1 min-h-0 h-full">
      <div className="w-64 shrink-0 border-r border-border/40 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="px-4 py-3 border-b border-border/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Documentos{allFiles.length > 0 ? ` (${allFiles.length})` : ""}
          </span>
        </div>
        {query.isLoading && <LoadingState text="Carregando..." />}
        {query.isError && <p className="text-xs text-destructive text-center py-4">Erro ao carregar.</p>}
        {!query.isLoading && allFiles.length === 0 && <EmptyState icon={FileText} text="Nenhum documento." />}
        <div className="flex flex-col gap-0.5 p-2">
          {allFiles.map((file, index) => (
            <div
              key={index}
              className={`flex items-start gap-1 rounded-md transition-colors ${
                selected?.url === file.url ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelected({ url: file.url, title: file.title })}
                className="flex-1 min-w-0 text-left px-3 py-2.5"
              >
                <span className="text-xs font-medium leading-snug line-clamp-2 block">{file.title}</span>
                {file.sub && <span className="text-[10px] opacity-60">{file.sub}</span>}
              </button>
              <a
                href={file.url}
                download
                onClick={event => event.stopPropagation()}
                className="shrink-0 flex items-center justify-center size-8 mt-1 mr-1 rounded-md hover:bg-muted/60 transition-colors opacity-50 hover:opacity-100"
                title="Download"
              >
                <Download className="size-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {selected ? (
          <DocumentViewer url={selected.url} title={selected.title} className="h-full" />
        ) : (
          <EmptyState icon={FileText} text="Selecione um documento para visualizar." />
        )}
      </div>
    </div>
  )
}
