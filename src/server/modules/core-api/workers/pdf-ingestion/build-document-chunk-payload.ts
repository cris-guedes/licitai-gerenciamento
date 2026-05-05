export function buildDocumentChunkPayload(input: {
    documentId: string;
    chunkId: string;
    content: string;
    raw?: string;
    heading?: string;
    page?: number;
    metadata?: Record<string, unknown>;
    payload?: Record<string, unknown>;
}) {
    return {
        ...(input.payload ?? {}),
        documentId: input.documentId,
        document_id: input.documentId,
        chunkId: input.chunkId,
        content: input.content,
        raw: input.raw ?? input.content,
        page: input.page,
        heading: input.heading,
        metadata: input.metadata,
    };
}
