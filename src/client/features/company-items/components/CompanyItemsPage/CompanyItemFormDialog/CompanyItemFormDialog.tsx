"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import type { CompanyItem } from "@/client/main/infra/apis/api-core/models/CompanyItem"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Switch } from "@/client/components/ui/switch"
import { Textarea } from "@/client/components/ui/textarea"
import { companyItemFormSchema, type CompanyItemFormValues } from "../../../schemas/company-item.schema"

type Props = {
  open: boolean
  mode: "create" | "edit"
  item: CompanyItem | null
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CompanyItemFormValues) => void
}

function toFormValues(item: CompanyItem | null): CompanyItemFormValues {
  return {
    codigo: item?.codigo ?? "",
    descricao: item?.descricao ?? "",
    marca: item?.marca ?? "",
    unidadeMedida: item?.unidadeMedida ?? "UN",
    imageUrl: item?.imageUrl ?? "",
    precoReferencia: item?.precoReferencia != null ? String(item.precoReferencia) : "",
    ativo: item?.ativo ?? true,
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export function CompanyItemFormDialog({ open, mode, item, isPending, onClose, onSubmit }: Props) {
  const form = useForm<CompanyItemFormValues>({
    resolver: zodResolver(companyItemFormSchema),
    defaultValues: toFormValues(item),
  })
  const ativo = useWatch({
    control: form.control,
    name: "ativo",
  }) ?? true

  useEffect(() => {
    form.reset(toFormValues(item))
  }, [item, form, open])

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo item" : "Editar item"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Cadastre um item interno para reutilizar nos fluxos de precificação."
              : `Atualize os dados de ${item?.codigo ?? "este item"} sem perder o histórico do catálogo.`}
          </DialogDescription>
        </DialogHeader>

        <form
          id="company-item-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(values => onSubmit(values))}
        >
          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="PROD-001"
                {...form.register("codigo")}
              />
              <FieldError message={form.formState.errors.codigo?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Intelbras, Motorola..."
                {...form.register("marca")}
              />
              <FieldError message={form.formState.errors.marca?.message} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="space-y-2">
              <Label htmlFor="unidadeMedida">Unidade de medida</Label>
              <Input
                id="unidadeMedida"
                placeholder="UN"
                maxLength={20}
                {...form.register("unidadeMedida")}
              />
              <FieldError message={form.formState.errors.unidadeMedida?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precoReferencia">Preço de referência</Label>
              <Input
                id="precoReferencia"
                inputMode="decimal"
                placeholder="0,00"
                {...form.register("precoReferencia")}
              />
              <FieldError message={form.formState.errors.precoReferencia?.message} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Foto do item</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                {...form.register("imageUrl")}
              />
              <FieldError message={form.formState.errors.imageUrl?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={4}
              placeholder="Descreva o item exatamente como ele deve aparecer no catálogo interno."
              {...form.register("descricao")}
            />
            <FieldError message={form.formState.errors.descricao?.message} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Item ativo</p>
              <p className="text-xs text-slate-500">Itens inativos permanecem cadastrados, mas saem do uso operacional.</p>
            </div>
            <Switch
              checked={ativo}
              onCheckedChange={(checked) => {
                form.setValue("ativo", checked, { shouldDirty: true })
              }}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="company-item-form" disabled={isPending}>
            {isPending ? (mode === "create" ? "Cadastrando..." : "Salvando...") : (mode === "create" ? "Cadastrar item" : "Salvar alterações")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
