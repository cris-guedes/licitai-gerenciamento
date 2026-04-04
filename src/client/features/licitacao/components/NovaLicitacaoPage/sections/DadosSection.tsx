"use client"

import type { UseFormReturn } from "react-hook-form"
import { FileText } from "lucide-react"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Textarea } from "@/client/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { SectionCard } from "./SectionCard"
import {
  type NovaLicitacaoFormValues,
  MODALITY_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  SPHERE_OPTIONS,
  UF_OPTIONS,
} from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function DadosSection({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form

  return (
    <SectionCard icon={FileText} title="Dados da Licitação" description="Identificação do processo licitatório">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Órgão" error={errors.state?.message}>
          <Input placeholder="Ex: Prefeitura Municipal de São Paulo" {...register("state")} />
        </Field>
        <Field label="Nº Edital">
          <Input placeholder="Ex: PE 001/2024" {...register("editalNumber")} />
        </Field>

        <Field label="Modalidade" required error={errors.modality?.message}>
          <Select value={watch("modality")} onValueChange={(v) => setValue("modality", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Portal">
          <Input placeholder="Ex: Compras.gov, BLL" {...register("portal")} />
        </Field>

        <Field label="Estado (UF)">
          <Select value={watch("state")} onValueChange={(v) => setValue("state", v)}>
            <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
            <SelectContent>
              {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Esfera">
          <Select value={watch("sphere")} onValueChange={(v) => setValue("sphere", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {SPHERE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Data Publicação">
          <Input type="date" {...register("publicationDate")} />
        </Field>
        <Field label="Data Abertura">
          <Input type="date" {...register("openingDate")} />
        </Field>
        <Field label="Limite Proposta">
          <Input type="date" {...register("proposalDeadline")} />
        </Field>

        <Field label="Tipo de Contrato">
          <Select value={watch("contractType")} onValueChange={(v) => setValue("contractType", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Valor Estimado (R$)">
          <Input type="number" min={0} step={0.01} placeholder="0,00" {...register("estimatedValue")} />
        </Field>
        <Field label="URL do Edital">
          <Input placeholder="https://..." {...register("editalUrl")} />
        </Field>
      </div>

      <Field label="Objeto" required error={errors.object?.message}>
        <Textarea
          placeholder="Descreva o objeto da licitação..."
          rows={3}
          {...register("object")}
        />
      </Field>
    </SectionCard>
  )
}
