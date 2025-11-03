"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"
import { GitFork, X, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkflow } from "../context/workflow-context"

interface ForkNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    task?: any
    branchCount?: number
  }
  id: string
}

export const ForkNode = memo(function ForkNode({ data, id }: ForkNodeProps) {
  const { removeTask, showConfirmation, removeForkBranch, addForkBranch } = useWorkflow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Fork Task",
      description: `Are you sure you want to delete "${data.label}"? This will remove all branches.`,
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

  const handleAddBranch = (e: React.MouseEvent) => {
    e.stopPropagation()
    addForkBranch(data.taskReferenceName)
  }

  const handleRemoveBranch = (e: React.MouseEvent, branchIndex: number) => {
    e.stopPropagation()
    showConfirmation({
      title: "Remove Branch",
      description: `Are you sure you want to remove Branch ${branchIndex + 1}? This will delete all tasks in this branch.`,
      onConfirm: () => {
        removeForkBranch(data.taskReferenceName, branchIndex)
      },
      confirmText: "Remove",
      cancelText: "Cancel",
    })
  }

  const branchCount = data.branchCount || 2

  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return "50%"
    if (total === 2) {
      // For 2 branches, use 25% and 75% for wide spacing
      return index === 0 ? "25%" : "75%"
    }
    // For 3+ branches, distribute evenly with padding on edges
    const spacing = 80 / (total - 1) // Use 80% of width (10% padding on each side)
    return `${10 + spacing * index}%`
  }

  return (
    <div className="group relative pb-1">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="relative min-w-[280px] rounded-lg border-2 border-blue-500 bg-blue-50 p-4 shadow-lg transition-shadow hover:shadow-xl">
        {/* Delete button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-2 border-red-400 bg-white p-0 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-1">
              <GitFork className="h-5 w-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-blue-600">{data.taskReferenceName}</div>
              <div className="mt-1 text-xs text-gray-500">{branchCount} parallel branches</div>
            </div>
          </div>

          <span className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">FORK</span>
        </div>
      </div>

      {Array.from({ length: branchCount }).map((_, index) => {
        const position = getHandlePosition(index, branchCount)
        return (
          <div
            key={`branch-${index}`}
            className="absolute flex flex-col items-center gap-0.5"
            style={{
              left: position,
              top: "100%",
              transform: "translateX(-50%)",
              marginTop: "-8px", // Using negative margin to pull handles up closer to node
            }}
          >
            {/* Branch handle - tiny, subtle blue dot */}
            <Handle
              type="source"
              position={Position.Bottom}
              id={`branch-${index}`}
              className="!relative !left-0 !top-0 !h-1 !w-1 !translate-x-0 !translate-y-0 !rounded-full !border !border-blue-600 !bg-blue-500"
            />

            {/* Control buttons below the handle */}
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddBranch}
                className="h-6 w-6 rounded-full border border-gray-300 bg-white p-0 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50"
                title="Add branch"
              >
                <Plus className="h-3 w-3 text-gray-600" />
              </Button>
              {branchCount > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleRemoveBranch(e, index)}
                  className="h-6 w-6 rounded-full border border-gray-300 bg-white p-0 shadow-sm transition-all hover:border-red-400 hover:bg-red-50"
                  title={`Remove Branch ${index + 1}`}
                >
                  <Minus className="h-3 w-3 text-gray-600" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
})
