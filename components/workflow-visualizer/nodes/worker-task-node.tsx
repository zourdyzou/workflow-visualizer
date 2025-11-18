"use client"
import { Handle, Position } from "@xyflow/react"
import type React from "react"
import { memo } from "react"

import { FunctionSquare, X, Plus, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { TaskSelectionPopover } from "../task-selection-popover"
import { useWorkflow } from "../context/workflow-context"

interface WorkerTaskNodeProps {
  data: {
    label: string
    taskReferenceName: string
    taskType: string
    executionStatus?: "COMPLETED" | "IN_PROGRESS" | "FAILED" | "SCHEDULED" | "TIMED_OUT" | "CANCELED" | "SKIPPED"
    startTime?: number
    endTime?: number
    duration?: number
  }
  id: string
}

export const WorkerTaskNode = memo(function WorkerTaskNode({ data, id }: WorkerTaskNodeProps) {
  const { removeTask, showConfirmation, executionMode } = useWorkflow()

  const isInBranch = id.includes("_case_")

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirmation({
      title: "Delete Task",
      description: `Are you sure you want to delete "${data.label}"? This action cannot be undone.`,
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

  const getStatusStyles = () => {
    switch (data.executionStatus) {
      case "COMPLETED":
        return {
          border: "border-green-500",
          bg: "bg-green-50",
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          badge: "bg-green-500 text-white"
        }
      case "IN_PROGRESS":
        return {
          border: "border-blue-500",
          bg: "bg-blue-50",
          icon: <Clock className="h-5 w-5 text-blue-600 animate-pulse" />,
          badge: "bg-blue-500 text-white"
        }
      case "FAILED":
        return {
          border: "border-red-500",
          bg: "bg-red-50",
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          badge: "bg-red-500 text-white"
        }
      case "TIMED_OUT":
        return {
          border: "border-orange-500",
          bg: "bg-orange-50",
          icon: <AlertCircle className="h-5 w-5 text-orange-600" />,
          badge: "bg-orange-500 text-white"
        }
      case "SCHEDULED":
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          icon: <Clock className="h-5 w-5 text-gray-400" />,
          badge: "bg-gray-400 text-white"
        }
      default:
        return {
          border: "border-gray-300",
          bg: "bg-white",
          icon: <FunctionSquare className="h-5 w-5 text-gray-700" />,
          badge: "bg-yellow-100 text-gray-900"
        }
    }
  }

  const statusStyles = getStatusStyles()

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <div className={`group relative min-w-[280px] rounded-lg border-2 ${statusStyles.border} ${statusStyles.bg} p-4 shadow-lg transition-shadow hover:shadow-xl`}>
        {executionMode ? (
          <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white shadow-md flex items-center justify-center">
            {statusStyles.icon}
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full border-2 border-red-400 bg-white p-0 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
          >
            <X className="h-3 w-3 text-red-500" />
          </Button>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-1">
              <FunctionSquare className="h-5 w-5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{data.label}</div>
              <div className="text-sm text-gray-400">{data.taskReferenceName}</div>
              {executionMode && data.duration !== undefined && (
                <div className="mt-1 text-xs text-gray-500">
                  Duration: {data.duration}ms
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end">
            <span className={`rounded px-2.5 py-1 text-xs font-medium ${statusStyles.badge}`}>
              {data.taskType}
            </span>
            {executionMode && data.executionStatus && (
              <span className="text-xs text-gray-500">{data.executionStatus}</span>
            )}
          </div>
        </div>

        {!isInBranch && !executionMode && (
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
})
