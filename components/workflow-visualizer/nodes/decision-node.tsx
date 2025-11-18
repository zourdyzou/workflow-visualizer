"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"
import { GitBranch, X, Plus, Minus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useWorkflow } from "../context/workflow-context"
import { TaskSelectionPopover } from "../task-selection-popover"

interface DecisionNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    task?: any
    cases?: string[]
  }
  id: string
}

export const DecisionNode = memo(function DecisionNode({ data, id }: DecisionNodeProps) {
  const { removeTask, showConfirmation, removeDecisionCase, addDecisionCase, executionMode } = useWorkflow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Decision Task",
      description: `Are you sure you want to delete "${data.label}"? This will remove all decision branches.`,
      onConfirm: () => {
        removeTask(data.taskReferenceName)
        if (typeof window !== "undefined" && (window as any).__removeNode) {
          ;(window as any).__removeNode(id)
        }
      },
      confirmText: "Delete",
      cancelText: "Cancel",
    })
  }

  const handleAddCase = (e: React.MouseEvent) => {
    e.stopPropagation()
    addDecisionCase(data.taskReferenceName)
  }

  const handleRemoveCase = (e: React.MouseEvent, caseKey: string, caseIndex: number) => {
    e.stopPropagation()
    if (caseKey === "default") {
      showConfirmation({
        title: "Remove Default Case",
        description: "Are you sure you want to remove the default case? This will delete all tasks in this path.",
        onConfirm: () => {
          removeDecisionCase(data.taskReferenceName, caseKey)
        },
        confirmText: "Remove",
        cancelText: "Cancel",
      })
    } else {
      showConfirmation({
        title: "Remove Decision Case",
        description: `Are you sure you want to remove case "${caseKey}"? This will delete all tasks in this path.`,
        onConfirm: () => {
          removeDecisionCase(data.taskReferenceName, caseKey)
        },
        confirmText: "Remove",
        cancelText: "Cancel",
      })
    }
  }

  const cases = data.cases || ["true", "false", "default"]

  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return "50%"
    if (total === 2) {
      // For 2 cases, use 25% and 75% for wide spacing
      return index === 0 ? "25%" : "75%"
    }
    // For 3+ cases, distribute evenly with padding on edges
    const spacing = 80 / (total - 1) // Use 80% of width (10% padding on each side)
    return `${10 + spacing * index}%`
  }

  return (
    <div className="group relative pb-1">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="relative min-w-[280px] rounded-lg border-2 border-green-500 bg-green-50 p-4 shadow-lg transition-shadow hover:shadow-xl">
        {!executionMode && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-2 border-red-400 bg-white p-0 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
          >
            <X className="h-3 w-3 text-red-500" />
          </Button>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-1">
              <GitBranch className="h-5 w-5 text-green-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-green-600">{data.taskReferenceName}</div>
              <div className="mt-1 text-xs text-gray-500">{cases.length} decision paths</div>
            </div>
          </div>

          <span className="rounded bg-green-500 px-2.5 py-1 text-xs font-medium text-white">DECISION</span>
        </div>
      </div>

      {cases.map((caseKey, index) => {
        const position = getHandlePosition(index, cases.length)
        const caseNodeId = `${data.taskReferenceName}_case_${caseKey}_0`

        return (
          <div
            key={`case-${caseKey}`}
            className="absolute flex flex-col items-center gap-0.5"
            style={{
              left: position,
              top: "100%",
              transform: "translateX(-50%)",
              marginTop: "-8px",
            }}
          >
            <Handle
              type="source"
              position={Position.Bottom}
              id={`case-${caseKey}`}
              className="!relative !left-0 !top-0 !h-1 !w-1 !translate-x-0 !translate-y-0 !rounded-full !border !border-green-600 !bg-green-500"
            />

            {!executionMode && (
              <div className="flex gap-1">
                <TaskSelectionPopover nodeId={caseNodeId}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full border border-gray-300 bg-white p-0 shadow-sm transition-all hover:border-green-400 hover:bg-green-50"
                    title={`Add task to case "${caseKey}"`}
                  >
                    <Plus className="h-3 w-3 text-gray-600" />
                  </Button>
                </TaskSelectionPopover>
                {cases.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleRemoveCase(e, caseKey, index)}
                    className="h-6 w-6 rounded-full border border-gray-300 bg-white p-0 shadow-sm transition-all hover:border-red-400 hover:bg-red-50"
                    title={`Remove case "${caseKey}"`}
                  >
                    <Minus className="h-3 w-3 text-gray-600" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})
