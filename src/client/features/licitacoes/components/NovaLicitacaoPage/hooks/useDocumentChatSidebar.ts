"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { DocumentChatMessage, useDocumentChatService } from "../../../services/use-document-chat.service"

type DocumentChatService = ReturnType<typeof useDocumentChatService>

type Props = {
  open: boolean
  documentId: string | null
  documentChatService: DocumentChatService
}

export function useDocumentChatSidebar({ open, documentId, documentChatService }: Props) {
  const [messages, setMessages] = useState<DocumentChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (!open || !documentId) return
    const currentDocumentId = documentId

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      setMessages([])

      try {
        const response = await documentChatService.getChat(currentDocumentId)
        if (cancelled) return
        setMessages(response.messages)
      } catch (error: unknown) {
        if (cancelled) return
        setError(error instanceof Error ? error : new Error(String(error)))
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [documentChatService, documentId, open])

  useEffect(() => {
    setDraft("")
  }, [documentId])

  async function handleSendMessage() {
    if (!documentId) return

    const message = draft.trim()
    if (!message) return

    const optimisticUserMessage: DocumentChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: message,
      metadata: null,
      createdAt: new Date().toISOString(),
      sources: [],
    }

    setMessages(current => [...current, optimisticUserMessage])
    setDraft("")
    setIsSending(true)
    setIsAssistantTyping(true)
    setError(null)

    try {
      const response = await documentChatService.sendMessage({
        documentId,
        message,
      })

      setMessages(current => [
        ...current.filter(item => item.id !== optimisticUserMessage.id),
        response.userMessage,
        response.assistantMessage,
      ])
    } catch (error: unknown) {
      const nextError = error instanceof Error ? error : new Error(String(error))
      setMessages(current => current.filter(item => item.id !== optimisticUserMessage.id))
      setError(nextError)
      toast.error(nextError.message)
    } finally {
      setIsSending(false)
      setIsAssistantTyping(false)
    }
  }

  async function handleClearChat() {
    if (!documentId) return

    const confirmed = window.confirm("Deseja limpar todo o histórico deste chat do documento?")
    if (!confirmed) return

    setIsClearing(true)
    setError(null)

    try {
      await documentChatService.clearChat(documentId)
      setMessages([])
      toast.success("Conversa limpa com sucesso.")
    } catch (error: unknown) {
      const nextError = error instanceof Error ? error : new Error(String(error))
      setError(nextError)
      toast.error(nextError.message)
    } finally {
      setIsClearing(false)
    }
  }

  return {
    messages,
    draft,
    error,
    isLoading,
    isSending,
    isAssistantTyping,
    isClearing,
    setDraft,
    handleSendMessage,
    handleClearChat,
  }
}
