export const EDITAL_DRAFT_PREVIEW_AGENT_CONFIG = {
    model: process.env.OPENAI_LIGHT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0,
};
