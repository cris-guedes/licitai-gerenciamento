"use client"

import { useState }        from "react"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/client/components/ui/dropdown-menu"
import { Button }          from "@/client/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select"
import { MemberRoleBadge } from "./MemberRoleBadge"
import { useTeam }         from "../hooks/use-team"
import { useAppContext }   from "@/client/hooks/app"
import type { ListMemberItem } from "@/client/main/infra/apis/api-core/models/ListMemberItem"

export function MemberList() {
  const { members, membersLoading, updateMemberRole, removeMember } = useTeam()
  const { user } = useAppContext()
  const [editingId, setEditingId] = useState<string | null>(null)

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleRoleChange(member: ListMemberItem, role: "ADMIN" | "MEMBER") {
    setEditingId(member.membershipId)
    await updateMemberRole.mutateAsync({ membershipId: member.membershipId, role })
    setEditingId(null)
  }

  async function handleRemove(membershipId: string) {
    await removeMember.mutateAsync(membershipId)
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Membro</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Papel</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Desde</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isCurrentUser = m.userId === user?.id
            const isOwner       = m.role === "OWNER"
            const isEditing     = editingId === m.membershipId

            return (
              <tr key={m.membershipId} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {m.name}
                      {isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.email}</span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {isOwner || isCurrentUser ? (
                    <MemberRoleBadge role={m.role} />
                  ) : (
                    <Select
                      defaultValue={m.role}
                      disabled={isEditing}
                      onValueChange={(v) => handleRoleChange(m, v as "ADMIN" | "MEMBER")}
                    >
                      <SelectTrigger className="h-7 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Membro</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                </td>

                <td className="px-4 py-3">
                  {!isOwner && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemove(m.membershipId)}
                        >
                          Remover membro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
