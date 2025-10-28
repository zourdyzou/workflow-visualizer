"use client"

import { useMemo } from "react"
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { SimpleTaskNode } from "./nodes/simple-task-node"
import { SystemTaskNode } from "./nodes/system-task-node"
import { DecisionNode } from "./nodes/decision-node"
import { StartEndNode } from "./nodes/start-end-node"
import { parseWorkflowToReactFlow } from "./utils/workflow-parser"
import type { ConductorWorkflow } from "./types/conductor-types"

const nodeTypes = {
  simpleTask: SimpleTaskNode,
  systemTask: SystemTaskNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
}

interface WorkflowManagementVisualizerProps {
  workflow: ConductorWorkflow
  className?: string
}

export function WorkflowManagementVisualizer({ workflow, className = "" }: WorkflowManagementVisualizerProps) {
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
        <Background color="#e2e8f0" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "simpleTask":
                return "#22c55e"
              case "systemTask":
                return "#0f766e"
              case "decision":
                return "#94a3b8"
              case "startEnd":
                return "#fbbf24"
              default:
                return "#94a3b8"
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}
