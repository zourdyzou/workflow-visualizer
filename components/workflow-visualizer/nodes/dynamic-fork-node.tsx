"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"
import { Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorkflow } from "../context/workflow-context"

interface DynamicForkNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    task?: any
  }
  id: string
}

export const DynamicForkNode = memo(function DynamicForkNode({ data, id }: DynamicForkNodeProps) {
  const { removeTask, showConfirmation } = useWorkflow()

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Dynamic Fork Task",
      description: `Are you sure you want to delete "${data.label}"? This task creates branches dynamically at runtime.`,
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

      <div className="group relative min-w-[280px] rounded-lg border-2 border-amber-500 bg-amber-50 p-4 shadow-lg transition-shadow hover:shadow-xl">
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
              <Zap className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-amber-600">{data.taskReferenceName}</div>
              <div className="mt-1 text-xs text-gray-500">Dynamic parallel branches</div>
            </div>
          </div>

          <span className="rounded bg-amber-500 px-2.5 py-1 text-xs font-medium text-white">DYNAMIC_FORK</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  )
})
