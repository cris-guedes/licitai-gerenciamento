"use client"

import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { Textarea } from "@/client/components/ui/textarea"
import { useCoreApi } from "@/client/hooks/use-core-api"
import type { ContratoListItem, ContratoStatus } from "../types"
import { CONTRATO_STATUS_LABEL } from "../types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  contrato: ContratoListItem
}

const optionalNumber = z.preprocess(
  value => value === "" || value === null ? undefined : value,
  z.coerce.number().optional(),
)

const schema = z.object({
  numeroContrato: z.string().optional(),
  anoContrato: optionalNumber,
  processo: z.string().optional(),
  tipoContrato: z.string().optional(),
  objetoContrato: z.string().optional(),
  fornecedorCnpjCpf: z.string().optional(),
  fornecedorNome: z.string().optional(),
  valorGlobal: optionalNumber,
  dataAssinatura: z.string().optional(),
  dataVigenciaInicio: z.string().optional(),
  dataVigenciaFim: z.string().optional(),
  status: z.enum(["RASCUNHO", "VIGENTE", "ENCERRADO", "RESCINDIDO", "CANCELADO"]),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

function dateInputValue(value: string | null | undefined) {
  if (!value) return ""
  return value.slice(0, 10)
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function EditContratoDialog({ open, onOpenChange, companyId, contrato }: Props) {
  const api = useCoreApi()
  const queryClient = useQueryClient()

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      numeroContrato: contrato.numeroContrato ?? "",
      anoContrato: contrato.anoContrato ?? undefined,
      processo: contrato.processo ?? "",
      tipoContrato: contrato.tipoContrato ?? "",
      objetoContrato: contrato.objetoContrato ?? "",
      fornecedorCnpjCpf: contrato.fornecedorCnpjCpf ?? "",
      fornecedorNome: contrato.fornecedorNome ?? "",
      valorGlobal: contrato.valorGlobal ? Number(contrato.valorGlobal) : undefined,
      dataAssinatura: dateInputValue(contrato.dataAssinatura),
      dataVigenciaInicio: dateInputValue(contrato.dataVigenciaInicio),
      dataVigenciaFim: dateInputValue(contrato.dataVigenciaFim),
      status: contrato.status,
    },
  })
  const selectedStatus = useWatch({ control: form.control, name: "status" })

  useEffect(() => {
    if (!open) return
    form.reset({
      numeroContrato: contrato.numeroContrato ?? "",
      anoContrato: contrato.anoContrato ?? undefined,
      processo: contrato.processo ?? "",
      tipoContrato: contrato.tipoContrato ?? "",
      objetoContrato: contrato.objetoContrato ?? "",
      fornecedorCnpjCpf: contrato.fornecedorCnpjCpf ?? "",
      fornecedorNome: contrato.fornecedorNome ?? "",
      valorGlobal: contrato.valorGlobal ? Number(contrato.valorGlobal) : undefined,
      dataAssinatura: dateInputValue(contrato.dataAssinatura),
      dataVigenciaInicio: dateInputValue(contrato.dataVigenciaInicio),
      dataVigenciaFim: dateInputValue(contrato.dataVigenciaFim),
      status: contrato.status,
    })
  }, [contrato, form, open])

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.contratos.postCoreContratosUpdate({
      requestBody: {
        companyId,
        contratoId: contrato.id,
        numeroContrato: emptyToNull(data.numeroContrato),
        anoContrato: data.anoContrato ?? null,
        processo: emptyToNull(data.processo),
        tipoContrato: emptyToNull(data.tipoContrato),
        objetoContrato: emptyToNull(data.objetoContrato),
        fornecedorCnpjCpf: emptyToNull(data.fornecedorCnpjCpf),
        fornecedorNome: emptyToNull(data.fornecedorNome),
        valorGlobal: data.valorGlobal ?? null,
        valorTotal: data.valorGlobal ?? null,
        dataAssinatura: emptyToNull(data.dataAssinatura),
        dataVigenciaInicio: emptyToNull(data.dataVigenciaInicio),
        dataVigenciaFim: emptyToNull(data.dataVigenciaFim),
        status: data.status,
      },
    }),
    onSuccess: () => {
      toast.success("Contrato atualizado.")
      queryClient.invalidateQueries({ queryKey: ["contratos", companyId] })
      queryClient.invalidateQueries({ queryKey: ["contratos", companyId, contrato.oportunidadeId] })
      queryClient.invalidateQueries({ queryKey: ["contrato-workspace", contrato.id] })
      onOpenChange(false)
    },
    onError: (error) => {
      console.error(error)
      toast.error("Erro ao atualizar contrato")
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Editar Contrato</DialogTitle>
          <DialogDescription>Atualize identificacao, valores, vigencia e status.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numeroContrato">Numero</Label>
              <Input id="numeroContrato" {...form.register("numeroContrato")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anoContrato">Ano</Label>
              <Input id="anoContrato" type="number" {...form.register("anoContrato")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="processo">Processo</Label>
              <Input id="processo" {...form.register("processo")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => form.setValue("status", value as ContratoStatus, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRATO_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetoContrato">Objeto</Label>
            <Textarea id="objetoContrato" rows={4} {...form.register("objetoContrato")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dataAssinatura">Assinatura</Label>
              <Input id="dataAssinatura" type="date" {...form.register("dataAssinatura")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataVigenciaInicio">Inicio</Label>
              <Input id="dataVigenciaInicio" type="date" {...form.register("dataVigenciaInicio")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataVigenciaFim">Fim</Label>
              <Input id="dataVigenciaFim" type="date" {...form.register("dataVigenciaFim")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fornecedorNome">Fornecedor</Label>
              <Input id="fornecedorNome" {...form.register("fornecedorNome")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedorCnpjCpf">CNPJ/CPF</Label>
              <Input id="fornecedorCnpjCpf" {...form.register("fornecedorCnpjCpf")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoContrato">Tipo</Label>
              <Input id="tipoContrato" placeholder="contrato, ata_registro_precos..." {...form.register("tipoContrato")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorGlobal">Valor global</Label>
              <Input id="valorGlobal" type="number" step="0.01" {...form.register("valorGlobal")} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
