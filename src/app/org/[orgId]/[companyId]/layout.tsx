import { DashboardShell } from "@/client/features/dashboard/components/DashboardShell"
import { prisma } from "@/server/shared/infra/db/client"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string; companyId: string }>
}) {
  const { orgId, companyId } = await params

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { razao_social: true, nome_fantasia: true },
  })

  const companyName = company?.nome_fantasia ?? company?.razao_social ?? "Minha Empresa"

  return (
    <DashboardShell orgId={orgId} companyId={companyId} companyName={companyName}>
      {children}
    </DashboardShell>
  )
}
