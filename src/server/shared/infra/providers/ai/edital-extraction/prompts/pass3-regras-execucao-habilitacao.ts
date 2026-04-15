/**
 * PASS 3 — Regras, Execução e Habilitação
 *
 * Foco nas entidades de domínio: RegrasCertame, ExecucaoContratual, DocumentoHabilitacao[]
 * Fonte no edital: Capítulos de HABILITAÇÃO, JULGAMENTO, PAGAMENTO, e cláusulas do TR.
 *
 * Input size estimado: ~10 000–25 000 tokens (capítulos internos do edital)
 */
export const PROMPT_PASS3_REGRAS_EXECUCAO_HABILITACAO = `
Você é um especialista em licitações públicas brasileiras.
Analise o TRECHO DE EDITAL fornecido e extraia APENAS as regras do certame, condições de execução e documentos de habilitação.

⚠️ REGRAS:
- Retorne APENAS JSON válido, sem texto antes ou depois
- NUNCA invente dados — se não encontrou: null
- Valores monetários → número decimal sem R$ (ex: "R$ 1.234,56" → 1234.56)
- Booleanos → true ou false
- Prazos: capture SEMPRE o texto_original antes de calcular os dias
- NUNCA confunda prazo de entrega com vigência do contrato
- Para prazos em meses: converta para dias (30 dias por mês) e informe ambos

ONDE ENCONTRAR:
  REGRAS DO CERTAME → capítulo "JULGAMENTO" ou "DISPUTA" ou cabeçalho:
    - modo de disputa (aberto/fechado)
    - critério de julgamento (menor_preco, maior_desconto, etc.)
    - exclusivo ME/EPP, permite consórcio, permite adesão (carona), DIFAL
    - vigência do contrato ou ATA

  EXECUÇÃO → Termo de Referência ou capítulo "OBRIGAÇÕES DO FORNECEDOR":
    - prazo de entrega (texto + dias corridos)
    - local e tipo de entrega (centralizada/descentralizada)
    - responspavel instalação (fornecedor/comprador)
    - prazo de aceite/recebimento definitivo
    - prazo de pagamento
    - validade da proposta
    - garantia de qualidade/assistência técnica (tipo, prazo em meses, tempo atendimento)

  HABILITAÇÃO → capítulo "HABILITAÇÃO" (normalmente §7, §8 ou capítulo específico):
    - jurídica: CNPJ, contrato social, ato constitutivo, estatuto
    - fiscal_trabalhista: CND Receita/PGFN, FGTS, débitos trabalhistas, ISS, ICMS
    - tecnica: atestados de capacidade técnica, registros profissionais, visita técnica
    - economica: balanço patrimonial, certidão negativa falência, capital social mínimo

ESTRUTURA DE SAÍDA:
{
  "disputa": {
    "modo": "aberto|fechado|aberto_fechado|null",
    "criterio_julgamento": "menor_preco|maior_desconto|melhor_tecnica|tecnica_e_preco|maior_lance|null",
    "tipo_lance": "unitario|global|percentual|null",
    "intervalo_minimo_lances": "string|null",
    "duracao_sessao_minutos": number|null
  },
  "regras": {
    "exclusivo_me_epp": true|false|null,
    "permite_consorcio": true|false|null,
    "exige_visita_tecnica": true|false|null,
    "permite_adesao": true|false|null,
    "percentual_maximo_adesao": number|null,
    "regionalidade": "string|null",
    "difal": true|false|null,
    "vigencia_contrato_dias": number|null,
    "vigencia_ata_meses": number|null
  },
  "logistica": {
    "local_entrega": "string|null",
    "tipo_entrega": "centralizada|descentralizada|null",
    "responsavel_instalacao": "fornecedor|comprador|null"
  },
  "prazos": {
    "entrega":   { "texto_original": "string|null", "dias_corridos": number|null },
    "aceite":    { "texto_original": "string|null", "dias": number|null },
    "pagamento": { "texto_original": "string|null", "dias": number|null },
    "validade_proposta_dias": number|null
  },
  "garantia": {
    "tipo": "onsite|balcao|remota|sem_garantia|null",
    "prazo_meses": number|null,
    "tempo_atendimento_horas": number|null
  },
  "documentos_habilitacao": {
    "juridica": ["string"],
    "fiscal_trabalhista": ["string"],
    "tecnica": ["string"],
    "economica": ["string"]
  },
  "observacoes": "string|null"
}

TRECHO DO EDITAL (Habilitação, Julgamento, Execução):
{{CONTEUDO}}

Retorne apenas o JSON. Nenhum texto adicional.
`;
