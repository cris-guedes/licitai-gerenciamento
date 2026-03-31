"use client"

import { useState } from "react"
import { ScrollText } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useProcurementService } from "../../../services/procurement"
import { AtaDetailSheet } from "../AtaDetail"
import { EmptyState, LoadingState, SectionTitle, formatDateShort } from "../shared"

type Props = {
  atas: ReturnType<typeof useProcurementService>["atas"]
  item: LicitacaoItem
}

export function TabAtas({ atas: query, item }: Props) {
  const [selected, setSelected] = useState<{ seqAta: number; numero?: string } | null>(null)

  const cnpj = item.orgao_cnpj
  const anoCompra = item.ano ? Number(item.ano) : undefined
  const sequencialCompra = item.numero_sequencial ? Number(item.numero_sequencial) : undefined

  return (
    <div className="flex flex-col flex-1">
      <SectionTitle>Atas de Registro de Preço{query.data?.atas.length ? ` (${query.data.atas.length})` : ""}</SectionTitle>
      {query.isLoading && <LoadingState text="Carregando atas..." />}
      {query.isError && <p className="text-sm text-destructive text-center py-4">Erro ao carregar atas.</p>}
      {query.data?.atas.length === 0 && <EmptyState icon={ScrollText} text="Nenhuma ata encontrada." />}
      <div className="flex flex-col gap-2">
        {query.data?.atas.map((ata: any, index: number) => {
          const seqAta = ata.sequencialAta as number | undefined
          const canOpen = seqAta != null && !!cnpj && !!anoCompra && !!sequencialCompra

          return (
            <div
              key={ata.numeroAtaRegistroPreco ?? index}
              onClick={() => canOpen && setSelected({ seqAta: seqAta!, numero: ata.numeroAtaRegistroPreco })}
              className={`flex flex-col gap-2 rounded-lg border border-border/40 px-4 py-3 ${canOpen ? "cursor-pointer hover:border-border/80 hover:bg-muted/10 transition-colors" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">
                  {ata.numeroAtaRegistroPreco ? `Ata nº ${ata.numeroAtaRegistroPreco}` : `Ata ${index + 1}`}
                </span>
                {ata.cancelado && <Badge variant="destructive" className="text-[10px] h-5 shrink-0">Cancelada</Badge>}
              </div>
              {ata.objetoCompra && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ata.objetoCompra}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground/70">
                {ata.dataAssinatura && <span>Assinatura: {formatDateShort(ata.dataAssinatura)}</span>}
                {ata.dataVigenciaInicio && <span>Início: {formatDateShort(ata.dataVigenciaInicio)}</span>}
                {ata.dataVigenciaFim && <span>Fim: {formatDateShort(ata.dataVigenciaFim)}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {selected && cnpj && anoCompra && sequencialCompra && (
        <AtaDetailSheet
          cnpj={cnpj}
          anoCompra={anoCompra}
          sequencialCompra={sequencialCompra}
          sequencialAta={selected.seqAta}
          numeroAta={selected.numero}
          open={true}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
