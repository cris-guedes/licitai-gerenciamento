"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Link2, Upload, Loader2 } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useDocumentService } from "../../../services/use-document.service"

const DOCUMENT_TYPES = [
  { value: "edital",   label: "Edital" },
  { value: "annex",    label: "Anexo" },
  { value: "minute",   label: "Minuta" },
  { value: "contract", label: "Contrato" },
  { value: "other",    label: "Outro" },
]

type Props = {
  open: boolean
  editalId: string
  onClose: () => void
  onDocumentAdded: (documentId: string) => void
}

export function AddDocumentDialog({ open, editalId, onClose, onDocumentAdded }: Props) {
  const api = useCoreApi()
  const { orgAtiva, empresaAtiva } = useAppContext()
  const docService = useDocumentService(api)

  const orgId     = orgAtiva?.id     ?? ""
  const companyId = empresaAtiva?.id ?? ""

  const [tab,         setTab]         = useState<"url" | "upload">("url")
  const [docType,     setDocType]     = useState("edital")
  const [url,         setUrl]         = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [file,        setFile]        = useState<File | null>(null)

  const isPending = docService.registerDocument.isPending || docService.uploadDocument.isPending

  function reset() {
    setUrl("")
    setFile(null)
    setPublishedAt("")
    setDocType("edital")
    setTab("url")
  }

  async function handleSubmit() {
    try {
      if (tab === "url") {
        if (!url) return toast.error("Informe a URL do documento.")
        const result = await docService.registerDocument.mutateAsync({
          orgId, companyId, editalId,
          type: docType,
          url,
          publishedAt: publishedAt || null,
        })
        toast.success("Documento registrado.")
        reset()
        onClose()
        onDocumentAdded(result.id)
      } else {
        if (!file) return toast.error("Selecione um arquivo PDF.")
        const result = await docService.uploadDocument.mutateAsync({
          orgId, companyId, editalId,
          type:        docType,
          publishedAt: publishedAt || null,
          file,
        })
        toast.success("Documento enviado.")
        reset()
        onClose()
        onDocumentAdded(result.id)
      }
    } catch {
      toast.error("Erro ao adicionar documento.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo de documento</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data de publicação */}
          <div className="space-y-1.5">
            <Label>Data de publicação <span className="text-muted-foreground">(opcional)</span></Label>
            <Input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>

          {/* URL ou Upload */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as "url" | "upload")}>
            <TabsList className="w-full">
              <TabsTrigger value="url" className="flex-1 gap-1.5">
                <Link2 className="size-3.5" />
                Tenho a URL
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-1.5">
                <Upload className="size-3.5" />
                Fazer upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="pt-3">
              <div className="space-y-1.5">
                <Label>URL do PDF</Label>
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="pt-3">
              <div className="space-y-1.5">
                <Label>Arquivo PDF</Label>
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
