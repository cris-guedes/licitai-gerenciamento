"use client"

import type { CompanyItem } from "@/client/main/infra/apis/api-core/models/CompanyItem"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/client/components/ui/alert-dialog"

type Props = {
  open: boolean
  item: CompanyItem | null
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CompanyItemDeleteDialog({ open, item, isPending, onClose, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent >
        <AlertDialogHeader>
          <AlertDialogTitle>Remover item</AlertDialogTitle>
          <AlertDialogDescription>
            {item
              ? `O item ${item.codigo} será removido do catálogo interno da empresa.`
              : "Este item será removido do catálogo interno da empresa."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
           
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? "Removendo..." : "Remover item"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
