"use client"

import { useMemo, useCallback, useEffect, useRef } from "react"
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
import { parseWorkflowToReactFlow } from "./utils/workflow-parser"
import { useWorkflow } from "./context/workflow-context"
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
  const { workflow: contextWorkflow } = useWorkflow()

  const activeWorkflow = contextWorkflow || workflow

  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({})

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => parseWorkflowToReactFlow(activeWorkflow),
    [activeWorkflow],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    nodes.forEach((node) => {
      nodePositionsRef.current[node.id] = node.position
    })
  }, [nodes])

  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = parseWorkflowToReactFlow(activeWorkflow)

    // Merge updated node data with preserved positions
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

  const addNodeAfter = useCallback(
    (afterNodeId: string, taskType: string) => {
      console.log("[v0] Adding node after:", afterNodeId, "with type:", taskType)

      const existingNodes = nodes.filter((n) => n.data.task?.type === taskType)
      const count = existingNodes.length + 1
      const taskTypeName = taskType === "WORKER_TASK" ? "worker_task" : taskType.toLowerCase()
      const newTaskName = `${taskTypeName}_${count}`
      const newTaskRef = `${taskTypeName}_ref_${count}`

      const afterNode = nodes.find((n) => n.id === afterNodeId)
      if (!afterNode) return

      const outgoingEdges = edges.filter((e) => e.source === afterNodeId)

      const newNodeId = `node-${Date.now()}`

      let reactFlowNodeType = "workerTask"
      if (taskType === "HTTP") reactFlowNodeType = "httpTask"
      else if (taskType === "EVENT") reactFlowNodeType = "eventTask"

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
      }

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

      const updatedNodes = nodes.map((node) => {
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

      const updatedEdges = edges.map((edge) => {
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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#94a3b8",
        },
        style: {
          strokeWidth: 2,
          stroke: "#94a3b8",
        },
      }

      setNodes((nds) => [...updatedNodes, newNode])
      setEdges((eds) => [...updatedEdges, newEdge])

      nodePositionsRef.current[newNodeId] = newNode.position
      updatedNodes.forEach((node) => {
        nodePositionsRef.current[node.id] = node.position
      })

      console.log("[v0] Node added successfully:", newNode)
    },
    [nodes, edges, setNodes, setEdges],
  )

  const removeNode = useCallback(
    (nodeId: string) => {
      console.log("[v0] Removing node:", nodeId)

      // Remove the node
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))

      // Find edges connected to this node
      const incomingEdge = edges.find((e) => e.target === nodeId)
      const outgoingEdge = edges.find((e) => e.source === nodeId)

      // Reconnect the workflow by creating a new edge from source to target
      if (incomingEdge && outgoingEdge) {
        const newEdge = {
          id: `edge-${incomingEdge.source}-${outgoingEdge.target}`,
          source: incomingEdge.source,
          target: outgoingEdge.target,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#94a3b8",
          },
          style: {
            strokeWidth: 2,
            stroke: "#94a3b8",
          },
        }

        // Remove old edges and add new connecting edge
        setEdges((eds) => [...eds.filter((e) => e.source !== nodeId && e.target !== nodeId), newEdge])
      } else {
        // Just remove edges connected to this node
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      }

      // Remove from position ref
      delete nodePositionsRef.current[nodeId]

      console.log("[v0] Node removed successfully")
    },
    [edges, setNodes, setEdges],
  )

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(event, node) => {
          if (onNodeClick) {
            onNodeClick(node)
          }
        }}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#94a3b8",
          },
          style: {
            strokeWidth: 2,
            stroke: "#94a3b8",
          },
        }}
        onInit={(reactFlowInstance) => {
          ;(window as any).__addNodeAfter = addNodeAfter
          ;(window as any).__removeNode = removeNode
        }}
      >
        <Background color="#64748b" gap={16} size={1.5} variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
