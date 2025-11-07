"use client"

import { useState } from "react"
import { WorkflowVisualizer } from "./workflow-visualizer"
import { WorkflowFormPanel } from "./workflow-form-panel"
import { WorkflowProvider, useWorkflow } from "./context/workflow-context"
import type { ConductorWorkflow } from "./types/conductor-types"

interface WorkflowViewerToolProps {
  initialWorkflow: ConductorWorkflow
  onSave?: (workflow: ConductorWorkflow) => void
  onCancel?: () => void
}

function WorkflowViewerToolContent({
  onSave,
  onCancel,
}: { onSave?: (workflow: ConductorWorkflow) => void; onCancel?: () => void }) {
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
      />
    </div>
  )
}

export function WorkflowViewerTool({ initialWorkflow, onSave, onCancel }: WorkflowViewerToolProps) {
  return (
    <WorkflowProvider initialWorkflow={initialWorkflow}>
      <WorkflowViewerToolContent onSave={onSave} onCancel={onCancel} />
    </WorkflowProvider>
  )
}
