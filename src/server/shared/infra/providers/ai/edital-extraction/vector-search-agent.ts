import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore, type SearchResult } from "@/server/shared/infra/providers/embeddings/flat-vector-store";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type VectorSearchAgentResult = {
  extraction: Record<string, any>;
  tokensUsed: { prompt: number; completion: number; total: number };
  searchesPerformed: number;
  totalChunksRetrieved: number;
  hits: SearchResult[];
};

/**
 * Queries otimizadas e agressivas para campos críticos que costumam ser omitidos.
 */
export const PREDEFINED_QUERIES = [
  // Identificação e Cabeçalho (Foco em números)
  "PROCESSO LICITATÓRIO nº PREGÃO ELETRÔNICO nº edital número capa",
  "UASG SRP GMS pregão número identificação capa edital",
  "Preâmbulo identificação órgão CNPJ UASG portal endereço eletrônico",
  
  // Objeto e Valor
  "constitui objeto licitação aquisição fornecimento registro preços",
  "Valor estimado total contratação R$ global referência preço máximo",
  
  // Registro de Preços (SRP)
  "SISTEMA DE REGISTRO DE PREÇOS ATA DE REGISTRO DE PREÇOS SRP",
  "ata registro preços validade adesão carona",
  
  // Cronograma (Datas críticas)
  "data hora abertura sessão pública propostas lances cronograma",
  "prazo limite impugnação esclarecimento data hora",
  
  // Disputa
  "modo disputa aberto fechado critério julgamento maior desconto menor preço",
  "tipo lance unitário global percentual intervalo mínimo lances",
  
  // Regras de Participação (Booleanos)
  "VEDADA PARTICIPAÇÃO DE CONSÓRCIOS não será permitida consórcio",
  "participação de empresas em consórcio permitida autorizada",
  "ME EPP exclusivo Microempresa empresa pequeno porte reservado",
  "adesão carona percentual máximo vigência ata registro preços",
  "visita técnica exigida obrigatória dispensada",
  
  // Prazos e Garantia
  "prazo entrega bens dias corridos empenho",
  "bens recebidos provisoriamente prazo dias verificação",
  "pagamento fatura prazo dias atesto nota fiscal",
  "prazo validade proposta dias data apresentação",
  "garantia produtos prazo meses assistência técnica onsite balcão",
  
  // Habilitação
  "HABILITAÇÃO JURÍDICA social estatuto",
  "HABILITAÇÃO FISCAL TRABALHISTA CND FGTS INSS",
  "QUALIFICAÇÃO TÉCNICA atestados capacidade",
  "QUALIFICAÇÃO ECONÔMICO-FINANCEIRA balanço",
  
  // Logística e Anexos
  "ANEXO VI órgãos participantes locais entrega COMP FUNEAS DEPPEN",
  "local entrega almoxarifado endereço responsável recebimento",
  "tabelas itens lotes quantidades especificações",
  "órgãos participantes carona adesão ata registro de preços entidades beneficiárias",
  "documentos habilitação jurídica fiscal técnica regularidade trabalhista atestados exigidos detalhamento observações"
];

