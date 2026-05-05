"use client"

import { useRef, useState } from "react"
import { AlertCircle, ArrowRight, CalendarClock, ScanSearch, Sparkles, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select"
import { cn } from "@/client/main/lib/utils"
import type { LicitacaoDocumentType } from "../../services/use-licitacao.service"

const MAX_FILE_SIZE_MB = 50

const DOCUMENT_TYPE_OPTIONS: Array<{ value: LicitacaoDocumentType; label: string; helper: string }> = [
  { value: "EDITAL", label: "Edital", helper: "Documento principal do processo licitatório." },
  { value: "ANEXO", label: "Anexo", helper: "Memorial, planilha, cronograma e documentos auxiliares." },
  { value: "OUTRO", label: "Outro", helper: "Arquivos complementares que não entram nas categorias acima." },
]

type Props = {
  isPending: boolean
  error: Error | null
  onUpload: (params: {
    file: File
    documentType: LicitacaoDocumentType
    replaceDocumentLocalId?: string
  }) => Promise<unknown>
  onSkip: () => void
}

export function UploadEditalStep({
  isPending,
  error,
  onUpload,
  onSkip,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedType, setSelectedType] = useState<LicitacaoDocumentType>("EDITAL")
  const [isDragging, setIsDragging] = useState(false)

  const selectedTypeMeta = DOCUMENT_TYPE_OPTIONS.find(option => option.value === selectedType)

  async function uploadFromEmptyState(file: File | null) {
    if (!file) return
    await onUpload({ file, documentType: selectedType })
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-4 px-0 pb-0 pt-2">
      <Card className="rounded-none border-slate-200/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <CardContent className="space-y-4 p-3 md:p-4">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="border border-slate-200 bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
              <div className="flex justify-center px-8 pt-8">
                <div className="w-full max-w-sm space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Tipo do documento
                  </p>
                  <Select value={selectedType} onValueChange={value => setSelectedType(value as LicitacaoDocumentType)}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Selecione o tipo do documento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-5 text-muted-foreground">{selectedTypeMeta?.helper}</p>
                </div>
              </div>

              <label
                htmlFor="upload-edital-step"
                onDragOver={event => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={async event => {
                  event.preventDefault()
                  setIsDragging(false)
                  await uploadFromEmptyState(event.dataTransfer.files?.[0] ?? null)
                }}
                className={cn(
                  "flex min-h-[clamp(360px,52vh,520px)] cursor-pointer flex-col items-center justify-center px-8 py-10 text-center transition-colors",
                  isDragging ? "bg-primary/5" : "bg-slate-50/50",
                )}
              >
                <div className={cn(
                  "flex w-full max-w-3xl flex-col items-center border-2 border-dashed px-10 py-14 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-primary/35 bg-white",
                )}>
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Upload className="size-7" />
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-lg font-semibold text-primary">
                      Arraste e solte o {(selectedTypeMeta?.label ?? "documento").toLowerCase()} aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-muted-foreground">Suporta arquivos PDF de até {MAX_FILE_SIZE_MB}MB</p>
                  </div>

                  {isPending ? (
                    <div className="mt-6 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      Processando documento...
                    </div>
                  ) : null}
                </div>

                <input
                  ref={inputRef}
                  id="upload-edital-step"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={async event => {
                    await uploadFromEmptyState(event.target.files?.[0] ?? null)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                />
              </label>

              <div className="flex justify-center px-8 pb-10">
                <Button type="button" size="lg" variant="ghost" className="rounded-none" onClick={onSkip}>
                  Pular etapa e cadastrar manualmente
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="font-medium text-foreground">Como a IA vai ajudar</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FeatureCard
                  icon={Sparkles}
                  title="Cadastro estruturado"
                  description="O PDF já entra vinculado ao processo para servir de base ao preenchimento e às próximas automações."
                />
                <FeatureCard
                  icon={ScanSearch}
                  title="Análise de Riscos"
                  description="O documento fica pronto para análises posteriores de cláusulas, exigências e pontos sensíveis do edital."
                />
                <FeatureCard
                  icon={CalendarClock}
                  title="Etapas futuras"
                  description="A mesma licitação poderá concentrar documentos, regras, órgãos, itens e cronograma sem retrabalho."
                />
              </div>
            </section>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Não foi possível concluir a operação com o documento</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles
  title: string
  description: string
}) {
  return (
    <Card className="rounded-none border-slate-200/80 bg-white/90">
      <CardContent className="space-y-4 p-6">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-primary">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
