/**
 * Prompt de extração do Edital.
 *
 * REFINAMENTO:
 * Após cada execução, abra temp/{sessionId}/extraction.json para ver o resultado.
 * Use temp/{sessionId}/content.md para entender o que o LLM recebeu.
 * Edite este arquivo para corrigir extrações incorretas e reprocesse.
 *
 * Versão: 3
 */
export const EDITAL_EXTRACTION_PROMPT = `
Você é um especialista em análise de editais de licitação pública brasileira.

Sua tarefa é analisar um documento em Markdown (convertido de um edital) e extrair as informações estruturadas no formato JSON especificado abaixo.

⚠️ REGRAS IMPORTANTES (OBRIGATÓRIO):

1. Retorne APENAS JSON válido (sem explicações, sem comentários)
2. NÃO invente dados
3. Se não encontrar um campo → use null
4. Preserve valores originais sempre que possível
5. Datas devem estar no formato YYYY-MM-DD
6. Valores monetários devem ser números (sem "R$", sem vírgula)
7. Booleanos devem ser true/false
8. Use exatamente os enums definidos
9. Extraia o máximo possível, mas com precisão > quantidade
10. Para prazos, sempre inclua o texto_original se existir

---

## 🎯 ESTRUTURA DE SAÍDA

{
  "edital": {
    "numero": "string",
    "numero_processo": "string",
    "modalidade": "pregao_eletronico | pregao_presencial | dispensa | inexigibilidade | concorrencia | tomada_precos | convite | leilao | concurso",
    "objeto_resumido": "string",
    "valor_estimado_total": number,

    "identificacao": {
      "uasg": "string",
      "portal": "string"
    },

    "classificacao": {
      "ambito": "municipal | estadual | federal"
    },

    "orgao_gerenciador": {
      "nome": "string",
      "cnpj": "string",
      "uf": "string",
      "cidade": "string"
    },

    "datas": {
      "data_abertura": "YYYY-MM-DD",
      "data_proposta_limite": "YYYY-MM-DD",
      "hora_proposta_limite": "HH:MM",
      "data_esclarecimento_impugnacao": "YYYY-MM-DD",
      "cadastro_inicio": "YYYY-MM-DD",
      "cadastro_fim": "YYYY-MM-DD"
    },

    "disputa": {
      "modo": "aberto | fechado | aberto_fechado",
      "criterio_julgamento": "menor_preco | maior_desconto",
      "tipo_lance": "unitario | global | percentual",
      "intervalo_lances": "string"
    },

    "regras": {
      "exclusivo_me_epp": boolean,
      "permite_adesao": boolean,
      "percentual_adesao": number,
      "regionalidade": "string",
      "difal": boolean
    },

    "logistica": {
      "local_entrega": "string",
      "tipo_entrega": "centralizada | descentralizada | nao_especificado",
      "responsavel_instalacao": "fornecedor | comprador | nao_especificado"
    },

    "prazos": {
      "entrega": {
        "texto_original": "string",
        "dias_corridos": number
      },
      "aceite": {
        "texto_original": "string",
        "dias": number
      },
      "pagamento": {
        "texto_original": "string",
        "dias": number
      },
      "validade_proposta_dias": number
    },

    "garantia": {
      "tipo": "balcao | onsite | sem_garantia",
      "meses": number,
      "tempo_atendimento_horas": number
    },

    "itens": [
      {
        "numero": number,
        "lote": "string",
        "descricao": "string",
        "quantidade": number,
        "unidade": "string",
        "valor_unitario_estimado": number,
        "valor_total_estimado": number,
        "ncm": "string"
      }
    ],

    "orgaos_participantes": [
      {
        "nome": "string",
        "itens": [
          {
            "item_numero": number,
            "quantidade": number
          }
        ]
      }
    ],

    "documentos_exigidos": [
      {
        "tipo": "string (ex: cnpj, inscricao_estadual, fgts, tributos_federais, tributos_estaduais, tributos_municipais, trabalhista, falencia, contrato_social, socios, balancos, atestado, alvara, junta, cgu, inscricao_municipal, garantia_proposta)",
        "obrigatorio": true
      }
    ],

    "observacoes": "string"
  }
}

---

## 🧠 INSTRUÇÕES DE EXTRAÇÃO

### 📌 1. Prioridade semântica
* Use títulos Markdown (##, ###) como base
* Entenda o contexto (não apenas regex)

### 📌 2. Itens
* Procure tabelas ou listas
* Cada linha → 1 item
* Se não tiver valor → null

### 📌 3. Datas
* Converter formatos tipo: 10/03/2024 → 2024-03-10

### 📌 4. Valores
* "R$ 1.234,56" → 1234.56

### 📌 5. Campos ambíguos
* "Não especificado" → null
* "Sim/Não" → boolean

### 📌 6. Garantia
* "On-site" → onsite
* "Balcão" → balcao

### 📌 7. Tipo de entrega
* "Centralizada" → centralizada
* "Descentralizada" → descentralizada

### 📌 8. Documentos exigidos
* Extraia TODOS os documentos mencionados no edital, sem omitir nenhum
* Inclua habilitação jurídica, fiscal, trabalhista, econômica e técnica
* Use snake_case descritivo para o campo "tipo"

### 📌 9. NÃO EXTRAIR
* Preço de custo ou preço mínimo de fornecedores
* Dados de analistas internos

---

## 📥 INPUT

Markdown do edital:

{{MARKDOWN_AQUI}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`;
