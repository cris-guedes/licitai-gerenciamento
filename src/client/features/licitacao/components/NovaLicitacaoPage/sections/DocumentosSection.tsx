"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { FileCheck } from "lucide-react"
import { Checkbox } from "@/client/components/ui/checkbox"
import { Label } from "@/client/components/ui/label"
import { Input } from "@/client/components/ui/input"
import { Button } from "@/client/components/ui/button"
import { Plus, X } from "lucide-react"
import { SectionCard } from "./SectionCard"
import { type NovaLicitacaoFormValues, REQUIRED_DOCUMENT_KEYS } from "../../../schemas/nova-licitacao.schema"

type Props = { form: UseFormReturn<NovaLicitacaoFormValues> }

export function DocumentosSection({ form }: Props) {
  const { watch, setValue } = form
  const checkedDocs    = watch("requiredDocumentKeys") ?? {}
  const otherDocuments = watch("otherDocuments") ?? []
  const [newDoc, setNewDoc] = useState("")

  function toggleDoc(key: string, checked: boolean) {
    setValue("requiredDocumentKeys", { ...checkedDocs, [key]: checked })
  }

  function addOtherDoc() {
    const trimmed = newDoc.trim()
    if (!trimmed) return
    setValue("otherDocuments", [...otherDocuments, trimmed])
    setNewDoc("")
  }

  function removeOtherDoc(index: number) {
    setValue("otherDocuments", otherDocuments.filter((_, i) => i !== index))
  }

  const mid = Math.ceil(REQUIRED_DOCUMENT_KEYS.length / 3)
  const col1 = REQUIRED_DOCUMENT_KEYS.slice(0, mid)
  const col2 = REQUIRED_DOCUMENT_KEYS.slice(mid, mid * 2)
  const col3 = REQUIRED_DOCUMENT_KEYS.slice(mid * 2)

  function DocCheckbox({ docKey, label }: { docKey: string; label: string }) {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={docKey}
          checked={!!checkedDocs[docKey]}
          onCheckedChange={(v) => toggleDoc(docKey, !!v)}
        />
        <Label htmlFor={docKey} className="text-sm cursor-pointer font-normal">{label}</Label>
      </div>
    )
  }

  return (
    <SectionCard icon={FileCheck} title="Documentos Necessários" description="Marque os documentos exigidos no edital para habilitação">
      <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
        <div className="space-y-2.5">
          {col1.map(({ key, label }) => <DocCheckbox key={key} docKey={key} label={label} />)}
        </div>
        <div className="space-y-2.5">
          {col2.map(({ key, label }) => <DocCheckbox key={key} docKey={key} label={label} />)}
        </div>
        <div className="space-y-2.5">
          {col3.map(({ key, label }) => <DocCheckbox key={key} docKey={key} label={label} />)}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <Label className="text-xs text-muted-foreground">Outros Documentos</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Nome do documento"
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOtherDoc())}
          />
          <Button type="button" variant="outline" size="sm" onClick={addOtherDoc} className="gap-1 shrink-0">
            <Plus className="size-3.5" /> Adicionar
          </Button>
        </div>
        {otherDocuments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {otherDocuments.map((doc, i) => (
              <span key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                {doc}
                <button type="button" onClick={() => removeOtherDoc(i)}>
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
