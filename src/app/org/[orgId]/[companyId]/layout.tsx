import { redirect } from "next/navigation"
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

  const company =
    companyId && companyId !== "undefined"
      ? await prisma.company.findUnique({
          where: { id: companyId },
          select: { id: true, organizationId: true, razao_social: true, nome_fantasia: true },
        })
      : null

  if (!company || company.organizationId !== orgId) {
    const fallbackCompany = await prisma.company.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })

    if (!fallbackCompany) {
      redirect("/onboarding")
    }

    redirect(`/org/${orgId}/${fallbackCompany.id}`)
  }

  const companyName = company?.nome_fantasia ?? company?.razao_social ?? "Minha Empresa"

  return (
    <DashboardShell orgId={orgId} companyId={companyId} companyName={companyName}>
      {children}
    </DashboardShell>
  )
}
