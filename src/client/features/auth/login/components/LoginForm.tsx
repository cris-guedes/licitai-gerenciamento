"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { cn } from "@/client/main/lib/utils"
import { useAuthMethods } from "@/client/hooks/app/auth/use-auth-methods"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const { signIn } = useAuthMethods()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }: LoginValues) => {
    setIsLoading(true)
    setServerError(null)

    const result = await signIn.email({ email, password })

    if (result.error) {
      setServerError("E-mail ou senha inválidos.")
      setIsLoading(false)
      return
    }

    router.push("/")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Entrar na plataforma
        </h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta para continuar.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide">
            E-mail <span className="text-red-500">*</span>
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

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide">
            Senha <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            {...register("password")}
            className={cn(errors.password && "border-red-400 focus-visible:ring-red-400/30")}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 font-bold uppercase tracking-widest text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
