"use client"

import { useState, useCallback, useRef } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import { LicitacaoStreamService, type ExtractionProgressEvent } from "./LicitacaoStreamService"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

type LicitacaoData = ExtractEditalDataResponse["licitacao"]
type ItemLicitado = NonNullable<NonNullable<LicitacaoData["edital"]>["itens"]>[number]

export function useLicitacaoService(_api: CoreApiClient) {
  const extractEditalDataStream = () => {
    const [progress,      setProgress]      = useState<ExtractionProgressEvent | null>(null)
    const [isPending,     setIsPending]      = useState(false)
    const [error,         setError]          = useState<Error | null>(null)
    const [highWaterPct,  setHighWaterPct]   = useState(0)
    const [partialResult, setPartialResult]  = useState<LicitacaoData | null>(null)

    // items_batch pode chegar antes de fields (as duas etapas rodam em paralelo).
    // Usamos refs para bufferizar os itens e fundir quando fields chegar.
    const pendingItemsRef   = useRef<ItemLicitado[]>([])
    const fieldsReceivedRef = useRef(false)

    const mutateAsync = useCallback(async ({ file }: { file: File }): Promise<ExtractEditalDataResponse> => {
      setIsPending(true)
      setError(null)
      setHighWaterPct(0)
      setPartialResult(null)
      pendingItemsRef.current   = []
      fieldsReceivedRef.current = false

      const trackProgress = (ev: ExtractionProgressEvent) => {
        setProgress(ev)
        setHighWaterPct(prev => Math.max(prev, ev.percent))

        if (ev.partialData?.type === "fields") {
          fieldsReceivedRef.current = true
          const pending = pendingItemsRef.current
          pendingItemsRef.current = []
          const licitacao = ev.partialData.licitacao
          // Funde os itens que chegaram antes de fields (se houver)
          setPartialResult(
            pending.length > 0 && licitacao.edital
              ? { ...licitacao, edital: { ...licitacao.edital, itens: [...(licitacao.edital.itens ?? []), ...pending] } }
              : licitacao
          )
        } else if (ev.partialData?.type === "items_batch") {
          if (!fieldsReceivedRef.current) {
            // fields ainda não chegou — bufferiza para fundir depois
            pendingItemsRef.current = [...pendingItemsRef.current, ...ev.partialData.items]
          } else {
            // fields já chegou — adiciona direto na view parcial
            const batchItems = ev.partialData.items
            setPartialResult(prev => prev ? {
              ...prev,
              edital: prev.edital ? {
                ...prev.edital,
                itens: [...(prev.edital.itens ?? []), ...batchItems],
              } : null,
            } : null)
          }
        }
      }

      try {
        const service = new LicitacaoStreamService()
        return await service.streamExtractEditalData(file, trackProgress)
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    const reset = useCallback(() => {
      setError(null)
      setProgress(null)
      setHighWaterPct(0)
      setPartialResult(null)
      pendingItemsRef.current   = []
      fieldsReceivedRef.current = false
    }, [])

    return { mutateAsync, isPending, error, progress, highWaterPct, partialResult, reset }
  }

  return { extractEditalDataStream }
}
