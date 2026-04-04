"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { Loader2, Link2, Upload, Sparkles } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useDocumentService } from "../../services/use-document.service"
import type { NovaLicitacaoFormValues } from "../../schemas/nova-licitacao.schema"
import { REQUIRED_DOCUMENT_KEYS } from "../../schemas/nova-licitacao.schema"
import type { UseFormReturn } from "react-hook-form"

type Props = {
  open: boolean
  editalId: string | null
  form: UseFormReturn<NovaLicitacaoFormValues>
  onClose: () => void
  onEditalCreated?: (editalId: string) => void
}

export function ImportarEditalDialog({ open, editalId, form, onClose, onEditalCreated }: Props) {
  const api = useCoreApi()
  const { orgAtiva, empresaAtiva } = useAppContext()
  const docService = useDocumentService(api)

  const [tab,  setTab]  = useState<"url" | "upload">("url")
  const [url,  setUrl]  = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<"input" | "analyzing">("input")

  const orgId     = orgAtiva?.id     ?? ""
  const companyId = empresaAtiva?.id ?? ""

  async function handleImport() {
    if (!editalId) return toast.error("Salve a licitação antes de importar o edital.")
    if (tab === "url" && !url) return toast.error("Informe a URL do edital.")
    if (tab === "upload" && !file) return toast.error("Selecione um arquivo PDF.")

    try {
      setStep("analyzing")

      // 1. Register or upload document
      let documentId: string
      if (tab === "url") {
        const result = await docService.registerDocument.mutateAsync({
          orgId, companyId, editalId, type: "edital", url,
        })
        documentId = result.id
      } else {
        const result = await docService.uploadDocument.mutateAsync({
          orgId, companyId, editalId, type: "edital", file: file!,
        })
        documentId = result.id
      }

      // 2. Run AI analysis
      const analysisRes = await fetch("/api/core/edital-analysis/run", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orgId, companyId, editalId, documentIds: [documentId] }),
      })
      if (!analysisRes.ok) throw new Error("Análise falhou")
      const analysis = await analysisRes.json()

      // 3. Populate form with extracted data
      populateForm(form, analysis)
      toast.success("Edital importado com sucesso! Revise os campos e salve.")
      onClose()
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao importar edital.")
    } finally {
      setStep("input")
    }
  }

  function reset() {
    setUrl("")
    setFile(null)
    setTab("url")
    setStep("input")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Importar Edital via IA
          </DialogTitle>
        </DialogHeader>

        {step === "analyzing" ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div>
              <p className="font-medium text-sm">Analisando edital...</p>
              <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "url" | "upload")}>
              <TabsList className="w-full">
                <TabsTrigger value="url" className="flex-1 gap-1.5">
                  <Link2 className="size-3.5" /> Tenho a URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1 gap-1.5">
                  <Upload className="size-3.5" /> Fazer upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-3 space-y-1.5">
                <Label className="text-xs">URL do PDF do edital</Label>
                <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
              </TabsContent>
              <TabsContent value="upload" className="pt-3 space-y-1.5">
                <Label className="text-xs">Arquivo PDF</Label>
                <Input type="file" accept=".pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </TabsContent>
            </Tabs>

            {!editalId && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Salve a licitação primeiro para habilitar a importação.
              </p>
            )}

            <Button className="w-full gap-1.5" onClick={handleImport} disabled={!editalId}>
              <Sparkles className="size-4" />
              Importar e preencher campos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Populate form from AI extraction ────────────────────────────────────────

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

function populateForm(form: UseFormReturn<NovaLicitacaoFormValues>, analysis: any) {
  const sv = (key: keyof NovaLicitacaoFormValues, val: any) => {
    if (val !== null && val !== undefined && val !== "") form.setValue(key, val as any)
  }

  sv("editalNumber",          analysis.editalNumber)
  sv("portal",                analysis.portal)
  sv("sphere",                analysis.sphere)
  sv("state",                 analysis.state)
  sv("object",                analysis.object)
  sv("modality",              analysis.modality)
  sv("contractType",          analysis.contractType)
  sv("editalUrl",             analysis.editalUrl)
  sv("estimatedValue",        analysis.estimatedValue)
  sv("publicationDate",       toDateInput(analysis.publicationDate))
  sv("openingDate",           toDateInput(analysis.openingDate))
  sv("proposalDeadline",      toDateInput(analysis.proposalDeadline))
  sv("processNumber",         analysis.processNumber)
  sv("uasg",                  analysis.uasg)
  sv("proposalDeadlineTime",  analysis.proposalDeadlineTime)
  sv("bidInterval",           analysis.bidInterval)
  sv("judgmentCriteria",      analysis.judgmentCriteria)
  sv("disputeMode",           analysis.disputeMode)
  sv("proposalValidityDays",  analysis.proposalValidityDays)
  sv("clarificationDeadline", toDateInput(analysis.clarificationDeadline))
  sv("regionality",           analysis.regionality)
  if (analysis.exclusiveSmallBusiness !== null) sv("exclusiveSmallBusiness", !!analysis.exclusiveSmallBusiness)
  if (analysis.allowsAdhesion !== null)         sv("allowsAdhesion",         !!analysis.allowsAdhesion)

  // Regras
  const rules = analysis.extractedRules as any
  if (rules) {
    sv("deliveryDays",    rules.deliveryDays)
    sv("acceptanceDays",  rules.acceptanceDays)
    sv("liquidationDays", rules.liquidationDays)
    sv("paymentDays",     rules.paymentDays)
    sv("guaranteeType",   rules.guaranteeType)
    sv("guaranteeMonths", rules.guaranteeMonths)
    if (rules.installation !== null && rules.installation !== undefined)
      sv("installation", rules.installation ? "Obrigatória" : "Não Especificado")
  }

  // Documentos exigidos
  const docs = analysis.extractedRequiredDocuments as string[] | null
  if (Array.isArray(docs) && docs.length > 0) {
    const knownKeys = REQUIRED_DOCUMENT_KEYS.map((k) => k.key)
    const checkedMap: Record<string, boolean> = {}
    const others: string[] = []
    for (const doc of docs) {
      const match = knownKeys.find((k) => k.toLowerCase().includes(doc.toLowerCase().replace(/\s/g, "")) || doc.toLowerCase().includes(k.toLowerCase()))
      if (match) checkedMap[match] = true
      else others.push(doc)
    }
    form.setValue("requiredDocumentKeys", checkedMap)
    if (others.length) form.setValue("otherDocuments", others)
  }

  // Órgãos gerenciadores
  const managing = analysis.extractedManagingAgencies as { name: string; cnpj?: string | null }[] | null
  if (Array.isArray(managing) && managing.length > 0) {
    form.setValue("managingAgencies", managing.map((a) => ({ name: a.name, cnpj: a.cnpj ?? undefined })))
  }

  // Órgãos participantes
  const participating = analysis.extractedParticipatingAgencies as { name: string; cnpj?: string | null }[] | null
  if (Array.isArray(participating) && participating.length > 0) {
    form.setValue("participatingAgencies", participating.map((a) => ({ name: a.name, cnpj: a.cnpj ?? undefined })))
  }
}
