"use client"
import { Handle, Position } from "@xyflow/react"
import { Workflow, GitFork, GitMerge } from "lucide-react"

interface SystemTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    status?: string
    collapsed?: boolean
  }
}

export function SystemTaskNode({ data }: SystemTaskNodeProps) {
  const getIcon = () => {
    const type = data.taskType.toLowerCase()
    if (type.includes("fork")) return <GitFork className="h-4 w-4" />
    if (type.includes("join")) return <GitMerge className="h-4 w-4" />
    return <Workflow className="h-4 w-4" />
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className="min-w-[240px] rounded-lg border-2 border-teal-700 bg-teal-800 p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-2">
            <div className="mt-0.5 text-white">{getIcon()}</div>
            <div className="flex-1">
              <div className="font-semibold text-white">{data.label}</div>
              <div className="text-sm text-teal-300">{data.taskReferenceName}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-gray-900">{data.taskType}</span>
          </div>
        </div>

        {data.collapsed && (
          <button className="mt-2 rounded bg-white px-3 py-1 text-xs font-medium text-gray-900">Collapsed</button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
