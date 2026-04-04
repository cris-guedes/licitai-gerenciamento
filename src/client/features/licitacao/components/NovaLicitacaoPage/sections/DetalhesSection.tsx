"use client"

import type { UseFormReturn } from "react-hook-form"
import { Settings } from "lucide-react"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Switch } from "@/client/components/ui/switch"
import { SectionCard } from "./SectionCard"
import {
  type NovaLicitacaoFormValues,
  JUDGMENT_OPTIONS,
  DISPUTE_OPTIONS,
} from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

const JUDGMENT_LABELS: Record<string, string> = {
  menor_preco:   "Menor Preço",
  maior_desconto: "Maior Desconto",
  melhor_tecnica: "Melhor Técnica",
}

const DISPUTE_LABELS: Record<string, string> = {
  aberto:        "Aberto",
  fechado:       "Fechado",
  aberto_fechado: "Aberto e Fechado",
}

export function DetalhesSection({ form }: Props) {
  const { register, setValue, watch } = form

  return (
    <SectionCard icon={Settings} title="Detalhes do Pregão" description="Informações específicas do processo licitatório">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nº do Processo">
          <Input placeholder="Ex: 001/2024" {...register("processNumber")} />
        </Field>
        <Field label="UASG">
          <Input placeholder="Ex: 123456" {...register("uasg")} />
        </Field>

        <Field label="Hora Limite da Proposta">
          <Input type="time" {...register("proposalDeadlineTime")} />
        </Field>
        <Field label="Intervalo de Lances">
          <Input type="number" min={0} step={0.01} placeholder="Ex: R$ 0,01" {...register("bidInterval")} />
        </Field>

        <Field label="Critério de Julgamento">
          <Select value={watch("judgmentCriteria")} onValueChange={(v) => setValue("judgmentCriteria", v)}>
            <SelectTrigger><SelectValue placeholder="Ex: Menor Preço" /></SelectTrigger>
            <SelectContent>
              {JUDGMENT_OPTIONS.map((j) => <SelectItem key={j} value={j}>{JUDGMENT_LABELS[j]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Modo de Disputa">
          <Select value={watch("disputeMode")} onValueChange={(v) => setValue("disputeMode", v)}>
            <SelectTrigger><SelectValue placeholder="Ex: Aberto, Fechado" /></SelectTrigger>
            <SelectContent>
              {DISPUTE_OPTIONS.map((d) => <SelectItem key={d} value={d}>{DISPUTE_LABELS[d]}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Validade da Proposta (dias)">
          <Input type="number" min={1} placeholder="Ex: 60" {...register("proposalValidityDays")} />
        </Field>
        <Field label="Prazo de Esclarecimento / Impugnação">
          <Input type="date" {...register("clarificationDeadline")} />
        </Field>

        <div className="col-span-2">
          <Field label="Regionalidade">
            <Input placeholder="Ex: Restrito ao Estado de SP" {...register("regionality")} />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-8 pt-1">
        <div className="flex items-center gap-2.5">
          <Switch
            id="exclusiveSmallBusiness"
            checked={watch("exclusiveSmallBusiness")}
            onCheckedChange={(v) => setValue("exclusiveSmallBusiness", v)}
          />
          <Label htmlFor="exclusiveSmallBusiness" className="text-sm cursor-pointer">Exclusividade EPP/ME</Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch
            id="allowsAdhesion"
            checked={watch("allowsAdhesion")}
            onCheckedChange={(v) => setValue("allowsAdhesion", v)}
          />
          <Label htmlFor="allowsAdhesion" className="text-sm cursor-pointer">Permite Adesão (Carona)</Label>
        </div>
      </div>
    </SectionCard>
  )
}
