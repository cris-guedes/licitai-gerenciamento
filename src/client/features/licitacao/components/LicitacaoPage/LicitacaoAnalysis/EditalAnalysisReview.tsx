"use client"

import type { EditalAnalysisResponse } from "@/client/main/infra/apis/api-core"
import { Badge } from "@/client/components/ui/badge"
import { Separator } from "@/client/components/ui/separator"
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/client/main/lib/utils"

const STATUS_CONFIG = {
  pending:   { label: "Pendente",   icon: Clock,        color: "text-muted-foreground" },
  running:   { label: "Analisando", icon: Loader2,      color: "text-blue-600"         },
  completed: { label: "Concluída",  icon: CheckCircle2, color: "text-emerald-600"      },
  approved:  { label: "Aprovada",   icon: CheckCircle2, color: "text-blue-700"         },
  failed:    { label: "Falhou",     icon: XCircle,      color: "text-red-600"          },
} as const

function Field({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === "") return null
  const display = typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value)
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("pt-BR")
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

type Props = {
  analysis: EditalAnalysisResponse
}

export function EditalAnalysisReview({ analysis }: Props) {
  const status  = STATUS_CONFIG[analysis.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const Icon    = status.icon

  const rules = analysis.extractedRules as {
    deliveryDays?: number | null
    acceptanceDays?: number | null
    liquidationDays?: number | null
    paymentDays?: number | null
    guaranteeType?: string | null
    guaranteeMonths?: number | null
    installation?: boolean | null
  } | null

  const requiredDocs = analysis.extractedRequiredDocuments as string[] | null
  const managingAgencies = analysis.extractedManagingAgencies as { name: string; cnpj: string | null }[] | null

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", status.color, analysis.status === "running" && "animate-spin")} />
        <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
        <span className="text-xs text-muted-foreground ml-auto">v{analysis.version}</span>
      </div>

      {analysis.status !== "completed" && analysis.status !== "approved" && (
        <p className="text-sm text-muted-foreground italic">
          {analysis.status === "running" ? "Análise em andamento..." : "Aguardando processamento."}
        </p>
      )}

      {(analysis.status === "completed" || analysis.status === "approved") && (
        <div className="space-y-5">
          {/* Identificação */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Identificação</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº Edital"    value={analysis.editalNumber} />
              <Field label="Portal"       value={analysis.portal} />
              <Field label="Esfera"       value={analysis.sphere} />
              <Field label="Estado"       value={analysis.state} />
              <Field label="Nº Processo"  value={analysis.processNumber} />
              <Field label="UASG"         value={analysis.uasg} />
              <Field label="Modalidade"   value={analysis.modality} />
              <Field label="Tipo Contrato" value={analysis.contractType} />
            </div>
          </section>

          <Separator />

          {/* Objeto */}
          {analysis.object && (
            <section className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Objeto</h4>
              <p className="text-sm leading-relaxed">{analysis.object}</p>
            </section>
          )}

          <Separator />

          {/* Datas e valores */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Datas e Valores</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor Estimado"       value={formatCurrency(analysis.estimatedValue)} />
              <Field label="Data Publicação"      value={formatDate(analysis.publicationDate)} />
              <Field label="Data Abertura"        value={formatDate(analysis.openingDate)} />
              <Field label="Prazo Proposta"       value={formatDate(analysis.proposalDeadline)} />
              <Field label="Hora Limite"          value={analysis.proposalDeadlineTime} />
              <Field label="Prazo Esclarecimento" value={formatDate(analysis.clarificationDeadline)} />
              <Field label="Validade Proposta"    value={analysis.proposalValidityDays != null ? `${analysis.proposalValidityDays} dias` : null} />
              <Field label="Lance Mínimo"         value={formatCurrency(analysis.bidInterval)} />
            </div>
          </section>

          <Separator />

          {/* Condições */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condições</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Critério Julgamento" value={analysis.judgmentCriteria} />
              <Field label="Modo Disputa"        value={analysis.disputeMode} />
              <Field label="Exclusivo ME/EPP"    value={analysis.exclusiveSmallBusiness} />
              <Field label="Permite Adesão"      value={analysis.allowsAdhesion} />
              <Field label="Regionalidade"       value={analysis.regionality} />
            </div>
          </section>

          {/* Regras contratuais */}
          {rules && (
            <>
              <Separator />
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Regras Contratuais</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Prazo Entrega"     value={rules.deliveryDays    != null ? `${rules.deliveryDays} dias`    : null} />
                  <Field label="Prazo Aceite"      value={rules.acceptanceDays  != null ? `${rules.acceptanceDays} dias`  : null} />
                  <Field label="Prazo Liquidação"  value={rules.liquidationDays != null ? `${rules.liquidationDays} dias` : null} />
                  <Field label="Prazo Pagamento"   value={rules.paymentDays     != null ? `${rules.paymentDays} dias`     : null} />
                  <Field label="Tipo Garantia"     value={rules.guaranteeType} />
                  <Field label="Garantia (meses)"  value={rules.guaranteeMonths} />
                  <Field label="Instalação"        value={rules.installation} />
                </div>
              </section>
            </>
          )}

          {/* Documentos exigidos */}
          {Array.isArray(requiredDocs) && requiredDocs.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documentos Exigidos</h4>
                <div className="flex flex-wrap gap-1.5">
                  {requiredDocs.map((doc) => (
                    <Badge key={doc} variant="outline" className="text-xs">{doc}</Badge>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Órgãos */}
          {Array.isArray(managingAgencies) && managingAgencies.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Órgão Gerenciador</h4>
                {managingAgencies.map((a, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{a.name}</span>
                    {a.cnpj && <span className="text-muted-foreground ml-2 text-xs">{a.cnpj}</span>}
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
