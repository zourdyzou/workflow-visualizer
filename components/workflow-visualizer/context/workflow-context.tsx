"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { ConductorWorkflow, ConductorTask } from "../types/conductor-types"
import { WorkflowConfirmationDialog } from "./workflow-confirmation-dialog"

interface WorkflowContextType {
  workflow: ConductorWorkflow
  updateTask: (taskReferenceName: string, updates: Partial<ConductorTask>) => void
  updateWorkflow: (updates: Partial<ConductorWorkflow>) => void
  getTask: (taskReferenceName: string) => ConductorTask | undefined
  addTask: (task: ConductorTask, afterTaskRef?: string) => void
  removeTask: (taskReferenceName: string) => void
  exportWorkflow: () => ConductorWorkflow
  showConfirmation: (config: ConfirmationConfig) => void
}

interface ConfirmationConfig {
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({
  children,
  initialWorkflow,
}: {
  children: ReactNode
  initialWorkflow: ConductorWorkflow
}) {
  const [workflow, setWorkflow] = useState<ConductorWorkflow>(initialWorkflow)
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationConfig | null>(null)

  const updateTask = useCallback((taskReferenceName: string, updates: Partial<ConductorTask>) => {
    setWorkflow((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.taskReferenceName === taskReferenceName ? { ...task, ...updates } : task)),
    }))
  }, [])

  const updateWorkflow = useCallback((updates: Partial<ConductorWorkflow>) => {
    setWorkflow((prev) => ({ ...prev, ...updates }))
  }, [])

  const getTask = useCallback(
    (taskReferenceName: string) => {
      return workflow.tasks.find((task) => task.taskReferenceName === taskReferenceName)
    },
    [workflow.tasks],
  )

  const addTask = useCallback((task: ConductorTask, afterTaskRef?: string) => {
    setWorkflow((prev) => {
      if (!afterTaskRef) {
        return { ...prev, tasks: [...prev.tasks, task] }
      }

      const afterIndex = prev.tasks.findIndex((t) => t.taskReferenceName === afterTaskRef)
      if (afterIndex === -1) {
        return { ...prev, tasks: [...prev.tasks, task] }
      }

      const newTasks = [...prev.tasks]
      newTasks.splice(afterIndex + 1, 0, task)
      return { ...prev, tasks: newTasks }
    })
  }, [])

  const removeTask = useCallback((taskReferenceName: string) => {
    setWorkflow((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.taskReferenceName !== taskReferenceName),
    }))
  }, [])

  const exportWorkflow = useCallback(() => {
    return workflow
  }, [workflow])

  const showConfirmation = useCallback((config: ConfirmationConfig) => {
    setConfirmationConfig(config)
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmationConfig) {
      confirmationConfig.onConfirm()
      setConfirmationConfig(null)
    }
  }, [confirmationConfig])

  const handleCancel = useCallback(() => {
    setConfirmationConfig(null)
  }, [])

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        updateTask,
        updateWorkflow,
        getTask,
        addTask,
        removeTask,
        exportWorkflow,
        showConfirmation,
      }}
    >
      {children}
      <WorkflowConfirmationDialog
        open={!!confirmationConfig}
        title={confirmationConfig?.title || ""}
        description={confirmationConfig?.description || ""}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText={confirmationConfig?.confirmText}
        cancelText={confirmationConfig?.cancelText}
      />
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
