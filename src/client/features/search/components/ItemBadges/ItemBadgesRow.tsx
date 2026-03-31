"use client"

import { BadgeWithInfo } from "./BadgeWithInfo"
import {
  getBeneficioBadgeClass,
  getBeneficioTooltip,
  getCriterioBadgeClass,
  getCriterioTooltip,
  isNaoSeAplica,
} from "./helpers"

export function ItemBadgesRow({ it }: { it: any }) {
  const hasBadges =
    (it.criterioJulgamentoNome && !isNaoSeAplica(it.criterioJulgamentoNome)) ||
    (it.tipoBeneficioNome && !isNaoSeAplica(it.tipoBeneficioNome))

  if (!hasBadges) return null

  return (
    <div className="flex flex-wrap gap-1 mb-1.5">
      {it.criterioJulgamentoNome && !isNaoSeAplica(it.criterioJulgamentoNome) && (
        <BadgeWithInfo
          label={it.criterioJulgamentoNome}
          colorClass={getCriterioBadgeClass(it.criterioJulgamentoNome)}
          tooltip={getCriterioTooltip(it.criterioJulgamentoNome)}
        />
      )}
      {it.tipoBeneficioNome && !isNaoSeAplica(it.tipoBeneficioNome) && (
        <BadgeWithInfo
          label={it.tipoBeneficioNome}
          colorClass={getBeneficioBadgeClass(it.tipoBeneficioNome)}
          tooltip={getBeneficioTooltip(it.tipoBeneficioNome)}
        />
      )}
    </div>
  )
}
