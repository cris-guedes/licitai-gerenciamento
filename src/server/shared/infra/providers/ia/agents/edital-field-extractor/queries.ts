/**
 * Mapeamento temático de queries para busca vetorial.
 * Cada grupo foca em áreas específicas do esquema de extração (Zod).
 */
export const EDITAL_SEARCH_MAP = {
    identificacao: [
        "Edital Pregão Eletrônico nº",
        "Processo Administrativo nº",
        "Identificação do Órgão e Unidade",
        "Objeto da licitação serviço e aquisição",
        "Objeto da contratação prestação de serviços fornecimento descrição detalhada",
    ],
    entidade: [
        "Órgão Contratante Ente Público CNPJ",
        "MUNICÍPIO PREFEITURA EMPRESA FUNDAÇÃO SECRETARIA",
        "Unidade Gerenciadora Código do Órgão UASG",
        "Portal de compras link endereço eletrônico",
        "Razão Social nome oficial CNPJ endereço sede contratante",
        "CONTRATANTE inscrito CNPJ representado doravante denominado",
    ],
    financeiro: [
        "Valor estimado total da contratação R$",
        "Preço de referência teto máximo global Lote",
        "Dotação orçamentária recursos financeiros fonte",
        "DIFAL Diferencial de Alíquota retenção impostos tributos ICMS",
    ],
    disputa: [
        "Data e hora da sessão pública abertura",
        "Recebimento das propostas data limite envio",
        "Critério de julgamento menor preço maior desconto",
        "Modo de disputa aberto fechado",
        "Intervalo mínimo de diferença entre os lances R$",
        "Tipo de lance unitário global percentual desconto",
        "Duração da sessão pública minutos",
    ],
    regras: [
        "Benefícios da Lei Complementar 123 ME EPP exclusivo",
        "TIPO DE PARTICIPAÇÃO licitação ME EPP MEI ampla concorrência",
        "Itens Lotes destinados participação exclusivamente MEI ME EPP valor 80000",
        "reserva de cota 25 por cento microempresa empresa pequeno porte",
        "prioridade contratação MEI ME EPP sediadas local regionalmente 10 por cento",
        "entidades empresariais reunidas em consórcio impedidas não poderão participar",
        "Participação de empresas em consórcio cooperativas permitida",
        "Possibilidade de adesão à Ata de Registro de Preços carona",
        "Esclarecimentos pedidos prazo dias úteis antes abertura",
        "impugnação até dias úteis antes abertura certame pregão",
    ],
    prazos: [
        "Prazo de entrega dias contados do empenho recebimento",
        "prazo máximo para entrega do objeto fornecimento contratado dias corridos",
        "Condições de pagamento trinta dias após o atesto nota fiscal",
        "pagamento será efetuado em até dias corridos úteis",
        "pagamento mensal crédito em conta bancária vencimento prazo apresentação nota fiscal",
        "Prazo de validade da proposta dias abertura",
        "Vigência da Ata de Registro de Preços meses percentual limite adesão carona",
        "Vigência do contrato de execução dias",
        "prazo para aceite recebimento definitivo atesto conformidade",
        "Vigência contrato meses prorrogação anos limite",
        "Início execução serviços dias úteis após assinatura contrato ordem fornecimento",
    ],
    habilitacao: [
        "Documentação de habilitação regularidade fiscal FGTS",
        "Inscrição no Cadastro Nacional de Pessoas Jurídicas CNPJ",
        "Certidão negativa de falência ou recuperação judicial",
        "Qualificação técnica atestados de capacidade",
        "Qualificação econômica balanço patrimonial",
        "Habilitação jurídica ato constitutivo contrato social",
        "Certidão Negativa Débitos Federais Estaduais Municipais INSS SRF",
        "Certidão Negativa Débitos Trabalhistas CNDT",
        "Alvará de funcionamento licença sanitária farmácia drogaria",
        "Responsável técnico farmacêutico CRF registro conselho",
        "Regularidade fiscal certidão negativa tributos",
        "Documentos necessários habilitação jurídica fiscal técnica econômica exigidos",
    ],
    logistica: [
        "Local de execução entrega endereço almoxarifado",
        "entrega centralizada descentralizada unidades locais",
        "instalação montagem responsável fornecedor comprador",
        "Garantia do serviço assistência técnica prazo meses garantia contratual",
        "SLA tempo de atendimento em horas solução do problema reparo SLA",
        "Visita técnica obrigatória facultativa vistoria",
        "Endereço local prestação serviço Rua Bairro CEP cidade",
    ],
    anexos: [
        "ANEXO I Termo de Referência Projeto Básico",
        "Minuta da Ata de Registro de Preços Contrato",
    ]
};

/**
 * Lista consolidada para o Agente de Busca.
 */
export const EDITAL_SEARCH_QUERIES = Object.values(EDITAL_SEARCH_MAP).flat();
