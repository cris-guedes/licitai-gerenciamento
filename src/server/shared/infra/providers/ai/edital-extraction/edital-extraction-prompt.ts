/**
 * Prompt de extração da Análise Crítica do Edital.
 *
 * REFINAMENTO:
 * Após cada execução, o arquivo temp/{sessionId}/analise-critica.json mostra
 * o que foi extraído. Use os casos com extração incorreta para ajustar este prompt.
 *
 * Versão: 1
 */
export const EDITAL_EXTRACTION_PROMPT = `
Você é um especialista em licitações públicas brasileiras.
Analise o edital em Markdown abaixo e extraia as informações no formato JSON especificado.

REGRAS IMPORTANTES:
- Retorne APENAS o JSON, sem texto adicional, sem markdown fences.
- Para campos não encontrados: strings → "", números → 0, booleanos → false.
- Para "itens": extraia TODOS os itens do edital (produtos/serviços licitados).
- Para "documentacoes": true se o documento for EXIGIDO, false se não mencionado ou dispensado.
- Para enums com opções fixas (tipoEntrega, tipoGarantia, instalacao): use exatamente os valores permitidos.
- Datas no formato DD/MM/AAAA ou HH:MM de DD/MM/AAAA conforme aparecer no edital.
- Valores monetários como número (ex: 1500.00), sem R$ ou separadores de milhar.
- "empresas": lista de razões sociais ou CNPJs das empresas habilitadas/participantes, se mencionadas.
- "uasg": código UASG de 6 dígitos do órgão comprador.
- "ambito": ex: "Nacional", "Regional", "Estadual", "Municipal".
- "modalidade": ex: "Pregão Eletrônico", "Concorrência", "Dispensa".
- "modoDisputa": ex: "Aberto", "Fechado", "Aberto-Fechado".
- "tipoDeLance": ex: "Menor Preço por Item", "Menor Preço Global", "Maior Desconto".
- "criterioJulgamento": ex: "Menor Preço", "Maior Desconto", "Técnica e Preço".
- "eppMe": ex: "Sim", "Não", "Empate Ficto".
- "difal": ex: "Sim", "Não", "Não mencionado".
- "plataforma": ex: "ComprasNet", "BNC", "Licitanet", "PNCP".

SCHEMA ESPERADO:
{
  "orgao": string,
  "uasg": string,
  "dataAbertura": string,
  "ambito": string,
  "cadastro": string,
  "abertura": string,
  "uf": string,
  "modoDisputa": string,
  "cidade": string,
  "empresas": string[],
  "analista": string,
  "tipoDeLance": string,
  "numeroEdital": string,
  "intervaloLances": string,
  "numeroProcesso": string,
  "criterioJulgamento": string,
  "plataforma": string,
  "eppMe": string,
  "adesao": string,
  "modalidade": string,
  "regionalidade": string,
  "esclarecimentoImpugnacao": string,
  "difal": string,
  "prazoEnvioProposta": string,
  "obs": string,
  "itens": [
    {
      "numero": number,
      "produto": string,
      "quantidade": number,
      "marca": string,
      "modelo": string,
      "fornecedor": string,
      "ncm": string,
      "valorReferencia": number,
      "valorReferenciaTotal": number,
      "precoCusto": number,
      "precoMinimo": number
    }
  ],
  "prazoEntrega": string,
  "tipoEntrega": "centralizada" | "descentralizada" | "nao_especifica",
  "tipoGarantia": "on-site" | "balcao" | "nao_especifica",
  "instalacao": "fornecedor" | "comprador" | "nao_especifica",
  "validadeProposta": string,
  "garantia": string,
  "prazoAceite": string,
  "prazoPagamento": string,
  "documentacoes": {
    "cnpj": boolean,
    "outrosDocumentos": string,
    "inscricaoEstadual": boolean,
    "certidaoFgts": boolean,
    "certidaoTributosFederais": boolean,
    "certidaoTributosEstaduais": boolean,
    "certidaoTributosMunicipais": boolean,
    "certidaoTrabalhista": boolean,
    "certidaoFalenciaRecuperacao": boolean,
    "contratoSocial": boolean,
    "docSocios": boolean,
    "balancos": boolean,
    "atestado": boolean,
    "alvara": boolean,
    "certidaoJunta": boolean,
    "certidaoUnificadaCgu": boolean,
    "inscricaoMunicipal": boolean,
    "garantiaProposta": boolean
  },
  "observacoes": string
}

EDITAL (Markdown):
`;
