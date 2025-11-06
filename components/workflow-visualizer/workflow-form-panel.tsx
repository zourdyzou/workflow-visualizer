"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Pencil, CirclePlus, Trash2, ChevronsRight } from "lucide-react"
import { useState, useEffect } from "react"
import type { ConductorWorkflow } from "./types/conductor-types"
import { useWorkflow } from "./context/workflow-context"
import CodeEditor from "@uiw/react-textarea-code-editor"

interface WorkflowFormPanelProps {
  workflow: ConductorWorkflow
  selectedNode: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onCancel: () => void
}

export function WorkflowFormPanel({
  workflow,
  selectedNode,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
}: WorkflowFormPanelProps) {
  const [configTab, setConfigTab] = useState<"workflow" | "task">("workflow")
  const { workflow: contextWorkflow } = useWorkflow()

  const firstTask = contextWorkflow?.tasks?.[0]
  const displayTask =
    selectedNode ||
    (firstTask
      ? {
          id: firstTask.taskReferenceName,
          data: {
            task: firstTask,
            label: firstTask.name,
            taskReferenceName: firstTask.taskReferenceName,
            taskType: firstTask.type,
          },
        }
      : null)

  useEffect(() => {
    if (selectedNode) {
      setConfigTab("task")
    }
  }, [selectedNode])

  if (!isOpen) {
    return (
      <div className="w-12 border-l bg-gray-50 flex items-start justify-center pt-4">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(true)} className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const actualTaskReferenceName =
    displayTask?.data?.task?.taskReferenceName || displayTask?.data?.taskReferenceName || displayTask?.id

  return (
    <div className="w-[480px] border-l bg-white flex flex-col">
      <div className="border-b bg-white">
        <div className="flex items-center h-12 px-6 gap-6">
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors -ml-1 cursor-pointer"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfigTab("workflow")}
              className={`text-sm font-medium px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                configTab === "workflow"
                  ? "text-gray-900 bg-gray-100 border-sky-400"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Workflow
            </button>
            <button
              onClick={() => setConfigTab("task")}
              className={`text-sm font-medium px-3 py-2 border-b-2 transition-colors cursor-pointer ${
                configTab === "task"
                  ? "text-gray-900 bg-gray-100 border-sky-400"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Task
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {configTab === "workflow" ? (
          <WorkflowForm workflow={workflow} />
        ) : displayTask ? (
          <TaskForm key={displayTask.id} task={displayTask.data} taskReferenceName={actualTaskReferenceName} />
        ) : (
          <div className="text-center text-gray-500 py-8">No tasks available</div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1 bg-sky-400 hover:bg-sky-500 text-white">
          Save
        </Button>
      </div>
    </div>
  )
}

function WorkflowForm({ workflow }: { workflow: ConductorWorkflow }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="workflow-name">Workflow Name</Label>
        <Input id="workflow-name" defaultValue={workflow.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-description">Description</Label>
        <Textarea id="workflow-description" defaultValue={workflow.description} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-version">Version</Label>
        <Input id="workflow-version" type="number" defaultValue={workflow.version} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeout">Timeout (seconds)</Label>
        <Input id="timeout" type="number" defaultValue={workflow.timeoutSeconds} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeout-policy">Timeout Policy</Label>
        <Select defaultValue={workflow.timeoutPolicy}>
          <SelectTrigger id="timeout-policy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALERT_ONLY">Alert Only</SelectItem>
            <SelectItem value="TIME_OUT_WF">Time Out Workflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="failure-workflow">Failure Workflow</Label>
        <Input id="failure-workflow" defaultValue={workflow.failureWorkflow} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="restartable" defaultChecked={workflow.restartable} className="h-4 w-4" />
        <Label htmlFor="restartable" className="font-normal">
          Restartable
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="status-listener"
          defaultChecked={workflow.workflowStatusListenerEnabled}
          className="h-4 w-4"
        />
        <Label htmlFor="status-listener" className="font-normal">
          Workflow Status Listener Enabled
        </Label>
      </div>
    </div>
  )
}

function TaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const fullTask = task.task || task
  const taskType = task.taskType || "WORKER"

  return (
    <div className="space-y-4">
      {taskType === "WORKER" && <SimpleTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "HTTP" && <HttpTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "EVENT" && <EventTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "START_WORKFLOW" && <StartWorkflowTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "DECISION" && <DecisionTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "FORK_JOIN" && <ForkJoinTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "JOIN" && <JoinTaskForm task={fullTask} taskReferenceName={taskReferenceName} />}
      {taskType === "JSON_JQ_TRANSFORM" && (
        <JsonJqTransformForm task={fullTask} taskReferenceName={taskReferenceName} />
      )}
      {taskType === "DYNAMIC_FORK" && <DynamicForkForm task={fullTask} taskReferenceName={taskReferenceName} />}
    </div>
  )
}

function SimpleTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const inputParams = task.inputParameters || {}

  const [taskName, setTaskName] = useState(task.name || "")
  const [taskRef, setTaskRef] = useState(task.taskReferenceName || taskReferenceName)
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(inputParams).map(([key, value]) => ({
      key,
      value: String(value),
      type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
    })),
  )

  useEffect(() => {
    const newWorkflowInput = parameters.reduce(
      (acc, { key, value, type }) => {
        if (key) {
          switch (type) {
            case "Number":
              acc[key] = Number.parseFloat(value)
              break
            case "Boolean":
              acc[key] = value.toLowerCase() === "true"
              break
            case "Null":
              acc[key] = null
              break
            default:
              acc[key] = value
          }
        }
        return acc
      },
      {} as Record<string, any>,
    )

    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
      inputParameters: newWorkflowInput,
    })
  }, [taskName, taskRef, parameters, taskReferenceName, updateTask])

  const addParameter = () => {
    setParameters([...parameters, { key: "", value: "", type: "String" }])
  }

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
              <span className="text-sm text-gray-500">(empty)</span>
            </div>
          ) : (
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_140px_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`param-key-${index}`}>Key</Label>
                    <Input
                      id={`param-key-${index}`}
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].key = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-value-${index}`}>Value</Label>
                    <Input
                      id={`param-value-${index}`}
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].value = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-type-${index}`}>Type</Label>
                    <Select
                      value={param.type}
                      onValueChange={(value) => {
                        const newParams = [...parameters]
                        newParams[index].type = value
                        setParameters(newParams)
                      }}
                    >
                      <SelectTrigger id={`param-type-${index}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="String">String</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Boolean">Boolean</SelectItem>
                        <SelectItem value="Null">Null</SelectItem>
                        <SelectItem value="Object/Array">Object/Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function HttpTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const httpRequest = task.inputParameters?.http_request || {}

  const [taskName, setTaskName] = useState(task.name || "")
  const [taskRef, setTaskRef] = useState(task.taskReferenceName || taskReferenceName)
  const [method, setMethod] = useState(httpRequest.method || "GET")
  const [uri, setUri] = useState(httpRequest.uri || "")
  const headers = httpRequest.headers || {}
  const [accept, setAccept] = useState(headers.Accept || headers.accept || "application/json")
  const [contentType, setContentType] = useState(
    headers["Content-Type"] || headers["content-type"] || "application/json",
  )
  const body = httpRequest.body || {}
  const [bodyStr, setBodyStr] = useState(Object.keys(body).length > 0 ? JSON.stringify(body, null, 2) : "{}")

  const [otherHeaders, setOtherHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [bodyType, setBodyType] = useState<"json" | "parameters">("json")
  const [bodyParameters, setBodyParameters] = useState<Array<{ key: string; value: string }>>([])

  useEffect(() => {
    const httpRequestBody = bodyType === "json" ? JSON.parse(bodyStr) : {}
    const bodyParams =
      bodyType === "parameters"
        ? bodyParameters.reduce((acc, { key, value }) => {
            if (key) acc[key] = value
            return acc
          }, {})
        : {}

    const finalBody = bodyType === "json" ? httpRequestBody : bodyParams

    const updatedHeaders = otherHeaders.reduce((acc, { key, value }) => {
      if (key) acc[key] = value
      return acc
    }, {})

    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
      inputParameters: {
        http_request: {
          method: method,
          uri: uri,
          headers: {
            Accept: accept,
            "Content-Type": contentType,
            ...updatedHeaders,
          },
          body: finalBody,
        },
      },
    })
  }, [
    taskName,
    taskRef,
    method,
    uri,
    accept,
    contentType,
    otherHeaders,
    bodyType,
    bodyStr,
    bodyParameters,
    taskReferenceName,
    updateTask,
  ])

  const addHeader = () => {
    setOtherHeaders([...otherHeaders, { key: "", value: "" }])
  }

  const removeHeader = (index: number) => {
    setOtherHeaders(otherHeaders.filter((_, i) => i !== index))
  }

  const addParameter = () => {
    setBodyParameters([...bodyParameters, { key: "", value: "" }])
  }

  const removeParameter = (index: number) => {
    setBodyParameters(bodyParameters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-name">Task Definition</Label>
          <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-ref">Reference Name</Label>
          <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="method" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="HEAD">HEAD</SelectItem>
              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="https://orkes-api-tester.orkesconductor.com/api"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accept">Accept</Label>
          <Input id="accept" value={accept} onChange={(e) => setAccept(e.target.value)} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-type">Content-Type</Label>
          <Input
            id="content-type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-attempts">Maximum Attempts</Label>
        <Input id="max-attempts" type="number" placeholder="3" className="w-full" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Body:</span>
          <RadioGroup
            value={bodyType}
            onValueChange={(v) => setBodyType(v as "json" | "parameters")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="font-normal cursor-pointer">
                JSON
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="parameters" id="parameters" />
              <Label htmlFor="parameters" className="font-normal cursor-pointer">
                Parameters
              </Label>
            </div>
          </RadioGroup>
        </div>

        {bodyType === "json" ? (
          <div className="space-y-2">
            <Label htmlFor="body-code">Code</Label>
            <Textarea
              id="body-code"
              value={bodyStr}
              onChange={(e) => setBodyStr(e.target.value)}
              rows={6}
              className="font-mono text-sm resize-none w-full"
            />
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            {bodyParameters.length === 0 ? (
              <div className="flex items-center justify-between">
                <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                  <CirclePlus className="h-4 w-4 mr-2" />
                  Add parameter
                </Button>
                <span className="text-sm text-gray-500">(empty)</span>
              </div>
            ) : (
              <div className="space-y-3">
                {bodyParameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end">
                    <div className="space-y-2">
                      <Label htmlFor={`param-key-${index}`}>Key</Label>
                      <Input
                        id={`param-key-${index}`}
                        value={param.key}
                        onChange={(e) => {
                          const newParams = [...bodyParameters]
                          newParams[index].key = e.target.value
                          setBodyParameters(newParams)
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`param-value-${index}`}>Value</Label>
                      <Input
                        id={`param-value-${index}`}
                        value={param.value}
                        onChange={(e) => {
                          const newParams = [...bodyParameters]
                          newParams[index].value = e.target.value
                          setBodyParameters(newParams)
                        }}
                        placeholder="New value"
                        className="w-full"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParameter(index)}
                      className="h-10 w-10 text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                  <CirclePlus className="h-4 w-4 mr-2" />
                  Add parameter
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EventTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const eventName = task.inputParameters?.eventName || ""
  const sink = task.sink || ""
  const inputParams = task.inputParameters || {}
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(inputParams)
      .filter(([key]) => key !== "eventName" && key !== "eventSink")
      .map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
      })),
  )
  const [currentEventName, setEventName] = useState(eventName)
  const [currentSink, setSink] = useState(sink)

  useEffect(() => {
    const newWorkflowInput = parameters.reduce(
      (acc, { key, value, type }) => {
        if (key) {
          switch (type) {
            case "Number":
              acc[key] = Number.parseFloat(value)
              break
            case "Boolean":
              acc[key] = value.toLowerCase() === "true"
              break
            case "Null":
              acc[key] = null
              break
            default:
              acc[key] = value
          }
        }
        return acc
      },
      {} as Record<string, any>,
    )

    updateTask(taskReferenceName, {
      name: task.name,
      taskReferenceName: task.taskReferenceName,
      inputParameters: {
        eventName: currentEventName,
        eventSink: currentSink,
        ...newWorkflowInput,
      },
      sink: currentSink,
    })
  }, [currentEventName, currentSink, parameters, taskReferenceName, updateTask, task.name, task.taskReferenceName])

  const addParameter = () => {
    setParameters([...parameters, { key: "", value: "", type: "String" }])
  }

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" defaultValue={task.name || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" defaultValue={task.taskReferenceName || taskReferenceName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-name">Event Name</Label>
        <Input
          id="event-name"
          value={currentEventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="internal_event_name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-sink">Event Sink</Label>
        <Input
          id="event-sink"
          value={currentSink}
          onChange={(e) => setSink(e.target.value)}
          placeholder="sqs:queue_name"
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
              <span className="text-sm text-gray-500">(empty)</span>
            </div>
          ) : (
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_140px_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`param-key-${index}`}>Key</Label>
                    <Input
                      id={`param-key-${index}`}
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].key = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-value-${index}`}>Value</Label>
                    <Input
                      id={`param-value-${index}`}
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].value = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-type-${index}`}>Type</Label>
                    <Select
                      value={param.type}
                      onValueChange={(value) => {
                        const newParams = [...parameters]
                        newParams[index].type = value
                        setParameters(newParams)
                      }}
                    >
                      <SelectTrigger id={`param-type-${index}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="String">String</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Boolean">Boolean</SelectItem>
                        <SelectItem value="Null">Null</SelectItem>
                        <SelectItem value="Object/Array">Object/Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StartWorkflowTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const workflowName = task.inputParameters?.workflowName || task.subWorkflowParam?.name || ""
  const workflowVersion = task.inputParameters?.workflowVersion || task.subWorkflowParam?.version || 1
  const workflowInput = task.inputParameters?.workflowInput || task.inputParameters || {}
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(workflowInput)
      .filter(([key]) => key !== "workflowName" && key !== "workflowVersion" && key !== "workflowInput")
      .map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
      })),
  )

  const [currentWorkflowName, setWorkflowName] = useState(workflowName)
  const [currentWorkflowVersion, setWorkflowVersion] = useState(String(workflowVersion))

  useEffect(() => {
    const newWorkflowInput = parameters.reduce(
      (acc, { key, value, type }) => {
        if (key) {
          switch (type) {
            case "Number":
              acc[key] = Number.parseFloat(value)
              break
            case "Boolean":
              acc[key] = value.toLowerCase() === "true"
              break
            case "Null":
              acc[key] = null
              break
            default:
              acc[key] = value
          }
        }
        return acc
      },
      {} as Record<string, any>,
    )

    updateTask(taskReferenceName, {
      name: task.name,
      taskReferenceName: task.taskReferenceName,
      inputParameters: {
        workflowName: currentWorkflowName,
        workflowVersion: Number.parseInt(currentWorkflowVersion, 10),
        workflowInput: newWorkflowInput,
      },
      subWorkflowParam: {
        name: currentWorkflowName,
        version: Number.parseInt(currentWorkflowVersion, 10),
      },
    })
  }, [
    currentWorkflowName,
    currentWorkflowVersion,
    parameters,
    taskReferenceName,
    updateTask,
    task.name,
    task.taskReferenceName,
  ])

  const addParameter = () => {
    setParameters([...parameters, { key: "", value: "", type: "String" }])
  }

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" defaultValue={task.name || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" defaultValue={task.taskReferenceName || taskReferenceName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-name">Workflow Name</Label>
        <Input
          id="workflow-name"
          value={currentWorkflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="sub_workflow_name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-version">Workflow Version</Label>
        <Input
          id="workflow-version"
          type="number"
          value={currentWorkflowVersion}
          onChange={(e) => setWorkflowVersion(e.target.value)}
          placeholder="1"
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
              <span className="text-sm text-gray-500">(empty)</span>
            </div>
          ) : (
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_140px_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`param-key-${index}`}>Key</Label>
                    <Input
                      id={`param-key-${index}`}
                      value={param.key}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].key = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-value-${index}`}>Value</Label>
                    <Input
                      id={`param-value-${index}`}
                      value={param.value}
                      onChange={(e) => {
                        const newParams = [...parameters]
                        newParams[index].value = e.target.value
                        setParameters(newParams)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`param-type-${index}`}>Type</Label>
                    <Select
                      value={param.type}
                      onValueChange={(value) => {
                        const newParams = [...parameters]
                        newParams[index].type = value
                        setParameters(newParams)
                      }}
                    >
                      <SelectTrigger id={`param-type-${index}`} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="String">String</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Boolean">Boolean</SelectItem>
                        <SelectItem value="Null">Null</SelectItem>
                        <SelectItem value="Object/Array">Object/Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addParameter} className="bg-sky-400 hover:bg-sky-500 text-white">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DecisionTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask, getTask } = useWorkflow()

  // Get the latest task data from the workflow context
  const latestTask = getTask(taskReferenceName) || task

  const [taskName, setTaskName] = useState(latestTask.name || "")
  const [taskRef, setTaskRef] = useState(latestTask.taskReferenceName || taskReferenceName)

  const decisionCases = latestTask.decisionCases || {}
  const defaultCase = latestTask.defaultCase || []

  useEffect(() => {
    setTaskName(latestTask.name || "")
    setTaskRef(latestTask.taskReferenceName || taskReferenceName)
  }, [latestTask.name, latestTask.taskReferenceName, taskReferenceName])

  useEffect(() => {
    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
    })
  }, [taskName, taskRef, taskReferenceName, updateTask])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Decision Cases</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {Object.keys(decisionCases).length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-2">(empty)</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(decisionCases).map(([caseName, tasks]: [string, any]) => (
                <div key={caseName} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">Case: {caseName}</div>
                    <div className="text-xs text-gray-500">
                      ({Array.isArray(tasks) ? tasks.length : 0} task
                      {Array.isArray(tasks) && tasks.length !== 1 ? "s" : ""})
                    </div>
                  </div>
                  <div className="pl-4 space-y-1">
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                      tasks.map((t: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="font-mono text-xs">{t.taskReferenceName}</span>
                          <span className="text-gray-400">({t.type})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 italic">No tasks</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Default Case</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {defaultCase.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-2">(empty)</div>
          ) : (
            <div className="space-y-1">
              {defaultCase.map((t: any, idx: number) => (
                <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="font-mono text-xs">{t.taskReferenceName}</span>
                  <span className="text-gray-400">({t.type})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ForkJoinTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask, getTask } = useWorkflow()

  // Get the latest task data from the workflow context
  const latestTask = getTask(taskReferenceName) || task

  const [taskName, setTaskName] = useState(latestTask.name || "")
  const [taskRef, setTaskRef] = useState(latestTask.taskReferenceName || taskReferenceName)

  const forkTasks = latestTask.forkTasks || []

  useEffect(() => {
    setTaskName(latestTask.name || "")
    setTaskRef(latestTask.taskReferenceName || taskReferenceName)
  }, [latestTask.name, latestTask.taskReferenceName, taskReferenceName])

  useEffect(() => {
    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
    })
  }, [taskName, taskRef, taskReferenceName, updateTask])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Fork Branches</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {forkTasks.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-2">(empty)</div>
          ) : (
            <div className="space-y-4">
              {forkTasks.map((branchTasks: any[], branchIndex: number) => (
                <div key={branchIndex} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">Branch {branchIndex + 1}</div>
                    <div className="text-xs text-gray-500">
                      ({Array.isArray(branchTasks) ? branchTasks.length : 0} task
                      {Array.isArray(branchTasks) && branchTasks.length !== 1 ? "s" : ""})
                    </div>
                  </div>
                  <div className="pl-4 space-y-1">
                    {Array.isArray(branchTasks) && branchTasks.length > 0 ? (
                      branchTasks.map((t: any, idx: number) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="font-mono text-xs">{t.taskReferenceName}</span>
                          <span className="text-gray-400">({t.type})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 italic">No tasks</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function JsonJqTransformForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const [taskName, setTaskName] = useState(task.name || "")
  const [taskRef, setTaskRef] = useState(task.taskReferenceName || taskReferenceName)
  const [queryExpression, setQueryExpression] = useState(task.inputParameters?.queryExpression || ".[]")

  useEffect(() => {
    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
      inputParameters: {
        ...task.inputParameters,
        queryExpression,
      },
    })
  }, [taskName, taskRef, queryExpression, taskReferenceName, updateTask, task.inputParameters])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="query-expression">JQ Query Expression</Label>
        <div className="border rounded-md overflow-hidden">
          <CodeEditor
            value={queryExpression}
            language="js"
            placeholder=".[] | select(.age > 18) | .name"
            onChange={(e) => setQueryExpression(e.target.value)}
            padding={12}
            style={{
              fontSize: 13,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              backgroundColor: "#f9fafb",
              minHeight: "120px",
            }}
          />
        </div>
        <p className="text-xs text-gray-500">Enter a jq expression to transform JSON data (e.g., .users[].name)</p>
      </div>
    </>
  )
}

function DynamicForkForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { updateTask } = useWorkflow()
  const [taskName, setTaskName] = useState(task.name || "")
  const [taskRef, setTaskRef] = useState(task.taskReferenceName || taskReferenceName)
  const [dynamicForkTasksParam, setDynamicForkTasksParam] = useState(task.dynamicForkTasksParam || "dynamicTasks")
  const [dynamicForkTasksInputParamName, setDynamicForkTasksInputParamName] = useState(
    task.dynamicForkTasksInputParamName || "dynamicTasksInput",
  )

  useEffect(() => {
    updateTask(taskReferenceName, {
      name: taskName,
      taskReferenceName: taskRef,
    })
  }, [taskName, taskRef, taskReferenceName, updateTask])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateTask(taskReferenceName, {
        dynamicForkTasksParam,
        dynamicForkTasksInputParamName,
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [dynamicForkTasksParam, dynamicForkTasksInputParamName, taskReferenceName, updateTask])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input id="task-ref" value={taskRef} onChange={(e) => setTaskRef(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dynamic-tasks-param">Dynamic Tasks Parameter</Label>
        <Input
          id="dynamic-tasks-param"
          value={dynamicForkTasksParam}
          onChange={(e) => setDynamicForkTasksParam(e.target.value)}
          placeholder="dynamicTasks"
        />
        <p className="text-xs text-gray-500">Name of the input parameter containing the array of tasks to fork</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dynamic-tasks-input-param">Dynamic Tasks Input Parameter</Label>
        <Input
          id="dynamic-tasks-input-param"
          value={dynamicForkTasksInputParamName}
          onChange={(e) => setDynamicForkTasksInputParamName(e.target.value)}
          placeholder="dynamicTasksInput"
        />
        <p className="text-xs text-gray-500">
          Name of the input parameter containing the map of inputs for each forked task
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> The number of branches and their tasks are determined at runtime based on the input
          parameters provided by a preceding task.
        </p>
      </div>
    </>
  )
}

function JoinTaskForm({ task, taskReferenceName }: { task: any; taskReferenceName: string }) {
  const { getTask } = useWorkflow()

  // Get the latest task data from the workflow context
  const latestTask = getTask(taskReferenceName) || task

  // Extract the fork reference name from the join task reference name
  // JOIN tasks are typically named like "fork_0_join", so we extract "fork_0"
  const forkReferenceName = latestTask.taskReferenceName?.replace(/_join$/, "") || ""
  const forkTask = getTask(forkReferenceName)

  const joinOn = latestTask.joinOn || []
  const numBranches = Array.isArray(joinOn) ? joinOn.length : 0

  return (
    <>
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 mb-4">
        <p className="text-sm text-purple-800">
          <strong>Note:</strong> JOIN tasks are automatically created and managed by the system. They wait for all
          branches of a FORK to complete before continuing the workflow.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-name">Task Name</Label>
        <Input id="task-name" value={latestTask.name || ""} disabled className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-ref">Task Reference Name</Label>
        <Input
          id="task-ref"
          value={latestTask.taskReferenceName || taskReferenceName}
          disabled
          className="bg-gray-50"
        />
      </div>

      {forkReferenceName && (
        <div className="space-y-2">
          <Label htmlFor="fork-ref">Joins From Fork</Label>
          <Input id="fork-ref" value={forkReferenceName} disabled className="bg-gray-50" />
          {forkTask && (
            <p className="text-xs text-gray-500">
              Fork task: <span className="font-mono">{forkTask.name}</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="num-branches">Number of Branches</Label>
        <Input id="num-branches" value={numBranches} disabled className="bg-gray-50" />
        <p className="text-xs text-gray-500">
          This JOIN task waits for {numBranches} branch{numBranches !== 1 ? "es" : ""} to complete
        </p>
      </div>

      {joinOn.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Join On (Branch References)</div>

          <div className="border border-dashed border-gray-300 rounded-md p-4">
            <div className="space-y-2">
              {joinOn.map((ref: string, index: number) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="font-mono text-xs">{ref}</span>
                  <span className="text-gray-400">(Branch {index + 1})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
