"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"

type Props = {
  open: boolean
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}

export function AccountDeleteDialog({ open, isPending, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle>Excluir conta</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação é <strong>permanente e irreversível</strong>. Sua conta, dados de acesso e histórico serão removidos imediatamente. Tem certeza?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Excluindo..." : "Sim, excluir minha conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
