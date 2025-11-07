"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"

import { Globe, LinkIcon, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskSelectionPopover } from "../task-selection-popover"
import { useWorkflow } from "../context/workflow-context"

interface HttpTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    method?: string
    url?: string
  }
  id: string
}

export const HttpTaskNode = memo(function HttpTaskNode({ data, id }: HttpTaskNodeProps) {
  const { removeTask, showConfirmation, getTask } = useWorkflow()

  const isInBranch = id.includes("_case_") || id.includes("_fork_")

  const latestTask = getTask(data.taskReferenceName)
  const httpRequest = latestTask?.inputParameters?.http_request || {}
  const method = httpRequest.method || data.method
  const url = httpRequest.uri || data.url
  const taskName = latestTask?.name || data.label

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Task",
      description: `Are you sure you want to delete "${data.label}"? This action cannot be undone.`,
      onConfirm: () => {
        removeTask(data.taskReferenceName)
        // Also remove the node from React Flow
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

      <div className="group relative min-w-[280px] rounded-lg border-2 border-gray-300 bg-white p-4 shadow-lg transition-shadow hover:shadow-xl">
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
              <Globe className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{taskName}</div>
              <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
            </div>
          </div>

          <span className="rounded bg-orange-100 px-2.5 py-1 text-xs font-medium text-gray-900">{data.taskType}</span>
        </div>

        {/* HTTP details */}
        {(method || url) && (
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
            {method && (
              <Badge variant="secondary" className="bg-gray-100 text-xs font-medium text-gray-700">
                {method}
              </Badge>
            )}
            {url && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <LinkIcon className="h-3 w-3" />
                <span className="truncate">{url}</span>
              </div>
            )}
          </div>
        )}

        {!isInBranch && (
          <div className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2">
            <TaskSelectionPopover nodeId={id}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white p-0 opacity-0 shadow-md transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg group-hover:opacity-100"
              >
                <Plus className="h-4 w-4 text-gray-600 hover:text-blue-600" />
              </Button>
            </TaskSelectionPopover>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
})
