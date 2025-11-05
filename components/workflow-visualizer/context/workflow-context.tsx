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
  addTaskToBranch: (task: ConductorTask, decisionTaskRef: string, branch: string) => void
  addTaskToForkBranch: (task: ConductorTask, forkTaskRef: string, branchIndex: number) => void
  addForkBranch: (forkTaskRef: string) => void
  removeForkBranch: (forkTaskRef: string, branchIndex: number) => void
  addDecisionCase: (decisionTaskRef: string) => void
  removeDecisionCase: (decisionTaskRef: string, caseKey: string) => void
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
    console.log("[v0] updateTask called:", { taskReferenceName, updates })

    setWorkflow((prev) => {
      // Helper function to update a task recursively
      const updateTaskRecursive = (task: ConductorTask): ConductorTask => {
        // If this is the task we're looking for, update it
        if (task.taskReferenceName === taskReferenceName) {
          console.log("[v0] Found and updating task:", taskReferenceName)
          return { ...task, ...updates }
        }

        // Check fork branches
        if (task.forkTasks && Array.isArray(task.forkTasks)) {
          const updatedForkTasks = task.forkTasks.map((branch) => {
            if (Array.isArray(branch)) {
              return branch.map(updateTaskRecursive)
            }
            return branch
          })

          // Only update if something changed
          if (JSON.stringify(updatedForkTasks) !== JSON.stringify(task.forkTasks)) {
            console.log("[v0] Updated task in fork branch")
            return { ...task, forkTasks: updatedForkTasks }
          }
        }

        // Check decision cases
        if (task.decisionCases) {
          let casesUpdated = false
          const updatedDecisionCases: Record<string, ConductorTask[]> = {}

          for (const [caseKey, caseTasks] of Object.entries(task.decisionCases)) {
            const updatedCaseTasks = caseTasks.map(updateTaskRecursive)
            updatedDecisionCases[caseKey] = updatedCaseTasks

            if (JSON.stringify(updatedCaseTasks) !== JSON.stringify(caseTasks)) {
              casesUpdated = true
            }
          }

          // Check default case
          let updatedDefaultCase = task.defaultCase
          if (task.defaultCase && Array.isArray(task.defaultCase)) {
            updatedDefaultCase = task.defaultCase.map(updateTaskRecursive)
            if (JSON.stringify(updatedDefaultCase) !== JSON.stringify(task.defaultCase)) {
              casesUpdated = true
            }
          }

          if (casesUpdated) {
            console.log("[v0] Updated task in decision case")
            return {
              ...task,
              decisionCases: updatedDecisionCases,
              defaultCase: updatedDefaultCase,
            }
          }
        }

        return task
      }

      return {
        ...prev,
        tasks: prev.tasks.map(updateTaskRecursive),
      }
    })
  }, [])

  const updateWorkflow = useCallback((updates: Partial<ConductorWorkflow>) => {
    if (updates.tasks !== undefined) {
      setWorkflow((prev) => ({ ...prev, ...updates }))
    } else {
      setWorkflow((prev) => ({ ...prev, ...updates }))
    }
  }, [])

  const getTask = useCallback(
    (taskReferenceName: string): ConductorTask | undefined => {
      // Helper function to recursively search for a task
      const findTaskRecursive = (task: ConductorTask): ConductorTask | undefined => {
        if (task.taskReferenceName === taskReferenceName) {
          return task
        }

        // Search in forkTasks
        if (task.forkTasks && Array.isArray(task.forkTasks)) {
          for (const branch of task.forkTasks) {
            if (Array.isArray(branch)) {
              for (const forkTask of branch) {
                const found = findTaskRecursive(forkTask)
                if (found) return found
              }
            }
          }
        }

        // Search in decisionCases
        if (task.decisionCases) {
          for (const caseTasks of Object.values(task.decisionCases)) {
            if (Array.isArray(caseTasks)) {
              for (const caseTask of caseTasks) {
                const found = findTaskRecursive(caseTask)
                if (found) return found
              }
            }
          }
        }

        // Search in defaultCase
        if (task.defaultCase && Array.isArray(task.defaultCase)) {
          for (const defaultTask of task.defaultCase) {
            const found = findTaskRecursive(defaultTask)
            if (found) return found
          }
        }

        return undefined
      }

      // Search through all top-level tasks
      for (const task of workflow.tasks) {
        const found = findTaskRecursive(task)
        if (found) return found
      }

      return undefined
    },
    [workflow.tasks],
  )

  const addTask = useCallback((task: ConductorTask, afterTaskRef?: string) => {
    setWorkflow((prev) => {
      if (task.type === "FORK_JOIN") {
        const joinTask: ConductorTask = {
          name: `${task.name}_join`,
          taskReferenceName: `${task.taskReferenceName}_join`,
          type: "JOIN",
          inputParameters: {},
          joinOn: [task.taskReferenceName],
        }

        if (!afterTaskRef || afterTaskRef === "start") {
          return { ...prev, tasks: [task, joinTask, ...prev.tasks] }
        }

        const afterIndex = prev.tasks.findIndex((t) => t.taskReferenceName === afterTaskRef)
        if (afterIndex === -1) {
          return { ...prev, tasks: [...prev.tasks, task, joinTask] }
        }

        const newTasks = [...prev.tasks]
        newTasks.splice(afterIndex + 1, 0, task, joinTask)
        return { ...prev, tasks: newTasks }
      }

      if (!afterTaskRef || afterTaskRef === "start") {
        return { ...prev, tasks: [task, ...prev.tasks] }
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

  const addTaskToBranch = useCallback((task: ConductorTask, decisionTaskRef: string, branch: string) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (t.taskReferenceName === decisionTaskRef && (t.type === "DECISION" || t.type === "SWITCH")) {
          const updatedTask = { ...t }

          if (branch === "default") {
            updatedTask.defaultCase = [...(updatedTask.defaultCase || []), task]
          } else {
            updatedTask.decisionCases = {
              ...updatedTask.decisionCases,
              [branch]: [...(updatedTask.decisionCases?.[branch] || []), task],
            }
          }

          return updatedTask
        }
        return t
      })

      return { ...prev, tasks: newTasks }
    })
  }, [])

  const addTaskToForkBranch = useCallback((task: ConductorTask, forkTaskRef: string, branchIndex: number) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (
          t.taskReferenceName === forkTaskRef &&
          (t.type === "FORK_JOIN" || t.type === "FORK_JOIN_DYNAMIC" || t.type === "DYNAMIC_FORK")
        ) {
          const updatedTask = { ...t }
          const forkTasks = [...(updatedTask.forkTasks || [])]

          if (!forkTasks[branchIndex]) {
            forkTasks[branchIndex] = []
          }

          forkTasks[branchIndex] = [...forkTasks[branchIndex], task]
          updatedTask.forkTasks = forkTasks

          return updatedTask
        }
        return t
      })

      return { ...prev, tasks: newTasks }
    })
  }, [])

  const addForkBranch = useCallback((forkTaskRef: string) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (
          t.taskReferenceName === forkTaskRef &&
          (t.type === "FORK_JOIN" || t.type === "FORK_JOIN_DYNAMIC" || t.type === "DYNAMIC_FORK")
        ) {
          const updatedTask = { ...t }
          const forkTasks = [...(updatedTask.forkTasks || [])]
          forkTasks.push([]) // Add empty branch
          updatedTask.forkTasks = forkTasks
          return updatedTask
        }
        return t
      })
      return { ...prev, tasks: newTasks }
    })
  }, [])

  const removeForkBranch = useCallback((forkTaskRef: string, branchIndex: number) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (
          t.taskReferenceName === forkTaskRef &&
          (t.type === "FORK_JOIN" || t.type === "FORK_JOIN_DYNAMIC" || t.type === "DYNAMIC_FORK")
        ) {
          const updatedTask = { ...t }
          const forkTasks = [...(updatedTask.forkTasks || [])]
          forkTasks[branchIndex] = [] // Clear all tasks from this branch
          updatedTask.forkTasks = forkTasks
          return updatedTask
        }
        return t
      })
      return { ...prev, tasks: newTasks }
    })
  }, [])

  const addDecisionCase = useCallback((decisionTaskRef: string) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (t.taskReferenceName === decisionTaskRef && (t.type === "DECISION" || t.type === "SWITCH")) {
          const updatedTask = { ...t }
          const existingCases = Object.keys(updatedTask.decisionCases || {})
          const newCaseKey = `case_${existingCases.length + 1}`
          updatedTask.decisionCases = {
            ...updatedTask.decisionCases,
            [newCaseKey]: [],
          }
          return updatedTask
        }
        return t
      })
      return { ...prev, tasks: newTasks }
    })
  }, [])

  const removeDecisionCase = useCallback((decisionTaskRef: string, caseKey: string) => {
    setWorkflow((prev) => {
      const newTasks = prev.tasks.map((t) => {
        if (t.taskReferenceName === decisionTaskRef && (t.type === "DECISION" || t.type === "SWITCH")) {
          const updatedTask = { ...t }
          if (caseKey === "default") {
            updatedTask.defaultCase = []
          } else {
            const { [caseKey]: removed, ...remainingCases } = updatedTask.decisionCases || {}
            updatedTask.decisionCases = remainingCases
          }
          return updatedTask
        }
        return t
      })
      return { ...prev, tasks: newTasks }
    })
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
        addTaskToBranch,
        addTaskToForkBranch,
        addForkBranch,
        removeForkBranch,
        addDecisionCase,
        removeDecisionCase,
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
