import { PROMPT_PASS1_IDENTIFICACAO } from "./prompts/pass1-identificacao";
import { PROMPT_PASS2_ITENS } from "./prompts/pass2-itens";
import { PROMPT_PASS3_REGRAS_EXECUCAO_HABILITACAO } from "./prompts/pass3-regras-execucao-habilitacao";
import { EDITAL_EXTRACTION_PROMPT as FULL_PROMPT } from "./prompts/edital-extraction-prompt";

/**
 * EDITAL EXTRACTION INTENTS
 *
 * Utiliza o sistema de "queries" para o ChunkRelevanceScorer.
 * Assim o pipeline busca apenas as partes relevantes do edital
 * para inserir em cada prompt, dividindo o problema e contornando timeouts.
 */
export const EDITAL_INTENTS = {
    IDENTIFICACAO: {
        query: [
            "Dados de identificação, número do processo, aviso de licitação ou do pregão",
            "Modalidade da contratação: Pregão Eletrônico, Dispensa Eletrônica, Inexigibilidade, Concorrência",
            "Objeto da licitação, descrição resumida do que está sendo comprado ou contratado",
            "Nome do órgão gerenciador, prefeitura, comissão ou entidade contratante",
            "CNPJ do órgão público, UASG ou Portal",
            "Valor estimado total da licitação",
            "Cronograma da licitação: Datas e horários (Brasília) de abertura, recebimento de propostas, lances, limite e sessão pública",
            "Registro de Preços",
            "preambulo do edital"
        ],
        prompt: PROMPT_PASS1_IDENTIFICACAO
    },

    ITENS: {
        // Itens geralmente estão no Termo de Referência
        query: [
            "Relação de itens, materiais ou serviços, lote, descrição, quantidade pedida e unidade de medida",
            "Tabela de produtos, especificações, termo de referência, anexo I",
            "Valor unitário estimado e o valor total estimado (R$) referenciado no edital",
            "Código NCM ou NBS"
        ],
        prompt: PROMPT_PASS2_ITENS
    },

    REGRAS_EXECUCAO_HABILITACAO: {
        query: [
            "Regras do edital, ME/EPP, margem de preferência, adesão de carona, consórcio, regionalidade, diferencial de alíquota DIFAL",
            "Modo de disputa (aberto/fechado), critério de julgamento (menor preço), lances",
            "Prazos de entrega em dias, condições de recebimento, validade da proposta",
            "Pagamento da nota fiscal, liquidação e aceite",
            "Garantia, prazo em meses, tempo de atendimento, onsite/balcao",
            "Documentos para habilitação jurídica, contrato social, estatuto",
            "Habilitação fiscal, trabalhista, CND, INSS, FGTS, débitos estaduais",
            "Qualificação técnica e econômico-financeira, atestado de capacidade técnica, balanço patrimonial, certidão negativa de falência"
        ],
        prompt: PROMPT_PASS3_REGRAS_EXECUCAO_HABILITACAO
    },

    FULL_EXTRACTION: {
        // Usado como fallback caso a extração partilhada não seja desejada, ou para editais curtos
        query: [
            "Extrair todas as informações do edital, identificação, itens, regras, prazos, habilitação e cronograma completo."
        ],
        prompt: FULL_PROMPT
    }
};
