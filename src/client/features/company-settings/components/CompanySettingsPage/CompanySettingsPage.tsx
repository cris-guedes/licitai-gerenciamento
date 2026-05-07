"use client"

import { Settings2 } from "lucide-react"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useCompanyWorkflowEditorService } from "../../services/use-company-workflow-editor.service"
import { WorkflowEditorCanvas } from "./WorkflowEditorCanvas"
import { WorkflowInspector } from "./WorkflowInspector"
import { useCompanySettingsPage } from "./hooks/useCompanySettingsPage"

export function CompanySettingsPage() {
  const api = useCoreApi()
  const { empresaAtiva } = useAppContext()
  const workflowEditorService = useCompanyWorkflowEditorService(api)
  const page = useCompanySettingsPage({
    companyId: empresaAtiva?.id ?? null,
    workflowEditorService,
  })

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-x-hidden">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50 text-sky-700">
          <Settings2 className="size-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Configurações Globais</h1>
          <p className="text-xs text-muted-foreground">Ajustes da empresa ativa usados por toda a operação.</p>
        </div>
      </div>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <WorkflowEditorCanvas
          nodes={page.nodes}
          transitions={page.transitions}
          selectedElement={page.selectedElement}
          isLoading={page.isLoading}
          canCreateRootNode={page.canCreateRootNode}
          onSelectNode={page.selectNode}
          onSelectTransition={page.selectTransition}
          onCreateRootNode={() => page.startCreateNode(null)}
          onCreateTransition={page.createTransition}
          onPersistNodePosition={page.persistNodePosition}
        />

        <WorkflowInspector
          selectedNode={page.selectedNode}
          selectedTransition={page.selectedTransition}
          createParentNode={page.createParentNode}
          createParentNodeId={page.createParentNodeId}
          nodeDraft={page.nodeDraft}
          transitionTypeDraft={page.transitionTypeDraft}
          isSaving={page.isSaving}
          hasNodeDraftChanges={page.hasNodeDraftChanges}
          hasTransitionDraftChanges={page.hasTransitionDraftChanges}
          selectedNodeHasChildren={page.selectedNodeHasChildren}
          selectedNodeCanHaveChildren={page.selectedNodeCanHaveChildren}
          onNodeDraftChange={page.updateNodeDraft}
          onTransitionTypeChange={page.setTransitionTypeDraft}
          onSaveNode={page.saveSelectedNode}
          onCreateNode={page.createDraftNode}
          onDeleteNode={page.deleteSelectedNode}
          onStartCreateChild={page.startCreateNode}
          onCancelCreateNode={page.cancelCreateNode}
          onSaveTransition={page.saveSelectedTransition}
          onDeleteTransition={page.deleteSelectedTransition}
        />
      </section>
    </div>
  )
}
