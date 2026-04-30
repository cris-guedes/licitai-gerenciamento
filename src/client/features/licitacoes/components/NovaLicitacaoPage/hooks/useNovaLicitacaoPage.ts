"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import { useLicitacaoService } from "../../../services/use-licitacao.service"
import {
  createNovaLicitacaoDefaultValues,
  novaLicitacaoFormSchema,
  type NovaLicitacaoFormValues,
} from "../../../schemas/nova-licitacao.schema"
import { mapExtractedLicitacaoToFormValues } from "../../../utils/map-extracted-licitacao-to-form-values"

type LicitacaoService = ReturnType<typeof useLicitacaoService>

type Props = {
  licitacaoService: LicitacaoService
}

type AppliedExtraction = {
  sessionId: string
  pdfFilename: string
  itemsExtracted: number
  appliedAt: string
}

export function useNovaLicitacaoPage({ licitacaoService }: Props) {
  const form = useForm<NovaLicitacaoFormValues>({
    resolver: zodResolver(novaLicitacaoFormSchema),
    defaultValues: createNovaLicitacaoDefaultValues(),
  })

  const extraction = licitacaoService.extractEdital()
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractEditalDataResponse | null>(null)
  const [appliedExtraction, setAppliedExtraction] = useState<AppliedExtraction | null>(null)

  async function handleExtractFile(file: File) {
    const result = await extraction.mutateAsync({ file })
    setExtractionResult(result)
  }

  function handleApplyExtraction() {
    if (!extractionResult) return false

    if (form.formState.isDirty) {
      const confirmed = window.confirm(
        "Os dados atuais do formulário serão substituídos pelos campos extraídos. Deseja continuar?",
      )

      if (!confirmed) return false
    }

    form.reset(mapExtractedLicitacaoToFormValues(extractionResult.licitacao))
    setAppliedExtraction({
      sessionId: extractionResult.sessionId,
      pdfFilename: extractionResult.metrics.pdfFilename,
      itemsExtracted: extractionResult.metrics.itemsExtracted,
      appliedAt: new Date().toISOString(),
    })
    setIsExtractModalOpen(false)

    return true
  }

  function handleResetForm() {
    if (form.formState.isDirty) {
      const confirmed = window.confirm("Deseja limpar todos os campos preenchidos deste formulário?")
      if (!confirmed) return
    }

    form.reset(createNovaLicitacaoDefaultValues())
  }

  return {
    form,
    extraction,
    extractionResult,
    appliedExtraction,
    isExtractModalOpen,
    setIsExtractModalOpen,
    handleExtractFile,
    handleApplyExtraction,
    handleResetForm,
  }
}
