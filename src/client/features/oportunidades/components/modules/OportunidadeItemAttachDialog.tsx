"use client"

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Input } from "@/client/components/ui/input"
import { ScrollArea } from "@/client/components/ui/scroll-area"
import type { OportunidadeWorkspaceItem } from "@/client/features/licitacoes/services/use-licitacao.service"
import { formatCurrency } from "../../lib/oportunidade-workspace"

type CompanyItemOption = {
  id: string
  codigo: string
  descricao: string
  unidadeMedida: string
  imageUrl: string | null
  precoReferencia: number | null
}

type Props = {
  open: boolean
  item: OportunidadeWorkspaceItem | null
  companyItems: CompanyItemOption[]
  isPending: boolean
  onClose: () => void
  onSelect: (companyItemId: string) => Promise<void>
}

export function OportunidadeItemAttachDialog({
  open,
  item,
  companyItems,
  isPending,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("")
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query)
    if (!normalizedQuery) return companyItems

    return companyItems.filter(companyItem => {
      const haystack = normalizeText(`${companyItem.codigo} ${companyItem.descricao}`)
      return haystack.includes(normalizedQuery)
    })
  }, [companyItems, query])

  async function handleSelect(companyItemId: string) {
    await onSelect(companyItemId)
  }

  return (
    <Dialog open={open} onOpenChange={nextOpen => !nextOpen && onClose()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Anexar item interno</DialogTitle>
          <DialogDescription>
            Escolha um item do catálogo para vincular ao item do edital e preencher a base comercial automaticamente.
          </DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">
                Item {item.numeroItem ?? "-"} {item.lote ? `· Lote ${item.lote}` : ""}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.descricao || "Item sem descrição"}</p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Buscar por código ou descrição"
                className="h-11 rounded-xl border-slate-200 bg-white pl-9 shadow-none"
              />
            </div>

            <ScrollArea className="h-[380px] rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-200 bg-white">
                {filteredItems.map(companyItem => (
                  <button
                    key={companyItem.id}
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    onClick={() => void handleSelect(companyItem.id)}
                    disabled={isPending}
                  >
                    {companyItem.imageUrl ? (
                      <img
                        src={companyItem.imageUrl}
                        alt={companyItem.descricao}
                        className="size-12 rounded-md border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="size-12 rounded-md border border-slate-200 bg-slate-50" />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{companyItem.codigo}</span>
                        <span className="text-xs text-slate-400">{companyItem.unidadeMedida}</span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-slate-600">{companyItem.descricao}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Preço ref.</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatCurrency(companyItem.precoReferencia !== null ? String(companyItem.precoReferencia) : null) ?? "-"}
                      </p>
                    </div>
                  </button>
                ))}

                {filteredItems.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Nenhum item do catálogo corresponde à busca.
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}
