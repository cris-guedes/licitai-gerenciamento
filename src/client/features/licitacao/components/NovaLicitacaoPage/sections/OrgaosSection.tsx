"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Building2, Plus, X } from "lucide-react"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Button } from "@/client/components/ui/button"
import { SectionCard } from "./SectionCard"
import type { NovaLicitacaoFormValues } from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

function AgencyList({
  label,
  agencies,
  onAdd,
  onRemove,
}: {
  label: string
  agencies: { name: string; cnpj?: string }[]
  onAdd: (agency: { name: string; cnpj?: string }) => void
  onRemove: (index: number) => void
}) {
  const [name, setName] = useState("")
  const [cnpj, setCnpj] = useState("")

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, cnpj: cnpj.trim() || undefined })
    setName("")
    setCnpj("")
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAdd() }
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground font-medium">{label}</Label>

      <div className="flex gap-2">
        <Input
          placeholder="Nome do órgão"
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Input
          placeholder="CNPJ (opcional)"
          className="w-44"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" size="sm" className="gap-1 shrink-0" onClick={handleAdd}>
          <Plus className="size-3.5" /> Adicionar
        </Button>
      </div>

      {agencies.length > 0 && (
        <div className="space-y-1.5">
          {agencies.map((ag, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-muted/30 text-sm">
              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 font-medium">{ag.name}</span>
              {ag.cnpj && <span className="text-xs text-muted-foreground">{ag.cnpj}</span>}
              <button type="button" onClick={() => onRemove(i)}>
                <X className="size-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrgaosSection({ form }: Props) {
  const { watch, setValue } = form

  const managing      = watch("managingAgencies") ?? []
  const participating = watch("participatingAgencies") ?? []

  return (
    <SectionCard icon={Building2} title="Órgão Gerenciador e Órgãos Participantes" description="Órgãos envolvidos na oportunidade e suas quantidades por item">
      <AgencyList
        label="Órgão Gerenciador"
        agencies={managing}
        onAdd={(ag) => setValue("managingAgencies", [...managing, ag])}
        onRemove={(i) => setValue("managingAgencies", managing.filter((_, idx) => idx !== i))}
      />
      <AgencyList
        label="Órgãos Participantes"
        agencies={participating}
        onAdd={(ag) => setValue("participatingAgencies", [...participating, ag])}
        onRemove={(i) => setValue("participatingAgencies", participating.filter((_, idx) => idx !== i))}
      />
    </SectionCard>
  )
}
