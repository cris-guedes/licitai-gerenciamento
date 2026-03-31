"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import { atividadeSchema, type AtividadeData } from "../schemas/onboarding.schema"

interface Props {
  defaultValues:      AtividadeData
  situacaoCadastral?: string
  onBack:             () => void
  onSubmit:           (values: AtividadeData) => void
  isPending:          boolean
  isError:            boolean
}

export function StepAtividade({
  defaultValues,
  situacaoCadastral,
  onBack,
  onSubmit,
  isPending,
  isError,
}: Props) {
  const { register, handleSubmit } = useForm<AtividadeData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues,
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary tracking-tight">Atividade Econômica</h1>
        <p className="text-sm text-muted-foreground">Confirme os dados de atividade da empresa.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* ── CNAE principal ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">CNAE Principal</Label>
            <Input placeholder="—" {...register("cnae_fiscal")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Descrição</Label>
            <Input placeholder="—" {...register("cnae_fiscal_descricao")} />
          </div>
        </div>

        {/* ── CNAEs secundários ── */}
        {(defaultValues.cnaes_secundarios?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              CNAEs Secundários
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {defaultValues.cnaes_secundarios!.map((c) => (
                <span
                  key={c.codigo}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
                  title={c.descricao}
                >
                  <span className="font-mono font-semibold text-foreground">{c.codigo}</span>
                  <span className="max-w-[180px] truncate">{c.descricao}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Situação cadastral ── */}
        {situacaoCadastral && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Situação Cadastral
            </Label>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                situacaoCadastral === "ATIVA"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {situacaoCadastral}
            </span>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isPending}
            className="h-11 px-4"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 h-11 font-bold uppercase tracking-widest text-xs disabled:opacity-40"
          >
            {isPending ? "Finalizando..." : "Confirmar e Entrar"}
          </Button>
        </div>

        {isError && (
          <p className="text-sm text-red-500 text-center">
            Erro ao finalizar cadastro. Tente novamente.
          </p>
        )}

      </form>
    </div>
  )
}
