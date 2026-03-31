/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Categoria } from './Categoria';
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
import type { TipoContrato } from './TipoContrato';
export type RecuperarContratoDTO = {
  anoContrato?: number;
  tipoContrato?: TipoContrato;
  numeroContratoEmpenho?: string;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  dataAtualizacao?: string;
  niFornecedor?: string;
  tipoPessoa?: 'PJ' | 'PF' | 'PE';
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  categoriaProcesso?: Categoria;
  dataPublicacaoPncp?: string;
  informacaoComplementar?: string;
  sequencialContrato?: number;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  processo?: string;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  nomeRazaoSocialFornecedor?: string;
  tipoPessoaSubContratada?: 'PJ' | 'PF' | 'PE';
  numeroRetificacao?: number;
  numeroParcelas?: number;
  niFornecedorSubContratado?: string;
  receita?: boolean;
  numeroControlePNCP?: string;
  valorParcela?: number;
  objetoContrato?: string;
  valorInicial?: number;
  nomeFornecedorSubContratado?: string;
  urlCipi?: string;
  identificadorCipi?: string;
  dataAtualizacaoGlobal?: string;
  valorAcumulado?: number;
  valorGlobal?: number;
  usuarioNome?: string;
  codigoPaisFornecedor?: string;
  numeroControlePncpCompra?: string;
};

