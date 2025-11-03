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
