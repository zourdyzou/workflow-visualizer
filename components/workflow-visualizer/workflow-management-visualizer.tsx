"use client"

import { useMemo, useCallback } from "react"
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
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => parseWorkflowToReactFlow(workflow), [workflow])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const addNodeAfter = useCallback(
    (afterNodeId: string, taskType: string) => {
      console.log("[v0] Adding node after:", afterNodeId, "with type:", taskType)

      // Generate a unique name based on existing nodes
      const existingNodes = nodes.filter((n) => n.data.task?.type === taskType)
      const count = existingNodes.length + 1
      const taskTypeName = taskType === "WORKER_TASK" ? "worker_task" : taskType.toLowerCase()
      const newTaskName = `${taskTypeName}_${count}`
      const newTaskRef = `${taskTypeName}_ref_${count}`

      // Find the node we're inserting after
      const afterNode = nodes.find((n) => n.id === afterNodeId)
      if (!afterNode) return

      // Find edges that start from this node
      const outgoingEdges = edges.filter((e) => e.source === afterNodeId)

      // Create new node ID
      const newNodeId = `node-${Date.now()}`

      // Determine node type for ReactFlow
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

      // Add HTTP-specific fields
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

      const newNode = {
        id: newNodeId,
        type: reactFlowNodeType,
        position: {
          x: afterNode.position.x,
          y: afterNode.position.y + 150,
        },
        data: nodeData,
      }

      // Update edges: redirect outgoing edges to go through the new node
      const updatedEdges = edges.map((edge) => {
        if (edge.source === afterNodeId) {
          // Change the source to the new node
          return {
            ...edge,
            source: newNodeId,
          }
        }
        return edge
      })

      // Add new edge from after node to new node
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

      // Update nodes and edges
      setNodes((nds) => [...nds, newNode])
      setEdges((eds) => [...updatedEdges, newEdge])

      console.log("[v0] Node added successfully:", newNode)
    },
    [nodes, edges, setNodes, setEdges],
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
          // Store the function in a way nodes can access it
          ;(window as any).__addNodeAfter = addNodeAfter
        }}
      >
        <Background color="#64748b" gap={16} size={1.5} variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
