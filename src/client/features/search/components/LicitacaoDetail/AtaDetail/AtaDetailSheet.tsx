"use client"

import { Dialog, DialogContent, DialogTitle } from "@/client/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { AtaDetailContent } from "./AtaDetailContent"

interface Props {
  cnpj:             string
  anoCompra:        number
  sequencialCompra: number
  sequencialAta:    number
  numeroAta?:       string
  open:             boolean
  onClose:          () => void
}

export function AtaDetailSheet({
  cnpj, anoCompra, sequencialCompra, sequencialAta, numeroAta, open, onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[90vw] w-[90vw] h-[88vh] overflow-hidden flex flex-col p-0 gap-0"
      >
        <VisuallyHidden.Root>
          <DialogTitle>
            {numeroAta ? `Ata nº ${numeroAta}` : "Detalhes da ata"}
          </DialogTitle>
        </VisuallyHidden.Root>
        <AtaDetailContent
          cnpj={cnpj}
          anoCompra={anoCompra}
          sequencialCompra={sequencialCompra}
          sequencialAta={sequencialAta}
          numeroAta={numeroAta}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
