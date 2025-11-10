"use client"

import { useState } from "react"
import { WorkflowVisualizer } from "./workflow-visualizer"
import { WorkflowFormPanel, type WorkflowFormPanelLocalization } from "./workflow-form-panel"
import { WorkflowProvider, useWorkflow } from "./context/workflow-context"
import type { ConductorWorkflow } from "./types/conductor-types"

/**
 * Props for the WorkflowViewerTool component.
 *
 * @interface WorkflowViewerToolProps
 * @property {ConductorWorkflow} initialWorkflow - The initial workflow definition to visualize and edit
 * @property {(workflow: ConductorWorkflow) => void} [onSave] - Optional callback fired when the user saves changes, receives the exported workflow
 * @property {() => void} [onCancel] - Optional callback fired when the user cancels editing
 * @property {WorkflowFormPanelLocalization} [formLocalizedObj] - Optional localization object for the form panel. Defaults to English if not provided
 */
interface WorkflowViewerToolProps {
  initialWorkflow: ConductorWorkflow
  onSave?: (workflow: ConductorWorkflow) => void
  onCancel?: () => void
  formLocalizedObj?: WorkflowFormPanelLocalization
}

/**
 * Internal content component that uses workflow context.
 * Manages the selected node state and panel visibility.
 *
 * @private
 * @component
 */
function WorkflowViewerToolContent({
  onSave,
  onCancel,
  formLocalizedObj,
}: {
  onSave?: (workflow: ConductorWorkflow) => void
  onCancel?: () => void
  formLocalizedObj?: WorkflowFormPanelLocalization
}) {
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { workflow, exportWorkflow } = useWorkflow()

  const handleSave = () => {
    if (onSave) {
      const exportedWorkflow = exportWorkflow()
      onSave(exportedWorkflow)
    }
    setIsPanelOpen(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    setSelectedNode(null)
    setIsPanelOpen(false)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <WorkflowVisualizer
          workflow={workflow}
          onNodeClick={(node) => {
            if (node.id === "start" || node.id === "end" || node.type === "startEnd") {
              return
            }
            setSelectedNode(node)
            setIsPanelOpen(true)
          }}
        />
      </div>

      <WorkflowFormPanel
        workflow={workflow}
        selectedNode={selectedNode}
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        onSave={handleSave}
        onCancel={handleCancel}
        localizedObj={formLocalizedObj}
      />
    </div>
  )
}

/**
 * WorkflowViewerTool - Main entry component for the workflow visualization and editing tool.
 *
 * This is the primary component to use for integrating the workflow visualizer into your application.
 * It combines a visual workflow diagram (using React Flow) with a form panel for editing task properties.
 *
 * Features:
 * - Interactive workflow visualization with drag-and-drop node positioning
 * - Add, edit, and delete workflow tasks
 * - Support for all Conductor task types (WORKER, HTTP, DECISION, FORK_JOIN, etc.)
 * - Real-time workflow state management
 * - Localization support for internationalization
 * - Export workflow as Conductor JSON format
 *
 * @component
 * @example
 * ```tsx
 * import { WorkflowViewerTool } from '@/components/workflow-visualizer/workflow-viewer-tool'
 * import { defaultWorkflowFormLocalization } from '@/lib/workflow-form-localization'
 *
 * function MyWorkflowEditor() {
 *   const handleSave = (workflow) => {
 *     console.log('Workflow saved:', workflow)
 *     // Send to API or save locally
 *   }
 *
 *   return (
 *     <WorkflowViewerTool
 *       initialWorkflow={myWorkflowData}
 *       onSave={handleSave}
 *       formLocalizedObj={defaultWorkflowFormLocalization}
 *     />
 *   )
 * }
 * ```
 */
export function WorkflowViewerTool({
  initialWorkflow,
  onSave,
  onCancel,
  formLocalizedObj,
}: WorkflowViewerToolProps) {
  return (
    <WorkflowProvider initialWorkflow={initialWorkflow}>
      <WorkflowViewerToolContent onSave={onSave} onCancel={onCancel} formLocalizedObj={formLocalizedObj} />
    </WorkflowProvider>
  )
}
