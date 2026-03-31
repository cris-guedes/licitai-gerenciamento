"use client"

import { useState } from "react"
import { Briefcase, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/client/main/lib/utils/format"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useProcurementService } from "../../../services/procurement"
import { buildContractPncpUrl } from "../../../utils/urls"
import { ContractDetailSheet } from "../ContractDetail"
import { EmptyState, LoadingState, SectionTitle, formatDateShort } from "../shared"

type Props = {
  contracts: ReturnType<typeof useProcurementService>["contracts"]
  item: LicitacaoItem
}

export function TabContratos({ contracts: query, item }: Props) {
  const [selected, setSelected] = useState<{ seq: number; ano: number; numero?: string } | null>(null)

  return (
    <div className="flex flex-col flex-1">
      <SectionTitle>Contratos / Empenhos{query.data?.contracts.length ? ` (${query.data.contracts.length})` : ""}</SectionTitle>
      {query.isLoading && <LoadingState text="Carregando contratos..." />}
      {query.isError && <p className="text-sm text-destructive text-center py-4">Erro ao carregar contratos.</p>}
      {query.data?.contracts.length === 0 && <EmptyState icon={Briefcase} text="Nenhum contrato encontrado." />}
      <div className="flex flex-col gap-2">
        {query.data?.contracts.map((contract: any, index: number) => {
          const seq = contract.sequencialContrato as number | undefined
          const canOpen = seq != null && contract.anoContrato != null && !!item.orgao_cnpj

          return (
            <div
              key={`${contract.anoContrato}-${contract.sequencialContrato ?? index}`}
              onClick={() => canOpen && setSelected({ seq: seq!, ano: contract.anoContrato, numero: contract.numeroContratoEmpenho })}
              className={`flex flex-col rounded-lg border border-border/40 overflow-hidden ${canOpen ? "cursor-pointer hover:border-border/80 hover:bg-muted/10 transition-colors" : ""}`}
            >
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {contract.numeroContratoEmpenho ? `Contrato nº ${contract.numeroContratoEmpenho}` : `Contrato ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    {contract.valorGlobal != null && (
                      <span className="text-sm font-bold text-primary">{formatCurrency(contract.valorGlobal)}</span>
                    )}
                    {(() => {
                      const pncpUrl = buildContractPncpUrl(item.orgao_cnpj, contract.anoContrato, seq)
                      return pncpUrl ? (
                        <a
                          href={pncpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded px-1.5 py-0.5 transition-colors"
                          onClick={event => event.stopPropagation()}
                        >
                          PNCP <ExternalLink size={9} />
                        </a>
                      ) : null
                    })()}
                  </div>
                </div>
                {contract.nomeRazaoSocialFornecedor && (
                  <p className="text-xs font-medium text-muted-foreground">{contract.nomeRazaoSocialFornecedor}</p>
                )}
                {contract.objetoContrato && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{contract.objetoContrato}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground/70">
                  {contract.dataAssinatura && <span>Assinatura: {formatDateShort(contract.dataAssinatura)}</span>}
                  {contract.dataVigenciaInicio && <span>Início: {formatDateShort(contract.dataVigenciaInicio)}</span>}
                  {contract.dataVigenciaFim && <span>Fim: {formatDateShort(contract.dataVigenciaFim)}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selected && item.orgao_cnpj && (
        <ContractDetailSheet
          orgaoCnpj={item.orgao_cnpj}
          anoContrato={selected.ano}
          sequencialContrato={selected.seq}
          numeroContratoEmpenho={selected.numero}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
