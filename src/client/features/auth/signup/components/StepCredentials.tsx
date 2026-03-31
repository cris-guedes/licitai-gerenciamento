"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import Link from "next/link"
import { credentialsSchema, type CredentialsValues } from "../schemas/signup.schema"

interface Props {
  onBack: () => void
  onSubmit: (data: { email: string; password: string }) => void
  isLoading?: boolean
  serverError?: string | null
}

export function StepCredentials({ onBack, onSubmit, isLoading, serverError }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
  })

  const handleFormSubmit = ({ email, password }: CredentialsValues) => {
    onSubmit({ email, password })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Passo 3 de 3
        </p>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Crie sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Quase lá, defina seu acesso.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">
            E-mail profissional <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@empresa.com"
            {...register("email")}
            className={cn(errors.email && "border-red-400 focus-visible:ring-red-400/30")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide">
            Senha de acesso <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
            className={cn(errors.password && "border-red-400 focus-visible:ring-red-400/30")}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wide">
            Confirme sua senha <span className="text-red-500">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            {...register("confirmPassword")}
            className={cn(errors.confirmPassword && "border-red-400 focus-visible:ring-red-400/30")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="h-11 px-4 border-border hover:bg-muted"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-11 font-bold uppercase tracking-widest text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Criando conta..." : "Finalizar Cadastro"}
          </Button>
        </div>

        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}
      </form>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        Ao clicar em finalizar, você concorda com nossos{" "}
        <Link href="/termos" className="font-bold text-primary hover:underline">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link href="/privacidade" className="font-bold text-primary hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  )
}
