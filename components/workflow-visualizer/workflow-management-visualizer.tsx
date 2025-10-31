"use client"

import type React from "react"

import { useMemo, useCallback, useEffect, useRef, useState } from "react"
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { SimpleTaskNode } from "./nodes/simple-task-node"
import { SystemTaskNode } from "./nodes/system-task-node"
import { DecisionNode } from "./nodes/decision-node"
import { StartEndNode } from "./nodes/start-end-node"
import { WorkerTaskNode } from "./nodes/worker-task-node"
import { HttpTaskNode } from "./nodes/http-task-node"
import { EventTaskNode } from "./nodes/event-task-node"
import { StartWorkflowNode } from "./nodes/start-workflow-node"
import { ForkNode } from "./nodes/fork-node"
import { JoinNode } from "./nodes/join-node"
import { parseWorkflowToReactFlow } from "./utils/workflow-parser"
import { useWorkflow } from "./context/workflow-context"
import { WorkflowBranchSelectionDialog } from "./context/workflow-branch-selection-dialog"
import type { ConductorWorkflow } from "./types/conductor-types"

const nodeTypes = {
  simpleTask: SimpleTaskNode,
  systemTask: SystemTaskNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  workerTask: WorkerTaskNode,
  httpTask: HttpTaskNode,
  eventTask: EventTaskNode,
  startWorkflowTask: StartWorkflowNode,
  fork: ForkNode,
  join: JoinNode,
}

interface WorkflowManagementVisualizerProps {
  workflow: ConductorWorkflow
  className?: string
  onNodeClick?: (node: any) => void
}

