import type { Node, Edge } from "@xyflow/react"
import type { ConductorWorkflow, ConductorTask } from "../types/conductor-types"

const VERTICAL_SPACING = 250
const HORIZONTAL_SPACING = 400
const BRANCH_VERTICAL_OFFSET = 150

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
  const branchEndNodes: { nodeId: string; y: number; branchIndex?: number; sourceHandle?: string }[] = []

  workflow.tasks.forEach((task, index) => {
    const nodeId = task.taskReferenceName || `task_${index}`
    const nodeType = getNodeType(task.type)

    const xPosition = 400

    const node: Node = {
      id: nodeId,
      type: nodeType,
      position: { x: xPosition, y: yPosition },
      data: {
        label: task.name,
        taskReferenceName: task.taskReferenceName,
        taskType: task.type,
        task: task,
        method: (task.inputParameters as any)?.http_request?.method,
        url: (task.inputParameters as any)?.http_request?.uri,
        collapsed: task.type === "DYNAMIC_FORK" || task.type === "FORK_JOIN_DYNAMIC",
        branchCount: task.forkTasks?.length || 2,
        cases: task.decisionCases ? Object.keys(task.decisionCases).concat(["default"]) : undefined,
      },
    }

    nodes.push(node)

    if (branchEndNodes.length > 0) {
      branchEndNodes.forEach((branchEnd) => {
        const edge: Edge = {
          id: `${branchEnd.nodeId}-${nodeId}`,
          source: branchEnd.nodeId,
          target: nodeId,
          type: "smoothstep",
          animated: false,
        }

        if (branchEnd.sourceHandle) {
          edge.sourceHandle = branchEnd.sourceHandle
        }

        if (task.type === "JOIN" && branchEnd.branchIndex !== undefined) {
          edge.targetHandle = `branch-${branchEnd.branchIndex}`
        }

        edges.push(edge)
      })
      branchEndNodes.length = 0
    } else {
      edges.push({
        id: `${previousNodeId}-${nodeId}`,
        source: previousNodeId,
        target: nodeId,
        type: "smoothstep",
        animated: false,
      })
    }

    previousNodeId = nodeId

    const branchStartY = yPosition
    yPosition += VERTICAL_SPACING

    if (task.type === "FORK_JOIN" || task.type === "FORK_JOIN_DYNAMIC") {
      const forkTasks = task.forkTasks || []
      const branchCount = forkTasks.length
      let maxBranchY = branchStartY + VERTICAL_SPACING

      forkTasks.forEach((forkBranch: ConductorTask[], branchIndex: number) => {
        if (!forkBranch || forkBranch.length === 0) {
          return
        }

        const branchX = xPosition - ((branchCount - 1) * HORIZONTAL_SPACING) / 2 + branchIndex * HORIZONTAL_SPACING
        let branchY = branchStartY + VERTICAL_SPACING + BRANCH_VERTICAL_OFFSET
        let lastNodeInBranch = nodeId

        forkBranch.forEach((forkTask, forkIndex) => {
          const forkNodeId = `${nodeId}_fork_${branchIndex}_${forkIndex}`
          const forkNodeType = getNodeType(forkTask.type)

          nodes.push({
            id: forkNodeId,
            type: forkNodeType,
            position: { x: branchX, y: branchY },
            data: {
              label: forkTask.name,
              taskReferenceName: forkTask.taskReferenceName,
              taskType: forkTask.type,
              task: forkTask,
              method: (forkTask.inputParameters as any)?.http_request?.method,
              url: (forkTask.inputParameters as any)?.http_request?.uri,
            },
          })

          if (forkIndex === 0) {
            edges.push({
              id: `${nodeId}-${forkNodeId}`,
              source: nodeId,
              sourceHandle: `branch-${branchIndex}`,
              target: forkNodeId,
              type: "smoothstep",
              animated: false,
              label: `Branch ${branchIndex + 1}`,
              labelStyle: { fontSize: 10, fill: "#64748b" },
            })
          } else {
            edges.push({
              id: `${lastNodeInBranch}-${forkNodeId}`,
              source: lastNodeInBranch,
              target: forkNodeId,
              type: "smoothstep",
              animated: false,
            })
          }

          lastNodeInBranch = forkNodeId
          branchY += VERTICAL_SPACING
        })

        branchEndNodes.push({ nodeId: lastNodeInBranch, y: branchY, branchIndex })
        maxBranchY = Math.max(maxBranchY, branchY)
      })

      yPosition = maxBranchY + VERTICAL_SPACING
    }

    if (task.type === "DECISION" || task.type === "SWITCH") {
      const decisionCases = task.decisionCases || {}
      const caseKeys = Object.keys(decisionCases).concat(["default"])
      const caseCount = caseKeys.length
      let maxBranchY = branchStartY + VERTICAL_SPACING

      caseKeys.forEach((caseKey, caseIndex) => {
        const caseTasks = caseKey === "default" ? task.defaultCase || [] : decisionCases[caseKey]

        if (caseTasks.length === 0) return

        const caseX = xPosition - ((caseCount - 1) * HORIZONTAL_SPACING) / 2 + caseIndex * HORIZONTAL_SPACING
        let caseY = branchStartY + VERTICAL_SPACING + BRANCH_VERTICAL_OFFSET
        let lastNodeInCase = nodeId

        caseTasks.forEach((caseTask: ConductorTask, taskIndex: number) => {
          const caseNodeId = `${nodeId}_case_${caseKey}_${taskIndex}`
          const caseNodeType = getNodeType(caseTask.type)

          nodes.push({
            id: caseNodeId,
            type: caseNodeType,
            position: { x: caseX, y: caseY },
            data: {
              label: caseTask.name,
              taskReferenceName: caseTask.taskReferenceName,
              taskType: caseTask.type,
              task: caseTask,
              method: (caseTask.inputParameters as any)?.http_request?.method,
              url: (caseTask.inputParameters as any)?.http_request?.uri,
            },
          })

          if (taskIndex === 0) {
            edges.push({
              id: `${nodeId}-${caseNodeId}`,
              source: nodeId,
              sourceHandle: `case-${caseKey}`,
              target: caseNodeId,
              type: "smoothstep",
              animated: false,
              label: caseKey === "default" ? "default" : `case: ${caseKey}`,
              labelStyle: { fontSize: 10, fill: "#64748b" },
              labelBgStyle: { fill: "#ffffff", fillOpacity: 0.8 },
            })
          } else {
            edges.push({
              id: `${lastNodeInCase}-${caseNodeId}`,
              source: lastNodeInCase,
              target: caseNodeId,
              type: "smoothstep",
              animated: false,
            })
          }

          lastNodeInCase = caseNodeId
          caseY += VERTICAL_SPACING
        })

        branchEndNodes.push({ nodeId: lastNodeInCase, y: caseY })
        maxBranchY = Math.max(maxBranchY, caseY)
      })

      yPosition = maxBranchY + VERTICAL_SPACING
    }
  })

  // Add end node
  nodes.push({
    id: "end",
    type: "startEnd",
    position: { x: 400, y: yPosition },
    data: { label: "End", type: "end" },
  })

  if (branchEndNodes.length > 0) {
    branchEndNodes.forEach((branchEnd) => {
      edges.push({
        id: `${branchEnd.nodeId}-end`,
        source: branchEnd.nodeId,
        target: "end",
        type: "smoothstep",
        animated: false,
      })
    })
  } else {
    edges.push({
      id: `${previousNodeId}-end`,
      source: previousNodeId,
      target: "end",
      type: "smoothstep",
      animated: false,
    })
  }

  return { nodes, edges }
}

function getNodeType(taskType: string): string {
  switch (taskType) {
    case "WORKER":
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
      return "fork"
    case "JSON_JQ_TRANSFORM":
      return "jsonJq"
    case "DYNAMIC_FORK":
      return "dynamicFork"
    case "JOIN":
      return "join"
    case "TERMINATE":
      return "systemTask"
    default:
      return "workerTask"
  }
}
