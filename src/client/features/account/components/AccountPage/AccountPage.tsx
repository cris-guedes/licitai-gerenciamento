"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Mail, CalendarClock, Pencil, Trash2, ShieldAlert, ShieldCheck, Shield } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import { Avatar, AvatarFallback } from "@/client/components/ui/avatar"
import { Badge } from "@/client/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useAccountService } from "../../services/account/use-account.service"
import { accountProfileSchema, type AccountProfileValues } from "../../schemas/account.schema"
import { useAccountPage } from "./hooks/useAccountPage"
import { AccountDeleteDialog } from "./AccountDeleteDialog"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function formatDate(value?: Date | string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function DisplayField({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-background p-4 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function AccountPage() {
  const api            = useCoreApi()
  const accountService = useAccountService(api)
  const { user, signOut, orgAtiva } = useAppContext()

  const page = useAccountPage({
    user,
    organizationId: orgAtiva?.id ?? "",
    accountService,
    signOut,
  })

  const form = useForm<AccountProfileValues>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      name:  user?.name  ?? "",
      email: user?.email ?? "",
    },
  })

  useEffect(() => {
    if (user) form.reset({ name: user.name, email: user.email })
  }, [user, form])

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U"

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted text-muted-foreground">
          <User className="size-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">Minha Conta</h1>
          <p className="text-xs text-muted-foreground">Gerencie seus dados de acesso e perfil.</p>
        </div>
      </div>

      {/* Profile card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{user?.name ?? "—"}</CardTitle>
                  {page.role && (
                    <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {page.role}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">{user?.email ?? "—"}</CardDescription>
              </div>
            </div>
            {!page.editOpen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 shrink-0"
                onClick={() => page.setEditOpen(true)}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {page.editOpen ? (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(page.handleUpdate)}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" className="h-10 rounded-xl" {...form.register("name")} />
                  <FieldError message={form.formState.errors.name?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" className="h-10 rounded-xl" {...form.register("email")} />
                  <FieldError message={form.formState.errors.email?.message} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { page.setEditOpen(false); form.reset() }}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={page.isUpdating}>
                  {page.isUpdating ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DisplayField icon={User} label="Nome">
                <p className="text-sm font-medium text-foreground">{user?.name ?? "—"}</p>
              </DisplayField>

              <DisplayField icon={Mail} label="E-mail">
                <p className="text-sm font-medium text-foreground">{user?.email ?? "—"}</p>
              </DisplayField>

              <DisplayField icon={Shield} label="Papel na organização">
                <p className="text-sm font-medium text-foreground">{page.role ?? "—"}</p>
              </DisplayField>

              <DisplayField icon={(user as any)?.emailVerified ? ShieldCheck : ShieldAlert} label="Verificação de e-mail">
                {(user as any)?.emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <ShieldCheck className="size-3.5" />
                    Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                    <ShieldAlert className="size-3.5" />
                    Não verificado
                  </span>
                )}
              </DisplayField>

              <DisplayField icon={CalendarClock} label="Membro desde" className="sm:col-span-2">
                <p className="text-sm font-medium text-foreground">
                  {formatDate((user as any)?.createdAt)}
                </p>
              </DisplayField>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30 bg-destructive/[0.02] shadow-sm">
        <CardHeader className="px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-destructive" />
            <CardTitle className="text-base text-destructive">Zona de perigo</CardTitle>
          </div>
          <CardDescription>Ações irreversíveis. Prossiga com cautela.</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-background p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Excluir minha conta</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove permanentemente sua conta e todos os dados associados.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => page.setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Excluir conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <AccountDeleteDialog
        open={page.deleteOpen}
        isPending={page.isDeleting}
        onClose={() => page.setDeleteOpen(false)}
        onConfirm={page.handleDelete}
      />
    </div>
  )
}
