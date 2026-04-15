import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/embeddings/flat-vector-store";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type VectorSearchAgentResult = {
  extraction: Record<string, any>;
  tokensUsed: { prompt: number; completion: number; total: number };
  searchesPerformed: number;
  totalChunksRetrieved: number;
};

/**
 * Queries balanceadas: cobertura de todos os campos sem redundâncias excessivas.
 */
export const PREDEFINED_QUERIES = [
  // Identificação
  "Preâmbulo edital identificação órgão CNPJ UASG portal endereço código",
  "UASG SRP GMS pregão número identificação capa edital",
  "Número pregão processo licitatório protocolo aviso",
  // Objeto
  "constitui objeto licitação aquisição fornecimento registro preços",
  "Valor estimado total contratação R$ global referência",
  // Cronograma
  "data hora abertura sessão pública propostas lances cronograma",
  "prazo limite impugnação esclarecimento data hora",
  // Disputa
  "modo disputa aberto fechado critério julgamento menor preço maior desconto",
  "tipo lance unitário global percentual intervalo mínimo lances duração sessão",
  // Regras
  "consórcio não será permitida participação vedada proibida",
  "ME EPP microempresa empresa pequeno porte exclusivo reservado benefício",
  "adesão carona percentual máximo vigência ata registro preços meses prorrogação",
  "regionalidade margem preferência DIFAL isenção fiscal",
  "visita técnica exigida dispensada",
  // Prazos
  "prazo entrega bens dias corridos empenho",
  "bens recebidos provisoriamente prazo dias verificação qualidade",
  "pagamento fatura prazo dias atesto nota fiscal",
  "prazo validade proposta dias data apresentação",
  // Garantia
  "garantia produtos prazo meses assistência técnica onsite balcão remota sem garantia",
  // Habilitação
  "HABILITAÇÃO JURÍDICA contrato social estatuto cédula identidade",
  "HABILITAÇÃO FISCAL TRABALHISTA CND FGTS INSS certidão",
  "QUALIFICAÇÃO TÉCNICA atestados capacidade",
  "QUALIFICAÇÃO ECONÔMICO-FINANCEIRA balanço patrimonial",
  // Logística e Órgãos Participantes
  "ANEXO VI órgãos participantes locais entrega COMP FUNEAS DEPPEN HPM UEL UEM UEPG UNESPAR UNIOESTE",
  "local entrega almoxarifado endereço responsável recebimento telefone horário",
  "tabelas itens lotes quantidades especificações técnicas CATMAT",
];

const SYSTEM_PROMPT = `
Você é um especialista em análise de editais de licitação brasileiros.

Analise os chunks de texto recuperados do edital fornecidos abaixo e extraia TODAS as informações estruturadas seguindo o esquema Zod solicitado.

REGRAS DE EXTRAÇÃO:

- NUNCA invente dados. Use null se não encontrar no texto.
- Itens: deixe o campo "itens" como [].
- Datas: formato de entrada DD/MM/AAAA → saída ISO AAAA-MM-DD.
- Tabelas: textos [Tabela Completa] e [Tabela Linha] são dados tabulares — leia com atenção.

CAMPOS QUE EXIGEM ATENÇÃO ESPECÍFICA:

UASG: no início do edital aparece "UASG:XXXXXX" — use SOMENTE esse número. Códigos GMS (ex: "GMS: 6510-18969") NÃO são UASG.

PORTAL: use a URL do SISTEMA DE RECEBIMENTO DE PROPOSTAS (ex: "endereço eletrônico para recebimento e abertura de propostas é https://..."). Ignore URLs onde o edital está publicado (pncp.gov.br, comprasparana.pr.gov.br).

CRONOGRAMA: datas de abertura e sessão pública estão na capa. Datas de esclarecimento/impugnação podem ser relativas ("X dias úteis antes da abertura") — calcule subtraindo os dias úteis da data de abertura.

CONSÓRCIO: "não será permitida" / "vedada" → false. "será permitida" → true. Não confunda com adesão/carona.

DIFAL: "Convênio ICMS" com isenção para operações internas → false. Exige diferencial de alíquota → true.

ÓRGÃOS PARTICIPANTES: extraia do ANEXO VI "ÓRGÃOS PARTICIPANTES E LOCAIS DE ENTREGA". Inclua nome completo, UF e cidade de cada um.

PRAZOS: entrega = dias após empenho; aceite = "recebidos provisoriamente em X dias"; pagamento = "prazo não superior a X dias após atesto".

DOCUMENTOS DE HABILITAÇÃO: preencha cada categoria com os documentos listados na seção de habilitação do edital (geralmente "ANEXO II" ou seção numerada "DOCUMENTOS DE HABILITAÇÃO"):
- juridica → HABILITAÇÃO JURÍDICA
- fiscal_trabalhista → HABILITAÇÃO FISCAL / SOCIAL / TRABALHISTA
- tecnica → QUALIFICAÇÃO TÉCNICA
- economica → QUALIFICAÇÃO ECONÔMICO-FINANCEIRA
`.trim();

