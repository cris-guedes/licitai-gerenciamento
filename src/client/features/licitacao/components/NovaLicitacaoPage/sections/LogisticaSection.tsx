"use client"

import type { UseFormReturn } from "react-hook-form"
import { Truck } from "lucide-react"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Textarea } from "@/client/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { SectionCard } from "./SectionCard"
import { type NovaLicitacaoFormValues, UF_OPTIONS } from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

export function LogisticaSection({ form }: Props) {
  const { register, setValue, watch } = form

  return (
    <SectionCard icon={Truck} title="Processo e Logística" description="Dados contratuais, CNPJ e endereço de entrega">
      <div className="grid grid-cols-2 gap-4">
        <Field label="CNPJ do Órgão">
          <Input placeholder="00.000.000/0000-00" {...register("agencyCnpj")} />
        </Field>
        <Field label="Inscrição Estadual do Órgão">
          <Input placeholder="Ex: ISENTO ou número" {...register("agencyStateRegistration")} />
        </Field>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">Logística</Label>
        <Field label="Local de Entrega">
          <Input placeholder="Ex: Almoxarifado Central" {...register("deliveryLocation")} />
        </Field>
        <div className="grid grid-cols-4 gap-3 pt-1">
          <Field label="CEP">
            <Input placeholder="00000-000" {...register("zipCode")} />
          </Field>
          <div className="col-span-3">
            <Field label="Rua / Logradouro">
              <Input placeholder="Ex: Rua das Flores" {...register("street")} />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Número">
            <Input placeholder="Nº" {...register("addressNumber")} />
          </Field>
          <Field label="Bairro">
            <Input placeholder="Bairro" {...register("neighborhood")} />
          </Field>
          <Field label="Cidade">
            <Input placeholder="Cidade" {...register("city")} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Estado (UF)">
            <Select value={watch("logisticsState")} onValueChange={(v) => setValue("logisticsState", v)}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Complemento">
              <Input placeholder="Bloco, sala, ponto de referência..." {...register("complement")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <Label className="text-xs text-muted-foreground font-medium">Contatos</Label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do Pregoeiro">
            <Input placeholder="Nome completo" {...register("auctioneerName")} />
          </Field>
          <Field label="Contato do Pregoeiro">
            <Input placeholder="Telefone / e-mail" {...register("auctioneerContact")} />
          </Field>
          <Field label="Nome do Gestor de Contrato">
            <Input placeholder="Nome completo" {...register("contractManagerName")} />
          </Field>
          <Field label="Contato do Gestor">
            <Input placeholder="Telefone / e-mail" {...register("contractManagerContact")} />
          </Field>
        </div>
      </div>

      <Field label="Observações">
        <Textarea placeholder="Observações adicionais..." rows={3} {...register("notes")} />
      </Field>
    </SectionCard>
  )
}
