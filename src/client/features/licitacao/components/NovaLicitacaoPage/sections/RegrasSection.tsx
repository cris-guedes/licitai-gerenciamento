"use client"

import type { UseFormReturn } from "react-hook-form"
import { ScrollText } from "lucide-react"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { SectionCard } from "./SectionCard"
import { type NovaLicitacaoFormValues, GUARANTEE_OPTIONS, INSTALLATION_OPTIONS } from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

export function RegrasSection({ form }: Props) {
  const { register, setValue, watch } = form

  return (
    <SectionCard icon={ScrollText} title="Regras do Edital" description="Prazos, garantia e condições que serão herdadas pelo contrato">
      <div className="grid grid-cols-4 gap-4">
        <Field label="Prazo de Entrega (dias)">
          <Input type="number" min={1} placeholder="Ex: 30" {...register("deliveryDays")} />
        </Field>
        <Field label="Prazo de Aceite (dias)">
          <Input type="number" min={1} placeholder="Ex: 15" {...register("acceptanceDays")} />
        </Field>
        <Field label="Prazo de Liquidação (dias)">
          <Input type="number" min={1} placeholder="Ex: 30" {...register("liquidationDays")} />
        </Field>
        <Field label="Prazo de Pagamento (dias)">
          <Input type="number" min={1} placeholder="Ex: 30" {...register("paymentDays")} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Tipo de Garantia">
          <Select value={watch("guaranteeType")} onValueChange={(v) => setValue("guaranteeType", v)}>
            <SelectTrigger><SelectValue placeholder="Sem Garantia" /></SelectTrigger>
            <SelectContent>
              {GUARANTEE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Prazo de Garantia (meses)">
          <Input type="number" min={1} placeholder="Ex: 12" {...register("guaranteeMonths")} />
        </Field>
        <Field label="Instalação">
          <Select value={watch("installation")} onValueChange={(v) => setValue("installation", v)}>
            <SelectTrigger><SelectValue placeholder="Não Especificado" /></SelectTrigger>
            <SelectContent>
              {INSTALLATION_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </SectionCard>
  )
}
