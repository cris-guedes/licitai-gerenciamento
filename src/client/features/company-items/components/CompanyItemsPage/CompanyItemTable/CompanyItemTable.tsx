"use client"

/* eslint-disable @next/next/no-img-element */
import { Pencil, Trash2 } from "lucide-react"
import type { CompanyItem } from "@/client/main/infra/apis/api-core/models/CompanyItem"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table"
import { formatCurrency, formatDate } from "@/client/main/lib/utils"

type Props = {
  items: CompanyItem[]
  isLoading: boolean
  onEdit: (item: CompanyItem) => void
  onDelete: (item: CompanyItem) => void
}

function ItemStatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <Badge
      variant="outline"
      className={ativo
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-600"}
    >
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  )
}

export function CompanyItemTable({ items, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(index => (
          <div key={index} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100/80" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
        <p className="text-base font-semibold text-slate-900">Nenhum item cadastrado</p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Comece cadastrando os itens internos da empresa para reutilizar no fluxo de precificação.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
        <p className="text-sm font-medium text-slate-700">
          {items.length} item(ns) encontrados
        </p>
      </div>

      <div className="max-h-[72vh] overflow-auto">
        <Table className="min-w-[980px]">
          <TableHeader className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/85">
            <TableRow className="border-slate-200 hover:bg-slate-50/95">
              <TableHead className="h-11 w-[88px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Foto
              </TableHead>
              <TableHead className="h-11 w-[146px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Código
              </TableHead>
              <TableHead className="h-11 min-w-[420px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Descrição
              </TableHead>
              <TableHead className="h-11 w-[144px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Marca
              </TableHead>
              <TableHead className="h-11 w-[96px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Unidade
              </TableHead>
              <TableHead className="h-11 w-[144px] px-4 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Preço
              </TableHead>
              <TableHead className="h-11 w-[172px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Atualizado
              </TableHead>
              <TableHead className="h-11 w-[124px] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Status
              </TableHead>
              <TableHead className="h-11 w-[112px] px-4 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} className="border-slate-200 hover:bg-slate-50/60">
                <TableCell className="px-4 py-3">
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.descricao}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Sem foto</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.04em] text-slate-700">
                    {item.codigo}
                  </span>
                </TableCell>

                <TableCell className="px-4 py-3 align-middle whitespace-normal">
                  <p className="line-clamp-2 text-sm leading-6 text-slate-900">
                    {item.descricao}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-slate-500">
                  {item.marca || "-"}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm font-medium text-slate-700">
                  {item.unidadeMedida}
                </TableCell>

                <TableCell className="px-4 py-3 text-right text-sm font-semibold text-slate-950">
                  {item.precoReferencia != null ? formatCurrency(item.precoReferencia) : "-"}
                </TableCell>

                <TableCell className="px-4 py-3 text-sm text-slate-500">
                  {formatDate(item.updatedAt)}
                </TableCell>

                <TableCell className="px-4 py-3">
                  <ItemStatusBadge ativo={item.ativo} />
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg"
                      onClick={() => onEdit(item)}
                      aria-label={`Editar item ${item.codigo}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-lg text-rose-600 hover:text-rose-700"
                      onClick={() => onDelete(item)}
                      aria-label={`Remover item ${item.codigo}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
