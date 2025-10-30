"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import type { ConductorWorkflow } from "./types/conductor-types"

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
  if (!isOpen) {
    return (
      <div className="w-12 border-l bg-gray-50 flex items-start justify-center pt-4">
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(true)} className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[480px] border-l bg-white flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{selectedNode ? "Task Configuration" : "Workflow Configuration"}</h2>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {selectedNode ? (
          <TaskForm key={selectedNode.id} task={selectedNode.data} />
        ) : (
          <WorkflowForm workflow={workflow} />
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1">
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
        <Label htmlFor="owner-email">Owner Email</Label>
        <Input id="owner-email" type="email" defaultValue={workflow.ownerEmail} />
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

function TaskForm({ task }: { task: any }) {
  const fullTask = task.task || task
  const taskType = task.taskType || "SIMPLE"

  return (
    <Tabs defaultValue="definition" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="definition">Definition</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="definition" className="space-y-4 mt-4">
        {taskType === "SIMPLE" && <SimpleTaskForm task={fullTask} />}
        {taskType === "HTTP" && <HttpTaskForm task={fullTask} />}
        {taskType === "EVENT" && <EventTaskForm task={fullTask} />}
        {taskType === "START_WORKFLOW" && <StartWorkflowTaskForm task={fullTask} />}
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="timeout">Timeout (seconds)</Label>
          <Input id="timeout" type="number" placeholder="3600" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retry-count">Retry Count</Label>
          <Input id="retry-count" type="number" placeholder="3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
          <Input id="retry-delay" type="number" placeholder="60" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="optional" className="h-4 w-4" />
          <Label htmlFor="optional" className="font-normal">
            Optional Task
          </Label>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function SimpleTaskForm({ task }: { task: any }) {
  const inputParams = task.inputParameters || {}
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(inputParams).map(([key, value]) => ({
      key,
      value: String(value),
      type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
    })),
  )

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
        <Input id="task-ref" defaultValue={task.taskReferenceName || ""} />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
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
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function HttpTaskForm({ task }: { task: any }) {
  const httpRequest = task.inputParameters?.http_request || {}
  const method = httpRequest.method || "GET"
  const uri = httpRequest.uri || ""
  const headers = httpRequest.headers || {}
  const accept = headers.Accept || headers.accept || "application/json"
  const contentType = headers["Content-Type"] || headers["content-type"] || "application/json"
  const body = httpRequest.body || {}
  const bodyStr = Object.keys(body).length > 0 ? JSON.stringify(body, null, 2) : "{}"

  const [otherHeaders, setOtherHeaders] = useState<Array<{ key: string; value: string }>>([])
  const [bodyType, setBodyType] = useState<"json" | "parameters">("json")
  const [bodyParameters, setBodyParameters] = useState<Array<{ key: string; value: string }>>([])

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
          <Input id="task-name" defaultValue={task.name || ""} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-ref">Reference Name</Label>
          <Input id="task-ref" defaultValue={task.taskReferenceName || ""} className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select defaultValue={method}>
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
            defaultValue={uri}
            placeholder="https://orkes-api-tester.orkesconductor.com/api"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accept">Accept</Label>
          <Input id="accept" defaultValue={accept} className="w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-type">Content-Type</Label>
          <Input id="content-type" defaultValue={contentType} className="w-full" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-attempts">Maximum Attempts</Label>
        <Input id="max-attempts" type="number" placeholder="3" className="w-full" />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Other headers:</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {otherHeaders.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addHeader} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add header
              </Button>
              <span className="text-sm text-gray-500">(empty)</span>
            </div>
          ) : (
            <div className="space-y-3">
              {otherHeaders.map((header, index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`header-key-${index}`}>Header</Label>
                    <Input
                      id={`header-key-${index}`}
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...otherHeaders]
                        newHeaders[index].key = e.target.value
                        setOtherHeaders(newHeaders)
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`header-value-${index}`}>Value</Label>
                    <Input
                      id={`header-value-${index}`}
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...otherHeaders]
                        newHeaders[index].value = e.target.value
                        setOtherHeaders(newHeaders)
                      }}
                      placeholder="New value"
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHeader(index)}
                    className="h-10 w-10 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addHeader} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add header
              </Button>
            </div>
          )}
        </div>
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
            <Textarea id="body-code" defaultValue={bodyStr} rows={6} className="font-mono text-sm resize-none w-full" />
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            {bodyParameters.length === 0 ? (
              <div className="flex items-center justify-between">
                <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
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
                <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
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

function EventTaskForm({ task }: { task: any }) {
  const eventName = task.inputParameters?.eventName || ""
  const sink = task.sink || ""
  const inputParams = task.inputParameters || {}
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(inputParams)
      .filter(([key]) => key !== "eventName")
      .map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
      })),
  )

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
        <Input id="task-ref" defaultValue={task.taskReferenceName || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-name">Event Name</Label>
        <Input id="event-name" defaultValue={eventName} placeholder="internal_event_name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-sink">Event Sink</Label>
        <Input id="event-sink" defaultValue={sink} placeholder="sqs:queue_name" />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
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
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StartWorkflowTaskForm({ task }: { task: any }) {
  const workflowName = task.inputParameters?.workflowName || task.subWorkflowParam?.name || ""
  const workflowVersion = task.inputParameters?.workflowVersion || task.subWorkflowParam?.version || 1
  const workflowInput = task.inputParameters?.workflowInput || task.inputParameters || {}
  const [parameters, setParameters] = useState<Array<{ key: string; value: string; type: string }>>(
    Object.entries(workflowInput)
      .filter(([key]) => key !== "workflowName" && key !== "workflowVersion")
      .map(([key, value]) => ({
        key,
        value: String(value),
        type: typeof value === "number" ? "Number" : typeof value === "boolean" ? "Boolean" : "String",
      })),
  )

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
        <Input id="task-ref" defaultValue={task.taskReferenceName || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-name">Workflow Name</Label>
        <Input id="workflow-name" defaultValue={workflowName} placeholder="sub_workflow_name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workflow-version">Workflow Version</Label>
        <Input id="workflow-version" type="number" defaultValue={workflowVersion} placeholder="1" />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Input parameters</div>

        <div className="border border-dashed border-gray-300 rounded-md p-4">
          {parameters.length === 0 ? (
            <div className="flex items-center justify-between">
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
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
              <Button onClick={addParameter} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add parameter
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
