import OpenAI from "openai";
import type { AiProvider, EditalExtraction } from "./AiProvider";

const MODEL = "gpt-4o";

const EDITAL_EXTRACTION_PROMPT = `Você é um especialista em licitações públicas brasileiras.
Analise o texto do edital abaixo e extraia as informações no formato JSON.

Retorne APENAS o JSON válido, sem explicações, sem markdown, sem blocos de código:

{
  "editalNumber": "string ou null",
  "portal": "string ou null (ex: Compras.gov, BLL, Portal Transparência)",
  "sphere": "federal, estadual ou municipal ou null",
  "state": "sigla do estado (ex: SP) ou null",
  "object": "descrição do objeto da licitação ou null",
  "modality": "modalidade (ex: Pregão Eletrônico, Concorrência) ou null",
  "contractType": "tipo de contratação (ex: Aquisição, Serviço) ou null",
  "editalUrl": "URL do edital ou null",
  "estimatedValue": "número decimal ou null",
  "publicationDate": "data ISO 8601 (YYYY-MM-DD) ou null",
  "openingDate": "data ISO 8601 (YYYY-MM-DD) ou null",
  "proposalDeadline": "data ISO 8601 (YYYY-MM-DD) ou null",
  "processNumber": "número do processo administrativo ou null",
  "uasg": "código UASG ou null",
  "proposalDeadlineTime": "horário (HH:MM) ou null",
  "bidInterval": "lance mínimo em reais ou null",
  "judgmentCriteria": "menor_preco, maior_desconto ou melhor_tecnica ou null",
  "disputeMode": "aberto, fechado ou aberto_fechado ou null",
  "proposalValidityDays": "número de dias ou null",
  "clarificationDeadline": "data ISO 8601 ou null",
  "regionality": "descrição de regionalidade ou null",
  "exclusiveSmallBusiness": "true ou false ou null",
  "allowsAdhesion": "true ou false ou null",
  "extractedRules": {
    "deliveryDays": "número ou null",
    "acceptanceDays": "número ou null",
    "liquidationDays": "número ou null",
    "paymentDays": "número ou null",
    "guaranteeType": "string ou null",
    "guaranteeMonths": "número ou null",
    "installation": "true ou false ou null"
  },
  "extractedRequiredDocuments": ["lista de tipos de documentos exigidos como strings"],
  "extractedManagingAgencies": [{ "name": "nome do órgão", "cnpj": "CNPJ ou null" }],
  "extractedParticipatingAgencies": [{ "name": "nome do órgão", "cnpj": "CNPJ ou null" }]
}`;

const SUMMARIZE_PROMPT = `Você é um especialista em licitações públicas brasileiras.
Leia o documento abaixo e produza um resumo claro e objetivo em português.
O resumo deve destacar os pontos mais importantes do documento: objeto, valores, prazos, exigências e qualquer informação relevante para um fornecedor.
Escreva de forma direta, sem introduções desnecessárias.`;

function getClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
    return new OpenAI({ apiKey });
}

export class OpenAiProvider implements AiProvider {
    async extractEdital(text: string): Promise<EditalExtraction> {
        const client = getClient();
        const response = await client.chat.completions.create({
            model: MODEL,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: EDITAL_EXTRACTION_PROMPT },
                { role: "user",   content: `TEXTO DO EDITAL:\n${text}` },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? "";
        try {
            return JSON.parse(raw) as EditalExtraction;
        } catch {
            throw new Error(`Failed to parse AI extraction response: ${raw.slice(0, 200)}`);
        }
    }

    async summarizeDocument(text: string): Promise<string> {
        const client = getClient();
        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: SUMMARIZE_PROMPT },
                { role: "user",   content: `DOCUMENTO:\n${text}` },
            ],
        });

        return response.choices[0]?.message?.content ?? "";
    }
}
