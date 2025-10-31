"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"
import { GitMerge, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskSelectionPopover } from "../task-selection-popover"
import { useWorkflow } from "../context/workflow-context"

interface JoinNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    task?: any
    branchCount?: number
  }
  id: string
}

export const JoinNode = memo(function JoinNode({ data, id }: JoinNodeProps) {
  const { removeTask, showConfirmation } = useWorkflow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Join Task",
      description: `Are you sure you want to delete "${data.label}"?`,
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

  const branchCount = data.branchCount || 2

  return (
    <div className="relative">
      {/* Multiple input handles for branches */}
      {Array.from({ length: branchCount }).map((_, index) => (
        <Handle
          key={`branch-${index}`}
          type="target"
          position={Position.Top}
          id={`branch-${index}`}
          className="!bg-purple-500"
          style={{
            left: `${((index + 1) / (branchCount + 1)) * 100}%`,
          }}
        />
      ))}

      <div className="group relative min-w-[280px] rounded-lg border-2 border-purple-500 bg-purple-50 p-4 shadow-lg transition-shadow hover:shadow-xl">
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
              <GitMerge className="h-5 w-5 text-purple-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-purple-600">{data.taskReferenceName}</div>
              <div className="mt-1 text-xs text-gray-500">Waits for {branchCount} branches</div>
            </div>
          </div>

          <span className="rounded bg-purple-500 px-2.5 py-1 text-xs font-medium text-white">JOIN</span>
        </div>

        <div className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2">
          <TaskSelectionPopover nodeId={id}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white p-0 opacity-0 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 group-hover:opacity-100"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </Button>
          </TaskSelectionPopover>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
})
