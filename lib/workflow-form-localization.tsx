/**
 * Localization interface for the WorkflowFormPanel component.
 * Contains all the text labels and strings used throughout the workflow form panel UI.
 *
 * @interface WorkflowFormPanelLocalization
 *
 * @example
 * \`\`\`tsx
 * const customLocalization: WorkflowFormPanelLocalization = {
 *   workflowTab: "Flujo de trabajo",
 *   taskTab: "Tarea",
 *   // ... other Spanish translations
 * }
 *
 * <WorkflowViewerTool
 *   initialWorkflow={myWorkflow}
 *   formLocalizedObj={customLocalization}
 * />
 * \`\`\`
 */
export interface WorkflowFormPanelLocalization {
  // Tab labels
  workflowTab: string
  taskTab: string

  // Workflow form labels
  workflowName: string
  workflowDescription: string
  workflowVersion: string
  timeout: string
  timeoutPolicy: string
  failureWorkflow: string
  restartable: string
  workflowStatusListener: string

  // Timeout policy options
  alertOnly: string
  timeOutWorkflow: string

  // Task form common labels
  taskName: string
  taskReferenceName: string
  taskDefinition: string
  referenceName: string
  inputParameters: string
  addParameter: string
  empty: string
  key: string
  value: string
  type: string

  // Type options
  typeString: string
  typeNumber: string
  typeBoolean: string
  typeNull: string
  typeObjectArray: string

  // HTTP task labels
  method: string
  url: string
  accept: string
  contentType: string
  maximumAttempts: string
  body: string
  json: string
  parameters: string
  code: string

  // Event task labels
  eventName: string
  eventSink: string

  // Start Workflow task labels
  workflowNameField: string
  workflowVersionField: string

  // Decision task labels
  decisionCases: string
  defaultCase: string
  caseLabelPrefix: string
  noTasks: string
  tasks: string
  task: string

  // Fork/Join task labels
  forkBranches: string
  branchLabelPrefix: string
  joinNote: string
  joinsFromFork: string
  forkTaskLabel: string
  numberOfBranches: string
  joinOnBranchReferences: string
  branchLabel: string

  // JSON JQ Transform labels
  jqQueryExpression: string
  jqPlaceholder: string
  jqHelpText: string

  // Dynamic Fork labels
  dynamicTasksParameter: string
  dynamicTasksParameterHelp: string
  dynamicTasksInputParameter: string
  dynamicTasksInputParameterHelp: string
  dynamicForkNote: string

  // Button labels
  cancel: string
  save: string

  // Misc
  noTasksAvailable: string
}

/**
 * Default English localization for the WorkflowFormPanel component.
 * Provides all standard labels and text strings in English.
 *
 * @constant
 * @type {WorkflowFormPanelLocalization}
 *
 * @example
 * \`\`\`tsx
 * import { defaultWorkflowFormLocalization } from '@/lib/workflow-form-localization'
 *
 * <WorkflowViewerTool
 *   initialWorkflow={myWorkflow}
 *   formLocalizedObj={defaultWorkflowFormLocalization}
 * />
 * \`\`\`
 */
export const defaultWorkflowFormLocalization: WorkflowFormPanelLocalization = {
  workflowTab: "Workflow",
  taskTab: "Task",

  workflowName: "Workflow Name",
  workflowDescription: "Description",
  workflowVersion: "Version",
  timeout: "Timeout (seconds)",
  timeoutPolicy: "Timeout Policy",
  failureWorkflow: "Failure Workflow",
  restartable: "Restartable",
  workflowStatusListener: "Workflow Status Listener Enabled",

  alertOnly: "Alert Only",
  timeOutWorkflow: "Time Out Workflow",

  taskName: "Task Name",
  taskReferenceName: "Task Reference Name",
  taskDefinition: "Task Definition",
  referenceName: "Reference Name",
  inputParameters: "Input parameters",
  addParameter: "Add parameter",
  empty: "(empty)",
  key: "Key",
  value: "Value",
  type: "Type",

  typeString: "String",
  typeNumber: "Number",
  typeBoolean: "Boolean",
  typeNull: "Null",
  typeObjectArray: "Object/Array",

  method: "Method",
  url: "URL",
  accept: "Accept",
  contentType: "Content-Type",
  maximumAttempts: "Maximum Attempts",
  body: "Body:",
  json: "JSON",
  parameters: "Parameters",
  code: "Code",

  eventName: "Event Name",
  eventSink: "Event Sink",

  workflowNameField: "Workflow Name",
  workflowVersionField: "Workflow Version",

  decisionCases: "Decision Cases",
  defaultCase: "Default Case",
  caseLabelPrefix: "Case:",
  noTasks: "No tasks",
  tasks: "tasks",
  task: "task",

  forkBranches: "Fork Branches",
  branchLabelPrefix: "Branch",
  joinNote:
    "JOIN tasks are automatically created and managed by the system. They wait for all branches of a FORK to complete before continuing the workflow.",
  joinsFromFork: "Joins From Fork",
  forkTaskLabel: "Fork task:",
  numberOfBranches: "Number of Branches",
  joinOnBranchReferences: "Join On (Branch References)",
  branchLabel: "Branch",

  jqQueryExpression: "JQ Query Expression",
  jqPlaceholder: ".[] | select(.age > 18) | .name",
  jqHelpText: "Enter a jq expression to transform JSON data (e.g., .users[].name)",

  dynamicTasksParameter: "Dynamic Tasks Parameter",
  dynamicTasksParameterHelp: "Name of the input parameter containing the array of tasks to fork",
  dynamicTasksInputParameter: "Dynamic Tasks Input Parameter",
  dynamicTasksInputParameterHelp: "Name of the input parameter containing the map of inputs for each forked task",
  dynamicForkNote:
    "The number of branches and their tasks are determined at runtime based on the input parameters provided by a preceding task.",

  cancel: "Cancel",
  save: "Save",

  noTasksAvailable: "No tasks available",
}
