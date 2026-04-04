import { NovaLicitacaoPage } from "@/client/features/licitacao/components/NovaLicitacaoPage/NovaLicitacaoPage"

type Props = {
  params: Promise<{ orgId: string; companyId: string }>
}

export default async function NovaLicitacaoRoute({ params }: Props) {
  const { orgId, companyId } = await params
  return <NovaLicitacaoPage orgId={orgId} companyId={companyId} />
}
