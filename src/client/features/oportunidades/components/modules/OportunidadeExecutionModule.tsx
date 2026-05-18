"use client"

import { OportunidadeContratosTab } from "@/client/features/contratos/components/OportunidadeContratosTab/OportunidadeContratosTab"

export function OportunidadeExecutionModule({
  companyId,
  oportunidadeId,
}: {
  companyId: string
  oportunidadeId: string
}) {
  return <OportunidadeContratosTab companyId={companyId} oportunidadeId={oportunidadeId} />
}
