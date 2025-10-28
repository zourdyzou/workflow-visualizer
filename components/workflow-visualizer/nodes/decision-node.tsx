"use client"
import { Handle, Position } from "@xyflow/react"
import { CheckCircle2 } from "lucide-react"

interface DecisionNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    cases?: string[]
  }
}

export function DecisionNode({ data }: DecisionNodeProps) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="relative min-w-[200px] rounded-lg border-2 border-green-500 bg-white p-8 shadow-md">
        {/* Diamond shape using CSS */}
        <div className="absolute inset-4 rotate-45 border-2 border-gray-300 bg-gray-100" />

        <div className="relative z-10 text-center">
          <div className="font-semibold text-gray-900">{data.label}</div>
          <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
        </div>

        <div className="absolute -right-2 -top-2 z-20">
          <CheckCircle2 className="h-5 w-5 fill-green-500 text-white" />
        </div>
      </div>

      {/* Multiple output handles for decision branches */}
      <Handle type="source" position={Position.Bottom} id="default" className="!bg-gray-400" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-gray-400" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-gray-400" />
    </div>
  )
}
