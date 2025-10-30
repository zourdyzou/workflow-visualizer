"use client"
import { Handle, Position } from "@xyflow/react"
import { Camera as Lambda, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WorkerTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
  }
}

export function WorkerTaskNode({ data }: WorkerTaskNodeProps) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="group relative min-w-[280px] rounded-lg border-2 border-gray-300 bg-white p-4 shadow-lg transition-shadow hover:shadow-xl">
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
              <Lambda className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
            </div>
          </div>

          <span className="rounded bg-yellow-100 px-2.5 py-1 text-xs font-medium text-gray-900">{data.taskType}</span>
        </div>

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
