"use client"

import { useForm }       from "react-hook-form"
import { zodResolver }   from "@hookform/resolvers/zod"
import { z }             from "zod"
import { useRouter }     from "next/navigation"
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button }        from "@/client/components/ui/button"
import { Input }         from "@/client/components/ui/input"
import { Label }         from "@/client/components/ui/label"
import { useAcceptInvite } from "../hooks/use-accept-invite"

const schema = z.object({
  name:            z.string().min(2, "Nome obrigatório"),
  password:        z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof schema>

const ROLE_LABELS: Record<string, string> = {
  OWNER:  "Proprietário",
  ADMIN:  "Administrador",
  MEMBER: "Membro",
}

interface Props {
  token: string
}

export function AcceptInvitePage({ token }: Props) {
  const router = useRouter()
  const { invite, inviteLoading, inviteError, acceptInvite } = useAcceptInvite(token)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ name, password }: FormValues) {
    const result = await acceptInvite.mutateAsync({ name, password })
    router.push(`/login?email=${encodeURIComponent(result.email)}`)
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Invalid / expired ────────────────────────────────────────────────────

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <AlertTriangle className="size-10 text-amber-500 mx-auto" />
          <h1 className="text-xl font-black text-primary">Convite inválido</h1>
          <p className="text-sm text-muted-foreground">
            Este link de convite expirou ou já foi utilizado. Solicite um novo convite ao administrador da organização.
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Ir para o login
          </Button>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] space-y-6">

        {/* Org info */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck className="size-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-xl font-black text-primary tracking-tight">
            Você foi convidado
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{invite.orgName}</span> convidou você
            para participar como <span className="font-semibold text-foreground">{ROLE_LABELS[invite.role] ?? invite.role}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Empresa: {invite.companyName}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">E-mail</Label>
            <Input value={invite.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Seu nome completo</Label>
            <Input placeholder="João Silva" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Crie uma senha</Label>
            <Input type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wide">Confirme a senha</Label>
            <Input type="password" placeholder="Repita a senha" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {acceptInvite.error && (
            <p className="text-sm text-red-500 text-center">
              {(acceptInvite.error as any)?.message ?? "Erro ao aceitar convite."}
            </p>
          )}

          <Button
            type="submit"
            disabled={acceptInvite.isPending}
            className="w-full h-11 font-bold uppercase tracking-widest text-xs"
          >
            {acceptInvite.isPending ? <Loader2 className="size-4 animate-spin" /> : "Entrar na Organização"}
          </Button>
        </form>
      </div>
    </div>
  )
}
