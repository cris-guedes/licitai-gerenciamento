"use client"

import { useState, useCallback } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type { UploadEditalDocumentResponse } from "@/client/main/infra/apis/api-core/models/UploadEditalDocumentResponse"

export type LicitacaoDocumentType = "EDITAL" | "ANEXO" | "OUTRO"
export type LicitacaoDocumentProcessingStatus = "AWAITING_UPLOAD" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED"

export type LicitacaoDraftPreview = {
  source: "first_page_agent"
  sourceDocumentId: string
  sourcePage: 1
  extractedAt: string
  displayName: string | null
  orgaoNome: string | null
  modalidade: string | null
  numero: string | null
  objetoResumo: string | null
  dataAbertura: string | null
}

export type UploadLicitacaoDocumentResponse = {
  oportunidadeId: string
  oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED"
  licitacaoId: string | null
  licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
  editalId: string | null
  editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
  documentId: string
  documentType: LicitacaoDocumentType
  displayName: string | null
  originalName: string
  mimeType: string
  sizeBytes: number
  status: "PROCESSING" | "READY" | "FAILED"
  documentUrl: string
  previewUrl: string
  previewUrlExpiresAt: string
  uploadedAt: string
  draftPreview: LicitacaoDraftPreview | null
}

export type UploadLicitacaoDocumentProgressEvent = {
  type: "progress"
  step: string
  message: string
  percent: number
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
  context?: {
    oportunidadeId: string
    licitacaoId: string | null
    editalId: string | null
    documentId: string
    documentType: LicitacaoDocumentType
  }
}

export type UploadLicitacaoDocumentDoneEvent = {
  type: "done"
  step: "done"
  message: string
  percent: number
  status: "READY"
  result: UploadLicitacaoDocumentResponse
}

export type UploadLicitacaoDocumentErrorEvent = {
  type: "error"
  step: "error"
  message: string
  percent: number
  status: "FAILED"
}

export type UploadLicitacaoDocumentEvent =
  | UploadLicitacaoDocumentProgressEvent
  | UploadLicitacaoDocumentDoneEvent
  | UploadLicitacaoDocumentErrorEvent

export type DeleteLicitacaoDocumentResponse = {
  documentId: string
  deleted: true
}

export type DeleteLicitacaoDraftResponse = {
  oportunidadeId: string
  deletedDocuments: number
  deleted: true
}

export type FinalizeOportunidadeRegistrationPayload = {
  numeroLicitacao: string
  ano: string
  processo: string
  modalidade: string
  objeto: string
  orgaoGerenciador: {
    cnpj: string
    nome: string
    codigoUnidade: string
    nomeUnidade: string
    municipio: string
    uf: string
    esfera: string
    poder: string
    itensSolicitados: Array<{
      itemId: string
      quantidade: string
    }>
  }
  valorTotalEstimado: string
  valorTotalHomologado: string
  srp: string
  situacao: string
  dataPublicacao: string
  dataUltimaAtualizacao: string
  linkProcesso: string
  identificadorExterno: string
  edital: {
    amparoLegal: string
    orgaosParticipantes: Array<{
      cnpj: string
      nome: string
      codigoUnidade: string
      nomeUnidade: string
      municipio: string
      uf: string
      esfera: string
      poder: string
      itensSolicitados: Array<{
        itemId: string
        quantidade: string
      }>
    }>
    cronograma: {
      acolhimentoInicio: string
      acolhimentoFim: string
      horaLimite: string
      sessaoPublica: string
      horaSessaoPublica: string
      esclarecimentosAte: string
      impugnacaoAte: string
    }
    certame: {
      modoDisputa: string
      criterioJulgamento: string
      tipoLance: string
      intervaloLances: string
      duracaoSessaoMinutos: string
      exclusivoMeEpp: string
      permiteConsorcio: string
      exigeVisitaTecnica: string
      regionalidade: string
      permiteAdesao: string
      percentualAdesao: string
      vigenciaAtaMeses: string
      vigenciaContratoDias: string
      difal: string
    }
    itens: Array<{
      itemId: string
      numero: string
      descricao: string
      tipo: string
      lote: string
      quantidade: string
      unidadeMedida: string
      valorUnitarioEstimado: string
      valorTotal: string
      codigoNcmNbs: string
      descricaoNcmNbs: string
      codigoCatmatCatser: string
      criterioJulgamento: string
      beneficioTributario: string
      observacao: string
    }>
    execucao: {
      entrega: {
        prazoEmDias: string
        localEntrega: string
        tipoEntrega: string
        responsavelInstalacao: string
      }
      pagamento: {
        prazoEmDias: string
      }
      aceite: {
        prazoEmDias: string
      }
      validadeProposta: string
      garantia: {
        tipo: string
        meses: string
        tempoAtendimentoHoras: string
      }
    }
    habilitacao: Array<{
      tipo: string
      categoria: string
      obrigatorio: string
    }>
    informacaoComplementar: string
  }
}

