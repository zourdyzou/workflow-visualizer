"use client"
import { Handle, Position } from "@xyflow/react"
import { Plus } from "lucide-react"
import { TaskSelectionPopover } from "../task-selection-popover"
import { Button } from "@/components/ui/button"

interface StartEndNodeProps {
  id: string
  data: {
    label: string
    type: "start" | "end"
  }
}

export function StartEndNode({ id, data }: StartEndNodeProps) {
  return (
    <div className="relative">
      {data.type === "end" && <Handle type="target" position={Position.Top} className="!bg-gray-400" />}

      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-300 bg-yellow-100 shadow-md">
        <span className="text-sm font-semibold text-gray-900">{data.label}</span>
      </div>

      {data.type === "start" && (
        <>
          <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />

          <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2">
            <TaskSelectionPopover nodeId={id}>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white p-0 shadow-sm hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </Button>
            </TaskSelectionPopover>
          </div>
        </>
      )}
    </div>
  )
}
