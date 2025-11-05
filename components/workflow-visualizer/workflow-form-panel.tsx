"use client"

import { Button } from "@/components/ui/button"
import { Pencil, ChevronsRight, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import type { ConductorWorkflow } from "./types/conductor-types"
import { useWorkflow } from "./context/workflow-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WorkflowFormPanelProps {
  workflow: ConductorWorkflow
  selectedNode: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onCancel: () => void
  onNewWorkflow?: () => void
}

export function WorkflowFormPanel({
  workflow,
  selectedNode,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
  onNewWorkflow,
}: WorkflowFormPanelProps) {
  const [configTab, setConfigTab] = useState<"workflow" | "task">("workflow")
  const { workflow: contextWorkflow } = useWorkflow()

  const firstTask = contextWorkflow?.tasks?.[0]
  const displayTask =
    selectedNode ||
    (firstTask
      ? {
          id: firstTask.taskReferenceName,
          data: {
            task: firstTask,
            label: firstTask.name,
            taskReferenceName: firstTask.taskReferenceName,
            taskType: firstTask.type,
          },
        }
      : null)

  useEffect(() => {
    if (selectedNode) {
      setConfigTab("task")
    }
  }, [selectedNode])

  if (!isOpen) {
    return (
      <div className="w-12 border-l bg-gray-50 flex flex-col items-center pt-4 gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(true)} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Edit workflow metadata</p>
            </TooltipContent>
          </Tooltip>

          {onNewWorkflow && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onNewWorkflow} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Create new workflow from scratch</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    )
  }

  const actualTaskReferenceName =
    displayTask?.data?.task?.taskReferenceName || displayTask?.data?.taskReferenceName || displayTask?.id

  return (
    <div className="w-[480px] border-l bg-white flex flex-col">
      <div className="border-b bg-white">
        <div className="flex items-center h-12 px-6 gap-6">
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors -ml-1 cursor-pointer"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfigTab("workflow")}
              className={`text-sm font-medium px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                configTab === "workflow"
                  ? "text-gray-900 bg-gray-100 border-sky-400"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Workflow
            </button>
            <button
              onClick={() => setConfigTab("task")}
              className={`text-sm font-medium px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                configTab === "task"
                  ? "text-gray-900 bg-gray-100 border-sky-400"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Task
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {configTab === "workflow" ? (
          <WorkflowForm workflow={workflow} />
        ) : displayTask ? (
          <TaskForm key={displayTask.id} task={displayTask.data} taskReferenceName={actualTaskReferenceName} />
        ) : (
          <div className="text-center text-gray-500 py-8">No tasks available</div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1 bg-sky-400 hover:bg-sky-500 text-white">
          Save
        </Button>
      </div>
    </div>
  )
}

// Declare variables before using them
const v0 = "some value"
const no = "some value"
const op = "some value"
const code = "some value"
const block = "some value"
const prefix = "some value"

// Existing code block
const WorkflowForm = ({ workflow }) => {
  // Use the declared variables here
  console.log(v0, no, op, code, block, prefix)

  return <div>{/* Workflow form content here */}</div>
}

const TaskForm = ({ task, taskReferenceName }) => {
  // Use the declared variables here
  console.log(v0, no, op, code, block, prefix)

  return <div>{/* Task form content here */}</div>
}
