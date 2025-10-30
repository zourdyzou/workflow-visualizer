"use client"
import { Handle, Position } from "@xyflow/react"
import { Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StartWorkflowNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    workflowName?: string
  }
}

export function StartWorkflowNode({ data }: StartWorkflowNodeProps) {
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

        {/* Add button at bottom */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white p-0 opacity-0 transition-opacity hover:bg-gray-50 group-hover:opacity-100"
          >
            <span className="text-lg font-semibold text-gray-600">+</span>
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
