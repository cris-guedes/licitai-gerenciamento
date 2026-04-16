"use client"

import { useState, useCallback } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import { LicitacaoStreamService, type ExtractionProgressEvent } from "./LicitacaoStreamService"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

export function useLicitacaoService(_api: CoreApiClient) {
  const extractEditalDataStream = () => {
    const [progress,       setProgress]       = useState<ExtractionProgressEvent | null>(null)
    const [isPending,      setIsPending]       = useState(false)
    const [error,          setError]           = useState<Error | null>(null)
    const [highWaterPct,   setHighWaterPct]    = useState(0)

    const mutateAsync = useCallback(async ({ file }: { file: File }): Promise<ExtractEditalDataResponse> => {
      setIsPending(true)
      setError(null)
      setHighWaterPct(0)
      setProgress({ step: "start", message: "Iniciando...", percent: 0 })

      const trackProgress = (ev: ExtractionProgressEvent) => {
        setProgress(ev)
        setHighWaterPct(prev => Math.max(prev, ev.percent))
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
    }, [])

    return { mutateAsync, isPending, error, progress, highWaterPct, reset }
  }

  return { extractEditalDataStream }
}
