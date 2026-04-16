/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExtractEditalDataStreamResponse = {
  sessionId: string;
  mdContent: string;
  licitacao: {
    numeroLicitacao: (string | null);
    ano: (number | null);
    processo: (string | null);
    modalidade: (string | null);
    objeto: (string | null);
    orgaoGerenciador: ({
      cnpj: (string | null);
      nome: (string | null);
      codigoUnidade: (string | null);
      nomeUnidade: (string | null);
      municipio: (string | null);
      uf: (string | null);
      esfera: ('federal' | 'estadual' | 'municipal' | null);
      poder: ('executivo' | 'legislativo' | 'judiciario' | null);
      textoOriginal: (string | null);
    } | null);
    valorTotalEstimado: (number | null);
    srp: (boolean | null);
    valorTotalHomologado: (number | null);
    situacao: (string | null);
    dataPublicacao: (string | null);
    dataUltimaAtualizacao: (string | null);
    linkProcesso: (string | null);
    identificadorExterno: (string | null);
    edital: ({
      amparoLegal: (string | null);
      orgaosParticipantes: Array<{
        cnpj: (string | null);
        nome: (string | null);
        codigoUnidade: (string | null);
        nomeUnidade: (string | null);
        municipio: (string | null);
        uf: (string | null);
        esfera: ('federal' | 'estadual' | 'municipal' | null);
        poder: ('executivo' | 'legislativo' | 'judiciario' | null);
        textoOriginal: (string | null);
      }>;
      cronograma: {
        acolhimentoInicio: (string | null);
        acolhimentoFim: (string | null);
        horaLimite: (string | null);
        sessaoPublica: (string | null);
        esclarecimentosAte: (string | null);
        textoOriginal: (string | null);
      };
      certame: {
        modoDisputa: (string | null);
        criterioJulgamento: (string | null);
        tipoInstrumento: (string | null);
        intervaloLances: (string | null);
        exclusivoMeEpp: (boolean | null);
        permiteAdesao: (boolean | null);
        percentualAdesao: (number | null);
        regionalidade: (string | null);
        difal: (boolean | null);
        textoOriginal: (string | null);
      };
      itens: Array<{
        numero: (number | null);
        descricao: (string | null);
        tipo: ('material' | 'servico' | null);
        lote: (string | null);
        quantidade: (number | null);
        unidadeMedida: (string | null);
        valorUnitarioEstimado: (number | null);
        valorTotal: (number | null);
        codigoNcmNbs: (string | null);
        descricaoNcmNbs: (string | null);
        codigoCatmatCatser: (string | null);
        criterioJulgamento: (string | null);
        beneficioTributario: (string | null);
        observacao: (string | null);
      }>;
      execucao: {
        entrega: {
          prazoEmDias: (number | null);
          textoOriginal: (string | null);
          localEntrega: (string | null);
          tipoEntrega: ('centralizada' | 'descentralizada' | null);
          responsavelInstalacao: ('fornecedor' | 'comprador' | null);
        };
        pagamento: {
          prazoEmDias: (number | null);
          textoOriginal: (string | null);
        };
        aceite: {
          prazoEmDias: (number | null);
          textoOriginal: (string | null);
        };
        validadeProposta: (number | null);
        garantia: {
          tipo: ('onsite' | 'balcao' | 'sem_garantia' | 'remota' | null);
          meses: (number | null);
          tempoAtendimentoHoras: (number | null);
          textoOriginal: (string | null);
        };
      };
      habilitacao: Array<{
        tipo: string;
        categoria: string;
        obrigatorio: boolean;
      }>;
      informacaoComplementar: (string | null);
      textoOriginal: (string | null);
    } | null);
  };
  metrics: {
    sessionId: string;
    timestamp: string;
    pdfUrl: string;
    pdfFilename: string;
    pdfFileSizeBytes: number;
    totalChars: number;
    totalWords: number;
    totalTables: number;
    entriesIndexed: number;
    conversionTimeMs: number;
    indexingTimeMs: number;
    extractionTimeMs: number;
    totalTimeMs: number;
    tempDir: string;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
    config?: {
      embeddingModel: string;
      aiModel: string;
      fileParser: string;
      extractionMode: string;
      totalQueries: number;
    };
  };
};

