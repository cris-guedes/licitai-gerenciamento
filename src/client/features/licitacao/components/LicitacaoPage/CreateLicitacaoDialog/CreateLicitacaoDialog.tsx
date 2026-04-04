"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select"
import {
  createLicitacaoSchema,
  type CreateLicitacaoFormValues,
  MODALITY_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
} from "../../../schemas/licitacao.schema"
import { cn } from "@/client/main/lib/utils"

type Props = {
  open: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CreateLicitacaoFormValues) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function Field({
  label,
  id,
  error,
  children,
  className,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

export function CreateLicitacaoDialog({ open, isPending, onClose, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateLicitacaoFormValues>({
    resolver: zodResolver(createLicitacaoSchema) as any,
    defaultValues: {
      object: "",
      modality: "",
      contractType: "",
      estimatedValue: "",
      openingDate: "",
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova licitação</DialogTitle>
          <DialogDescription>
            Preencha os dados do edital para iniciar o acompanhamento.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-licitacao-form"
          onSubmit={handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Objeto" id="object" error={errors.object?.message} className="col-span-2">
              <Input
                id="object"
                className="h-10 rounded-xl"
                placeholder="Ex: Aquisição de materiais de escritório"
                {...register("object")}
              />
            </Field>

            <Field label="Modalidade" id="modality" error={errors.modality?.message}>
              <Select onValueChange={(v) => setValue("modality", v)}>
                <SelectTrigger id="modality" className="h-10 rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MODALITY_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo de contratação" id="contractType">
              <Select onValueChange={(v) => setValue("contractType", v)}>
                <SelectTrigger id="contractType" className="h-10 rounded-xl">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Valor estimado (R$)" id="estimatedValue" error={errors.estimatedValue?.message}>
              <Input
                id="estimatedValue"
                type="number"
                step="0.01"
                min="0"
                className="h-10 rounded-xl"
                placeholder="0,00"
                {...register("estimatedValue")}
              />
            </Field>

            <Field label="Data de abertura" id="openingDate">
              <Input
                id="openingDate"
                type="date"
                className="h-10 rounded-xl"
                {...register("openingDate")}
              />
            </Field>
          </div>
        </form>

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-licitacao-form"
            size="sm"
            className="gap-1.5"
            disabled={isPending}
          >
            {isPending ? (
              "Criando..."
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Criar licitação
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
