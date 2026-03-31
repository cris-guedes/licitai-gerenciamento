"use client"

import { Dialog, DialogContent, DialogTitle } from "@/client/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { LicitacaoDetailContent } from "./LicitacaoDetailContent"

interface Props {
  item:    LicitacaoItem
  open:    boolean
  onClose: () => void
}

export function LicitacaoDetailSheet({ item, open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[95vw] w-[95vw] h-[92vh] overflow-hidden flex flex-col p-0 gap-0"
      >
        <VisuallyHidden.Root>
          <DialogTitle>{item.title ?? "Detalhes da licitação"}</DialogTitle>
        </VisuallyHidden.Root>
        <LicitacaoDetailContent item={item} isOpen={open} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
