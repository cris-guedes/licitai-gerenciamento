"use client"

import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export type DocumentChatSource = {
  id: string
  chunkId: string
  page: number | null
  score: number
  snippet: string
  heading: string | null
  createdAt: string
}

export type DocumentChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  metadata: unknown
  createdAt: string
  sources: DocumentChatSource[]
}

export type DocumentChat = {
  id: string
  documentId: string
  organizationId: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export type GetDocumentChatResponse = {
  chat: DocumentChat
  messages: DocumentChatMessage[]
}

export type AskDocumentChatResponse = {
  chat: DocumentChat
  userMessage: DocumentChatMessage
  assistantMessage: DocumentChatMessage
}

export type ClearDocumentChatResponse = {
  chatId: string
  cleared: true
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

export function useDocumentChatService(_api: CoreApiClient) {
  async function getChat(documentId: string): Promise<GetDocumentChatResponse> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/chat`, {
        method: "GET",
      })

      return await readJsonOrThrow<GetDocumentChatResponse>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  async function sendMessage(params: { documentId: string; message: string }): Promise<AskDocumentChatResponse> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(params.documentId)}/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: params.message }),
      })

      return await readJsonOrThrow<AskDocumentChatResponse>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  async function clearChat(documentId: string): Promise<ClearDocumentChatResponse> {
    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/chat`, {
        method: "DELETE",
      })

      return await readJsonOrThrow<ClearDocumentChatResponse>(response)
    } catch (error: unknown) {
      throw toError(error)
    }
  }

  return {
    getChat,
    sendMessage,
    clearChat,
  }
}
