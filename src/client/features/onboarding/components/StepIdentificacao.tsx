"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import { identificacaoSchema, type IdentificacaoData } from "../schemas/onboarding.schema"

interface Props {
  defaultValues: IdentificacaoData
  onBack:        () => void
  onNext:        (values: IdentificacaoData) => void
}

export function StepIdentificacao({ defaultValues, onBack, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentificacaoData>({
    resolver: zodResolver(identificacaoSchema),
    defaultValues,
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary tracking-tight">Identificação</h1>
        <p className="text-sm text-muted-foreground">Confirme o nome da empresa.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wide">
            Razão Social <span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("razao_social")}
            className={cn(errors.razao_social && "border-red-400 focus-visible:ring-red-400/30")}
          />
          {errors.razao_social && (
            <p className="text-xs text-red-500">{errors.razao_social.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wide">Nome Fantasia</Label>
          <Input placeholder="—" {...register("nome_fantasia")} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-11 px-4"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 font-bold uppercase tracking-widest text-xs"
          >
            Próximo
          </Button>
        </div>
      </form>
    </div>
  )
}
