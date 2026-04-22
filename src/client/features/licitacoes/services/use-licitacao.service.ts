"use client"

import { useState, useCallback } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

export function useLicitacaoService(_api: CoreApiClient) {
  const extractEdital = () => {
    const [isPending, setIsPending] = useState(false)
    const [error,     setError]     = useState<Error | null>(null)

    const mutateAsync = useCallback(async ({ file }: { file: File }): Promise<ExtractEditalDataResponse> => {
      setIsPending(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/core/extract-edital-data", {
          method: "POST",
          body:   formData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} na extração`)
        }

        return await res.json() as ExtractEditalDataResponse
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    const reset = useCallback(() => { setError(null) }, [])

    return { mutateAsync, isPending, error, reset }
  }

  return { extractEdital }
}
