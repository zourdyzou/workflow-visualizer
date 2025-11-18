"use client"

import { useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { WorkflowVisualizer } from "./workflow-visualizer"
import { WorkflowFormPanel, type WorkflowFormPanelLocalization } from "./workflow-form-panel"
import { WorkflowProvider, useWorkflow } from "./context/workflow-context"
import type { ConductorWorkflow, WorkflowExecution } from "./types/conductor-types"

/**
 * Props for the WorkflowViewerTool component.
 *
 * @interface WorkflowViewerToolProps
 * @property {ConductorWorkflow | WorkflowExecution} initialWorkflow - The initial workflow definition or execution to visualize
 * @property {boolean} [executionMode] - Whether to visualize as an execution (read-only with status indicators). Default: false
 * @property {(workflow: ConductorWorkflow) => void} [onSave] - Optional callback fired when the user saves changes, receives the exported workflow
 * @property {() => void} [onCancel] - Optional callback fired when the user cancels editing
 * @property {WorkflowFormPanelLocalization} [formLocalizedObj] - Optional localization object for the form panel. Defaults to English if not provided
 */
interface WorkflowViewerToolProps {
  initialWorkflow: ConductorWorkflow | WorkflowExecution
  executionMode?: boolean
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
  const { workflow, exportWorkflow, executionMode, workflowExecution } = useWorkflow()

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
    <div className="workflow-visualizer-root flex h-screen">
      <div className="flex-1 flex flex-col">
        <ReactFlowProvider>
          <WorkflowVisualizer
            workflow={workflow}
            workflowExecution={workflowExecution}
            onNodeClick={(node) => {
              if (node.id === "start" || node.id === "end" || node.type === "startEnd") {
                return
              }
              setSelectedNode(node)
              setIsPanelOpen(true)
            }}
          />
        </ReactFlowProvider>
      </div>

      <WorkflowFormPanel
        workflow={workflow}
        selectedNode={selectedNode}
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        onSave={handleSave}
        onCancel={handleCancel}
        localizedObj={formLocalizedObj}
        executionMode={executionMode}
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
 * - Execution mode to visualize runtime workflow data with status indicators
 *
 * @component
 * @example
 * \`\`\`tsx
 * // Definition mode (editable)
 * <WorkflowViewerTool
 *   initialWorkflow={workflowDefinition}
 *   onSave={handleSave}
 * />
 *
 * // Execution mode (read-only with status)
 * <WorkflowViewerTool
 *   initialWorkflow={workflowExecution}
 *   executionMode={true}
 * />
 * \`\`\`
 */
export function WorkflowViewerTool({ initialWorkflow, executionMode = false, onSave, onCancel, formLocalizedObj }: WorkflowViewerToolProps) {
  return (
    <WorkflowProvider initialWorkflow={initialWorkflow} executionMode={executionMode}>
      <WorkflowViewerToolContent onSave={onSave} onCancel={onCancel} formLocalizedObj={formLocalizedObj} />
    </WorkflowProvider>
  )
}
