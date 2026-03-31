"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Building2, MapPin, Landmark, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
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
import { companyProfileFormSchema, type CompanyProfileFormValues } from "../../../schemas/company-profile.schema"

type Props = {
  open: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CompanyProfileFormValues) => void
}

type Step = 1 | 2 | 3

const STEPS = [
  { label: "Identificação", icon: Building2 },
  { label: "Classificação", icon: Landmark },
  { label: "Endereço",      icon: MapPin },
]

const STEP_FIELDS: Record<Step, (keyof CompanyProfileFormValues)[]> = {
  1: ["cnpj", "razao_social"],
  2: [],
  3: [],
}

function StepProgress({ current }: { current: Step }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Passo {current} de {STEPS.length}
        </p>
        <p className="text-xs font-semibold text-foreground">
          {STEPS[current - 1].label}
        </p>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i + 1 <= current ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
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

export function CompanyCreateDialog({ open, isPending, onClose, onSubmit }: Props) {
  const [step, setStep] = useState<Step>(1)

  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues: {
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      email_empresa: "",
      telefone_1: "",
      situacao_cadastral: "",
      data_situacao_cadastral: "",
      data_abertura: "",
      porte: "",
      natureza_juridica: "",
      cnae_fiscal_descricao: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
      capital_social: "",
    },
  })

  const { register, formState: { errors }, trigger, handleSubmit, reset } = form

  async function handleNext() {
    const fields = STEP_FIELDS[step]
    const valid = fields.length === 0 ? true : await trigger(fields)
    if (valid) setStep((s) => (s + 1) as Step)
  }

  function handleBack() {
    setStep((s) => (s - 1) as Step)
  }

  function handleClose() {
    reset()
    setStep(1)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>
            Cadastre uma nova empresa vinculada à organização ativa.
          </DialogDescription>
        </DialogHeader>

        <StepProgress current={step} />

        <form
          id="create-company-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Step 1 — Identificação */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="CNPJ" id="cnpj" error={errors.cnpj?.message} className="col-span-2">
                  <Input id="cnpj" className="h-10 rounded-xl" placeholder="00000000000191" {...register("cnpj")} />
                </Field>

                <Field label="Razão social" id="razao_social" error={errors.razao_social?.message} className="col-span-2">
                  <Input id="razao_social" className="h-10 rounded-xl" placeholder="Empresa Exemplo LTDA" {...register("razao_social")} />
                </Field>

                <Field label="Nome fantasia" id="nome_fantasia" className="col-span-2">
                  <Input id="nome_fantasia" className="h-10 rounded-xl" placeholder="Nome fantasia (opcional)" {...register("nome_fantasia")} />
                </Field>

                <Field label="E-mail" id="email_empresa" error={errors.email_empresa?.message}>
                  <Input id="email_empresa" type="email" className="h-10 rounded-xl" placeholder="contato@empresa.com" {...register("email_empresa")} />
                </Field>

                <Field label="Telefone" id="telefone_1">
                  <Input id="telefone_1" className="h-10 rounded-xl" placeholder="(45) 99999-9999" {...register("telefone_1")} />
                </Field>

              </div>
            </div>
          )}

          {/* Step 2 — Classificação */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Situação cadastral" id="situacao_cadastral">
                  <Input id="situacao_cadastral" className="h-10 rounded-xl" placeholder="Ativa" {...register("situacao_cadastral")} />
                </Field>

                <Field label="Data de abertura" id="data_abertura">
                  <Input id="data_abertura" className="h-10 rounded-xl" placeholder="2020-01-01" {...register("data_abertura")} />
                </Field>

                <Field label="Data da situação" id="data_situacao_cadastral">
                  <Input id="data_situacao_cadastral" className="h-10 rounded-xl" placeholder="2024-01-01" {...register("data_situacao_cadastral")} />
                </Field>

                <Field label="Porte" id="porte">
                  <Input id="porte" className="h-10 rounded-xl" placeholder="Pequeno porte" {...register("porte")} />
                </Field>

                <Field label="Natureza jurídica" id="natureza_juridica">
                  <Input id="natureza_juridica" className="h-10 rounded-xl" placeholder="Sociedade Limitada" {...register("natureza_juridica")} />
                </Field>

                <Field label="CNAE principal" id="cnae_fiscal_descricao" className="col-span-2">
                  <Input id="cnae_fiscal_descricao" className="h-10 rounded-xl" placeholder="Atividade principal" {...register("cnae_fiscal_descricao")} />
                </Field>

                <Field label="Capital social" id="capital_social" className="col-span-2">
                  <Input id="capital_social" type="number" step="0.01" className="h-10 rounded-xl" placeholder="0,00" {...register("capital_social")} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 3 — Endereço */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="CEP" id="cep">
                  <Input id="cep" className="h-10 rounded-xl" placeholder="85851-000" {...register("cep")} />
                </Field>

                <Field label="UF" id="uf">
                  <Input id="uf" className="h-10 rounded-xl" placeholder="PR" maxLength={2} {...register("uf")} />
                </Field>

                <Field label="Logradouro" id="logradouro" className="col-span-2">
                  <Input id="logradouro" className="h-10 rounded-xl" placeholder="Rua Exemplo" {...register("logradouro")} />
                </Field>

                <Field label="Número" id="numero">
                  <Input id="numero" className="h-10 rounded-xl" placeholder="123" {...register("numero")} />
                </Field>

                <Field label="Complemento" id="complemento">
                  <Input id="complemento" className="h-10 rounded-xl" placeholder="Sala 2" {...register("complemento")} />
                </Field>

                <Field label="Bairro" id="bairro">
                  <Input id="bairro" className="h-10 rounded-xl" placeholder="Centro" {...register("bairro")} />
                </Field>

                <Field label="Município" id="municipio">
                  <Input id="municipio" className="h-10 rounded-xl" placeholder="Foz do Iguaçu" {...register("municipio")} />
                </Field>
              </div>
            </div>
          )}
        </form>

        {/* Footer navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={step === 1 ? handleClose : handleBack}
            className="gap-1.5"
          >
            {step === 1 ? (
              "Cancelar"
            ) : (
              <>
                <ArrowLeft className="size-3.5" />
                Voltar
              </>
            )}
          </Button>

          {step < 3 ? (
            <Button type="button" size="sm" className="gap-1.5" onClick={handleNext}>
              Próximo
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              form="create-company-form"
              size="sm"
              className="gap-1.5"
              disabled={isPending}
            >
              {isPending ? (
                "Criando..."
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Criar empresa
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
