/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LicitacaoListItem = {
  id: string;
  orgId: string;
  companyId: string;
  editalNumber: (string | null);
  portal: (string | null);
  sphere: (string | null);
  state: (string | null);
  object: (string | null);
  modality: (string | null);
  contractType: (string | null);
  estimatedValue: (number | null);
  publicationDate: (string | null);
  openingDate: (string | null);
  proposalDeadline: (string | null);
  editalUrl: (string | null);
  createdAt: string;
  updatedAt: string;
  tender: ({
    id: string;
    status: (string | null);
    phase: (string | null);
  } | null);
};

