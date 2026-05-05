"use client"

import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { DocumentChatSource } from "./use-document-chat.service"

export type DocumentSummaryStructured = {
  overview: string
  keyPoints: string[]
  deadlines: string[]
  requirements: string[]
  risks: string[]
}

export type GenerateDocumentSummaryResponse = {
  documentId: string
  generatedAt: string
  summary: DocumentSummaryStructured
  sources: DocumentChatSource[]
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = typeof body?.message === "string" ? body.message : `Erro ${response.status}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function useDocumentSummaryService(_api: CoreApiClient) {
  async function getSummary(documentId: string): Promise<GenerateDocumentSummaryResponse | null> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/summary`, {
        method: "GET",
      })

      return await readJsonOrThrow<GenerateDocumentSummaryResponse | null>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  async function generateSummary(documentId: string): Promise<GenerateDocumentSummaryResponse> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/summary`, {
        method: "POST",
      })

      return await readJsonOrThrow<GenerateDocumentSummaryResponse>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  return {
    getSummary,
    generateSummary,
  }
}
