/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecuperarFornecedorDTO } from './RecuperarFornecedorDTO';
import type { RecuperarOrgaoEntidadeDTO } from './RecuperarOrgaoEntidadeDTO';
import type { RecuperarUnidadeOrgaoDTO } from './RecuperarUnidadeOrgaoDTO';
export type RecuperarTermoContratoDTO = {
  tipoTermoContratoNome?: string;
  unidade?: RecuperarUnidadeOrgaoDTO;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  dataAtualizacao?: string;
  fornecedor?: RecuperarFornecedorDTO;
  niFornecedor?: string;
  tipoPessoa?: 'PJ' | 'PF' | 'PE';
  fornecedorSubContratado?: RecuperarFornecedorDTO;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  dataInclusao?: string;
  dataPublicacaoPncp?: string;
  informacaoComplementar?: string;
  processo?: string;
  nomeRazaoSocialFornecedor?: string;
  sequencialTermoContrato?: number;
  numeroTermoContrato?: string;
  unidadeSubrogada?: RecuperarUnidadeOrgaoDTO;
  tipoPessoaSubContratada?: 'PJ' | 'PF' | 'PE';
  numeroParcelas?: number;
  niFornecedorSubContratado?: string;
  qualificacaoAcrescimoSupressao?: boolean;
  qualificacaoVigencia?: boolean;
  qualificacaoFornecedor?: boolean;
  qualificacaoReajuste?: boolean;
  prazoAditadoDias?: number;
  informativoObservacao?: string;
  orgaoSubrogado?: RecuperarOrgaoEntidadeDTO;
  objetoTermoContrato?: string;
  fundamentoLegal?: string;
  valorAcrescido?: number;
  valorParcela?: number;
  nomeFornecedorSubContratado?: string;
  valorGlobal?: number;
};