export type FinalizeOportunidadeRegistrationResponse = {
  oportunidadeId: string
  oportunidadeStatus: "ACTIVE"
  licitacaoId: string
  licitacaoStatus: "COMPLETED"
  editalId: string
  editalStatus: "COMPLETED"
}

export type LicitacaoDraftSummary = {
  oportunidadeId: string
  oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED"
  licitacaoId: string | null
  licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
  editalId: string | null
  editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
  primaryDocumentName: string | null
  primaryDocumentType: LicitacaoDocumentType | null
  draftPreview: LicitacaoDraftPreview | null
  documentCount: number
  readyDocuments: number
  processingDocuments: number
  failedDocuments: number
  createdAt: string
  updatedAt: string
}

export type ListLicitacaoDraftsResponse = {
  drafts: LicitacaoDraftSummary[]
}

export type LicitacaoWorkspaceDocumentAnalysis = {
  id: string
  type: "EXTRACT_EDITAL" | "SUMMARY"
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  markdownContent: string | null
  result: unknown
  metrics: unknown
  errorMessage: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type LicitacaoWorkspaceDocument = {
  id: string
  type: LicitacaoDocumentType
  displayName: string | null
  originalName: string
  mimeType: string
  sizeBytes: number
  status: "PROCESSING" | "READY" | "FAILED"
  documentUrl: string
  previewUrl: string
  previewUrlExpiresAt: string
  uploadedAt: string
  analyses: LicitacaoWorkspaceDocumentAnalysis[]
}

export type LicitacaoWorkspaceResponse = {
  oportunidade: {
    id: string
    status: "DRAFT" | "ACTIVE" | "CANCELLED"
    draftPreview: LicitacaoDraftPreview | null
    createdAt: string
    updatedAt: string
  }
  licitacao: {
    id: string | null
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
    draftPreview: LicitacaoDraftPreview | null
    createdAt: string
    updatedAt: string
  }
  edital: {
    id: string
    status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
    createdAt: string
    updatedAt: string
  } | null
  documents: LicitacaoWorkspaceDocument[]
}

export type WorkflowNodeKind = {
  id: string
  key: string
  label: string
  description: string | null
  order: number
  parentKindId: string | null
  color: string | null
  metadata: unknown
  createdAt: string
  updatedAt: string
}

export type WorkflowNode = {
  id: string
  kindId: string
  parentId: string | null
  key: string
  label: string
  description: string | null
  order: number
  depth: number
  path: string
  color: string | null
  isInitial: boolean
  isTerminal: boolean
  metadata: unknown
  createdAt: string
  updatedAt: string
  kind: {
    id: string
    key: string
    label: string
    order: number
    parentKindId: string | null
    color: string | null
  }
}

export type WorkflowTransition = {
  id: string
  fromNodeId: string
  toNodeId: string
  transitionType: string | null
  metadata: unknown
  createdAt: string
  updatedAt: string
}

export type CompanyWorkflowResponse = {
  workflow: {
    id: string
    companyId: string
    name: string
    slug: string
    version: number
    isActive: boolean
    metadata: unknown
    createdAt: string
    updatedAt: string
    nodeKinds: WorkflowNodeKind[]
    nodes: WorkflowNode[]
    transitions: WorkflowTransition[]
  }
}

export type UpdateCompanyWorkflowNodeResponse = CompanyWorkflowResponse

export type OportunidadeBoardNode = {
  id: string
  key: string
  label: string
  color: string | null
  path: string
  isInitial: boolean
  isTerminal: boolean
}

export type OportunidadeBoardItem = {
  oportunidadeId: string
  oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED"
  licitacaoId: string | null
  editalId: string | null
  workflowDefinitionId: string | null
  title: string
  numero: string | null
  modalidade: string | null
  objetoResumo: string | null
  valorEstimado: string | null
  orgaoNome: string | null
  responsavel: {
    id: string
    name: string
    email: string
  } | null
  workflow: {
    currentNode: OportunidadeBoardNode | null
    phase: OportunidadeBoardNode | null
    status: OportunidadeBoardNode | null
    situation: OportunidadeBoardNode | null
    updatedAt: string | null
  }
  itemCount: number
  createdAt: string
  updatedAt: string
  canMove: boolean
}

export type ListOportunidadesBoardResponse = {
  items: OportunidadeBoardItem[]
  total: number
  columnSummaries: Array<{
    phaseNodeId: string
    itemCount: number
    valorEstimadoTotal: string
  }>
  filterOptions: {
    responsaveis: Array<{
      id: string
      name: string
      email: string
    }>
    situations: Array<{
      id: string
      label: string
    }>
    valueRange: {
      min: string | null
      max: string | null
    }
  }
}

export type MoveOportunidadeWorkflowResponse = {
  item: OportunidadeBoardItem
}

export type UpdateOportunidadeBoardItemResponse = {
  item: OportunidadeBoardItem
}

export type TeamMemberOption = {
  membershipId: string
  userId: string
  name: string
  email: string
  role: string
  createdAt: string
}

export type ListTeamMembersResponse = {
  members: TeamMemberOption[]
}

type ExtractedItem = NonNullable<NonNullable<ExtractEditalDataResponse["licitacao"]["edital"]>["itens"]>[number]

type PartialExtractionResponse = Pick<ExtractEditalDataResponse, "sessionId" | "mdContent" | "licitacao">

type ProgressEvent = {
  type?: "progress"
  scope?: "info" | "items" | "orchestration"
  step: string
  message: string
  percent: number
  pipelinePercent?: number
}

type PartialInfoEvent = {
  type: "partial_info"
  scope: "info"
  step: string
  message: string
  percent: number
  pipelinePercent: number
  partialItemsCount: number
  result: PartialExtractionResponse
}

type PartialItemsBatchEvent = {
  type: "partial_items_batch"
  scope: "items"
  step: string
  message: string
  percent: number
  pipelinePercent: number
  batch: {
    batchIndex: number
    totalBatches: number
    completedBatches: number
    batchTimeMs: number
    batchPayloadCount: number
    batchPayloadChars: number
    batchItems: ExtractedItem[]
    cumulativeItems: ExtractedItem[]
    cumulativeItemsCount: number
  }
  result: PartialExtractionResponse
}

type DoneEvent = {
  type: "done"
  step: "done"
  message: string
  percent: number
  result: ExtractEditalDataResponse
}

type ErrorEvent = {
  type: "error"
  step: "error"
  message: string
  percent: number
}

type StreamEvent = ProgressEvent | PartialInfoEvent | PartialItemsBatchEvent | DoneEvent | ErrorEvent

export type ExtractionPipelineProgress = {
  percent: number
  step: string
  message: string
  completed: boolean
  completedBatches: number
  totalBatches: number
  extractedItems: number
}

export type ExtractionProgressState = {
  info: ExtractionPipelineProgress
  items: ExtractionPipelineProgress
  orchestrationMessage: string
}

export type PartialExtractionPreview = {
  sessionId: string | null
  partialResponse: PartialExtractionResponse | null
  infoReady: boolean
  items: ExtractedItem[]
  completedBatches: number
  totalBatches: number
  lastBatchItems: ExtractedItem[]
}

function createInitialPipelineProgress(message: string): ExtractionPipelineProgress {
  return {
    percent: 0,
    step: "",
    message,
    completed: false,
    completedBatches: 0,
    totalBatches: 0,
    extractedItems: 0,
  }
}

function createInitialProgressState(): ExtractionProgressState {
  return {
    info: createInitialPipelineProgress("Aguardando início da extração de informações."),
    items: createInitialPipelineProgress("Aguardando início da extração de itens."),
    orchestrationMessage: "Aguardando upload do edital.",
  }
}

function createInitialPreviewState(): PartialExtractionPreview {
  return {
    sessionId: null,
    partialResponse: null,
    infoReady: false,
    items: [],
    completedBatches: 0,
    totalBatches: 0,
    lastBatchItems: [],
  }
}

function parseEventBlock<TEvent>(block: string): TEvent | null {
  const data = block
    .split(/\r?\n/)
    .filter(line => line.startsWith("data:"))
    .map(line => line.slice(5).trim())
    .join("\n")

  if (!data) return null
  return JSON.parse(data) as TEvent
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 20000,
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("A requisição demorou demais para responder. Tente novamente em instantes.")
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeStreamError(error: unknown, fallbackMessage: string): Error {
  const err = toError(error)

  if (/input stream/i.test(err.message) || /stream.+terminated/i.test(err.message) || /networkerror/i.test(err.message)) {
    const normalizedError = new Error(fallbackMessage)
    Object.defineProperty(normalizedError, "cause", {
      value: err,
      enumerable: false,
    })
    return normalizedError
  }

  return err
}

function normalizeExtractionStreamError(error: unknown): Error {
  return normalizeStreamError(
    error,
    "A conexão da extração foi interrompida antes da conclusão. Vamos tentar recuperar o resultado salvo no workspace.",
  )
}

function normalizeUploadStreamError(error: unknown): Error {
  return normalizeStreamError(
    error,
    "A conexão do upload foi interrompida durante o processamento do documento. Tente novamente em alguns instantes.",
  )
}

function createUploadTraceId() {
  const randomId = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

  return `upload-${Date.now()}-${randomId}`
}

function logUploadDebug(traceId: string, message: string, data?: Record<string, unknown>) {
  console.debug(`[UploadLicitacaoDocument:${traceId}] ${message}`, data ?? {})
}

function describeError(error: unknown) {
  const err = toError(error)

  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    cause: err.cause,
  }
}

function logUploadFailure(traceId: string, originalError: unknown, normalizedError: Error) {
  console.warn(`[UploadLicitacaoDocument:${traceId}] request.failed`, {
    original: describeError(originalError),
    normalized: describeError(normalizedError),
  })
}

export function useLicitacaoService(_api: CoreApiClient) {
  const listDrafts = useCallback(async ({
    companyId,
  }: {
    companyId: string
  }): Promise<ListLicitacaoDraftsResponse> => {
    const res = await fetch(`/api/core/list-licitacao-drafts?companyId=${encodeURIComponent(companyId)}`, {
      method: "GET",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao listar rascunhos`)
    }

    return await res.json()
  }, [])

  const getWorkspace = useCallback(async ({
    companyId,
    oportunidadeId,
  }: {
    companyId: string
    oportunidadeId: string
  }): Promise<LicitacaoWorkspaceResponse> => {
    const query = new URLSearchParams({
      companyId,
      oportunidadeId,
    })

    const res = await fetchWithTimeout(`/api/core/get-licitacao-workspace?${query.toString()}`, {
      method: "GET",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao recuperar o workspace`)
    }

    return await res.json()
  }, [])

  const getCompanyWorkflow = useCallback(async ({
    companyId,
  }: {
    companyId: string
  }): Promise<CompanyWorkflowResponse> => {
    const res = await fetch(`/api/core/get-company-workflow?companyId=${encodeURIComponent(companyId)}`, {
      method: "GET",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao carregar o workflow da empresa`)
    }

    return await res.json()
  }, [])

  const listTeamMembers = useCallback(async ({
    organizationId,
  }: {
    organizationId: string
  }): Promise<ListTeamMembersResponse> => {
    const res = await fetch(`/api/core/team/list-members?organizationId=${encodeURIComponent(organizationId)}`, {
      method: "GET",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao carregar responsáveis`)
    }

    return await res.json()
  }, [])

  const listOportunidadesBoard = useCallback(async ({
    companyId,
    workflowNodeIds,
    currentPhaseNodeId,
    currentStatusNodeId,
    currentSituationNodeId,
    responsavelUserId,
    valorEstimadoMin,
    valorEstimadoMax,
    q,
  }: {
    companyId: string
    workflowNodeIds?: string[]
    currentPhaseNodeId?: string
    currentStatusNodeId?: string
    currentSituationNodeId?: string
    responsavelUserId?: string
    valorEstimadoMin?: number
    valorEstimadoMax?: number
    q?: string
  }): Promise<ListOportunidadesBoardResponse> => {
    const query = new URLSearchParams({ companyId })

    for (const workflowNodeId of workflowNodeIds ?? []) query.append("workflowNodeIds", workflowNodeId)
    if (currentPhaseNodeId) query.set("currentPhaseNodeId", currentPhaseNodeId)
    if (currentStatusNodeId) query.set("currentStatusNodeId", currentStatusNodeId)
    if (currentSituationNodeId) query.set("currentSituationNodeId", currentSituationNodeId)
    if (responsavelUserId) query.set("responsavelUserId", responsavelUserId)
    if (valorEstimadoMin !== undefined) query.set("valorEstimadoMin", String(valorEstimadoMin))
    if (valorEstimadoMax !== undefined) query.set("valorEstimadoMax", String(valorEstimadoMax))
    if (q?.trim()) query.set("q", q.trim())

    const res = await fetch(`/api/core/list-oportunidades-board?${query.toString()}`, {
      method: "GET",
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao carregar o board de oportunidades`)
    }

    return await res.json()
  }, [])

  const moveOportunidadeWorkflow = useCallback(async ({
    companyId,
    oportunidadeId,
    targetNodeId,
  }: {
    companyId: string
    oportunidadeId: string
    targetNodeId: string
  }): Promise<MoveOportunidadeWorkflowResponse> => {
    const res = await fetchWithTimeout("/api/core/move-oportunidade-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        oportunidadeId,
        targetNodeId,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao mover a oportunidade no workflow`)
    }

    return await res.json()
  }, [])

  const updateOportunidadeBoardItem = useCallback(async ({
    companyId,
    oportunidadeId,
    responsavelUserId,
    phaseNodeId,
    statusNodeId,
    situationNodeId,
  }: {
    companyId: string
    oportunidadeId: string
    responsavelUserId?: string | null
    phaseNodeId?: string
    statusNodeId?: string
    situationNodeId?: string
  }): Promise<UpdateOportunidadeBoardItemResponse> => {
    const res = await fetchWithTimeout("/api/core/update-oportunidade-board-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        oportunidadeId,
        responsavelUserId,
        phaseNodeId,
        statusNodeId,
        situationNodeId,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao atualizar a oportunidade`)
    }

    return await res.json()
  }, [])

  const updateCompanyWorkflowNode = useCallback(async ({
    companyId,
    workflowDefinitionId,
    nodeId,
    label,
    color,
  }: {
    companyId: string
    workflowDefinitionId: string
    nodeId: string
    label: string
    color?: string | null
  }): Promise<UpdateCompanyWorkflowNodeResponse> => {
    const res = await fetch("/api/core/update-company-workflow-node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        workflowDefinitionId,
        nodeId,
        label,
        color,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao atualizar o workflow`)
    }

    return await res.json()
  }, [])

  const deleteDraft = useCallback(async ({
    companyId,
    oportunidadeId,
  }: {
    companyId: string
    oportunidadeId: string
  }): Promise<DeleteLicitacaoDraftResponse> => {
    const res = await fetch("/api/core/delete-licitacao-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, oportunidadeId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao excluir rascunho`)
    }

    return await res.json()
  }, [])

  const finalizeRegistration = useCallback(async ({
    companyId,
    oportunidadeId,
    form,
  }: {
    companyId: string
    oportunidadeId?: string
    form: FinalizeOportunidadeRegistrationPayload
  }): Promise<FinalizeOportunidadeRegistrationResponse> => {
    const res = await fetch("/api/core/finalize-oportunidade-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        oportunidadeId,
        form,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erro ${res.status} ao concluir o cadastro`)
    }

    return await res.json()
  }, [])

  const useUploadEdital = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      file,
      companyId,
    }: {
      file: File
      companyId: string
    }): Promise<UploadEditalDocumentResponse> => {
      setIsPending(true)
      setError(null)

      try {
        return await _api.licitacao.uploadEditalDocument({
          formData: {
            companyId,
            file,
          },
        })
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    return { mutateAsync, isPending, error, reset }
  }

  const useExtractEdital = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [progress, setProgress] = useState<ExtractionProgressState>(createInitialProgressState)
    const [preview, setPreview] = useState<PartialExtractionPreview>(createInitialPreviewState)

    const reset = useCallback(() => {
      setError(null)
      setProgress(createInitialProgressState())
      setPreview(createInitialPreviewState())
    }, [])

    const updatePipelineProgress = useCallback((scope: "info" | "items", event: ProgressEvent) => {
      setProgress(prev => ({
        ...prev,
        [scope]: {
          ...prev[scope],
          percent: event.pipelinePercent ?? prev[scope].percent,
          step: event.step,
          message: event.message,
          completed: (event.pipelinePercent ?? prev[scope].percent) >= 100,
        },
      }))
    }, [])

    const handleEvent = useCallback((event: StreamEvent): ExtractEditalDataResponse | null => {
      if (event.type === "done") {
        setProgress(prev => ({
          ...prev,
          orchestrationMessage: event.message,
          info: { ...prev.info, percent: 100, completed: true, message: "Extração de informações concluída." },
          items: { ...prev.items, percent: 100, completed: true, message: "Extração de itens concluída." },
        }))
        return event.result
      }

      if (event.type === "error") {
        throw new Error(event.message)
      }

      if (event.type === "partial_info") {
        setPreview(prev => ({
          ...prev,
          sessionId: event.result.sessionId,
          partialResponse: event.result,
          infoReady: true,
          items: event.result.licitacao.edital?.itens ?? prev.items,
        }))

        setProgress(prev => ({
          ...prev,
          info: {
            ...prev.info,
            percent: event.pipelinePercent,
            step: event.step,
            message: event.message,
            completed: true,
          },
          orchestrationMessage: event.message,
        }))

        return null
      }

      if (event.type === "partial_items_batch") {
        setPreview(prev => ({
          ...prev,
          sessionId: event.result.sessionId,
          partialResponse: event.result,
          items: event.batch.cumulativeItems,
          completedBatches: event.batch.completedBatches,
          totalBatches: event.batch.totalBatches,
          lastBatchItems: event.batch.batchItems,
        }))

        setProgress(prev => ({
          ...prev,
          items: {
            ...prev.items,
            percent: event.pipelinePercent,
            step: event.step,
            message: event.message,
            completed: event.batch.completedBatches === event.batch.totalBatches,
            completedBatches: event.batch.completedBatches,
            totalBatches: event.batch.totalBatches,
            extractedItems: event.batch.cumulativeItemsCount,
          },
          orchestrationMessage: event.message,
        }))

        return null
      }

      if (event.scope === "info" || event.scope === "items") {
        updatePipelineProgress(event.scope, event)
      }

      setProgress(prev => ({
        ...prev,
        orchestrationMessage: event.message,
      }))

      return null
    }, [updatePipelineProgress])

    const mutateAsync = useCallback(async ({
      companyId,
      file,
      documentId,
    }: {
      companyId: string
      file?: File
      documentId?: string
    }): Promise<ExtractEditalDataResponse> => {
      setIsPending(true)
      setError(null)
      setProgress(createInitialProgressState())
      setPreview(createInitialPreviewState())

      try {
        const isPostEmbedding = Boolean(documentId)
        const url = isPostEmbedding
          ? `/api/core/extract-edital-data-post-embeding/stream?companyId=${encodeURIComponent(companyId)}&documentId=${encodeURIComponent(documentId!)}`
          : `/api/core/extract-edital-data/stream?companyId=${encodeURIComponent(companyId)}`

        let res: Response

        if (isPostEmbedding) {
          res = await fetch(url, {
            method: "POST",
          })
        } else {
          if (!file) {
            throw new Error("Envie o PDF do edital para iniciar a extração.")
          }

          const formData = new FormData()
          formData.append("file", file)

          res = await fetch(url, {
            method: "POST",
            body: formData,
          })
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} na extração`)
        }

        if (!res.body) {
          throw new Error("O stream de extração não retornou conteúdo.")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let finalResult: ExtractEditalDataResponse | null = null

        while (true) {
          const { done, value } = await reader.read()
          buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

          const blocks = buffer.split(/\r?\n\r?\n/)
          buffer = blocks.pop() ?? ""

          for (const block of blocks) {
            const event = parseEventBlock<StreamEvent>(block)
            if (!event) continue

            const maybeResult = handleEvent(event)
            if (maybeResult) {
              finalResult = maybeResult
            }
          }

          if (done) break
        }

        if (!finalResult) {
          throw new Error("A extração terminou sem enviar o resultado final.")
        }

        return finalResult
      } catch (e: unknown) {
        const err = normalizeExtractionStreamError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [handleEvent])

    return { mutateAsync, isPending, error, reset, progress, preview }
  }

  const useUploadLicitacaoDocumentStream = () => {
    const [pendingCount, setPendingCount] = useState(0)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      file,
      companyId,
      documentType,
      oportunidadeId,
      editalId,
      replaceDocumentId,
      onEvent,
    }: {
      file: File
      companyId: string
      documentType: LicitacaoDocumentType
      oportunidadeId?: string
      editalId?: string
      replaceDocumentId?: string
      onEvent?: (event: UploadLicitacaoDocumentEvent) => void
    }): Promise<UploadLicitacaoDocumentResponse> => {
      setPendingCount(current => current + 1)
      setError(null)
      const traceId = createUploadTraceId()

      try {
        const formData = new FormData()
        formData.append("file", file)

        const query = new URLSearchParams({
          companyId,
          documentType,
          traceId,
        })

        if (oportunidadeId) query.set("oportunidadeId", oportunidadeId)
        if (editalId) query.set("editalId", editalId)
        if (replaceDocumentId) query.set("replaceDocumentId", replaceDocumentId)

        logUploadDebug(traceId, "request.started", {
          companyId,
          documentType,
          oportunidadeId,
          editalId,
          replaceDocumentId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        const res = await fetch(`/api/core/upload-licitacao-document/stream?${query.toString()}`, {
          method: "POST",
          headers: {
            "x-upload-trace-id": traceId,
          },
          body: formData,
        })

        logUploadDebug(traceId, "response.received", {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          contentType: res.headers.get("content-type"),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          logUploadDebug(traceId, "response.failed", {
            status: res.status,
            body,
          })
          throw new Error(body.message ?? `Erro ${res.status} no upload do documento`)
        }

        if (!res.body) {
          logUploadDebug(traceId, "response.empty_body")
          throw new Error("O stream de upload não retornou conteúdo.")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let finalResult: UploadLicitacaoDocumentResponse | null = null

        while (true) {
          const { done, value } = await reader.read()
          buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

          const blocks = buffer.split(/\r?\n\r?\n/)
          buffer = blocks.pop() ?? ""

          for (const block of blocks) {
            const event = parseEventBlock<UploadLicitacaoDocumentEvent>(block)
            if (!event) continue

            logUploadDebug(traceId, "sse.event", {
              type: event.type,
              step: event.step,
              percent: event.percent,
              status: event.status,
              context: event.type === "progress" ? event.context : undefined,
            })

            onEvent?.(event)

            if (event.type === "done") {
              finalResult = event.result
            }

            if (event.type === "error") {
              throw new Error(event.message)
            }
          }

          if (done) break
        }

        if (!finalResult) {
          logUploadDebug(traceId, "sse.missing_final_result", {
            bufferedChars: buffer.length,
          })
          throw new Error("O upload terminou sem enviar o resultado final.")
        }

        logUploadDebug(traceId, "request.completed", {
          documentId: finalResult.documentId,
          oportunidadeId: finalResult.oportunidadeId,
          status: finalResult.status,
        })

        return finalResult
      } catch (e: unknown) {
        const err = normalizeUploadStreamError(e)
        logUploadFailure(traceId, e, err)
        setError(err)
        throw err
      } finally {
        setPendingCount(current => Math.max(0, current - 1))
      }
    }, [])

    const isPending = pendingCount > 0

    return { mutateAsync, isPending, error, reset }
  }

  const useDeleteLicitacaoDocument = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      companyId,
      documentId,
    }: {
      companyId: string
      documentId: string
    }): Promise<DeleteLicitacaoDocumentResponse> => {
      setIsPending(true)
      setError(null)

      try {
        const res = await fetch("/api/core/delete-licitacao-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, documentId }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} ao excluir documento`)
        }

        return await res.json()
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    return { mutateAsync, isPending, error, reset }
  }

  return {
    listDrafts,
    getWorkspace,
    getCompanyWorkflow,
    listTeamMembers,
    listOportunidadesBoard,
    moveOportunidadeWorkflow,
    updateOportunidadeBoardItem,
    updateCompanyWorkflowNode,
    deleteDraft,
    finalizeRegistration,
    useUploadEdital,
    useUploadLicitacaoDocumentStream,
    useDeleteLicitacaoDocument,
    useExtractEdital,
  }
}
