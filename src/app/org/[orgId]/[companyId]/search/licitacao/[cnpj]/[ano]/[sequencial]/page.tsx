"use client"

import { use, useMemo } from "react"
import { LicitacaoDetailContent } from "@/client/features/search/components/LicitacaoDetail"
import { Card } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface Params {
  orgId: string
  companyId: string
  cnpj: string
  ano: string
  sequencial: string
}

export default function LicitacaoDetailPage({ params }: { params: Promise<Params> | Params }) {
  // Use 'use' hook for params in Next.js 15+ or handle Promise/Sync
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { orgId, companyId, cnpj, ano, sequencial } = resolvedParams

  const mockItem = useMemo(() => ({
    orgao_cnpj: cnpj,
    ano: ano,
    numero_sequencial: sequencial,
    title: `Licitação ${sequencial}/${ano}`,
  }), [cnpj, ano, sequencial])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={`/org/${orgId}/${companyId}/search`}>
            <ChevronLeft className="size-4" />
            Voltar para a Busca
          </Link>
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/40 shadow-xl bg-card/50 backdrop-blur-sm min-h-[800px]">
        <LicitacaoDetailContent item={mockItem} isOpen={true} />
      </Card>
    </div>
  )
}
