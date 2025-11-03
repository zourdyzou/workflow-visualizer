"use client"
import { Handle, Position } from "@xyflow/react"

interface WorkerTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    status?: string
  }
}

export function SimpleTaskNode({ data }: WorkerTaskNodeProps) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="min-w-[240px] rounded-lg border-2 border-gray-300 bg-white p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{data.label}</div>
            <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-gray-900">{data.taskType}</span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
