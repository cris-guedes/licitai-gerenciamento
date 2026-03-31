"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { localizacaoSchema, type LocalizacaoData } from "../schemas/onboarding.schema"

interface Props {
  defaultValues: LocalizacaoData
  onBack:        () => void
  onNext:        (values: LocalizacaoData) => void
}

export function StepLocalizacao({ defaultValues, onBack, onNext }: Props) {
  const { register, handleSubmit } = useForm<LocalizacaoData>({
    resolver: zodResolver(localizacaoSchema),
    defaultValues,
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary tracking-tight">Localização</h1>
        <p className="text-sm text-muted-foreground">Confirme o endereço da empresa.</p>
      </div>

      <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">

        {/* ── CEP ── */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wide">CEP</Label>
          <Input placeholder="—" {...register("cep")} className="max-w-[160px]" />
        </div>

        {/* ── Logradouro + Número ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Logradouro</Label>
            <Input placeholder="—" {...register("logradouro")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Número</Label>
            <Input placeholder="—" {...register("numero")} />
          </div>
        </div>

        {/* ── Complemento + Bairro ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Complemento</Label>
            <Input placeholder="—" {...register("complemento")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Bairro</Label>
            <Input placeholder="—" {...register("bairro")} />
          </div>
        </div>

        {/* ── Município + UF ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Município</Label>
            <Input placeholder="—" {...register("municipio")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">UF</Label>
            <Input placeholder="—" {...register("uf")} />
          </div>
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