export function WorkflowManagementVisualizer({
  workflow,
  className = "",
  onNodeClick,
}: WorkflowManagementVisualizerProps) {
  const { workflow: contextWorkflow, addTask, addTaskToBranch, addTaskToForkBranch } = useWorkflow()

  const activeWorkflow = contextWorkflow || workflow

  const isDraggingRef = useRef(false)
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const lastWorkflowVersionRef = useRef<string>("")
  const countRef = useRef<number>(0)

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => parseWorkflowToReactFlow(activeWorkflow),
    [activeWorkflow],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  const [branchSelection, setBranchSelection] = useState<{
    isOpen: boolean
    branches: string[]
    afterNodeId: string
    taskType: string
    taskData: any
  } | null>(null)

  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [nodes, edges])

  useEffect(() => {
    nodes.forEach((node) => {
      nodePositionsRef.current[node.id] = node.position
    })
  }, [nodes])

  useEffect(() => {
    const workflowHash = JSON.stringify({
      name: activeWorkflow.name,
      tasks: activeWorkflow.tasks?.map((t) => ({
        name: t.name,
        taskReferenceName: t.taskReferenceName,
        type: t.type,
        inputParameters: t.inputParameters,
        decisionCases: t.decisionCases,
        defaultCase: t.defaultCase,
        forkTasks: t.forkTasks,
      })),
    })

    if (workflowHash === lastWorkflowVersionRef.current || isDraggingRef.current) {
      return
    }

    lastWorkflowVersionRef.current = workflowHash

    const { nodes: updatedNodes, edges: updatedEdges } = parseWorkflowToReactFlow(activeWorkflow)

    const mergedNodes = updatedNodes.map((updatedNode) => {
      const existingPosition = nodePositionsRef.current[updatedNode.id]
      return {
        ...updatedNode,
        position: existingPosition || updatedNode.position,
      }
    })

    setNodes(mergedNodes)
    setEdges(updatedEdges)
  }, [activeWorkflow, setNodes, setEdges])

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      const isDragging = changes.some((change) => change.type === "position" && change.dragging)
      isDraggingRef.current = isDragging

      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const addNodeAfter = useCallback(
    (afterNodeId: string, taskType: string) => {
      console.log("[v0] addNodeAfter called with:", { afterNodeId, taskType })

      const currentNodes = nodesRef.current
      const currentEdges = edgesRef.current

      console.log("[v0] Current nodes count:", currentNodes.length)

      const afterNode = currentNodes.find((n) => n.id === afterNodeId)
      if (!afterNode) {
        console.log("[v0] After node not found:", afterNodeId)
        return
      }

      if (afterNode.data?.taskType === "DECISION" || afterNode.data?.taskType === "SWITCH") {
        const branches = afterNode.data?.cases || ["true", "false", "default"]

        let taskTypeName = taskType.toLowerCase()
        if (taskType === "WORKER_TASK") taskTypeName = "worker_task"
        else if (taskType === "FORK_JOIN") taskTypeName = "fork"
        else if (taskType === "JOIN") taskTypeName = "join"
        else if (taskType === "DECISION") taskTypeName = "decision"

        const count = countRef.current
        const newTaskName = `${taskTypeName}_${count}`
        const newTaskRef = `${taskTypeName}_ref_${count}`
        countRef.current += 1

        const taskData: any = {
          name: newTaskName,
          taskReferenceName: newTaskRef,
          type: taskType,
          inputParameters: {},
        }

        if (taskType === "HTTP") {
          taskData.inputParameters = {
            http_request: {
              method: "GET",
              uri: "",
            },
          }
        } else if (taskType === "DECISION") {
          taskData.decisionCases = { true: [], false: [] }
          taskData.defaultCase = []
        } else if (taskType === "FORK_JOIN") {
          taskData.forkTasks = [[], []]
        }

        setBranchSelection({
          isOpen: true,
          branches,
          afterNodeId,
          taskType,
          taskData,
        })
        return
      }

      if (afterNode.data?.taskType === "FORK_JOIN" || afterNode.data?.taskType === "FORK_JOIN_DYNAMIC") {
        const branchCount = afterNode.data?.branchCount || 2
        const branches = Array.from({ length: branchCount }, (_, i) => `Branch ${i + 1}`)

        let taskTypeName = taskType.toLowerCase()
        if (taskType === "WORKER_TASK") taskTypeName = "worker_task"
        else if (taskType === "FORK_JOIN") taskTypeName = "fork"
        else if (taskType === "JOIN") taskTypeName = "join"
        else if (taskType === "DECISION") taskTypeName = "decision"

        const count = countRef.current
        const newTaskName = `${taskTypeName}_${count}`
        const newTaskRef = `${taskTypeName}_ref_${count}`
        countRef.current += 1

        const taskData: any = {
          name: newTaskName,
          taskReferenceName: newTaskRef,
          type: taskType,
          inputParameters: {},
        }

        if (taskType === "HTTP") {
          taskData.inputParameters = {
            http_request: {
              method: "GET",
              uri: "",
            },
          }
        } else if (taskType === "DECISION") {
          taskData.decisionCases = {
            true: [],
            false: [],
          }
          taskData.defaultCase = []
        } else if (taskType === "FORK_JOIN") {
          taskData.forkTasks = [[], []]
        }

        setBranchSelection({
          isOpen: true,
          branches,
          afterNodeId,
          taskType,
          taskData,
        })
        return
      }

      let taskTypeName = taskType.toLowerCase()
      if (taskType === "WORKER_TASK") taskTypeName = "worker_task"
      else if (taskType === "FORK_JOIN") taskTypeName = "fork"
      else if (taskType === "JOIN") taskTypeName = "join"
      else if (taskType === "DECISION") taskTypeName = "decision"

      const count = countRef.current
      const newTaskName = `${taskTypeName}_${count}`
      const newTaskRef = `${taskTypeName}_ref_${count}`
      countRef.current += 1

      console.log("[v0] Creating new task:", { newTaskName, newTaskRef })

      const newNodeId = `node-${Date.now()}`

      let reactFlowNodeType = "workerTask"
      if (taskType === "HTTP") reactFlowNodeType = "httpTask"
      else if (taskType === "EVENT") reactFlowNodeType = "eventTask"
      else if (taskType === "DECISION") reactFlowNodeType = "decision"
      else if (taskType === "FORK_JOIN") reactFlowNodeType = "fork"
      else if (taskType === "JOIN") reactFlowNodeType = "join"

      const taskData: any = {
        name: newTaskName,
        taskReferenceName: newTaskRef,
        type: taskType,
        inputParameters: {},
      }

      const nodeData: any = {
        label: newTaskName,
        taskReferenceName: newTaskRef,
        taskType: taskType,
        task: taskData,
      }

      if (taskType === "HTTP") {
        taskData.inputParameters = {
          http_request: {
            method: "GET",
            uri: "",
          },
        }
        nodeData.method = "GET"
        nodeData.url = ""
      } else if (taskType === "DECISION") {
        taskData.decisionCases = {
          true: [],
          false: [],
        }
        taskData.defaultCase = []
        nodeData.cases = ["true", "false", "default"]
      } else if (taskType === "FORK_JOIN") {
        taskData.forkTasks = [[], []]
        nodeData.branchCount = 2
      } else if (taskType === "JOIN") {
        nodeData.branchCount = 2
      }

      const afterTaskRef = afterNode.data?.taskReferenceName
      console.log("[v0] Adding task to workflow context after:", afterTaskRef)
      addTask(taskData, afterTaskRef)

      const VERTICAL_SPACING = 200

      const newNode = {
        id: newNodeId,
        type: reactFlowNodeType,
        position: {
          x: afterNode.position.x,
          y: afterNode.position.y + VERTICAL_SPACING,
        },
        data: nodeData,
      }

      console.log("[v0] New node created:", newNode)

      const updatedNodes = currentNodes.map((node) => {
        if (node.position.y > afterNode.position.y) {
          return {
            ...node,
            position: {
              ...node.position,
              y: node.position.y + VERTICAL_SPACING,
            },
          }
        }
        return node
      })

      const updatedEdges = currentEdges.map((edge) => {
        if (edge.source === afterNodeId) {
          return {
            ...edge,
            source: newNodeId,
          }
        }
        return edge
      })

      const newEdge = {
        id: `edge-${afterNodeId}-${newNodeId}`,
        source: afterNodeId,
        target: newNodeId,
        type: "smoothstep",
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#64748b",
        },
        style: {
          strokeWidth: 2,
          stroke: "#64748b",
        },
      }

      console.log("[v0] Setting nodes and edges")
      setNodes([...updatedNodes, newNode])
      setEdges([...updatedEdges, newEdge])

      nodePositionsRef.current[newNodeId] = newNode.position
      updatedNodes.forEach((node) => {
        nodePositionsRef.current[node.id] = node.position
      })
    },
    [setNodes, setEdges, addTask],
  )

  const handleBranchSelect = useCallback(
    (branch: string) => {
      if (!branchSelection) return

      const { afterNodeId, taskData } = branchSelection
      const afterNode = nodesRef.current.find((n) => n.id === afterNodeId)

      if (!afterNode) return

      const afterTaskRef = afterNode.data?.taskReferenceName

      if (afterNode.data?.taskType === "DECISION" || afterNode.data?.taskType === "SWITCH") {
        console.log("[v0] Adding task to decision branch:", { afterTaskRef, branch })
        addTaskToBranch(taskData, afterTaskRef, branch)
      } else if (afterNode.data?.taskType === "FORK_JOIN" || afterNode.data?.taskType === "FORK_JOIN_DYNAMIC") {
        const branchIndex = Number.parseInt(branch.replace("Branch ", "")) - 1
        console.log("[v0] Adding task to fork branch:", { afterTaskRef, branchIndex })
        addTaskToForkBranch(taskData, afterTaskRef, branchIndex)
      }

      setBranchSelection(null)
    },
    [branchSelection, addTaskToBranch, addTaskToForkBranch],
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))

      const incomingEdge = edges.find((e) => e.target === nodeId)
      const outgoingEdge = edges.find((e) => e.source === nodeId)

      if (incomingEdge && outgoingEdge) {
        const newEdge = {
          id: `edge-${incomingEdge.source}-${outgoingEdge.target}`,
          source: incomingEdge.source,
          target: outgoingEdge.target,
          type: "smoothstep",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#64748b",
          },
          style: {
            strokeWidth: 2,
            stroke: "#64748b",
          },
        }

        setEdges((eds) => [...eds.filter((e) => e.source !== nodeId && e.target !== nodeId), newEdge])
      } else {
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      }

      delete nodePositionsRef.current[nodeId]
    },
    [edges, setNodes, setEdges],
  )

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (onNodeClick) {
        onNodeClick(node)
      }
    },
    [onNodeClick],
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#64748b",
      },
      style: {
        strokeWidth: 2,
        stroke: "#64748b",
      },
    }),
    [],
  )

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        onInit={(reactFlowInstance) => {
          ;(window as any).__addNodeAfter = addNodeAfter
          ;(window as any).__removeNode = removeNode
        }}
      >
        <Background color="#64748b" gap={16} size={1.5} variant="dots" />
        <Controls />
      </ReactFlow>

      {branchSelection && (
        <WorkflowBranchSelectionDialog
          isOpen={branchSelection.isOpen}
          branches={branchSelection.branches}
          onSelect={handleBranchSelect}
          onCancel={() => setBranchSelection(null)}
        />
      )}
    </div>
  )
}
