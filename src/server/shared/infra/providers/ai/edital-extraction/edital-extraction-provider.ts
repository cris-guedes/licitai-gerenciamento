import OpenAI from "openai";
import { EDITAL_EXTRACTION_PROMPT } from "./edital-extraction-prompt";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export class EditalExtractionProvider {
    private readonly client: OpenAI;

    constructor() {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async extractEdital({
        mdContent,
    }: EditalExtractionProvider.ExtractParams): Promise<EditalExtractionProvider.ExtractResponse> {
        const startTime = Date.now();

        console.log(`[EditalExtractionProvider] Iniciando extração — modelo: ${OPENAI_MODEL}`);
        console.log(`[EditalExtractionProvider] Tamanho do markdown: ${mdContent.length} chars`);

        const prompt = EDITAL_EXTRACTION_PROMPT.replace("{{MARKDOWN_AQUI}}", mdContent);

        const completion = await this.client.chat.completions.create({
            model: OPENAI_MODEL,
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [{ role: "user", content: prompt }],
        });

        const extractionTimeMs = Date.now() - startTime;
        const rawJson          = completion.choices[0]?.message?.content ?? "{}";
        const usage            = completion.usage;

        console.log(`[EditalExtractionProvider] Extração concluída em ${extractionTimeMs}ms`);
        console.log(`[EditalExtractionProvider] Tokens — prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens}`);

        let result: EditalExtractionProvider.ExtractionResult;
        try {
            result = JSON.parse(rawJson);
        } catch {
            throw new Error(`[EditalExtractionProvider] Falha ao parsear JSON da OpenAI: ${rawJson.slice(0, 200)}`);
        }

        return {
            result,
            extractionTimeMs,
            tokensUsed: {
                prompt:     usage?.prompt_tokens     ?? 0,
                completion: usage?.completion_tokens ?? 0,
                total:      usage?.total_tokens      ?? 0,
            },
        };
    }
}

export namespace EditalExtractionProvider {

    export type EditalItem = {
        numero:                  number
        lote:                    string | null
        descricao:               string
        quantidade:              number
        unidade:                 string
        valor_unitario_estimado: number | null
        valor_total_estimado:    number | null
        ncm:                     string | null
    }

    export type Edital = {
        numero:               string
        numero_processo:      string
        modalidade:           string
        objeto_resumido:      string
        valor_estimado_total: number | null
        identificacao: {
            uasg:   string
            portal: string
        }
        classificacao: {
            ambito: string
        }
        orgao_gerenciador: {
            nome:   string
            cnpj:   string
            uf:     string
            cidade: string
        }
        datas: {
            data_abertura:                  string | null
            data_proposta_limite:           string | null
            hora_proposta_limite:           string | null
            data_esclarecimento_impugnacao: string | null
            cadastro_inicio:                string | null
            cadastro_fim:                   string | null
        }
        disputa: {
            modo:                string
            criterio_julgamento: string
            tipo_lance:          string
            intervalo_lances:    string | null
        }
        regras: {
            exclusivo_me_epp:  boolean
            permite_adesao:    boolean
            percentual_adesao: number | null
            regionalidade:     string | null
            difal:             boolean
        }
        logistica: {
            local_entrega:          string | null
            tipo_entrega:           string
            responsavel_instalacao: string
        }
        prazos: {
            entrega:                { texto_original: string | null; dias_corridos: number | null }
            aceite:                 { texto_original: string | null; dias: number | null }
            pagamento:              { texto_original: string | null; dias: number | null }
            validade_proposta_dias: number | null
        }
        garantia: {
            tipo:                    string
            meses:                   number | null
            tempo_atendimento_horas: number | null
        }
        itens:               EditalItem[]
        orgaos_participantes: Array<{
            nome:  string
            itens: Array<{ item_numero: number; quantidade: number }>
        }>
        documentos_exigidos: Array<{
            tipo:        string
            obrigatorio: boolean
        }>
        observacoes: string | null
    }

    export type ExtractionResult = {
        edital: Edital
    }

    export type ExtractParams = {
        mdContent: string
    }

    export type ExtractResponse = {
        result:           ExtractionResult
        extractionTimeMs: number
        tokensUsed: {
            prompt:     number
            completion: number
            total:      number
        }
    }
}
