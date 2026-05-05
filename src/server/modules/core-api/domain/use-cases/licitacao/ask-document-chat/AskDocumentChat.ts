/* eslint-disable @typescript-eslint/no-namespace */
import type { IChatMessageRepository } from "@/server/modules/core-api/domain/data/IChatMessageRepository";
import type { IChatMessageSourceRepository } from "@/server/modules/core-api/domain/data/IChatMessageSourceRepository";
import type { ChatMessageRecord } from "@/server/modules/core-api/domain/data/DocumentChatTypes";
import type { IDocumentChatRepository } from "@/server/modules/core-api/domain/data/IDocumentChatRepository";
import type { ILLMProvider } from "@/server/modules/core-api/domain/data/ILLMProvider";
import type { IVectorSearchProvider } from "@/server/modules/core-api/domain/data/IVectorSearchProvider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../_shared/assertDocumentAccess";
import { DocumentChatViewMapper } from "../_shared/documentChatView";
import { ensureDocumentChat } from "../_shared/ensureDocumentChat";
import type { AskDocumentChatDTO } from "./dtos/AskDocumentChatDTOs";
import { AskDocumentChatMapper, type AskDocumentChatView } from "./dtos/AskDocumentChatView";

const DEFAULT_HISTORY_LIMIT = 10;
const DEFAULT_VECTOR_LIMIT = 6;
const DEFAULT_MIN_SCORE = 0.15;

const SYSTEM_PROMPT = [
    "Você é o assistente do documento da plataforma LicitAI.",
    "Responda sempre em português do Brasil.",
    "Use prioritariamente o contexto recuperado do documento e o histórico recente.",
    "Se a resposta não estiver sustentada pelo contexto, deixe isso explícito e não invente fatos.",
    "Quando possível, mencione a página ou a seção usada na fundamentação de forma natural.",
    "Se o usuário pedir resumo, requisitos, riscos, prazos ou documentos, organize a resposta de forma clara.",
].join(" ");

export class AskDocumentChat {
    constructor(
        private readonly documentChatRepository: IDocumentChatRepository,
        private readonly chatMessageRepository: IChatMessageRepository,
        private readonly chatMessageSourceRepository: IChatMessageSourceRepository,
        private readonly vectorSearchProvider: IVectorSearchProvider,
        private readonly llmProvider: ILLMProvider,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: AskDocumentChat.Params): Promise<AskDocumentChat.Response> {
        const trimmedMessage = params.message.trim();
        if (!trimmedMessage) {
            throw new Error("Envie uma pergunta para continuar.");
        }

        const { document, company } = await assertUserCanAccessDocument({
            documentRepository: this.documentRepository,
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            documentId: params.documentId,
            userId: params.userId,
        });

        const chat = await ensureDocumentChat({
            documentChatRepository: this.documentChatRepository,
            documentId: document.id,
            organizationId: company.organizationId,
            title: document.originalName,
        });

        const userMessage = await this.chatMessageRepository.create({
            chatId: chat.id,
            role: "user",
            content: trimmedMessage,
            metadata: {
                documentId: document.id,
            },
        });

        const recentMessages = await this.chatMessageRepository.findRecentByChatId({
            chatId: chat.id,
            limit: DEFAULT_HISTORY_LIMIT,
        });

        const historyMessages = recentMessages.filter(message => message.id !== userMessage.id);

        const chunks = await this.vectorSearchProvider.search({
            documentId: document.vectorDocumentId,
            query: trimmedMessage,
            limit: DEFAULT_VECTOR_LIMIT,
            minScore: DEFAULT_MIN_SCORE,
        });

        const prompt = this.buildPrompt({
            documentName: document.originalName,
            historyMessages,
            currentQuestion: trimmedMessage,
            chunks,
        });

        const llmResult = await this.llmProvider.generateText({
            systemPrompt: SYSTEM_PROMPT,
            prompt,
            temperature: 0.2,
        });

        const assistantMessage = await this.chatMessageRepository.create({
            chatId: chat.id,
            role: "assistant",
            content: llmResult.text.trim(),
            metadata: {
                provider: llmResult.metadata,
                documentId: document.id,
                retrievedChunks: chunks.length,
            },
        });

        await this.chatMessageSourceRepository.createMany({
            items: chunks.map(chunk => ({
                messageId: assistantMessage.id,
                chunkId: chunk.chunkId,
                page: chunk.page ?? null,
                score: chunk.score,
                snippet: this.buildSnippet(chunk.content),
                heading: chunk.heading ?? null,
            })),
        });

        const updatedChat = await this.documentChatRepository.update({
            id: chat.id,
            data: {
                updatedAt: new Date(),
            },
        });

        const sources = await this.chatMessageSourceRepository.findByMessageIds({
            messageIds: [assistantMessage.id],
        });

        const [userMessageWithSources, assistantMessageWithSources] = DocumentChatViewMapper.joinMessagesWithSources(
            [userMessage, assistantMessage],
            sources,
        );

        return AskDocumentChatMapper.toView({
            chat: DocumentChatViewMapper.toChatView(updatedChat),
            userMessage: DocumentChatViewMapper.toMessageView(userMessageWithSources),
            assistantMessage: DocumentChatViewMapper.toMessageView(assistantMessageWithSources),
        });
    }

    private buildPrompt(input: {
        documentName: string;
        historyMessages: ChatMessageRecord[];
        currentQuestion: string;
        chunks: Array<{
            chunkId: string;
            content: string;
            page?: number;
            heading?: string;
            score: number;
        }>;
    }) {
        const contextBlock = input.chunks.length > 0
            ? input.chunks.map((chunk, index) => {
                const references = [
                    chunk.page != null ? `página ${chunk.page}` : null,
                    chunk.heading ? `seção ${chunk.heading}` : null,
                    `score ${chunk.score.toFixed(3)}`,
                ].filter(Boolean).join(" · ");

                return [
                    `[Contexto ${index + 1}] ${references}`,
                    chunk.content,
                ].join("\n");
            }).join("\n\n")
            : "Nenhum trecho relevante foi recuperado do documento.";

        const historyBlock = input.historyMessages.length > 0
            ? input.historyMessages.map(message => `${this.roleLabel(message.role)}: ${message.content}`).join("\n")
            : "Sem histórico anterior.";

        return [
            `Documento: ${input.documentName}`,
            "",
            "Contexto recuperado do documento:",
            contextBlock,
            "",
            "Histórico recente do chat:",
            historyBlock,
            "",
            "Pergunta atual do usuário:",
            input.currentQuestion,
            "",
            "Instruções de resposta:",
            "1. Responda usando o contexto do documento sempre que houver evidência suficiente.",
            "2. Se houver lacunas, explique o que não foi possível confirmar no documento.",
            "3. Cite páginas ou seções de forma natural quando isso ajudar a justificar a resposta.",
            "4. Não mencione chunks, embeddings ou detalhes internos da implementação.",
        ].join("\n");
    }

    private roleLabel(role: ChatMessageRecord["role"]) {
        if (role === "assistant") return "Assistente";
        if (role === "system") return "Sistema";
        return "Usuário";
    }

    private buildSnippet(content: string) {
        const normalized = content.replace(/\s+/g, " ").trim();
        if (normalized.length <= 280) return normalized;
        return `${normalized.slice(0, 277)}...`;
    }
}

export namespace AskDocumentChat {
    export type Params = AskDocumentChatDTO;
    export type Response = AskDocumentChatView;
}
