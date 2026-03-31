"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import type { SignupData } from "./SignupWizard"
import { contactInfoSchema, type ContactInfoValues } from "../schemas/signup.schema"

interface Props {
  data: SignupData
  onBack: () => void
  onNext: (data: Pick<SignupData, "firstName" | "lastName" | "phone">) => void
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function StepContactInfo({ data, onBack, onNext }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    },
  })

  const onSubmit = (values: ContactInfoValues) => {
    onNext(values)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Passo 2 de 3
        </p>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Seus dados pessoais
        </h1>
        <p className="text-sm text-muted-foreground">
          Como podemos identificar e entrar em contato com você?
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="firstName"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              placeholder="Ex: João"
              {...register("firstName")}
              className={cn(
                errors.firstName &&
                "border-red-400 focus-visible:ring-red-400/30"
              )}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="lastName"
              className="text-xs font-bold uppercase tracking-wide"
            >
              Sobrenome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Ex: Silva"
              {...register("lastName")}
              className={cn(
                errors.lastName &&
                "border-red-400 focus-visible:ring-red-400/30"
              )}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="text-xs font-bold uppercase tracking-wide"
          >
            WhatsApp / Telefone <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={field.value}
                onBlur={field.onBlur}
                ref={field.ref}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                className={cn(
                  errors.phone && "border-red-400 focus-visible:ring-red-400/30"
                )}
              />
            )}
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-11 px-4 border-border hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 font-bold uppercase tracking-widest text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Próximo passo
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <a href="/login" className="font-bold text-primary hover:underline">
          Entrar
        </a>
      </p>
    </div>
  )
}
