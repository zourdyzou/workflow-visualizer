"use client"

import type React from "react"

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
import { ForkNode } from "./nodes/fork-node"
import { JoinNode } from "./nodes/join-node"
import { JsonJqNode } from "./nodes/json-jq-node"
import { DynamicForkNode } from "./nodes/dynamic-fork-node"
import { parseWorkflowToReactFlow } from "./utils/workflow-parser"
import { useWorkflow } from "./context/workflow-context"
import type { ConductorWorkflow } from "./types/conductor-types"
import { isDynamicForkType, isForkType } from "@/lib/workflow-utils"

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
  jsonJq: JsonJqNode,
  dynamicFork: DynamicForkNode,
}

interface WorkflowVisualizerProps {
  workflow: ConductorWorkflow
  className?: string
  onNodeClick?: (node: any) => void
}

export function WorkflowVisualizer({ workflow, className = "", onNodeClick }: WorkflowVisualizerProps) {
  const { workflow: contextWorkflow, addTask, addTaskToBranch, addTaskToForkBranch } = useWorkflow()

  const activeWorkflow = contextWorkflow || workflow

  const isDraggingRef = useRef(false)
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const lastWorkflowVersionRef = useRef<string>("")
  const countRef = useRef<number>(0)

  const VERTICAL_SPACING = 200 // Moved VERTICAL_SPACING declaration here

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => parseWorkflowToReactFlow(activeWorkflow),
    [activeWorkflow],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

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
        forkTasks: Array.isArray(t.forkTasks)
          ? t.forkTasks.map((branch) =>
              Array.isArray(branch)
                ? branch.map((task) => ({
                    name: task.name,
                    taskReferenceName: task.taskReferenceName,
                    type: task.type,
                    inputParameters: task.inputParameters,
                  }))
                : [],
            )
          : undefined,
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

      // Check if this is a fork branch node (but NOT a JOIN node)
      if (afterNodeId.includes("_fork_") && !afterNodeId.includes("_join")) {
        const parts = afterNodeId.split("_fork_")
        const forkTaskRef = parts[0]
        const branchParts = parts[1].split("_")
        const branchIndex = Number.parseInt(branchParts[0])

        let taskTypeName = taskType.toLowerCase()
        if (taskType === "WORKER") taskTypeName = "worker_task"
        else if (taskType === "FORK_JOIN") taskTypeName = "fork"
        else if (taskType === "JOIN") taskTypeName = "join"
        else if (taskType === "DECISION") taskTypeName = "decision"
        else if (taskType === "JSON_JQ_TRANSFORM") taskTypeName = "json_jq"
        else if (taskType === "DYNAMIC_FORK") taskTypeName = "dynamic_fork"
        else if (taskType === "EVENT") taskTypeName = "event"
        else if (taskType === "WAIT") taskTypeName = "wait"

        const count = countRef.current
        const newTaskName = `${taskTypeName}_${count}`
        const newTaskRef = `${taskTypeName}_ref_${count}`
        countRef.current += 1

        console.log("[v0] Creating new task for fork branch:", { newTaskName, newTaskRef, forkTaskRef, branchIndex })

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
        } else if (taskType === "JSON_JQ_TRANSFORM") {
          taskData.inputParameters = {
            queryExpression: ".[]",
          }
        } else if (taskType === "DYNAMIC_FORK") {
          taskData.dynamicForkTasksParam = "dynamicTasks"
          taskData.dynamicForkTasksInputParamName = "dynamicTasksInput"
          taskData.inputParameters = {
            dynamicTasks: [],
            dynamicTasksInput: {},
          }
        } else if (taskType === "EVENT") {
          taskData.sink = "conductor"
          taskData.asyncComplete = false
        } else if (taskType === "WAIT") {
          taskData.inputParameters = {
            duration: "",
            until: "",
          }
        }

        console.log("[v0] Adding task to fork branch:", { forkTaskRef, branchIndex })
        addTaskToForkBranch(taskData, forkTaskRef, branchIndex)
        return
      }

      if (afterNodeId.includes("_case_") && !afterNodeId.includes("_join")) {
        const parts = afterNodeId.split("_case_")
        const decisionTaskRef = parts[0]
        const caseParts = parts[1].split("_")
        const caseName = caseParts.slice(0, -1).join("_")

        let taskTypeName = taskType.toLowerCase()
        if (taskType === "WORKER") taskTypeName = "worker_task"
        else if (taskType === "FORK_JOIN") taskTypeName = "fork"
        else if (taskType === "JOIN") taskTypeName = "join"
        else if (taskType === "DECISION") taskTypeName = "decision"
        else if (taskType === "JSON_JQ_TRANSFORM") taskTypeName = "json_jq"
        else if (taskType === "DYNAMIC_FORK") taskTypeName = "dynamic_fork"
        else if (taskType === "EVENT") taskTypeName = "event"
        else if (taskType === "WAIT") taskTypeName = "wait"

        const count = countRef.current
        const newTaskName = `${taskTypeName}_${count}`
        const newTaskRef = `${taskTypeName}_ref_${count}`
        countRef.current += 1

        console.log("[v0] Creating new task for decision case:", { newTaskName, newTaskRef, decisionTaskRef, caseName })

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
        } else if (taskType === "JSON_JQ_TRANSFORM") {
          taskData.inputParameters = {
            queryExpression: ".[]",
          }
        } else if (taskType === "DYNAMIC_FORK") {
          taskData.dynamicForkTasksParam = "dynamicTasks"
          taskData.dynamicForkTasksInputParamName = "dynamicTasksInput"
          taskData.inputParameters = {
            dynamicTasks: [],
            dynamicTasksInput: {},
          }
        } else if (taskType === "EVENT") {
          taskData.sink = "conductor"
          taskData.asyncComplete = false
        } else if (taskType === "WAIT") {
          taskData.inputParameters = {
            duration: "",
            until: "",
          }
        }

        console.log("[v0] Adding task to decision branch:", { decisionTaskRef, caseName })
        addTaskToBranch(taskData, decisionTaskRef, caseName)
        return
      }

      const afterNode = currentNodes.find((n) => n.id === afterNodeId)
      if (!afterNode) {
        console.log("[v0] After node not found:", afterNodeId)
        return
      }

      if (afterNode.data?.taskType === "DECISION" || afterNode.data?.taskType === "SWITCH") {
        console.log("[v0] Decision node: branches have direct plus buttons, skipping branch selection")
        return
      }

      if (isForkType(afterNode.data?.taskType)) {
        console.log("[v0] Fork node: branches have direct plus buttons, skipping branch selection")
        return
      }

      if (isDynamicForkType(afterNode.data?.taskType)) {
        console.log("[v0] Dynamic fork node: branches have direct plus buttons, skipping branch selection")
        return
      }

      let taskTypeName = taskType.toLowerCase()
      if (taskType === "WORKER") taskTypeName = "worker_task"
      else if (taskType === "FORK_JOIN") taskTypeName = "fork"
      else if (taskType === "JOIN") taskTypeName = "join"
      else if (taskType === "DECISION") taskTypeName = "decision"
      else if (taskType === "JSON_JQ_TRANSFORM") taskTypeName = "json_jq"
      else if (taskType === "DYNAMIC_FORK") taskTypeName = "dynamic_fork"
      else if (taskType === "EVENT") taskTypeName = "event"
      else if (taskType === "WAIT") taskTypeName = "systemTask"

      const count = countRef.current
      const newTaskName = `${taskTypeName}_${count}`
      const newTaskRef = `${taskTypeName}_ref_${count}`
      countRef.current += 1

      console.log("[v0] Creating new task:", { newTaskName, newTaskRef })

      const newNodeId = `node-${Date.now()}`

      let reactFlowNodeType = "workerTask"
      if (taskType === "HTTP") reactFlowNodeType = "httpTask"
      else if (taskType === "EVENT") reactFlowNodeType = "eventTask"
      else if (taskType === "WAIT") reactFlowNodeType = "systemTask"
      else if (taskType === "DECISION") reactFlowNodeType = "decision"
      else if (taskType === "FORK_JOIN") reactFlowNodeType = "fork"
      else if (taskType === "JOIN") reactFlowNodeType = "join"
      else if (taskType === "JSON_JQ_TRANSFORM") reactFlowNodeType = "jsonJq"
      else if (taskType === "DYNAMIC_FORK") reactFlowNodeType = "dynamicFork"

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
      } else if (taskType === "EVENT") {
        taskData.sink = "conductor"
        taskData.asyncComplete = false
      } else if (taskType === "WAIT") {
        taskData.inputParameters = {
          duration: "",
          until: "",
        }
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
        taskData.joinOn = []
      } else if (taskType === "JSON_JQ_TRANSFORM") {
        taskData.inputParameters = {
          queryExpression: ".[]",
        }
        nodeData.queryExpression = ".[]"
      } else if (taskType === "DYNAMIC_FORK") {
        taskData.dynamicForkTasksParam = "dynamicTasks"
        taskData.dynamicForkTasksInputParamName = "dynamicTasksInput"
        taskData.inputParameters = {
          dynamicTasks: [],
          dynamicTasksInput: {},
        }
        nodeData.dynamicTasksParam = "dynamicTasks"
        nodeData.dynamicTasksInputParamName = "dynamicTasksInput"
      }

      const afterTaskRef = afterNode.data?.taskReferenceName
      console.log("[v0] Adding task to workflow context after:", afterTaskRef)
      addTask(taskData, afterTaskRef || (afterNodeId === "start" ? "start" : undefined))

      const newNode = {
        id: newNodeId,
        type: reactFlowNodeType,
        position: {
          x: afterNode.position.x,
          y: afterNode.position.y + VERTICAL_SPACING,
        },
        data: nodeData,
      }

      if (taskType === "FORK_JOIN") {
        const joinNodeId = `node-${Date.now()}-join`
        const joinTaskName = `${newTaskName}_join`
        const joinTaskRef = `${newTaskRef}_join`

        const joinNode = {
          id: joinNodeId,
          type: "join",
          position: {
            x: afterNode.position.x,
            y: afterNode.position.y + VERTICAL_SPACING * 2,
          },
          data: {
            label: joinTaskName,
            taskReferenceName: joinTaskRef,
            taskType: "JOIN",
            branchCount: 2,
            task: {
              name: joinTaskName,
              taskReferenceName: joinTaskRef,
              type: "JOIN",
              inputParameters: {},
              joinOn: [newTaskRef],
            },
          },
        }

        const updatedNodesWithJoin = currentNodes.map((node) => {
          if (node.position.y > afterNode.position.y) {
            return {
              ...node,
              position: {
                ...node.position,
                y: node.position.y + VERTICAL_SPACING * 2,
              },
            }
          }
          return node
        })

        const updatedEdgesWithJoin = currentEdges.map((edge) => {
          if (edge.source === afterNodeId) {
            return {
              ...edge,
              source: joinNodeId,
            }
          }
          return edge
        })

        const forkToJoinEdge = {
          id: `edge-${newNodeId}-${joinNodeId}`,
          source: newNodeId,
          target: joinNodeId,
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

        const afterToForkEdge = {
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

        console.log("[v0] Setting nodes and edges with FORK and JOIN")
        setNodes([...updatedNodesWithJoin, newNode, joinNode])
        setEdges([...updatedEdgesWithJoin, afterToForkEdge, forkToJoinEdge])

        nodePositionsRef.current[newNodeId] = newNode.position
        nodePositionsRef.current[joinNodeId] = joinNode.position
        updatedNodesWithJoin.forEach((node) => {
          nodePositionsRef.current[node.id] = node.position
        })

        return
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
        style: {
          strokeWidth: 2,
          stroke: "#64748b",
        },
        pathOptions: {
          borderRadius: 20,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#64748b",
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
    [setNodes, setEdges, addTask, addTaskToBranch, addTaskToForkBranch, VERTICAL_SPACING],
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
          style: {
            strokeWidth: 2,
            stroke: "#64748b",
          },
          pathOptions: {
            borderRadius: 20,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#64748b",
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
      style: {
        strokeWidth: 2,
        stroke: "#64748b",
      },
      pathOptions: {
        borderRadius: 20,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#64748b",
      },
    }),
    [],
  )

  useEffect(() => {
    ;(window as any).__addNodeAfter = addNodeAfter
    ;(window as any).__removeNode = removeNode

    return () => {
      // Cleanup on unmount
      delete (window as any).__addNodeAfter
      delete (window as any).__removeNode
    }
  }, [addNodeAfter, removeNode])

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
      >
        <Background color="#64748b" gap={16} size={1.5} variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
