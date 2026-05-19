"use client"

import { OportunidadeContratosTab } from "@/client/features/contratos/components/OportunidadeContratosTab/OportunidadeContratosTab"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeExecutionModule({
  companyId,
  oportunidadeId,
  workspace,
}: {
  companyId: string
  oportunidadeId: string
  workspace: OportunidadeWorkspaceModel
}) {
  return <OportunidadeContratosTab companyId={companyId} oportunidadeId={oportunidadeId} workspace={workspace} />
}
