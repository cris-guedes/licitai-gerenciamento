"use client"

import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { DocumentWorkspace } from "../types/document-workspace"

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

export function useDocumentWorkspaceService(_api: CoreApiClient) {
  void _api

  async function getWorkspace(documentId: string): Promise<DocumentWorkspace> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/workspace`, {
        method: "GET",
      })

      return await readJsonOrThrow<DocumentWorkspace>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  return {
    getWorkspace,
  }
}
