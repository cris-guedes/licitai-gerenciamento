"use client"

import { useMutation } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { ExtractionMode } from "@/client/main/infra/apis/api-core/services/LicitacaoService"

export function useLicitacaoService(api: CoreApiClient) {
    const extractEditalData = () =>
        useMutation({
            mutationFn: ({ pdfUrl, mode }: { pdfUrl: string; mode: ExtractionMode }) =>
                api.licitacao.extractEditalData({ pdfUrl, mode }),
        })

    return { extractEditalData }
}
