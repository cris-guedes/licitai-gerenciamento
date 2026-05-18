/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const DocumentWorkspaceAnalysisSchema = z.object({
    id: z.string(),
    type: z.enum(["EXTRACT_EDITAL", "SUMMARY"]),
    status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]),
    markdownContent: z.string().nullable(),
    result: z.unknown().nullable(),
    metrics: z.unknown().nullable(),
    errorMessage: z.string().nullable(),
    startedAt: z.string().nullable(),
    finishedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

const DocumentSummarySchema = z.object({
    documentId: z.string(),
    generatedAt: z.string(),
    summary: z.object({
        overview: z.string(),
        keyPoints: z.array(z.string()),
        deadlines: z.array(z.string()),
        requirements: z.array(z.string()),
        risks: z.array(z.string()),
    }),
    sources: z.array(z.object({
        id: z.string(),
        chunkId: z.string(),
        page: z.number().nullable(),
        score: z.number(),
        snippet: z.string(),
        heading: z.string().nullable(),
        createdAt: z.string(),
    })),
}).nullable();

export namespace GetDocumentWorkspaceControllerSchemas {
    export const Body = z.null();
    export const Query = z.null();
    export const Params = z.object({
        documentId: z.string().describe("ID do documento."),
    });
    export const Response = z.object({
        document: z.object({
            id: z.string(),
            companyId: z.string(),
            type: z.enum(["EDITAL", "ANEXO", "OUTRO"]),
            title: z.string(),
            originalName: z.string(),
            mimeType: z.string(),
            sizeBytes: z.number(),
            status: z.enum(["PROCESSING", "READY", "FAILED"]),
            uploadedAt: z.string(),
            updatedAt: z.string(),
        }),
        preview: z.object({
            url: z.string(),
            downloadUrl: z.string(),
            expiresAt: z.string(),
            filename: z.string(),
            mimeType: z.string(),
        }),
        processing: z.object({
            state: z.enum(["PROCESSING", "READY", "FAILED"]),
            canProcess: z.boolean(),
            canRetry: z.boolean(),
            errorMessage: z.string().nullable(),
            progress: z.null(),
        }),
        ai: z.object({
            chat: z.object({
                enabled: z.boolean(),
                blockedReason: z.string().nullable(),
                messageCount: z.number().nullable(),
            }),
            summary: z.object({
                enabled: z.boolean(),
                blockedReason: z.string().nullable(),
                latest: DocumentSummarySchema,
            }),
            analyses: z.array(DocumentWorkspaceAnalysisSchema),
        }),
        links: z.array(z.object({
            kind: z.enum(["AVULSO", "EDITAL"]),
            id: z.string(),
            label: z.string(),
            isPrimary: z.boolean(),
        })),
    });
}
