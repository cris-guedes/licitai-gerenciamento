"use client"

import { ExternalLink, X } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { useLicitacaoDetail } from "./hooks/useLicitacaoDetail"
import {
  useProcurementAtasService,
  useProcurementContractsService,
  useProcurementDetailService,
  useProcurementFilesService,
  useProcurementHistoryService,
  useProcurementItemResultsService,
  useProcurementItemsService,
} from "../../services/procurement"
import { TABS } from "./constants"
import {
  TabAtas,
  TabContatos,
  TabContratos,
  TabDados,
  TabDocumentos,
  TabHistorico,
  TabItens,
  TabRequisitos,
  TabResumo,
} from "./tabs"

interface Props {
  item: LicitacaoItem
  isOpen?: boolean
  onClose?: () => void
}

export function LicitacaoDetailContent({ item, isOpen = true, onClose }: Props) {
  const api = useCoreApi()
  const procurementDetailService = useProcurementDetailService(api)
  const procurementItemsService = useProcurementItemsService(api)
  const procurementFilesService = useProcurementFilesService(api)
  const procurementAtasService = useProcurementAtasService(api)
  const procurementContractsService = useProcurementContractsService(api)
  const procurementHistoryService = useProcurementHistoryService(api)
  const procurementItemResultsService = useProcurementItemResultsService(api)

  const {
    activeTab,
    setActiveTab,
    documentTitle,
    systemSourceUrl,
    pncpUrl,
    detail,
    items,
    files,
    atas,
    contracts,
    history,
    itemResults,
  } = useLicitacaoDetail(
    { item, isOpen },
    {
      procurementDetailService,
      procurementItemsService,
      procurementFilesService,
      procurementAtasService,
      procurementContractsService,
      procurementHistoryService,
      procurementItemResultsService,
    }
  )
  const d = detail.data

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-border/40 flex items-center gap-4">
        {documentTitle && (
          <span className="text-base font-bold text-foreground flex-1">{documentTitle}</span>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {systemSourceUrl && (
            <a
              href={systemSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sistema de origem <ExternalLink className="size-3" />
            </a>
          )}
          {pncpUrl && (
            <a
              href={pncpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              PNCP <ExternalLink className="size-3" />
            </a>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={event => {
              event.stopPropagation()
              onClose()
            }}
            className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-44 shrink-0 border-r border-border/40 flex flex-col py-4 gap-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors rounded-none border-l-2 ${
                activeTab === id
                  ? "border-primary text-foreground bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "thin" }}>
          {detail.isError && (
            <div className="flex items-center justify-center py-10 text-sm text-destructive">
              Erro ao carregar detalhes da licitação.
            </div>
          )}

          {activeTab === "visao-geral" && (
            <div className="px-8 py-6 w-full">
              <TabDados d={d} item={item} />
              <div className="my-8 border-t border-border/30" />
              <TabResumo d={d} item={item} />
              <div className="my-8 border-t border-border/30" />
              <TabContatos d={d} item={item} />
              <div className="my-8 border-t border-border/30" />
              <TabRequisitos d={d} sectionTitle="Informações Adicionais" />
            </div>
          )}
          {activeTab === "itens" && <div className="px-8 py-6 flex flex-col flex-1"><TabItens items={items} item={item} itemResults={itemResults} /></div>}
          {activeTab === "documentos" && <div className="px-8 py-6 w-full flex flex-col flex-1"><TabDocumentos files={files} d={d} /></div>}
          {activeTab === "atas" && <div className="px-8 py-6 w-full flex flex-col flex-1"><TabAtas atas={atas} item={item} /></div>}
          {activeTab === "contratos" && <div className="px-8 py-6 w-full flex flex-col flex-1"><TabContratos contracts={contracts} item={item} /></div>}
          {activeTab === "historico" && <div className="px-8 py-6 w-full flex flex-col flex-1"><TabHistorico history={history} /></div>}
        </div>
      </div>
    </div>
  )
}
