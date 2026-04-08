"use client"

import { useMutation } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export function useLicitacaoService(api: CoreApiClient) {
    const extractEditalData = () =>
        useMutation({
            mutationFn: (pdfUrl: string) =>
                api.licitacao.extractEditalData({ pdfUrl }),
        })

    return { extractEditalData }
}
