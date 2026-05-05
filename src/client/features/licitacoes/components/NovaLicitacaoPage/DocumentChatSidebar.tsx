"use client"

import { useEffect, useRef } from "react"
import { Bot, Loader2, SendHorizonal, Trash2, User2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Button } from "@/client/components/ui/button"
import { Textarea } from "@/client/components/ui/textarea"
import { cn } from "@/client/main/lib/utils"
import { DocumentChatSourcesCard } from "./DocumentChatSourcesCard"
import { useDocumentChatSidebar } from "./hooks/useDocumentChatSidebar"
import type { useDocumentChatService } from "../../services/use-document-chat.service"

type DocumentChatService = ReturnType<typeof useDocumentChatService>

type Props = {
  documentId: string | null
  documentChatService: DocumentChatService
}

export function DocumentChatSidebar({
  documentId,
  documentChatService,
}: Props) {
  const chat = useDocumentChatSidebar({
    open: true,
    documentId,
    documentChatService,
  })
  const scrollBottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    })
  }, [chat.isAssistantTyping, chat.isLoading, chat.messages.length])

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-slate-200/80 px-5 py-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-primary">Chat do documento</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Conversa persistente vinculada apenas a este arquivo.
          </p>
        </div>
      </div>

      {chat.error ? (
        <div className="shrink-0 px-4 pt-4">
          <Alert variant="destructive">
            <AlertTitle>Não foi possível carregar o chat</AlertTitle>
            <AlertDescription>{chat.error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
        <div className="min-h-0 space-y-4 overflow-x-hidden">
          {chat.isLoading ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Carregando conversa do documento...
            </div>
          ) : chat.messages.length ? (
            <>
              {chat.messages.map(message => (
                <article key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("flex min-w-0 max-w-[94%] gap-3", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-200 text-primary",
                    )}>
                      {message.role === "user" ? <User2 className="size-4" /> : <Bot className="size-4" />}
                    </div>

                    <div className={cn(
                      "min-w-0 space-y-3 overflow-x-hidden rounded-[1.2rem] px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-50 text-primary",
                    )}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">
                        {message.content}
                      </p>

                      {message.role === "assistant" && message.sources.length > 0 ? (
                        <DocumentChatSourcesCard sources={message.sources} />
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}

              {chat.isAssistantTyping ? (
                <article className="flex justify-start">
                  <div className="flex min-w-0 max-w-[94%] gap-3">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-primary">
                      <Bot className="size-4" />
                    </div>

                    <div className="min-w-0 overflow-x-hidden rounded-[1.2rem] bg-slate-50 px-4 py-3 text-primary shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex gap-1">
                          <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                          <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                          <span className="size-2 animate-bounce rounded-full bg-slate-400" />
                        </span>
                        <span>IA escrevendo...</span>
                      </div>
                    </div>
                  </div>
                </article>
              ) : null}

              <div ref={scrollBottomRef} />
            </>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-primary">Nenhuma mensagem ainda</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pergunte sobre prazos, exigências, riscos, documentos ou qualquer outro trecho presente no PDF.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-4">
        <div className="space-y-3">
          <Textarea
            value={chat.draft}
            onChange={event => chat.setDraft(event.target.value)}
            placeholder="Pergunte algo sobre este documento..."
            className="min-h-24 resize-none rounded-[1.2rem] border-slate-200"
            disabled={!documentId || chat.isSending}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void chat.handleSendMessage()
              }
            }}
          />

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!documentId || chat.isClearing}
              onClick={() => void chat.handleClearChat()}
            >
              {chat.isClearing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
              Limpar
            </Button>

            <Button
              type="button"
              className="rounded-full px-5"
              disabled={!documentId || chat.isSending || !chat.draft.trim()}
              onClick={() => void chat.handleSendMessage()}
            >
              {chat.isSending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <SendHorizonal className="mr-2 size-4" />}
              Enviar
            </Button>
          </div>

          <p className="text-[11px] leading-5 text-muted-foreground">
            `Enter` envia. `Shift + Enter` insere nova linha.
          </p>
        </div>
      </div>
    </section>
  )
}
