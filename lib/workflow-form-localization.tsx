/**
 * Workflow Form Panel Localization Interface
 *
 * This interface defines all the localized strings used throughout the workflow form panels.
 * Implement this interface with your desired language/translations to customize the UI text.
 *
 * @example
 * \`\`\`typescript
 * const spanishLocalization: WorkflowFormPanelLocalization = {
 *   taskName: "Nombre de Tarea",
 *   taskReferenceName: "Nombre de Referencia",
 *   // ... other translations
 * }
 * \`\`\`
 */
export interface WorkflowFormPanelLocalization {
  // Tab labels
  workflowTab: string
  taskTab: string

  // Common actions
  save: string
  cancel: string
  addParameter: string
  empty: string

  // Common labels
  taskName: string
  taskReferenceName: string
  inputParameters: string
  key: string
  value: string
  type: string

  // Type options
  typeString: string
  typeNumber: string
  typeBoolean: string
  typeNull: string
  typeObjectArray: string

  // Workflow form
  workflowName: string
  workflowDescription: string
  workflowVersion: string
  timeout: string
  timeoutPolicy: string
  alertOnly: string
  timeOutWorkflow: string
  failureWorkflow: string
  restartable: string
  workflowStatusListener: string

  // HTTP task
  taskDefinition: string
  referenceName: string
  method: string
  url: string
  accept: string
  contentType: string
  maximumAttempts: string
  body: string
  json: string
  parameters: string

  // Event task
  eventName: string
  eventSink: string

  // Start Workflow task
  workflowNameField: string
  workflowVersionField: string

  // Decision task
  decisionCases: string
  defaultCase: string
  caseLabelPrefix: string
  tasks: string
  task: string
  noTasks: string

  // Fork/Join task
  forkBranches: string
  branchLabelPrefix: string
  joinNote: string
  joinsFromFork: string
  forkTaskLabel: string
  numberOfBranches: string
  joinOnBranchReferences: string
  branchLabel: string

  // JSON JQ Transform
  jqQueryExpression: string
  jqHelpText: string

  // Dynamic Fork
  dynamicTasksParameter: string
  dynamicTasksParameterHelp: string
  dynamicTasksInputParameter: string
  dynamicTasksInputParameterHelp: string
  dynamicForkNote: string

  // TERMINATE task
  terminationStatusLabel: string
  terminationStatusCompleted: string
  terminationStatusFailed: string
  terminationStatusTerminated: string
  terminationStatusHelp: string
  terminationReasonLabel: string
  terminationReasonPlaceholder: string
  terminationReasonHelp: string
  warningLabel: string
  terminationWarning: string

  // Misc
  noTasksAvailable: string

  // Wait task
  waitDurationLabel: string
  waitDurationPlaceholder: string
  waitDurationHelp: string
  waitUntilLabel: string
  waitUntilPlaceholder: string
  waitUntilHelp: string
  waitNote: string
}

/**
 * Default English localization for Workflow Form Panel
 *
 * This object provides all the default English text used throughout the workflow visualizer forms.
 * Use this as a reference when creating custom localizations.
 *
 * @example
 * \`\`\`typescript
 * import { defaultWorkflowFormLocalization } from '@/lib/workflow-form-localization'
 *
 * <WorkflowFormPanel
 *   localizedObj={defaultWorkflowFormLocalization}
 *   // ... other props
 * />
 * \`\`\`
 */
