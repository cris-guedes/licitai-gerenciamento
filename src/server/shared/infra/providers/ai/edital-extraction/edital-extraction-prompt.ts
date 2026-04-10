/**
 * Prompt de extração do Edital.
 *
 * REFINAMENTO:
 * Após cada execução, abra temp/{sessionId}/extraction.json para ver o resultado.
 * Use temp/{sessionId}/content.md para entender o que o LLM recebeu.
 * Edite este arquivo para corrigir extrações incorretas e reprocesse.
 *
 * Versão: 4
 */

/**
 * EDITAL EXTRACTION INTENTS (VERSÃO PRODUÇÃO)
 *
 * Uso:
 * 1. Buscar chunks com intent.query
 * 2. Injetar chunks no prompt
 * 3. Executar LLM
 * 4. Fazer merge dos resultados
 */

export const EDITAL_INTENTS = {
  IDENTIFICACAO: {
    query: [
      "Dados de identificação, número do edital, aviso de dispensa, número da licitação ou do pregão (ex: 123/2024)",
      "Número do processo administrativo ou processo licitatório (ex: Processo 456/2023)",
      "Modalidade da contratação: Dispensa Eletrônica, Pregão Eletrônico, Inexigibilidade, Concorrência",
      "Objeto da licitação, descrição resumida do que está sendo comprado ou contratado",
      "Nome do órgão gerenciador, prefeitura, comissão, entidade contratante ou fundo municipal",
      "CNPJ do órgão público ou da entidade contratante (ex: 00.000.000/0001-00, MF, CGC)",
      "Código UASG ou ID do Portal para identificação da compra",
      "Cidade e Estado (UF) de localização do órgão",
      "Valor estimado total da licitação",
      "Objeto da licitação, descrição resumida do que está sendo comprado ou contratado",
      "preambulo do edital"
    ],

    prompt: `
Você é especialista em licitações públicas brasileiras.

Extraia as informações de IDENTIFICAÇÃO do documento.

⚠️ REGRAS DE OURO:
- Retorne um JSON estritamente válido.
- Se a informação não existir, use null (sem aspas).
- Não invente dados. Se não houver CNPJ ou UASG no texto, retorne null.
- **CNPJ/UASG/UF/Cidade**: Procure exaustivamente no cabeçalho, rodapé, preâmbulo e na seção de "Assinaturas" ao final.

🎯 LÓGICA DE EXTRAÇÃO PARA CAMPOS CRÍTICOS:
1. **numero/processo**: Extraia o identificador numérico principal e ano (ex: "257/2026", "651/26").
2. **modalidade**: Identifique o tipo (ex: "Pregão Eletrônico", "Dispensa").
3. **identificacao.uasg**: Procure pela sigla "UASG" + código numérico. Se encontrar campos como "ID da Compra" ou "Portal de Compras", use como portal.
4. **orgao_gerenciador.cnpj**: Procure por "CNPJ", "MF" ou "C.G.C." seguido de 14 números. Quase sempre está no cabeçalho ou preâmbulo.
5. **orgao_gerenciador.uf/cidade**: Identifique a localização da sede do órgão (ex: Porto Alegre/RS).

## 🎯 FORMATO DE SAÍDA

{
  "numero": "string | null",
  "numero_processo": "string | null",
  "modalidade": "string | null",
  "objeto_resumido": "string | null",
  "valor_estimado_total": "number | null",
  "identificacao": {
    "uasg": "string | null",
    "portal": "string | null"
  },
  "classificacao": {
    "ambito": "string | null"
  },
  "orgao_gerenciador": {
    "nome": "string | null",
    "cnpj": "string | null",
    "uf": "string | null",
    "cidade": "string | null"
  }
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  DATAS_DISPUTA: {
    query: [
      "Cronograma da licitação: Datas e horários (Brasília) de abertura, propostas, lances e sessão pública",
      "Data limite para envio de propostas e horário de encerramento do acolhimento",
      "Data e hora de abertura da sessão pública e início da disputa de lances",
      "Prazo para pedido de esclarecimento, impugnação ou questionamentos do edital",
      "Modo de disputa: aberto, fechado, aberto e fechado, e regras de envio de lances",
      "Criterio de julgamento: menor preço por item, lote ou global"
    ],

    prompt: `
Extraia datas e informações de disputa.

⚠️ REGRAS:
- Datas → YYYY-MM-DD
- Hora → HH:MM
- Não inventar valores
- Campos ausentes → null

---

## 🎯 FORMATO DE SAÍDA

{
  "datas": {
    "data_abertura": string | null,
    "data_proposta_limite": string | null,
    "hora_proposta_limite": string | null,
    "data_esclarecimento_impugnacao": string | null,
    "cadastro_inicio": string | null,
    "cadastro_fim": string | null
  },
  "disputa": {
    "modo": string | null,
    "criterio_julgamento": string | null,
    "tipo_lance": string | null,
    "intervalo_lances": string | null
  }
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  PRAZOS_LOGISTICA: {
    query: [
      "Prazos de entrega dos produtos ou execução dos serviços em dias corridos ou úteis",
      "Condições de entrega: Entrega única, parcelada, conforme necessidade ou cronograma",
      "Endereço de entrega, almoxarifado, local de recebimento e secretaria responsável",
      "Prazo para pagamento da nota fiscal, liquidação e recebimento definitivo / aceite",
      "Validade da proposta de preços em dias",
      "Obrigações da contratada quanto à logística, frete, carga e descarga"
    ],

    prompt: `
Extraia prazos e logística.

⚠️ REGRAS:
- Sempre incluir texto_original quando houver prazo
- Converter dias para número
- Não inventar dados

---

## 🎯 FORMATO DE SAÍDA

{
  "prazos": {
    "entrega": {
      "texto_original": string | null,
      "dias_corridos": number | null
    },
    "aceite": {
      "texto_original": string | null,
      "dias": number | null
    },
    "pagamento": {
      "texto_original": string | null,
      "dias": number | null
    },
    "validade_proposta_dias": number | null
  },
  "logistica": {
    "local_entrega": string | null,
    "tipo_entrega": string | null,
    "responsavel_instalacao": string | null
  }
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  ITENS: {
    query: [
      "Qual é a relação de itens, materiais ou serviços que serão contratados? Qual o número do lote, descrição, quantidade pedida e unidade de medida?",
      "Qual é o valor unitário estimado de cada produto e o valor total em reais (R$) referenciado no edital?",
      "Qual é o código NCM (Nomenclatura Comum do Mercosul), código fiscal ou especificação tributária do produto ofertado?"
    ],

    prompt: `
Extraia TODOS os itens da tabela.

⚠️ REGRAS:
- Cada linha = 1 item
- Não agrupar
- Valores numéricos
- NCM apenas se existir
- Não inventar itens

---

## 🎯 FORMATO DE SAÍDA

{
  "itens": [
    {
      "numero": number | null,
      "lote": string | null,
      "descricao": string | null,
      "quantidade": number | null,
      "unidade": string | null,
      "valor_unitario_estimado": number | null,
      "valor_total_estimado": number | null,
      "ncm": string | null
    }
  ]
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  DOCUMENTOS: {
    query: [
      "Quais são os documentos exigidos obrigatoriamente para habilitação jurídica, documentação da empresa ou estatuto social?",
      "Quais são as certidões necessárias para regularidade fiscal, incluindo certidão negativa federal, estadual, municipal, FGTS ou trabalhista?",
      "Que documentos são exigidos para habilitação e qualificação técnica, atestado de capacidade técnica ou registro no conselho responsável?",
      "Que documentos são requeridos para qualificação econômico-financeira, avaliação patrimonial, índice de liquidez ou certidão negativa de falência?"
    ],

    prompt: `
Leia a seção de habilitação.

⚠️ REGRAS:
- Extrair apenas documentos explicitamente listados
- Não usar lista padrão
- obrigatorio sempre true
- Usar snake_case

---

## 🎯 FORMATO DE SAÍDA

{
  "documentos_exigidos": [
    {
      "tipo": string,
      "obrigatorio": true
    }
  ]
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  REGRAS: {
    query: [
      "Quais as regras do edital referentes a tratamento favorecido, exclusividade para Microempresa (ME) ou Empresa de Pequeno Porte (EPP), com cota reservada?",
      "Quais as regras para adesão de carona, formação de Ata de Registro de Preços e percentual máximo ou limite permitido (ex: 25%, 50%) de uso por órgãos não participantes?",
      "Quais as observações adicionais sobre regionalidade, restrição de estado, e regras para recolhimento de diferencial de alíquota (DIFAL)?"
    ],

    prompt: `
Extraia regras e observações.

⚠️ REGRAS:
- Booleanos → true/false
- Campos ausentes → null
- Não assumir valores

---

## 🎯 FORMATO DE SAÍDA

{
  "regras": {
    "exclusivo_me_epp": boolean | null,
    "permite_adesao": boolean | null,
    "percentual_adesao": number | null,
    "regionalidade": string | null,
    "difal": boolean | null
  },
  "observacoes": string | null
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  GARANTIA: {
    query: [
      "Como funcionará a garantia dos produtos? Qual é a vigência, prazo do fabricante em meses e condições gerais após a entrega?",
      "Qual é o tipo de garantia: serviço onsite (no local), suporte em balcão ou prestação de assistência técnica técnica direta ao consumidor?",
      "Qual é o tempo máximo e prazo de atendimento em horas (úteis) necessário para responder a chamados ou manutenção corretiva?"
    ],

    prompt: `
Extraia informações de garantia.

⚠️ REGRAS:
- onsite | balcao | sem_garantia
- Campos ausentes → null
- Não inventar valores

---

## 🎯 FORMATO DE SAÍDA

{
  "garantia": {
    "tipo": string | null,
    "meses": number | null,
    "tempo_atendimento_horas": number | null
  }
}

---

## 📥 INPUT

{{CHUNKS}}

---

## 📤 OUTPUT

Retorne apenas JSON válido.
`
  },

  /**
   * INTENT CONSOLIDADA (Para Long Context / Documentos Pequenos)
   * Reduz o custo em 7x ao enviar o contexto apenas uma vez.
   */
  FULL_EXTRACTION: {
    query: ["Extrair todas as informações do edital"],
    prompt: `
Você é um especialista em licitações públicas brasileiras (Lei 14.133/2021 e outras).
Sua tarefa é ler o o edital completo e extrair todas as informações estruturadas de acordo com o esquema abaixo.

⚠️ REGRAS CRÍTICAS DE EXTRAÇÃO:
- **JSON VÁLIDO**: Retorne APENAS o objeto JSON.
- **DADOS REAIS**: Se não encontrar uma informação, use null. NUNCA invente dados.
- **NÚMEROS**: Extraia apenas o valor numérico (ex: "R$ 1.500,00" -> 1500.00).
- **DATAS**: Use formato ISO YYYY-MM-DD.
- **ITENS**: Extraia exaustivamente todos os itens da tabela de objetos.

🎯 ESQUEMA DE SAÍDA:
{
  "edital": {
    "numero": "Número principal (ex: 043/2022)",
    "numero_processo": "Processo administrativo",
    "modalidade": "Modalidade (ex: Pregão, Dispensa)",
    "objeto_resumido": "Síntese do objeto",
    "valor_estimado_total": number | null,
    "identificacao": { "uasg": "string | null", "portal": "string | null" },
    "classificacao": { "ambito": "string (Federal/Estadual/Municipal) | null" },
    "orgao_gerenciador": { "nome": "string", "cnpj": "string", "uf": "string", "cidade": "string" },
    "datas": { "data_abertura": "YYYY-MM-DD", "data_proposta_limite": "YYYY-MM-DD", "hora_proposta_limite": "HH:MM", "data_esclarecimento_impugnacao": "YYYY-MM-DD", "cadastro_inicio": "YYYY-MM-DD", "cadastro_fim": "YYYY-MM-DD" },
    "disputa": { "modo": "string (Aberto/Fechado)", "criterio_julgamento": "string", "tipo_lance": "string", "intervalo_lances": "string | null" },
    "regras": { "exclusivo_me_epp": boolean, "permite_adesao": boolean, "percentual_adesao": number, "regionalidade": "string", "difal": boolean },
    "logistica": { "local_entrega": "endereço completo", "tipo_entrega": "Única/Parcelada", "responsavel_instalacao": "string" },
    "prazos": { "entrega": { "texto_original": "string", "dias_corridos": number }, "aceite": { "texto_original": "string", "dias": number }, "pagamento": { "texto_original": "string", "dias": number }, "validade_proposta_dias": number },
    "garantia": { "tipo": "string", "meses": number, "tempo_atendimento_horas": number },
    "itens": [ { "numero": number, "lote": "string", "descricao": "string", "quantidade": number, "unidade": "string", "valor_unitario_estimado": number, "valor_total_estimado": number, "ncm": "string" } ],
    "documentos_exigidos": [ { "tipo": "string", "obrigatorio": true } ],
    "observacoes": "string | null"
  }
}

---
## 📥 INPUT (EDITAL COMPLETO)

{{CHUNKS}}
`
  }
};



