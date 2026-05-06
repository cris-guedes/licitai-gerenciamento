import { z } from "zod";

export const EDITAL_DRAFT_PREVIEW_SCHEMA = z.object({
    displayName: z.string().nullable(),
    orgaoNome: z.string().nullable(),
    modalidade: z.string().nullable(),
    numero: z.string().nullable(),
    objetoResumo: z.string().nullable(),
    dataAbertura: z.string().nullable(),
});

export type EditalDraftPreviewAgentOutput = z.infer<typeof EDITAL_DRAFT_PREVIEW_SCHEMA>;
