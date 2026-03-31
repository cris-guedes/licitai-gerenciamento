"use client"

import { useState }                  from "react"
import { useForm }                   from "react-hook-form"
import { zodResolver }               from "@hookform/resolvers/zod"
import { z }                         from "zod"
import { Check, Copy, Loader2 }      from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog"
import { Button }   from "@/client/components/ui/button"
import { Input }    from "@/client/components/ui/input"
import { Label }    from "@/client/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { useTeam }  from "../hooks/use-team"

// ── Schemas ──────────────────────────────────────────────────────────────────

const directSchema = z.object({
  name:     z.string().min(2, "Nome obrigatório"),
  email:    z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role:     z.enum(["ADMIN", "MEMBER"]),
})

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role:  z.enum(["ADMIN", "MEMBER"]),
})

type DirectForm  = z.infer<typeof directSchema>
type InviteForm  = z.infer<typeof inviteSchema>
type Tab = "direct" | "invite"

interface Props {
  open:     boolean
  onClose:  () => void
}

// ── Tab: Direct ───────────────────────────────────────────────────────────────

function TabDirect({ onSuccess }: { onSuccess: () => void }) {
  const { createMember } = useTeam()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DirectForm>({
    resolver: zodResolver(directSchema),
    defaultValues: { role: "MEMBER" },
  })

  async function onSubmit(data: DirectForm) {
    await createMember.mutateAsync(data)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">Nome completo</Label>
        <Input placeholder="João Silva" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">E-mail</Label>
        <Input type="email" placeholder="joao@empresa.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">Senha de acesso</Label>
        <Input type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">Papel</Label>
        <Select defaultValue="MEMBER" onValueChange={(v) => setValue("role", v as "ADMIN" | "MEMBER")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">Membro</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {createMember.error && (
        <p className="text-sm text-red-500">{(createMember.error as any)?.message ?? "Erro ao criar membro."}</p>
      )}

      <Button type="submit" disabled={createMember.isPending} className="w-full h-11 font-bold uppercase tracking-widest text-xs">
        {createMember.isPending ? <Loader2 className="size-4 animate-spin" /> : "Criar Membro"}
      </Button>
    </form>
  )
}

// ── Tab: Invite ───────────────────────────────────────────────────────────────

function TabInvite() {
  const { createInvite } = useTeam()
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "MEMBER" },
  })

  async function onSubmit(data: InviteForm) {
    const result = await createInvite.mutateAsync(data)
    setInviteUrl(result.inviteUrl)
  }

  async function copyLink() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inviteUrl) {
    return (
      <div className="pt-2 space-y-4">
        <p className="text-sm text-muted-foreground">Link gerado com sucesso! Copie e envie ao convidado.</p>
        <div className="flex gap-2">
          <Input value={inviteUrl} readOnly className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copyLink}>
            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Este link expira em 7 dias.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">E-mail do convidado</Label>
        <Input type="email" placeholder="convidado@empresa.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold uppercase tracking-wide">Papel</Label>
        <Select defaultValue="MEMBER" onValueChange={(v) => setValue("role", v as "ADMIN" | "MEMBER")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="MEMBER">Membro</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {createInvite.error && (
        <p className="text-sm text-red-500">{(createInvite.error as any)?.message ?? "Erro ao gerar convite."}</p>
      )}

      <Button type="submit" disabled={createInvite.isPending} className="w-full h-11 font-bold uppercase tracking-widest text-xs">
        {createInvite.isPending ? <Loader2 className="size-4 animate-spin" /> : "Gerar Link"}
      </Button>
    </form>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function AddMemberModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("direct")

  const tabClass = (t: Tab) =>
    `flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${
      tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    }`

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-black tracking-tight">Adicionar Membro</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <button type="button" className={tabClass("direct")} onClick={() => setTab("direct")}>
            Acesso Direto
          </button>
          <button type="button" className={tabClass("invite")} onClick={() => setTab("invite")}>
            Link de Convite
          </button>
        </div>

        {tab === "direct"  && <TabDirect onSuccess={onClose} />}
        {tab === "invite"  && <TabInvite />}
      </DialogContent>
    </Dialog>
  )
}
