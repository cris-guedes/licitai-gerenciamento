"use client"

import { Dialog, DialogContent, DialogTitle } from "@/client/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { ContractDetailContent } from "./ContractDetailContent"

interface Props {
  orgaoCnpj:            string
  anoContrato:          number
  sequencialContrato:   number
  numeroContratoEmpenho?: string
  open:                 boolean
  onClose:              () => void
}

export function ContractDetailSheet({
  orgaoCnpj, anoContrato, sequencialContrato, numeroContratoEmpenho, open, onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[90vw] w-[90vw] h-[88vh] overflow-hidden flex flex-col p-0 gap-0"
      >
        <VisuallyHidden.Root>
          <DialogTitle>
            {numeroContratoEmpenho ? `Contrato nº ${numeroContratoEmpenho}` : "Detalhes do contrato"}
          </DialogTitle>
        </VisuallyHidden.Root>
        <ContractDetailContent
          orgaoCnpj={orgaoCnpj}
          anoContrato={anoContrato}
          sequencialContrato={sequencialContrato}
          numeroContratoEmpenho={numeroContratoEmpenho}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
