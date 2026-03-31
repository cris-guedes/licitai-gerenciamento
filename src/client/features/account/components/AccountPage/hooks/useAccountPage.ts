"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { useAccountService } from "../../../services/account/use-account.service"
import type { AccountProfileValues } from "../../../schemas/account.schema"

type User = {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  createdAt?: Date | string | null
}

type Deps = {
  user: User | null
  organizationId: string
  accountService: ReturnType<typeof useAccountService>
  signOut: () => Promise<unknown>
}

export function useAccountPage({ user, organizationId, accountService, signOut }: Deps) {
  const router = useRouter()
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const roleQuery = accountService.fetchRole({
    organizationId,
    userId: user?.id ?? "",
    enabled: !!user?.id && !!organizationId,
  })

  async function handleUpdate(values: AccountProfileValues) {
    if (!user) return
    try {
      await accountService.update.mutateAsync({ id: user.id, ...values })
      toast.success("Perfil atualizado com sucesso.")
      setEditOpen(false)
    } catch {
      toast.error("Erro ao atualizar perfil. Tente novamente.")
    }
  }

  async function handleDelete() {
    if (!user) return
    try {
      await accountService.remove.mutateAsync({ id: user.id })
      await signOut()
      router.push("/")
    } catch {
      toast.error("Erro ao excluir conta. Tente novamente.")
    }
  }

  const roleLabel = roleQuery.data
    ? (accountService.ROLE_LABELS[roleQuery.data] ?? roleQuery.data)
    : null

  return {
    user,
    role: roleLabel,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    handleUpdate,
    handleDelete,
    isUpdating: accountService.update.isPending,
    isDeleting: accountService.remove.isPending,
  }
}
