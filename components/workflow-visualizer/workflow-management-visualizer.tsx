"use client"

import { useMemo } from "react"
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
      >
        <Background color="#64748b" gap={16} size={1.5} variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
