"use client"

import { useCoreApi } from "@/client/hooks/use-core-api"
import { useAppContext } from "@/client/hooks/app"
import { useCompanyWorkflowEditorService } from "../../services/use-company-workflow-editor.service"
import { WorkflowEditorCanvas } from "./WorkflowEditorCanvas"
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
      <section className="min-w-0">
        <WorkflowEditorCanvas
          nodes={page.nodes}
          nodeKinds={page.nodeKinds}
          selectedElement={page.selectedElement}
          isLoading={page.isLoading}
          isSaving={page.isSaving}
          canCreateRootNode={page.canCreateRootNode}
          nodeDraft={page.nodeDraft}
          hasNodeDraftChanges={page.hasNodeDraftChanges}
          selectedNodeHasChildren={page.selectedNodeHasChildren}
          onSelectNode={page.selectNode}
          onClearSelection={page.clearSelection}
          onNodeDraftChange={page.updateNodeDraft}
          onSaveNode={page.saveSelectedNode}
          onDeleteNode={page.deleteSelectedNode}
          onCreateNodeFromPalette={page.createNodeFromPalette}
        />
      </section>
    </div>
  )
}
