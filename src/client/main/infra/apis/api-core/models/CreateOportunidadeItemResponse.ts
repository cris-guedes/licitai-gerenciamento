/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateOportunidadeItemResponse = {
  /**
   * Item criado no mesmo formato do workspace da oportunidade.
   */
  item: {
    /**
     * ID do item oficial do edital.
     */
    id: string;
    /**
     * ID do item operacional da oportunidade que gerencia este item do edital.
     */
    oportunidadeItemId: (string | null);
    /**
     * Numero sequencial do item no edital.
     */
    numeroItem: (number | null);
    /**
     * Descricao oficial do item no edital.
     */
    descricao: (string | null);
    /**
     * Tipo do item no edital, como material ou servico.
     */
    tipoItem: (string | null);
    /**
     * Identificacao do lote ao qual o item pertence, quando houver.
     */
    lote: (string | null);
    /**
     * Quantidade total solicitada no edital.
     */
    quantidadeTotal: (string | null);
    /**
     * Unidade de medida oficial do item no edital.
     */
    unidadeMedida: (string | null);
    /**
     * Valor unitario estimado pelo edital.
     */
    valorUnitarioEstimado: (string | null);
    /**
     * Valor total estimado pelo edital.
     */
    valorTotalEstimado: (string | null);
    /**
     * Codigo CATMAT ou CATSER informado pelo edital.
     */
    codigoCatmatCatser: (string | null);
    /**
     * Codigo NCM ou NBS informado pelo edital.
     */
    codigoNcmNbs: (string | null);
    /**
     * Criterio de julgamento do item no edital.
     */
    criterioJulgamentoItem: (string | null);
    /**
     * Beneficio tributario associado ao item, quando existir.
     */
    beneficioTributario: (string | null);
    /**
     * Observacoes oficiais do item no edital.
     */
    observacao: (string | null);
    /**
     * Indica se o item continua ativo para a proposta da empresa.
     */
    isSelected: boolean;
    /**
     * Status operacional do item dentro da oportunidade.
     */
    status: 'PENDING_PRICING' | 'READY_FOR_BID' | 'IN_BIDDING' | 'WON' | 'LOST' | 'DISCARDED';
    /**
     * Observacoes internas do time comercial para este item.
     */
    observacaoInterna: (string | null);
    /**
     * Item interno atualmente vinculado ao item do edital.
     */
    companyItem: ({
      /**
       * ID do item interno da empresa vinculado ao item do edital.
       */
      id: string;
      /**
       * Codigo interno do item da empresa.
       */
      codigo: string;
      /**
       * Descricao do item interno da empresa.
       */
      descricao: string;
      /**
       * Marca comercial do item interno, quando informada.
       */
      marca: (string | null);
      /**
       * Unidade de medida do item interno.
       */
      unidadeMedida: string;
      /**
       * URL da imagem do item interno, quando disponivel.
       */
      imageUrl: (string | null);
      /**
       * Preco de referencia atualmente salvo no catalogo interno.
       */
      precoReferencia: (string | null);
      /**
       * Indica se o item interno está ativo no catalogo da empresa.
       */
      ativo: boolean;
      /**
       * Data ISO da ultima atualizacao do item interno.
       */
      updatedAt: string;
    } | null);
    /**
     * Dados de precificacao salvos para este item da oportunidade.
     */
    pricing: ({
      /**
       * ID da configuracao de precificacao do item da oportunidade.
       */
      id: string;
      /**
       * Quantidade efetivamente considerada para a proposta.
       */
      quantidadeCotada: (string | null);
      /**
       * Quantidade adicional prevista para adesao, quando aplicavel.
       */
      quantidadeAdesao: (string | null);
      /**
       * Preco unitario ofertado pela empresa.
       */
      precoOfertaUnitario: (string | null);
      /**
       * Preco total calculado para a oferta do item.
       */
      precoOfertaTotal: (string | null);
      /**
       * Custo unitario congelado para a precificacao desta oportunidade.
       */
      custoUnitarioSnapshot: (string | null);
      /**
       * Valor minimo definido internamente para a fase de lances.
       */
      valorMinimoLance: (string | null);
      /**
       * Marca efetivamente ofertada para este item.
       */
      ofertaMarca: (string | null);
      /**
       * Modelo efetivamente ofertado para este item.
       */
      ofertaModelo: (string | null);
      /**
       * Descricao da garantia comercial prometida para este item.
       */
      garantiaDescricao: (string | null);
    } | null);
    /**
     * Dados correntes da fase de disputa do item.
     */
    disputa: ({
      /**
       * ID do registro operacional da disputa do item.
       */
      id: string;
      /**
       * Ultimo lance registrado pela empresa para o item.
       */
      ultimoLance: (string | null);
      /**
       * Data ISO do ultimo lance informado.
       */
      dataUltimoLance: (string | null);
      /**
       * Situacao textual resumida da disputa do item.
       */
      situacaoDisputa: (string | null);
      /**
       * Observacoes operacionais da fase de disputa.
       */
      observacaoOperacional: (string | null);
    } | null);
  };
};

