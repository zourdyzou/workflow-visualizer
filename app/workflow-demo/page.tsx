"use client"
import { WorkflowViewerTool } from "@/components/workflow-visualizer/workflow-viewer-tool"
import { defaultWorkflowFormLocalization } from "@/lib/workflow-form-localization"
import type { ConductorWorkflow } from "@/components/workflow-visualizer/types/conductor-types"

const sampleWorkflow: ConductorWorkflow = {
  name: "order_processing_workflow",
  description: "Complete order processing workflow with payment, inventory, and shipping",
  version: 2,
  tasks: [
    {
      name: "validate_order",
      taskReferenceName: "validate_ref",
      type: "WORKER",
      inputParameters: {
        orderId: "${workflow.input.orderId}",
        amount: "${workflow.input.amount}",
      },
      optional: false,
      asyncComplete: false,
      startDelay: 0,
    },
    {
      name: "process_payment",
      taskReferenceName: "payment_ref",
      type: "HTTP",
      inputParameters: {
        http_request: {
          method: "POST",
          uri: "/payment-service/process-payment",
          body: {
            orderId: "${workflow.input.orderId}",
            amount: "${workflow.input.amount}",
            currency: "${workflow.input.currency}",
          },
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      },
      timeoutSeconds: 300,
      retry: {
        retryFor: ["TIMEOUT", "SYSTEM_ERROR"],
        retryLimit: 3,
        retryDelaySeconds: 30,
      },
    },
    {
      name: "check_inventory",
      taskReferenceName: "inventory_ref",
      type: "WORKER",
      inputParameters: {
        productIds: "${workflow.input.productIds}",
        quantities: "${workflow.input.quantities}",
      },
      forkTasks: [
        {
          taskReferenceName: "inventory_check_1",
          type: "WORKER",
          inputParameters: {
            productId: "${workflow.input.productIds[0]}",
            quantity: "${workflow.input.quantities[0]}",
          },
        },
        {
          taskReferenceName: "inventory_check_2",
          type: "WORKER",
          inputParameters: {
            productId: "${workflow.input.productIds[1]}",
            quantity: "${workflow.input.quantities[1]}",
          },
        },
      ],
    },
    {
      name: "schedule_shipping",
      taskReferenceName: "shipping_ref",
      type: "WORKER",
      inputParameters: {
        orderId: "${workflow.input.orderId}",
        address: "${workflow.input.shippingAddress}",
      },
      joinOn: "inventory_ref",
      optional: true,
    },
  ],
  inputParameters: ["orderId", "amount", "currency", "productIds", "quantities", "shippingAddress"],
  outputParameters: {
    orderStatus: "${workflow.variables.orderStatus}",
    paymentId: "${payment_ref.output.paymentId}",
    trackingNumber: "${shipping_ref.output.trackingNumber}",
  },
  schemaVersion: 2,
  restartable: true,
  workflowStatusListenerEnabled: true,
  ownerEmail: "team@example.com",
  timeoutSeconds: 3600,
  timeoutPolicy: "ALERT_ONLY",
  failureWorkflow: "error_handling_workflow",
  inputTemplate: {
    currency: "USD",
  },
  variables: {
    orderStatus: "PENDING",
  },
}

export default function WorkflowDemoPage() {
  const handleSave = (workflow: ConductorWorkflow) => {
    console.log("[v0] Saved workflow:", workflow)
    // Here you would typically send the workflow to your backend API
    // Example: await fetch('/api/workflows', { method: 'POST', body: JSON.stringify(workflow) })
  }

  const handleCancel = () => {
    console.log("[v0] Cancelled changes")
  }

  return (
    <WorkflowViewerTool
      initialWorkflow={sampleWorkflow}
      onSave={handleSave}
      onCancel={handleCancel}
      formLocalizedObj={defaultWorkflowFormLocalization}
    />
  )
}
