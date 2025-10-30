"use client"

import { useState } from "react"
import { WorkflowManagementVisualizer } from "@/components/workflow-visualizer/workflow-management-visualizer"
import { WorkflowFormPanel } from "@/components/workflow-visualizer/workflow-form-panel"
import { WorkflowProvider, useWorkflow } from "@/components/workflow-visualizer/context/workflow-context"
import type { ConductorWorkflow } from "@/components/workflow-visualizer/types/conductor-types"

const sampleWorkflow: ConductorWorkflow = {
  name: "order_processing_workflow",
  description: "Complete order processing workflow with payment, inventory, and shipping",
  version: 2,
  tasks: [
    {
      name: "validate_order",
      taskReferenceName: "validate_ref",
      type: "SIMPLE",
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
      type: "SIMPLE",
      inputParameters: {
        productIds: "${workflow.input.productIds}",
        quantities: "${workflow.input.quantities}",
      },
      forkTasks: [
        {
          taskReferenceName: "inventory_check_1",
          type: "SIMPLE",
          inputParameters: {
            productId: "${workflow.input.productIds[0]}",
            quantity: "${workflow.input.quantities[0]}",
          },
        },
        {
          taskReferenceName: "inventory_check_2",
          type: "SIMPLE",
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
      type: "SIMPLE",
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

function WorkflowDemoContent() {
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const { workflow, exportWorkflow } = useWorkflow()

  const handleSave = () => {
    const conductorWorkflow = exportWorkflow()
    console.log("[v0] Saved workflow in Conductor format:", JSON.stringify(conductorWorkflow, null, 2))
    setIsPanelOpen(false)
  }

  const handleCancel = () => {
    console.log("[v0] Cancelled changes")
    setSelectedNode(null)
    setIsPanelOpen(false)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <WorkflowManagementVisualizer
          workflow={workflow}
          onNodeClick={(node) => {
            setSelectedNode(node)
            setIsPanelOpen(true)
          }}
        />
      </div>

      <WorkflowFormPanel
        workflow={workflow}
        selectedNode={selectedNode}
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}

export default function WorkflowDemoPage() {
  return (
    <WorkflowProvider initialWorkflow={sampleWorkflow}>
      <WorkflowDemoContent />
    </WorkflowProvider>
  )
}
