"use client"
import { Handle, Position } from "@xyflow/react"

interface StartEndNodeProps {
  data: {
    label: string
    type: "start" | "end"
  }
}

export function StartEndNode({ data }: StartEndNodeProps) {
  return (
    <div className="relative">
      {data.type === "end" && <Handle type="target" position={Position.Top} className="!bg-gray-400" />}

      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-300 bg-yellow-100 shadow-md">
        <span className="text-sm font-semibold text-gray-900">{data.label}</span>
      </div>

      {data.type === "start" && <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />}
    </div>
  )
}