const EXTRACTION_SCHEMA = z.object({
  edital: z.object({
    numero: z.string().nullable(),
    numero_processo: z.string().nullable(),
    modalidade: z.enum([
      "pregao_eletronico", "pregao_presencial", "dispensa", "inexigibilidade",
      "concorrencia", "tomada_precos", "convite", "leilao", "concurso", "credenciamento"
    ]).nullable(),
    amparo_legal: z.string().nullable(),
    srp: z.boolean().nullable(),
    objeto: z.string().nullable(),
    objeto_resumido: z.string().nullable(),
    valor_estimado_total: z.number().nullable(),
    orgao_gerenciador: z.object({
      nome: z.string().nullable(),
      cnpj: z.string().nullable(),
      uasg: z.string().nullable(),
      uf: z.string().nullable(),
      cidade: z.string().nullable(),
      esfera: z.enum(["municipal", "estadual", "federal"]).nullable(),
      portal: z.string().nullable()
    }),
    cronograma: z.object({
      data_abertura_propostas: z.string().nullable(),
      data_limite_propostas: z.string().nullable(),
      hora_limite_propostas: z.string().nullable(),
      data_sessao_publica: z.string().nullable(),
      hora_sessao_publica: z.string().nullable(),
      data_limite_esclarecimentos: z.string().nullable(),
      data_limite_impugnacao: z.string().nullable()
    }),
    disputa: z.object({
      modo: z.enum(["aberto", "fechado", "aberto_fechado"]).nullable(),
      criterio_julgamento: z.enum([
        "menor_preco", "maior_desconto", "melhor_tecnica", "tecnica_e_preco", "maior_lance"
      ]).nullable(),
      tipo_lance: z.enum(["unitario", "global", "percentual"]).nullable(),
      intervalo_minimo_lances: z.string().nullable(),
      duracao_sessao_minutos: z.number().nullable()
    }),
    regras: z.object({
      exclusivo_me_epp: z.boolean().nullable(),
      permite_consorcio: z.boolean().nullable(),
      exige_visita_tecnica: z.boolean().nullable(),
      permite_adesao: z.boolean().nullable(),
      percentual_maximo_adesao: z.number().nullable(),
      regionalidade: z.string().nullable(),
      difal: z.boolean().nullable(),
      vigencia_contrato_dias: z.number().nullable(),
      vigencia_ata_meses: z.number().nullable()
    }),
    logistica: z.object({
      local_entrega: z.string().nullable(),
      tipo_entrega: z.enum(["centralizada", "descentralizada"]).nullable(),
      responsavel_instalacao: z.enum(["fornecedor", "comprador"]).nullable()
    }),
    prazos: z.object({
      entrega: z.object({ texto_original: z.string().nullable(), dias_corridos: z.number().nullable() }),
      aceite: z.object({ texto_original: z.string().nullable(), dias: z.number().nullable() }),
      pagamento: z.object({ texto_original: z.string().nullable(), dias: z.number().nullable() }),
      validade_proposta_dias: z.number().nullable()
    }),
    garantia: z.object({
      tipo: z.enum(["onsite", "balcao", "remota", "sem_garantia"]).nullable(),
      prazo_meses: z.number().nullable(),
      tempo_atendimento_horas: z.number().nullable()
    }),
    itens: z.array(z.object({
      numero: z.number(),
      descricao: z.string()
    })),
    orgaos_participantes: z.array(z.object({
      nome: z.string(),
      cnpj: z.string().nullable(),
      uasg: z.string().nullable(),
      uf: z.string().nullable(),
      cidade: z.string().nullable(),
      itens: z.array(z.object({ item_numero: z.number(), quantidade: z.number() }))
    })),
    documentos_habilitacao: z.object({
      juridica: z.array(z.string()),
      fiscal_trabalhista: z.array(z.string()),
      tecnica: z.array(z.string()),
      economica: z.array(z.string())
    }),
    observacoes: z.string().nullable()
  })
});

