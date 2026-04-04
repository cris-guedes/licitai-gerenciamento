/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ApproveEditalAnalysisResponse = {
  id: string;
  orgId: string;
  companyId: string;
  editalId: string;
  version: number;
  status: string;
  approvedAt: (string | null);
  approvedById: (string | null);
  editalNumber: (string | null);
  portal: (string | null);
  sphere: (string | null);
  state: (string | null);
  object: (string | null);
  modality: (string | null);
  contractType: (string | null);
  editalUrl: (string | null);
  estimatedValue: (number | null);
  publicationDate: (string | null);
  openingDate: (string | null);
  proposalDeadline: (string | null);
  processNumber: (string | null);
  uasg: (string | null);
  proposalDeadlineTime: (string | null);
  bidInterval: (number | null);
  judgmentCriteria: (string | null);
  disputeMode: (string | null);
  proposalValidityDays: (number | null);
  clarificationDeadline: (string | null);
  regionality: (string | null);
  exclusiveSmallBusiness: (boolean | null);
  allowsAdhesion: (boolean | null);
  extractedRules: null;
  extractedLogistics: null;
  extractedRequiredDocuments: null;
  extractedManagingAgencies: null;
  extractedParticipatingAgencies: null;
  documentIds: Array<string>;
  createdAt: string;
  updatedAt: string;
};

