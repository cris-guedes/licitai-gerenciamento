import OpenAI from "openai";
import { EDITAL_EXTRACTION_PROMPT } from "./edital-extraction-prompt";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export class EditalExtractionProvider {
    private readonly client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async extractAnaliseCritica({
        mdContent,
    }: EditalExtractionProvider.ExtractParams): Promise<EditalExtractionProvider.ExtractResponse> {
        const startTime = Date.now();

        console.log(`[EditalExtractionProvider] Iniciando extração — modelo: ${OPENAI_MODEL}`);
        console.log(`[EditalExtractionProvider] Tamanho do markdown: ${mdContent.length} chars`);

        const completion = await this.client.chat.completions.create({
            model: OPENAI_MODEL,
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: EDITAL_EXTRACTION_PROMPT + mdContent,
                },
            ],
        });

        const extractionTimeMs = Date.now() - startTime;
        const rawJson          = completion.choices[0]?.message?.content ?? "{}";
        const usage            = completion.usage;

        console.log(`[EditalExtractionProvider] Extração concluída em ${extractionTimeMs}ms`);
        console.log(`[EditalExtractionProvider] Tokens — prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens}`);

        let analiseCritica: EditalExtractionProvider.AnaliseCriticaEdital;
        try {
            analiseCritica = JSON.parse(rawJson);
        } catch {
            throw new Error(`[EditalExtractionProvider] Falha ao parsear JSON da OpenAI: ${rawJson.slice(0, 200)}`);
        }

        return {
            analiseCritica,
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
    export type AnaliseCriticaEdital = {
        // Cabeçalho
        orgao:                    string
        uasg:                     string
        dataAbertura:             string
        ambito:                   string
        cadastro:                 string
        abertura:                 string
        uf:                       string
        modoDisputa:              string
        cidade:                   string
        empresas:                 string[]
        analista:                 string
        tipoDeLance:              string
        numeroEdital:             string
        intervaloLances:          string
        numeroProcesso:           string
        criterioJulgamento:       string
        plataforma:               string
        eppMe:                    string
        adesao:                   string
        modalidade:               string
        regionalidade:            string
        esclarecimentoImpugnacao: string
        difal:                    string
        prazoEnvioProposta:       string
        obs:                      string
        // Itens
        itens: Array<{
            numero:               number
            produto:              string
            quantidade:           number
            marca:                string
            modelo:               string
            fornecedor:           string
            ncm:                  string
            valorReferencia:      number
            valorReferenciaTotal: number
            precoCusto:           number
            precoMinimo:          number
        }>
        // Entrega
        prazoEntrega:     string
        tipoEntrega:      "centralizada" | "descentralizada" | "nao_especifica"
        tipoGarantia:     "on-site" | "balcao" | "nao_especifica"
        instalacao:       "fornecedor" | "comprador" | "nao_especifica"
        validadeProposta: string
        garantia:         string
        prazoAceite:      string
        prazoPagamento:   string
        // Documentações
        documentacoes: {
            cnpj:                       boolean
            outrosDocumentos:           string
            inscricaoEstadual:          boolean
            certidaoFgts:               boolean
            certidaoTributosFederais:   boolean
            certidaoTributosEstaduais:  boolean
            certidaoTributosMunicipais: boolean
            certidaoTrabalhista:        boolean
            certidaoFalenciaRecuperacao: boolean
            contratoSocial:             boolean
            docSocios:                  boolean
            balancos:                   boolean
            atestado:                   boolean
            alvara:                     boolean
            certidaoJunta:              boolean
            certidaoUnificadaCgu:       boolean
            inscricaoMunicipal:         boolean
            garantiaProposta:           boolean
        }
        observacoes: string
    }

    export type ExtractParams = {
        mdContent: string
    }

    export type ExtractResponse = {
        analiseCritica:  AnaliseCriticaEdital
        extractionTimeMs: number
        tokensUsed: {
            prompt:     number
            completion: number
            total:      number
        }
    }
}
