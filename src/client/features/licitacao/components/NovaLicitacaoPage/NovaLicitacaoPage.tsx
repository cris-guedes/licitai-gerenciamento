"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Sparkles, Save, X } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Separator } from "@/client/components/ui/separator"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useLicitacaoService } from "../../services/use-licitacao.service"
import { novaLicitacaoSchema, type NovaLicitacaoFormValues, REQUIRED_DOCUMENT_KEYS } from "../../schemas/nova-licitacao.schema"

import { DadosSection }      from "./sections/DadosSection"
import { DetalhesSection }   from "./sections/DetalhesSection"
import { DocumentosSection } from "./sections/DocumentosSection"
import { LogisticaSection }  from "./sections/LogisticaSection"
import { RegrasSection }     from "./sections/RegrasSection"
import { OrgaosSection }     from "./sections/OrgaosSection"
import { ImportarEditalDialog } from "./ImportarEditalDialog"

type Props = {
  orgId: string
  companyId: string
}

export function NovaLicitacaoPage({ orgId, companyId }: Props) {
  const router         = useRouter()
  const api            = useCoreApi()
  const { orgAtiva }   = useAppContext()
  const licitacaoSvc   = useLicitacaoService(api)

  const [importOpen,  setImportOpen]  = useState(false)
  const [savedEditalId, setSavedEditalId] = useState<string | null>(null)

  const base = `/org/${orgId}/${companyId}`

  const form = useForm<NovaLicitacaoFormValues>({
    resolver: zodResolver(novaLicitacaoSchema) as any,
    defaultValues: {
      object:                 "",
      modality:               "",
      exclusiveSmallBusiness: false,
      allowsAdhesion:         false,
      requiredDocumentKeys:   {},
      otherDocuments:         [],
      managingAgencies:       [],
      participatingAgencies:  [],
    },
  })

  const { watch, handleSubmit, formState: { errors, isSubmitting } } = form

  const watchedObject      = watch("object")
  const watchedEditalNumber = watch("editalNumber")

  async function onSubmit(values: NovaLicitacaoFormValues) {
    try {
      // Collect required documents
      const checkedKeys = Object.entries(values.requiredDocumentKeys ?? {})
        .filter(([, v]) => v)
        .map(([k]) => REQUIRED_DOCUMENT_KEYS.find((d) => d.key === k)?.label ?? k)
      const requiredDocuments = [...checkedKeys, ...(values.otherDocuments ?? [])]

      const result = await licitacaoSvc.create.mutateAsync({
        orgId,
        companyId,
        object:   values.object,
        modality: values.modality,

        contractType:   values.contractType   || null,
        editalNumber:   values.editalNumber   || null,
        portal:         values.portal         || null,
        sphere:         values.sphere         || null,
        state:          values.state          || null,
        editalUrl:      values.editalUrl      || null,
        estimatedValue: values.estimatedValue ? Number(values.estimatedValue) : null,
        publicationDate:  values.publicationDate  || null,
        openingDate:      values.openingDate      || null,
        proposalDeadline: values.proposalDeadline || null,

        processNumber:         values.processNumber         || null,
        uasg:                  values.uasg                  || null,
        proposalDeadlineTime:  values.proposalDeadlineTime  || null,
        bidInterval:           values.bidInterval            ? Number(values.bidInterval)           : null,
        judgmentCriteria:      values.judgmentCriteria      || null,
        disputeMode:           values.disputeMode            || null,
        proposalValidityDays:  values.proposalValidityDays  ? Number(values.proposalValidityDays)  : null,
        clarificationDeadline: values.clarificationDeadline || null,
        regionality:           values.regionality            || null,
        exclusiveSmallBusiness: values.exclusiveSmallBusiness,
        allowsAdhesion:         values.allowsAdhesion,

        rules: {
          deliveryDays:    values.deliveryDays    ? Number(values.deliveryDays)    : null,
          acceptanceDays:  values.acceptanceDays  ? Number(values.acceptanceDays)  : null,
          liquidationDays: values.liquidationDays ? Number(values.liquidationDays) : null,
          paymentDays:     values.paymentDays     ? Number(values.paymentDays)     : null,
          guaranteeType:   values.guaranteeType   || null,
          guaranteeMonths: values.guaranteeMonths ? Number(values.guaranteeMonths) : null,
          installation:    values.installation    || null,
        },

        logistics: {
          agencyCnpj:              values.agencyCnpj              || null,
          agencyStateRegistration: values.agencyStateRegistration || null,
          deliveryLocation:        values.deliveryLocation        || null,
          zipCode:                 values.zipCode                 || null,
          street:                  values.street                  || null,
          number:                  values.addressNumber           || null,
          neighborhood:            values.neighborhood            || null,
          city:                    values.city                    || null,
          state:                   values.logisticsState          || null,
          complement:              values.complement              || null,
          auctioneerName:          values.auctioneerName          || null,
          auctioneerContact:       values.auctioneerContact       || null,
          contractManagerName:     values.contractManagerName     || null,
          contractManagerContact:  values.contractManagerContact  || null,
          notes:                   values.notes                   || null,
        },

        requiredDocuments,
        managingAgencies:      values.managingAgencies,
        participatingAgencies: values.participatingAgencies,
      })

      setSavedEditalId(result.edital.id)
      toast.success("Licitação salva com sucesso.")
      router.push(`${base}/licitacoes`)
    } catch {
      toast.error("Erro ao salvar licitação.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => router.back()}>
              <ArrowLeft className="size-4" /> Voltar
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <h1 className="text-sm font-semibold leading-none">Nova Licitação</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Cadastre uma nova oportunidade de licitação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 px-6 py-6 max-w-[1200px] mx-auto">
        {/* Form */}
        <form id="nova-licitacao-form" onSubmit={handleSubmit(onSubmit as any)} className="flex-1 space-y-5 min-w-0">
          <DadosSection      form={form} />
          <DetalhesSection   form={form} />
          <DocumentosSection form={form} />
          <LogisticaSection  form={form} />
          <RegrasSection     form={form} />
          <OrgaosSection     form={form} />
        </form>

        {/* Right sidebar */}
        <div className="w-64 shrink-0 space-y-4 sticky top-[57px] self-start">
          {/* Ações */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</p>
            </div>
            <div className="p-3 space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-1.5 justify-start"
                onClick={() => setImportOpen(true)}
              >
                <Sparkles className="size-3.5 text-primary" />
                Importar Edital via IA
              </Button>
              <Button
                type="submit"
                form="nova-licitacao-form"
                size="sm"
                className="w-full gap-1.5 justify-start"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Salvar Licitação
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 justify-start text-muted-foreground"
                onClick={() => router.back()}
              >
                <X className="size-3.5" /> Cancelar
              </Button>
            </div>
          </div>

          {/* Resumo */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resumo</p>
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Órgão</p>
                <p className="font-medium truncate">{watch("state") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nº Edital</p>
                <p className="font-medium">{watchedEditalNumber || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Objeto</p>
                <p className="font-medium line-clamp-3 leading-relaxed">{watchedObject || "—"}</p>
              </div>
              {watch("estimatedValue") && (
                <div>
                  <p className="text-muted-foreground">Valor Estimado</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
                      .format(Number(watch("estimatedValue")))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Erros */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive space-y-0.5">
              {errors.object   && <p>• Objeto é obrigatório</p>}
              {errors.modality && <p>• Modalidade é obrigatória</p>}
            </div>
          )}
        </div>
      </div>

      <ImportarEditalDialog
        open={importOpen}
        editalId={savedEditalId}
        form={form}
        onClose={() => setImportOpen(false)}
      />
    </div>
  )
}
