import { redirect } from "next/navigation"
import { getServerSession } from "@/server/shared/infra/auth/get-server-session"
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository"
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository"

export default async function OrgRedirectPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/login")
  }

  const membershipRepository = new PrismaMembershipRepository()
  const membership = await membershipRepository.findByUserIdAndOrganizationId({
    userId: session.user.id,
    organizationId: orgId,
  })

  if (!membership) {
    redirect("/")
  }

  const companyRepository = new PrismaCompanyRepository()
  const companies = await companyRepository.findByOrganizationId({ organizationId: orgId })
  const firstCompany = companies[0]

  if (!firstCompany) {
    redirect("/onboarding")
  }

  redirect(`/org/${orgId}/${firstCompany.id}`)
}
