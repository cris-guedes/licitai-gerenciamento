import { httpHandler } from "@/server/modules/core-api";

// Extração de editais no modo agente pode demorar até ~2min (embedding + LLM + batches de itens)
export const maxDuration = 300;

export const GET  = httpHandler;
export const POST = httpHandler;