export const defaultWorkflowFormLocalization: WorkflowFormPanelLocalization = {
  // Tab labels
  workflowTab: "Workflow",
  taskTab: "Task",

  // Common actions
  save: "Save",
  cancel: "Cancel",
  addParameter: "Add Parameter",
  empty: "No parameters",

  // Common labels
  taskName: "Task Name",
  taskReferenceName: "Task Reference Name",
  inputParameters: "Input Parameters",
  key: "Key",
  value: "Value",
  type: "Type",

  // Type options
  typeString: "String",
  typeNumber: "Number",
  typeBoolean: "Boolean",
  typeNull: "Null",
  typeObjectArray: "Object/Array",

  // Workflow form
  workflowName: "Workflow Name",
  workflowDescription: "Description",
  workflowVersion: "Version",
  timeout: "Timeout (seconds)",
  timeoutPolicy: "Timeout Policy",
  alertOnly: "Alert Only",
  timeOutWorkflow: "Time Out Workflow",
  failureWorkflow: "Failure Workflow",
  restartable: "Restartable",
  workflowStatusListener: "Enable Workflow Status Listener",

  // HTTP task
  taskDefinition: "Task Name",
  referenceName: "Task Reference Name",
  method: "Method",
  url: "URL",
  accept: "Accept",
  contentType: "Content Type",
  maximumAttempts: "Maximum Attempts",
  body: "Body",
  json: "JSON",
  parameters: "Parameters",

  // Event task
  eventName: "Event Name",
  eventSink: "Event Sink",

  // Start Workflow task
  workflowNameField: "Workflow Name",
  workflowVersionField: "Workflow Version",

  // Decision task
  decisionCases: "Decision Cases",
  defaultCase: "Default Case",
  caseLabelPrefix: "Case",
  tasks: "tasks",
  task: "task",
  noTasks: "No tasks in this case",

  // Fork/Join task
  forkBranches: "Fork Branches",
  branchLabelPrefix: "Branch",
  joinNote:
    "JOIN tasks automatically synchronize parallel branches. This task waits for all configured branches to complete before proceeding.",
  joinsFromFork: "Joins From Fork",
  forkTaskLabel: "Fork Task:",
  numberOfBranches: "Number of Branches",
  joinOnBranchReferences: "Join On (Branch References)",
  branchLabel: "Branch",

  // JSON JQ Transform
  jqQueryExpression: "JQ Query Expression",
  jqHelpText: "Enter a jq expression to transform JSON data (e.g., .users[].name)",

  // Dynamic Fork
  dynamicTasksParameter: "Dynamic Tasks Parameter",
  dynamicTasksParameterHelp: "Name of the input parameter that contains the list of tasks to fork dynamically",
  dynamicTasksInputParameter: "Dynamic Tasks Input Parameter",
  dynamicTasksInputParameterHelp: "Name of the input parameter that contains the input data for each dynamic task",
  dynamicForkNote:
    "Dynamic Fork tasks create parallel branches at runtime based on input parameters. The tasks to execute are determined during workflow execution.",

  // TERMINATE task
  terminationStatusLabel: "Status",
  terminationStatusCompleted: "COMPLETED",
  terminationStatusFailed: "FAILED",
  terminationStatusTerminated: "TERMINATED",
  terminationStatusHelp: "Choose how the workflow should be marked when this task executes",
  terminationReasonLabel: "Reason",
  terminationReasonPlaceholder: "Enter reason for termination",
  terminationReasonHelp: "Provide a reason for termination. This will be recorded in the workflow execution.",
  warningLabel: "Warning:",
  terminationWarning:
    "When this task executes, the workflow will immediately terminate with the specified status. No subsequent tasks will be executed.",

  // Misc
  noTasksAvailable: "No tasks available",

  // Wait task
  waitDurationLabel: "Duration",
  waitDurationPlaceholder: "2 days 3 hours 5 minutes",
  waitDurationHelp:
    "Specify duration using days (d), hours (hrs/h), minutes (mins/m), seconds (secs/s). Example: '2 days 3 hours 5 minutes'",
  waitUntilLabel: "Wait Until",
  waitUntilPlaceholder: "2024-12-31 23:59 GMT+00:00",
  waitUntilHelp: "Specify a datetime to wait until. Formats: 'yyyy-MM-dd HH:mm z', 'yyyy-MM-dd HH:mm', or 'yyyy-MM-dd'",
  waitNote:
    "WAIT tasks pause workflow execution either for a specified duration or until a specific datetime. Only one field (Duration or Wait Until) should be filled.",
}
