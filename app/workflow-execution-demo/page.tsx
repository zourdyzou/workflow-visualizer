"use client"

import { WorkflowViewerTool } from "@/components/workflow-visualizer/workflow-viewer-tool"
import { defaultWorkflowFormLocalization } from "@/lib/workflow-form-localization"
import type { WorkflowExecution } from "@/components/workflow-visualizer/types/conductor-types"

const workflowExecutionExample: WorkflowExecution = {
  workflowId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
  workflowName: "complex_order_processing",
  workflowVersion: 1,
  status: "RUNNING",
  
  createTime: 1753883456574,
  startTime: 1753883456574,
  endTime: undefined,
  updateTime: Date.now(),
  
  ownerApp: "order-service",
  createdBy: "john.doe@acme.com",
  updatedBy: "john.doe@acme.com",
  
  input: {
    orderId: "ORD-12345",
    customerId: "CUST-789",
    amount: 299.99,
    paymentMethod: "credit_card",
    priority: "express",
    items: [
      { productId: "P001", quantity: 2, price: 99.99 },
      { productId: "P002", quantity: 1, price: 100.01 }
    ]
  },
  output: {},
  
  tasks: [
    // Task 1: Validate Order - COMPLETED
    {
      taskId: "task-001",
      taskType: "WORKER",
      status: "COMPLETED",
      referenceTaskName: "validate_order",
      taskDefName: "validate_order_worker",
      scheduledTime: 1753883456582,
      startTime: 1753883456663,
      endTime: 1753883458000,
      updateTime: 1753883458000,
      startDelayInSeconds: 0,
      seq: 1,
      pollCount: 1,
      retryCount: 0,
      retried: false,
      executed: true,
      callbackFromWorker: true,
      workerId: "worker-pod-abc123",
      inputData: {
        orderId: "ORD-12345",
        items: [
          { productId: "P001", quantity: 2 },
          { productId: "P002", quantity: 1 }
        ]
      },
      outputData: {
        valid: true,
        stockAvailable: true,
        estimatedDelivery: "2024-01-25"
      },
      workflowTask: {
        name: "validate_order_worker",
        taskReferenceName: "validate_order",
        type: "WORKER",
        inputParameters: {
          orderId: "${workflow.input.orderId}",
          items: "${workflow.input.items}"
        }
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 81,
      loopOverTask: false
    },
    // Task 2: DECISION - Route payment by method - COMPLETED
    {
      taskId: "task-002",
      taskType: "DECISION",
      status: "COMPLETED",
      referenceTaskName: "payment_router",
      taskDefName: "DECISION",
      scheduledTime: 1753883458100,
      startTime: 1753883458150,
      endTime: 1753883458200,
      updateTime: 1753883458200,
      startDelayInSeconds: 0,
      seq: 2,
      pollCount: 1,
      retryCount: 0,
      retried: false,
      executed: true,
      callbackFromWorker: false,
      workerId: "conductor-server",
      inputData: {
        paymentMethod: "credit_card"
      },
      outputData: {
        caseOutput: ["credit_card"]
      },
      workflowTask: {
        name: "payment_router",
        taskReferenceName: "payment_router",
        type: "DECISION",
        inputParameters: {
          paymentMethod: "${workflow.input.paymentMethod}"
        },
        caseValueParam: "paymentMethod",
        decisionCases: {
          credit_card: [
            {
              name: "process_credit_card_worker",
              taskReferenceName: "process_credit_card",
              type: "WORKER"
            }
          ],
          paypal: [
            {
              name: "process_paypal_worker",
              taskReferenceName: "process_paypal",
              type: "WORKER"
            }
          ],
          crypto: [
            {
              name: "process_crypto_worker",
              taskReferenceName: "process_crypto",
              type: "WORKER"
            }
          ]
        },
        defaultCase: [
          {
            name: "manual_review_worker",
            taskReferenceName: "manual_review",
            type: "WORKER"
          }
        ]
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 50,
      loopOverTask: false
    },
    // Task 3: Credit Card Payment (from DECISION) - COMPLETED
    {
      taskId: "task-003",
      taskType: "WORKER",
      status: "COMPLETED",
      referenceTaskName: "process_credit_card",
      taskDefName: "process_credit_card_worker",
      scheduledTime: 1753883458300,
      startTime: 1753883458400,
      endTime: 1753883460500,
      updateTime: 1753883460500,
      startDelayInSeconds: 0,
      seq: 3,
      pollCount: 1,
      retryCount: 0,
      retried: false,
      executed: true,
      callbackFromWorker: true,
      workerId: "payment-worker-cc001",
      inputData: {
        amount: 299.99,
        currency: "USD",
        cardToken: "tok_visa_4242"
      },
      outputData: {
        transactionId: "TXN-CC-98765",
        status: "SUCCESS",
        authCode: "AUTH-123456"
      },
      workflowTask: {
        name: "process_credit_card_worker",
        taskReferenceName: "process_credit_card",
        type: "WORKER"
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 100,
      loopOverTask: false
    },
    // Task 4: FORK - Parallel notifications and fulfillment - COMPLETED
    {
      taskId: "task-004",
      taskType: "FORK_JOIN",
      status: "COMPLETED",
      referenceTaskName: "parallel_tasks",
      taskDefName: "FORK_JOIN",
      scheduledTime: 1753883460600,
      startTime: 1753883460650,
      endTime: 1753883460700,
      updateTime: 1753883460700,
      startDelayInSeconds: 0,
      seq: 4,
      pollCount: 1,
      retryCount: 0,
      retried: false,
      executed: true,
      callbackFromWorker: false,
      workerId: "conductor-server",
      inputData: {},
      outputData: {},
      workflowTask: {
        name: "parallel_tasks",
        taskReferenceName: "parallel_tasks",
        type: "FORK_JOIN",
        forkTasks: [
          [
            {
              name: "send_email_worker",
              taskReferenceName: "send_email",
              type: "WORKER"
            }
          ],
          [
            {
              name: "send_sms_worker",
              taskReferenceName: "send_sms",
              type: "WORKER"
            }
          ],
          [
            {
              name: "create_shipment",
              taskReferenceName: "create_shipment",
              type: "HTTP"
            }
          ]
        ]
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 50,
      loopOverTask: false
    },
    // Fork Branch 1: Send Email - COMPLETED
    {
      taskId: "task-005",
      taskType: "WORKER",
      status: "COMPLETED",
      referenceTaskName: "send_email",
      taskDefName: "send_email_worker",
      scheduledTime: 1753883460800,
      startTime: 1753883460900,
      endTime: 1753883462000,
      updateTime: 1753883462000,
      startDelayInSeconds: 0,
      seq: 5,
      pollCount: 1,
      retryCount: 0,
      retried: false,
      executed: true,
      callbackFromWorker: true,
      workerId: "notification-worker-001",
      inputData: {
        to: "customer@example.com",
        template: "order_confirmation",
        orderId: "ORD-12345"
      },
      outputData: {
        messageId: "MSG-EMAIL-789",
        sent: true,
        timestamp: "2024-01-15T10:30:00Z"
      },
      workflowTask: {
        name: "send_email_worker",
        taskReferenceName: "send_email",
        type: "WORKER"
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 100,
      loopOverTask: false
    },
    // Fork Branch 2: Send SMS - IN_PROGRESS
    {
      taskId: "task-006",
      taskType: "WORKER",
      status: "IN_PROGRESS",
      referenceTaskName: "send_sms",
      taskDefName: "send_sms_worker",
      scheduledTime: 1753883460800,
      startTime: 1753883461500,
      endTime: undefined,
      updateTime: Date.now(),
      startDelayInSeconds: 0,
      seq: 6,
      pollCount: 2,
      retryCount: 0,
      retried: false,
      executed: false,
      callbackFromWorker: true,
      workerId: "notification-worker-002",
      inputData: {
        phoneNumber: "+1234567890",
        message: "Your order ORD-12345 has been confirmed and will ship soon!"
      },
      outputData: {},
      workflowTask: {
        name: "send_sms_worker",
        taskReferenceName: "send_sms",
        type: "WORKER"
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 700,
      loopOverTask: false
    },
    // Fork Branch 3: Create Shipment - SCHEDULED
    {
      taskId: "task-007",
      taskType: "HTTP",
      status: "SCHEDULED",
      referenceTaskName: "create_shipment",
      taskDefName: "HTTP",
      scheduledTime: 1753883460800,
      startTime: undefined,
      endTime: undefined,
      updateTime: Date.now(),
      startDelayInSeconds: 0,
      seq: 7,
      pollCount: 0,
      retryCount: 0,
      retried: false,
      executed: false,
      callbackFromWorker: false,
      workerId: undefined,
      inputData: {
        uri: "https://api.shipping.example.com/shipments",
        method: "POST",
        body: {
          orderId: "ORD-12345",
          warehouse: "WH-CENTRAL",
          priority: "express"
        }
      },
      outputData: {},
      workflowTask: {
        name: "create_shipment",
        taskReferenceName: "create_shipment",
        type: "HTTP"
      },
      workflowInstanceId: "exec-3791f604-6d4c-11f0-880f-0246e7260963",
      workflowType: "complex_order_processing",
      responseTimeoutSeconds: 3600,
      callbackAfterSeconds: 0,
      workflowPriority: 0,
      iteration: 0,
      queueWaitTime: 0,
      loopOverTask: false
    }
  ],
  
  workflowDefinition: {
    name: "complex_order_processing",
    description: "Complex order processing with decision routing and parallel tasks",
    version: 1,
    schemaVersion: 2,
    tasks: [
      {
        name: "validate_order_worker",
        taskReferenceName: "validate_order",
        type: "WORKER",
        inputParameters: {
          orderId: "${workflow.input.orderId}",
          items: "${workflow.input.items}"
        }
      },
      {
        name: "payment_router",
        taskReferenceName: "payment_router",
        type: "DECISION",
        inputParameters: {
          paymentMethod: "${workflow.input.paymentMethod}"
        },
        caseValueParam: "paymentMethod",
        decisionCases: {
          credit_card: [
            {
              name: "process_credit_card_worker",
              taskReferenceName: "process_credit_card",
              type: "WORKER"
            }
          ],
          paypal: [
            {
              name: "process_paypal_worker",
              taskReferenceName: "process_paypal",
              type: "WORKER"
            }
          ],
          crypto: [
            {
              name: "process_crypto_worker",
              taskReferenceName: "process_crypto",
              type: "WORKER"
            }
          ]
        },
        defaultCase: [
          {
            name: "manual_review_worker",
            taskReferenceName: "manual_review",
            type: "WORKER"
          }
        ]
      },
      {
        name: "parallel_tasks",
        taskReferenceName: "parallel_tasks",
        type: "FORK_JOIN",
        forkTasks: [
          [
            {
              name: "send_email_worker",
              taskReferenceName: "send_email",
              type: "WORKER"
            }
          ],
          [
            {
              name: "send_sms_worker",
              taskReferenceName: "send_sms",
              type: "WORKER"
            }
          ],
          [
            {
              name: "create_shipment",
              taskReferenceName: "create_shipment",
              type: "HTTP"
            }
          ]
        ]
      },
      {
        name: "parallel_tasks_join",
        taskReferenceName: "parallel_tasks_join",
        type: "JOIN",
        joinOn: ["send_email", "send_sms", "create_shipment"]
      }
    ],
    inputParameters: ["orderId", "customerId", "amount", "paymentMethod", "priority", "items"],
    outputParameters: {},
    timeoutPolicy: "ALERT_ONLY",
    timeoutSeconds: 3600,
    restartable: true,
    workflowStatusListenerEnabled: true,
    failureWorkflow: "",
    ownerEmail: "engineering@example.com"
  },
  
  variables: {},
  failedReferenceTaskNames: [],
  failedTaskNames: [],
  lastRetriedTime: 0,
  taskToDomain: {},
  priority: 0,
  rateLimited: false,
  correlationId: "order-ORD-12345",
  reasonForIncompletion: "",
  event: ""
}

export default function WorkflowExecutionDemoPage() {
  const handleSave = (workflow: any) => {
    console.log("Execution data saved:", workflow)
  }

  const handleCancel = () => {
    console.log("Execution viewer cancelled")
  }

  return (
    <div className="wcv-h-screen wcv-w-full wcv-bg-background">
      <WorkflowViewerTool
        initialWorkflow={workflowExecutionExample}
        formLocalizedObj={defaultWorkflowFormLocalization}
        onSave={handleSave}
        onCancel={handleCancel}
        executionMode={true}
      />
    </div>
  )
}
