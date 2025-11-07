"use client"
import { Handle, Position } from "@xyflow/react"
import { Rocket, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskSelectionPopover } from "../task-selection-popover"

interface StartWorkflowNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    workflowName?: string
  }
  id: string
}

export function StartWorkflowNode({ data, id }: StartWorkflowNodeProps) {
  const isInBranch = id.includes("_case_") || id.includes("_fork_")

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="group relative min-w-[280px] rounded-lg border-2 border-teal-600 bg-teal-700 p-4 shadow-lg transition-shadow hover:shadow-xl">
        {/* Delete button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-2 border-red-400 bg-white p-0 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-1">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{data.label}</div>
              <div className="text-sm text-teal-300">{data.taskReferenceName}</div>
            </div>
          </div>

          <span className="rounded bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-900">{data.taskType}</span>
        </div>

        {/* Workflow badge */}
        {data.workflowName && (
          <div className="mt-3 border-t border-teal-600 pt-3">
            <Badge variant="secondary" className="bg-white/90 text-xs font-medium text-teal-900">
              Workflow
            </Badge>
          </div>
        )}

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
}
