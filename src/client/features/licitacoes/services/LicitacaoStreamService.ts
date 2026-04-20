/* Manual Implementation - Safe from regeneration */
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"

type LicitacaoData = ExtractEditalDataResponse["licitacao"];
type ItemLicitado = NonNullable<NonNullable<LicitacaoData["edital"]>["itens"]>[number];

export type ExtractionPartialData =
  | { type: "fields"; licitacao: LicitacaoData }
  | { type: "items_batch"; items: ItemLicitado[]; batchIndex: number; totalBatches: number };

export type ExtractionProgressEvent = {
  step:    string;
  message: string;
  percent: number;
  result?: ExtractEditalDataResponse;
  partialData?: ExtractionPartialData;
};

export class LicitacaoStreamService {
  /** Extrai edital a partir de um arquivo PDF enviado via upload (multipart/form-data). */
  public async streamExtractEditalData(
    file: File,
    onProgress: (ev: ExtractionProgressEvent) => void
  ): Promise<ExtractEditalDataResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/core/extract-edital-data/stream", {
      method: "POST",
      body:   formData,
      // Não definir Content-Type: o browser adiciona o boundary com o boundary correto
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Falha na conexão com o servidor de extração.");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Leitura de stream não suportada pelo navegador.");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        if (!part.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(part.substring(6)) as ExtractionProgressEvent;
          onProgress(data);
          if (data.step === "done" && data.result) return data.result;
          if (data.step === "error") throw new Error(data.message);
          // Yield para macrotarefa separada: garante que o React renderiza os dados parciais
          // antes de processar o próximo evento (evita batching com o evento "done").
          if (data.partialData) {
            await new Promise<void>(resolve => setTimeout(resolve, 0));
          }
        } catch (e) {
          if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
            throw e;
          }
        }
      }
    }

    throw new Error("Stream encerrado sem conclusão da extração.");
  }
}