// ─── Agente principal ─────────────────────────────────────────────────────────

export class VectorSearchAgent {
  private readonly openai: ReturnType<typeof createOpenAI>;
  private readonly model: string;
  private embeddingCache = new Map<string, Float32Array>();

  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly vectorStore: FlatVectorStore,
  ) {
    this.model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async warmupEmbeddings(): Promise<void> {
    console.log(`[VectorSearchAgent] Pré-computando ${PREDEFINED_QUERIES.length} embeddings em batch...`);
    const embeddings = await this.embeddingProvider.embedMany(PREDEFINED_QUERIES, true);
    for (let i = 0; i < PREDEFINED_QUERIES.length; i++) {
      this.embeddingCache.set(PREDEFINED_QUERIES[i]!, embeddings[i]!);
    }
  }

  async extract(): Promise<VectorSearchAgentResult> {
    const startTime = Date.now();

    // 1. Recuperação paralela expandida
    const queryEmbeddings = await Promise.all(
      PREDEFINED_QUERIES.map(q => {
        const cached = this.embeddingCache.get(q);
        if (cached) return Promise.resolve(cached);
        return this.embeddingProvider.embedMany([q], true).then(embs => embs[0]!);
      })
    );

    // topK=150, minScore=0.30 — balanceia cobertura e tamanho do contexto enviado ao LLM
    const hits = this.vectorStore.multiQuerySearch(queryEmbeddings, 150, 0.30);
    const sorted = [...hits].sort((a, b) => (a.metadata?.chunk_index as number ?? 0) - (b.metadata?.chunk_index as number ?? 0));

    const context = sorted
      .filter(h => h.text)
      .map(h => `[Pág ${h.metadata?.page ?? '?'}] ${h.text}`)
      .join("\n\n---\n\n");

    console.log(`[VectorSearchAgent] Busca expandida ativa. Contexto: ${context.length} caracteres (${hits.length} chunks)`);

    // 2. Extração em passo único
    const { object, usage } = await generateObject({
      model: this.openai(this.model),
      schema: EXTRACTION_SCHEMA,
      system: SYSTEM_PROMPT,
      prompt: `Analise as informações extraídas do edital abaixo para preencher o esquema JSON.

LEMBRETES CRÍTICOS ANTES DE PREENCHER:
- orgao_gerenciador.uasg: procure exatamente o padrão "UASG:XXXXXX" no texto — esse é o único valor válido. Ignore qualquer número GMS (ex: "GMS: 6510-18969") ou código de item de tabela.
- orgao_gerenciador.portal: use a URL mencionada como "endereço eletrônico para recebimento e abertura de propostas" (ex: https://www.gov.br/compras/pt-br). NÃO use pncp.gov.br nem comprasparana.pr.gov.br.

CONTEXTO DO EDITAL:
${context}`,
      temperature: 0,
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`[VectorSearchAgent] Extração concluída em ${elapsedMs}ms`);

    return {
      extraction: object,
      tokensUsed: {
        prompt: usage?.promptTokens ?? 0,
        completion: usage?.completionTokens ?? 0,
        total: usage?.totalTokens ?? 0,
      },
      searchesPerformed: PREDEFINED_QUERIES.length,
      totalChunksRetrieved: hits.length,
    };
  }
}
