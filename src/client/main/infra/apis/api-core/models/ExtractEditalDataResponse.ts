/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExtractEditalDataResponse = {
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
      itensSolicitados: null;
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
        itensSolicitados: null;
      }>;
      cronograma: {
        acolhimentoInicio: (string | null);
        acolhimentoFim: (string | null);
        horaLimite: (string | null);
        sessaoPublica: (string | null);
        horaSessaoPublica: (string | null);
        esclarecimentosAte: (string | null);
        impugnacaoAte: (string | null);
      };
      certame: {
        modoDisputa: (string | null);
        criterioJulgamento: (string | null);
        tipoLance: ('unitario' | 'global' | 'percentual' | null);
        intervaloLances: (string | null);
        duracaoSessaoMinutos: (number | null);
        exclusivoMeEpp: (boolean | null);
        permiteConsorcio: (boolean | null);
        exigeVisitaTecnica: (boolean | null);
        permiteAdesao: (boolean | null);
        percentualAdesao: (number | null);
        regionalidade: (string | null);
        difal: (boolean | null);
        vigenciaAtaMeses: (number | null);
        vigenciaContratoDias: (number | null);
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
          localEntrega: (string | null);
          tipoEntrega: ('centralizada' | 'descentralizada' | null);
          responsavelInstalacao: ('fornecedor' | 'comprador' | null);
        };
        pagamento: {
          prazoEmDias: (number | null);
        };
        aceite: {
          prazoEmDias: (number | null);
        };
        validadeProposta: (number | null);
        garantia: {
          tipo: ('onsite' | 'balcao' | 'sem_garantia' | 'remota' | null);
          meses: (number | null);
          tempoAtendimentoHoras: (number | null);
        };
      };
      habilitacao: Array<{
        tipo: string;
        categoria: string;
        obrigatorio: boolean;
      }>;
      informacaoComplementar: (string | null);
    } | null);
  };
  metrics: {
    sessionId: string;
    timestamp: string;
    pdfFilename: string;
    pdfFileSizeBytes: number;
    totalWords: number;
    entriesIndexed: number;
    itemsExtracted: number;
    totalTimeMs: number;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
    embeddingTokensUsed: number;
    chunksEnviados: {
      agenteCampos: number;
      agenteItens: number;
    };
    artifacts: {
      directory: string;
      originalPdf: string;
      pdfProcessingResponse: string;
      aiInputs: string;
      extractionResult: string;
      metrics: string;
    };
    steps: {
      orchestration: {
        label: string;
        totalTimeMs: number;
        steps: Array<{
          id: string;
          label: string;
          timeMs: number;
          details: Array<{
            label: string;
            value: string;
          }>;
        }>;
      };
      info: {
        label: string;
        totalTimeMs: number;
        steps: Array<{
          id: string;
          label: string;
          timeMs: number;
          details: Array<{
            label: string;
            value: string;
          }>;
        }>;
      };
      items: {
        label: string;
        totalTimeMs: number;
        steps: Array<{
          id: string;
          label: string;
          timeMs: number;
          details: Array<{
            label: string;
            value: string;
          }>;
        }>;
      };
    };
  };
};
