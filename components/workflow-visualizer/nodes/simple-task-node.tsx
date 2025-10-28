"use client"
import { Handle, Position } from "@xyflow/react"
import { CheckCircle2 } from "lucide-react"

interface SimpleTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    status?: string
  }
}

export function SimpleTaskNode({ data }: SimpleTaskNodeProps) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="min-w-[240px] rounded-lg border-2 border-green-500 bg-white p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{data.label}</div>
            <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-gray-900">{data.taskType}</span>
          </div>
        </div>

        <div className="absolute -right-2 -top-2">
          <CheckCircle2 className="h-5 w-5 fill-green-500 text-white" />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
