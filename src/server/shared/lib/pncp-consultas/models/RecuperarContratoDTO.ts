/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Categoria } from './Categoria';
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
import type { TipoContrato } from './TipoContrato';
export type RecuperarContratoDTO = {
  numeroControlePncpCompra?: string;
  codigoPaisFornecedor?: string;
  dataAtualizacao?: string;
  usuarioNome?: string;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  niFornecedor?: string;
  tipoPessoa?: 'PJ' | 'PF' | 'PE';
  processo?: string;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  nomeRazaoSocialFornecedor?: string;
  informacaoComplementar?: string;
  numeroContratoEmpenho?: string;
  categoriaProcesso?: Categoria;
  anoContrato?: number;
  tipoContrato?: TipoContrato;
  sequencialContrato?: number;
  dataPublicacaoPncp?: string;
  niFornecedorSubContratado?: string;
  nomeFornecedorSubContratado?: string;
  dataAtualizacaoGlobal?: string;
  numeroControlePNCP?: string;
  receita?: boolean;
  numeroParcelas?: number;
  numeroRetificacao?: number;
  tipoPessoaSubContratada?: 'PJ' | 'PF' | 'PE';
  objetoContrato?: string;
  valorInicial?: number;
  valorParcela?: number;
  valorGlobal?: number;
  valorAcumulado?: number;
  identificadorCipi?: string;
  urlCipi?: string;
};