const SYSTEM_PROMPT = `
Você é um especialista em análise de editais de licitação brasileiros.

Analise os chunks de texto recuperados do edital fornecidos abaixo e extraia TODAS as informações estruturadas seguindo o esquema Zod solicitado.

IDENTIFICAÇÃO EM CABEÇALHOS:
- Procure por "PROCESSO Nº" ou "PREGÃO Nº" logo nos primeiros chunks (Capa/Preâmbulo). Se encontrar algo como "PREGÃO ELETRÔNICO N° 56/2023", o numero é "56/2023".

REGRAS CRÍTICAS DE EXTRAÇÃO:
- NUNCA invente dados. Use null se não encontrar LITERALMENTE no texto.
- SRP: Retorne true SOMENTE se o texto contiver explicitamente "Sistema de Registro de Preços" ou "Ata de Registro de Preços". Se NÃO houver NENHUMA menção a SRP/Registro de Preços, retorne false.
- CONSÓRCIO: Se encontrar "Consórcio de empresa" em uma lista de vedações/proibições (ex: item 3.2.10), retorne false. Se for permitido, true. Se não mencionado, null.
- DATAS E HORÁRIOS: Extraia EXATAMENTE como aparecem no texto. Procure especialmente no bloco <IDENTIFICACAO_DO_EDITAL_E_CABECALHO> por textos como "DATA DE ABERTURA DE PROPOSTAS: 26 de maio de 2023" ou "RECEBIMENTO DE PROPOSTAS: até as 09:00 horas do dia 26 de maio de 2023". Converta para ISO: "26 de maio de 2023" → "2023-05-26". NUNCA invente datas que não existam literalmente no texto.
- VALOR ESTIMADO: Priorize "VALOR ESTIMADO GLOBAL DE CONTRATAÇÃO" encontrado no cabeçalho. NÃO use valores de cláusulas contratuais.
- AMPARO LEGAL: Liste TODAS as leis mencionadas no preâmbulo, separadas por vírgula. Ex: "Lei 14.133/21, LC 123/06, Dec. Mun. 299/2022".
- UASG: Se não encontrar nominalmente "UASG:", use null. Ignore placeholders como "XXXXXX".
- PORTAL: URL para envio de propostas (ex: Licitar Digital, Compras.gov.br).

DOCUMENTOS DE HABILITAÇÃO:
Extraia meticulosamente as listas de documentos das seções de habilitação.
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

    // 1. Recuperação por Metadados (Estrutural) - Prioridade Máxima
    const structuralHits: SearchResult[] = [];
    
    // Captura os primeiros 6 chunks do documento (Geralmente contêm números e modalidade)
    const topDocHits = this.vectorStore.listByMetadata(meta => 
      (meta.chunk_index as number) < 6
    );
    structuralHits.push(...topDocHits);

    // Captura TODOS os chunks das primeiras páginas (page 0 ou 1 — depende do indexador)
    const firstPageHits = this.vectorStore.listByMetadata(meta => 
      (meta.page as number) <= 1
    );
    structuralHits.push(...firstPageHits);

    // Captura toda a seção que contém o primeiro chunk (Geralmente "PREÂMBULO" ou "CAPA")
    if (topDocHits.length > 0) {
      const firstSection = topDocHits[0]!.metadata.section as string;
      if (firstSection) {
        const sectionHits = this.vectorStore.listByMetadata(meta => 
          meta.section === firstSection
        );
        structuralHits.push(...sectionHits);
      }
    }

    // 2. Recuperação Semântica (Similiaridade)
    const queryEmbeddings = await Promise.all(
      PREDEFINED_QUERIES.map(q => {
        const cached = this.embeddingCache.get(q);
        if (cached) return Promise.resolve(cached);
        return this.embeddingProvider.embedMany([q], true).then(embs => embs[0]!);
      })
    );

    const semanticHits = this.vectorStore.multiQuerySearch(queryEmbeddings, 120, 0.25);

    // 3. Fusão e Marcação Estrutural
    const structuralIds = new Set(structuralHits.map(h => h.id));
    const allHitsMap = new Map<string, SearchResult>();
    [...structuralHits, ...semanticHits].forEach(h => allHitsMap.set(h.id, h));
    
    const hits = Array.from(allHitsMap.values());
    const sorted = hits.sort((a, b) => (a.metadata?.chunk_index as number ?? 0) - (b.metadata?.chunk_index as number ?? 0));

    // Injeção de Tags para orientar a IA
    const contextLines: string[] = [];
    let inStructuralPanel = false;

    for (const h of sorted) {
      const isStructural = structuralIds.has(h.id) || (h.metadata?.chunk_index as number) < 6;
      
      if (isStructural && !inStructuralPanel) {
        contextLines.push("\n<IDENTIFICACAO_DO_EDITAL_E_CABECALHO>");
        inStructuralPanel = true;
      } else if (!isStructural && inStructuralPanel) {
        contextLines.push("</IDENTIFICACAO_DO_EDITAL_E_CABECALHO>\n");
        inStructuralPanel = false;
      }

      contextLines.push(`[Pág ${h.metadata?.page ?? '?'}] ${h.text}`);
    }
    if (inStructuralPanel) contextLines.push("</IDENTIFICACAO_DO_EDITAL_E_CABECALHO>\n");

    const context = contextLines.join("\n\n---\n\n");

    console.log(`[VectorSearchAgent] Extração Híbrida Ativa: ${structuralHits.length} chunks estruturais (topDoc=${topDocHits.length}, firstPage=${firstPageHits.length}).`);
    console.log(`[VectorSearchAgent] Primeiros 5 IDs estruturais: ${structuralHits.slice(0, 5).map(h => h.id).join(' | ')}`);
    console.log(`[VectorSearchAgent] Total hits após fusão: ${hits.length}`);

    // 4. Extração com Schema Enriquecido
    const { object, usage } = await generateObject({
      model: this.openai(this.model),
      schema: z.object({
        edital: z.object({
          numero: z.string().nullable().describe("Número oficial do edital/pregão. Ex: '56/2023'. Procure no bloco IDENTIFICACAO_DO_EDITAL."),
          numero_processo: z.string().nullable().describe("Número do processo administrativo. Ex: '91/2023'. Procure no bloco IDENTIFICACAO_DO_EDITAL."),
          modalidade: z.enum([
            "pregao_eletronico", "pregao_presencial", "dispensa", "inexigibilidade",
            "concorrencia", "tomada_precos", "convite", "leilao", "concurso", "credenciamento"
          ]).describe("Modalidade da licitação."),
          amparo_legal: z.string().nullable().describe("Liste TODAS as leis: Ex: 'Lei 14.133/21, LC 123/06, Dec. Mun. 299/2022'."),
          srp: z.boolean().nullable().describe("true SOMENTE se o texto mencionar 'Sistema de Registro de Preços' ou 'Ata de Registro de Preços'. Se NÃO houver menção, retorne false."),
          objeto: z.string().nullable().describe("Descrição completa do objeto."),
          objeto_resumido: z.string().nullable().describe("Resumo curto do objeto."),
          valor_estimado_total: z.number().nullable().describe("Use o 'VALOR ESTIMADO GLOBAL DE CONTRATAÇÃO' do cabeçalho. NÃO use valores de cláusulas contratuais."),
          orgao_gerenciador: z.object({
            nome: z.string().nullable(),
            cnpj: z.string().nullable(),
            uasg: z.string().nullable().describe("Número UASG (6 dígitos). Ignore XXXXXX."),
            uf: z.string().nullable(),
            cidade: z.string().nullable(),
            esfera: z.enum(["municipal", "estadual", "federal"]).nullable(),
            portal: z.string().nullable().describe("URL para lances.")
          }),
          cronograma: z.object({
            data_abertura_propostas: z.string().nullable().describe("Procure 'DATA DE ABERTURA DE PROPOSTAS' no cabeçalho. Formato ISO: AAAA-MM-DD. Ex: '26 de maio de 2023' → '2023-05-26'."),
            data_limite_propostas: z.string().nullable().describe("Procure 'RECEBIMENTO DE PROPOSTAS: até as HH:MM horas do dia DD de MÊS de AAAA'. Use a data encontrada."),
            hora_limite_propostas: z.string().nullable().describe("Horário limite para propostas. Ex: 'até as 09:00 horas' → '09:00'."),
            data_sessao_publica: z.string().nullable().describe("Data da sessão pública. Geralmente igual à data de abertura."),
            hora_sessao_publica: z.string().nullable().describe("Hora da sessão. Procure 'ABERTURA DAS PROPOSTAS: HH:MM horas'."),
            data_limite_esclarecimentos: z.string().nullable(),
            data_limite_impugnacao: z.string().nullable()
          }),
          disputa: z.object({
            modo: z.enum(["aberto", "fechado", "aberto_fechado"]).nullable(),
            criterio_julgamento: z.enum([
              "menor_preco", "maior_desconto", "melhor_tecnica", "tecnica_e_preco", "maior_lance"
            ]).nullable(),
            tipo_lance: z.enum(["unitario", "global", "percentual"]).nullable(),
            intervalo_lances: z.string().nullable().describe("Intervalo mínimo estipulado entre lances ou % de diferença.")
          }),
          regras: z.object({
            exclusivo_me_epp: z.boolean().nullable().describe("Se o edital for reservado ou exclusivo para ME/EPP."),
            permite_consorcio: z.boolean().nullable().describe("Se 'Consórcio de empresas' é PROIBIDO/VEDADO em qualquer parte do texto, retorne false."),
            exige_visita_tecnica: z.boolean().nullable(),
            permite_adesao: z.boolean().nullable(),
            percentual_adesao: z.number().nullable().describe("Percentual máximo permitido para caronas/adesões (ex: 50, 100)."),
            regionalidade: z.string().nullable(),
            difal: z.boolean().nullable()
          }),
          documentos_habilitacao: z.object({
            juridica: z.array(z.string()),
            fiscal_trabalhista: z.array(z.string()),
            tecnica: z.array(z.string()),
            economica: z.array(z.string())
          }),
          logistica: z.object({
            local_entrega: z.string().nullable().describe("Endereços ou locais onde os produtos devem ser entregues."),
            tipo_entrega: z.string().nullable().describe("Entrega parcelada, única, sob demanda?"),
            responsavel_instalacao: z.string().nullable().describe("Quem faz a instalação? Contratada, Contratante, ou não aplicável?")
          }),
          prazos: z.object({
            entrega: z.object({
              texto_original: z.string().nullable().describe("Trecho com a regra de entrega. Ex: 'em até 30 dias após emissão de empenho'"),
              dias_corridos: z.number().nullable()
            }),
            aceite: z.object({
              texto_original: z.string().nullable(),
              dias: z.number().nullable()
            }),
            pagamento: z.object({
              texto_original: z.string().nullable().describe("Prazo e condições para pagamento (ex: '30 dias após nota fiscal')"),
              dias: z.number().nullable()
            }),
            validade_proposta_dias: z.number().nullable().describe("Validade obrigatória da proposta (ex: 60, 90 dias).")
          }),
          garantia: z.object({
            tipo: z.string().nullable(),
            meses: z.number().nullable(),
            tempo_atendimento_horas: z.number().nullable()
          }),
          orgaos_participantes: z.array(z.object({
            nome: z.string(),
            itens: z.array(z.object({
              item_numero: z.number(),
              quantidade: z.number()
            }))
          })).describe("Instituições ou secretarias beneficiadas e os números dos itens vinculados a elas."),
          documentos_exigidos: z.array(z.object({
            tipo: z.string().describe("Descreva o documento. Ex: 'Alvará de funcionamento'"),
            obrigatorio: z.boolean()
          })).describe("Rol de certificados obrigatórios solicitados no edital de forma explícita (além da doc. habilitação básica)."),
          observacoes: z.string().nullable().describe("Pontos essenciais soltos ou notas críticas sobre o certame.")
        })
      }),
      system: SYSTEM_PROMPT,
      prompt: `Analise as informações abaixo para extrair os dados da licitação.

INSTRUÇÕES PRIORITÁRIAS:
1. O bloco <IDENTIFICACAO_DO_EDITAL_E_CABECALHO> contém a CAPA do edital com números, datas, horários e valor estimado. Extraia LITERALMENTE os dados de lá.
2. Datas: Copie exatamente do texto. "26 de maio de 2023" → "2023-05-26". "até as 09:00 horas" → "09:00". NUNCA invente datas.
3. SRP: Retorne false se não houver menção explícita a "Registro de Preços".
4. Consórcio em lista de vedações (ex: "3.2.10- Consórcio de empresa") → permite_consorcio = false.

CONTEXTO:
${context}`,
      temperature: 0,
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`[VectorSearchAgent] Extração concluída em ${elapsedMs}ms`);

    return {
      extraction: object,
      tokensUsed: {
        prompt: usage?.inputTokens ?? 0,
        completion: usage?.outputTokens ?? 0,
        total: usage?.totalTokens ?? 0,
      },
      searchesPerformed: PREDEFINED_QUERIES.length,
      totalChunksRetrieved: hits.length,
      hits,
    };
  }
}
