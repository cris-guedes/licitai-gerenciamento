export const ITEM_EXTRACTOR_CONFIG = {
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0,
    llmBatchSize: Number(process.env.EDITAL_ITEM_LLM_BATCH_SIZE ?? (process.env.VERCEL ? "5" : "20")),
};
