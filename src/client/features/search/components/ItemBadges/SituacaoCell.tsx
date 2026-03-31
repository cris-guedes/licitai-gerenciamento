"use client"

import { BadgeWithInfo } from "./BadgeWithInfo"
import { SITUACAO_ITEM_CONFIG } from "./constants"
import { isNaoSeAplica } from "./helpers"

export function SituacaoCell({ it }: { it: any }) {
  if (!it.situacaoCompraItemNome || isNaoSeAplica(it.situacaoCompraItemNome)) {
    return <span className="text-muted-foreground/40">—</span>
  }

  return (
    <BadgeWithInfo
      label={it.situacaoCompraItemNome}
      colorClass={SITUACAO_ITEM_CONFIG[it.situacaoCompraItem]?.bg ?? "bg-muted text-muted-foreground"}
      tooltip={SITUACAO_ITEM_CONFIG[it.situacaoCompraItem]?.tooltip ?? "Situação atual do item na licitação."}
    />
  )
}
