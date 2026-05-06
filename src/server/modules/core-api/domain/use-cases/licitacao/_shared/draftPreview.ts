import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const LicitacaoDraftPreviewSchema = z.object({
    source: z.literal("first_page_agent"),
    sourceDocumentId: z.string(),
    sourcePage: z.literal(1),
    extractedAt: z.string(),
    displayName: z.string().nullable(),
    orgaoNome: z.string().nullable(),
    modalidade: z.string().nullable(),
    numero: z.string().nullable(),
    objetoResumo: z.string().nullable(),
    dataAbertura: z.string().nullable(),
});

export const LicitacaoMetadataSchema = z.object({
    draftPreview: LicitacaoDraftPreviewSchema.nullable().optional(),
});

export type LicitacaoDraftPreview = z.infer<typeof LicitacaoDraftPreviewSchema>;
export type LicitacaoMetadata = z.infer<typeof LicitacaoMetadataSchema>;

export function parseLicitacaoMetadata(metadata: Prisma.JsonValue | null | undefined): LicitacaoMetadata {
    const parsed = LicitacaoMetadataSchema.safeParse(metadata);
    return parsed.success ? parsed.data : {};
}

export function parseLicitacaoDraftPreview(metadata: Prisma.JsonValue | null | undefined): LicitacaoDraftPreview | null {
    return parseLicitacaoMetadata(metadata).draftPreview ?? null;
}

export function withDraftPreview(
    metadata: Prisma.JsonValue | null | undefined,
    draftPreview: LicitacaoDraftPreview | null,
): LicitacaoMetadata {
    const current = parseLicitacaoMetadata(metadata);

    return {
        ...current,
        draftPreview,
    };
}
