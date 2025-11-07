"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"
import { Code2, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskSelectionPopover } from "../task-selection-popover"
import { useWorkflow } from "../context/workflow-context"

interface JsonJqNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    task?: any
  }
  id: string
}

export const JsonJqNode = memo(function JsonJqNode({ data, id }: JsonJqNodeProps) {
  const { removeTask, showConfirmation } = useWorkflow()

  const isInBranch = id.includes("_case_") || id.includes("_fork_")

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete JSON JQ Transform Task",
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

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="group relative min-w-[240px] rounded-lg border-2 border-indigo-400 bg-indigo-50 p-4 shadow-lg transition-shadow hover:shadow-xl">
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
              <Code2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-indigo-600">{data.taskReferenceName}</div>
            </div>
          </div>

          <span className="rounded bg-indigo-500 px-2.5 py-1 text-xs font-medium text-white">JSON_JQ</span>
        </div>

        {!isInBranch && (
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
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
})
