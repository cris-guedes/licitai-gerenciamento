"use client"

import { TriangleAlert } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/client/components/ui/alert-dialog"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"

type Props = {
  open: boolean
  isPending: boolean
  company: CompanyProfile | null
  onClose: () => void
  onConfirm: () => void
}

export function CompanyDeleteDialog({ open, isPending, company, onClose, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
          <AlertDialogDescription>
            {company
              ? `Você está prestes a remover ${company.nome_fantasia ?? company.razao_social}. Esta ação não poderá ser desfeita.`
              : "Você está prestes a remover esta empresa. Esta ação não poderá ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
