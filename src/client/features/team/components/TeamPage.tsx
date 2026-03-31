"use client"

import { useState }      from "react"
import { UserPlus }      from "lucide-react"
import { Button }        from "@/client/components/ui/button"
import { MemberList }    from "./MemberList"
import { AddMemberModal } from "./AddMemberModal"

export function TeamPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">Time</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie os membros da sua organização e seus níveis de acesso.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 font-bold uppercase tracking-widest text-xs h-10">
          <UserPlus className="size-4" />
          Adicionar Membro
        </Button>
      </div>

      <MemberList />

      <AddMemberModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
