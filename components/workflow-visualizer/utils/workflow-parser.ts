import type { Node, Edge } from "@xyflow/react"
import type { ConductorWorkflow, ConductorTask } from "../types/conductor-types"

const VERTICAL_SPACING = 150
const HORIZONTAL_SPACING = 300

export function parseWorkflowToReactFlow(workflow: ConductorWorkflow): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []
  let yPosition = 0

  // Add start node
  nodes.push({
    id: "start",
    type: "startEnd",
    position: { x: 400, y: yPosition },
    data: { label: "Start", type: "start" },
  })

  yPosition += VERTICAL_SPACING

  // Process tasks
  let previousNodeId = "start"

  workflow.tasks.forEach((task, index) => {
    const nodeId = task.taskReferenceName || `task_${index}`
    const nodeType = getNodeType(task.type)

    // Determine node position
    const xPosition = 400 // Center position, adjust for branching later

    const node: Node = {
      id: nodeId,
      type: nodeType,
      position: { x: xPosition, y: yPosition },
      data: {
        label: task.name,
        taskReferenceName: task.taskReferenceName,
        taskType: task.type,
        // Pass the entire task object for form access
        task: task,
        // Additional fields for display
        method: (task.inputParameters as any)?.http_request?.method,
        url: (task.inputParameters as any)?.http_request?.uri,
        collapsed: task.type === "DYNAMIC_FORK" || task.type === "FORK_JOIN_DYNAMIC",
      },
    }

    nodes.push(node)

    // Add edge from previous node
    edges.push({
      id: `${previousNodeId}-${nodeId}`,
      source: previousNodeId,
      target: nodeId,
      type: "smoothstep",
    })

    previousNodeId = nodeId
    yPosition += VERTICAL_SPACING

    // Handle special task types
    if (task.type === "FORK_JOIN" || task.type === "FORK_JOIN_DYNAMIC") {
      // Add fork branches (simplified for now)
      const forkTasks = (task as any).forkTasks || []
      forkTasks.forEach((forkBranch: ConductorTask[], branchIndex: number) => {
        const branchX = xPosition - 200 + branchIndex * 400
        forkBranch.forEach((forkTask, forkIndex) => {
          const forkNodeId = `${nodeId}_fork_${branchIndex}_${forkIndex}`
          nodes.push({
            id: forkNodeId,
            type: getNodeType(forkTask.type),
            position: { x: branchX, y: yPosition + forkIndex * VERTICAL_SPACING },
            data: {
              label: forkTask.name,
              taskReferenceName: forkTask.taskReferenceName,
              taskType: forkTask.type,
            },
          })

          if (forkIndex === 0) {
            edges.push({
              id: `${nodeId}-${forkNodeId}`,
              source: nodeId,
              target: forkNodeId,
            })
          }
        })
      })
    }

    if (task.type === "DECISION" || task.type === "SWITCH") {
      // Handle decision branches
      const decisionCases = (task as any).decisionCases || {}
      Object.keys(decisionCases).forEach((caseKey, caseIndex) => {
        const caseX = xPosition - 200 + caseIndex * 400
        // Add case label nodes
        nodes.push({
          id: `${nodeId}_case_${caseKey}`,
          type: "default",
          position: { x: caseX, y: yPosition },
          data: { label: caseKey },
          style: {
            background: "#e0e7ff",
            border: "1px solid #818cf8",
            borderRadius: "4px",
            padding: "8px",
            fontSize: "12px",
          },
        })
      })
    }
  })

  // Add end node
  nodes.push({
    id: "end",
    type: "startEnd",
    position: { x: 400, y: yPosition },
    data: { label: "End", type: "end" },
  })

  edges.push({
    id: `${previousNodeId}-end`,
    source: previousNodeId,
    target: "end",
    type: "smoothstep",
  })

  return { nodes, edges }
}

function getNodeType(taskType: string): string {
  // Map specific task types to their node components
  switch (taskType) {
    case "SIMPLE":
      return "workerTask"
    case "HTTP":
      return "httpTask"
    case "EVENT":
      return "eventTask"
    case "START_WORKFLOW":
    case "SUB_WORKFLOW":
      return "startWorkflowTask"
    case "DECISION":
    case "SWITCH":
      return "decision"
    case "FORK_JOIN":
    case "FORK_JOIN_DYNAMIC":
    case "DYNAMIC_FORK":
    case "JOIN":
    case "DYNAMIC":
    case "TERMINATE":
      return "systemTask"
    default:
      return "workerTask" // Default to worker task for unknown types
  }
}
