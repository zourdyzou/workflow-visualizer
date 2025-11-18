export interface ConductorWorkflow {
  name: string
  description?: string
  version?: number
  tasks: ConductorTask[]
  inputParameters?: string[]
  outputParameters?: Record<string, any>
  schemaVersion?: number
  restartable?: boolean
  workflowStatusListenerEnabled?: boolean
  ownerEmail?: string
  timeoutSeconds?: number
  timeoutPolicy?: string
  failureWorkflow?: string
}

export interface ConductorTask {
  name: string
  taskReferenceName: string
  type: string
  description?: string
  optional?: boolean
  inputParameters?: Record<string, any>
  outputParameters?: Record<string, any>
  startDelay?: number
  retryCount?: number
  retryLogic?: string
  retryDelaySeconds?: number
  responseTimeoutSeconds?: number
  timeoutSeconds?: number
  timeoutPolicy?: string
  asyncComplete?: boolean
  // For FORK_JOIN tasks
  forkTasks?: ConductorTask[][]
  // For DECISION tasks
  decisionCases?: Record<string, ConductorTask[]>
  defaultCase?: ConductorTask[]
  // For DYNAMIC tasks
  dynamicTaskNameParam?: string
  dynamicForkTasksParam?: string
  dynamicForkTasksInputParamName?: string
  forkTaskName?: string
  forkTaskInputs?: any[]
  forkTaskWorkflow?: string
  forkTaskWorkflowVersion?: number
  queryExpression?: string
}

export interface WorkflowExecution {
  // Execution metadata
  workflowId: string
  workflowName: string
  workflowVersion: number
  status: WorkflowExecutionStatus
  
  // Timing
  createTime: number
  startTime: number
  endTime?: number
  updateTime: number
  
  // Ownership
  ownerApp?: string
  createdBy?: string
  updatedBy?: string
  
  // Actual runtime data
  input: Record<string, any>
  output?: Record<string, any>
  
  // Executed tasks with runtime data
  tasks: ExecutedTask[]
  
  // Original workflow definition (embedded)
  workflowDefinition: ConductorWorkflow
  
  // Runtime state
  variables?: Record<string, any>
  failedReferenceTaskNames?: string[]
  failedTaskNames?: string[]
  lastRetriedTime?: number
  taskToDomain?: Record<string, string>
  priority?: number
  rateLimited?: boolean
  correlationId?: string
  reasonForIncompletion?: string
  event?: string
  history?: any[]
}

export interface ExecutedTask {
  // Task identification
  taskId: string
  taskType: string
  taskDefName: string
  referenceTaskName: string
  status: TaskExecutionStatus
  
  // Timing
  scheduledTime: number
  startTime?: number
  endTime?: number
  updateTime: number
  startDelayInSeconds?: number
  
  // Execution metadata
  seq: number
  pollCount: number
  retryCount: number
  retried: boolean
  executed: boolean
  callbackFromWorker?: boolean
  workerId?: string
  
  // Actual runtime data
  inputData: Record<string, any>
  outputData?: Record<string, any>
  reasonForIncompletion?: string
  
  // Original task definition
  workflowTask: ConductorTask
  
  // Workflow context
  workflowInstanceId: string
  workflowType: string
  responseTimeoutSeconds?: number
  callbackAfterSeconds?: number
  workflowPriority?: number
  iteration?: number
  queueWaitTime?: number
  loopOverTask?: boolean
  subworkflowId?: string
  subworkflowChanged?: boolean
}

export type WorkflowExecutionStatus =
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "TIMED_OUT"
  | "TERMINATED"

export type TaskExecutionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "TIMED_OUT"
  | "CANCELED"
  | "COMPLETED_WITH_ERRORS"
