/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchExternalProcurementAtasResponse = {
  atas: Array<{
    numeroAtaRegistroPreco?: string;
    anoAta?: number;
    sequencialAta?: number;
    numeroControlePNCP?: string;
    objetoCompra?: string;
    dataAssinatura?: string;
    dataVigenciaInicio?: string;
    dataVigenciaFim?: string;
    dataCancelamento?: (string | null);
    cancelado?: boolean;
    dataPublicacaoPncp?: string;
  }>;
};

