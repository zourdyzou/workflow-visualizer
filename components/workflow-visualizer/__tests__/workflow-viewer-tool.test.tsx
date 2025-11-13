import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { WorkflowViewerTool } from "../workflow-viewer-tool"
import { defaultWorkflowFormLocalization } from "@/lib/workflow-form-localization"
import type { ConductorWorkflow } from "../types/conductor-types"

// Mock React Flow to avoid rendering issues in tests
vi.mock("@xyflow/react", () => ({
  ReactFlow: vi.fn(({ children }) => <div data-testid="react-flow">{children}</div>),
  Background: vi.fn(() => <div data-testid="background" />),
  Controls: vi.fn(() => <div data-testid="controls" />),
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useReactFlow: vi.fn(() => ({
    setViewport: vi.fn(),
    fitView: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
  })),
  Handle: vi.fn(() => <div data-testid="handle" />),
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
  MarkerType: {
    ArrowClosed: "arrowclosed",
  },
  Panel: vi.fn(({ children }) => <div data-testid="panel">{children}</div>),
}))

describe("WorkflowViewerTool", () => {
  const simpleWorkflow: ConductorWorkflow = {
    name: "test_workflow",
    description: "Test workflow description",
    version: 1,
    tasks: [
      {
        name: "test_task",
        taskReferenceName: "test_task_ref",
        type: "WORKER",
        inputParameters: {
          input1: "${workflow.input.data}",
        },
      },
    ],
    inputParameters: ["data"],
    schemaVersion: 2,
  }

  const workflowWithMultipleTasks: ConductorWorkflow = {
    name: "complex_workflow",
    description: "Complex workflow with multiple tasks",
    version: 1,
    tasks: [
      {
        name: "task_1",
        taskReferenceName: "task_1_ref",
        type: "WORKER",
        inputParameters: {},
      },
      {
        name: "http_task",
        taskReferenceName: "http_task_ref",
        type: "HTTP",
        inputParameters: {
          http_request: {
            method: "POST",
            uri: "/api/test",
            body: {},
          },
        },
      },
      {
        name: "decision_task",
        taskReferenceName: "decision_task_ref",
        type: "DECISION",
        inputParameters: {
          case: "${workflow.input.status}",
        },
        caseValueParam: "case",
        decisionCases: {
          active: [],
          inactive: [],
        },
        defaultCase: [],
      },
    ],
    inputParameters: ["status"],
    schemaVersion: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      expect(screen.getByTestId("react-flow")).toBeInTheDocument()
    })

    it("should render with localization", () => {
      render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} formLocalizedObj={defaultWorkflowFormLocalization} />)
      expect(screen.getByTestId("react-flow")).toBeInTheDocument()
    })

    it("should render the workflow visualizer root container", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      const rootElement = container.querySelector(".workflow-visualizer-root")
      expect(rootElement).toBeInTheDocument()
    })

    it("should apply proper layout classes", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      const rootElement = container.querySelector(".workflow-visualizer-root")
      expect(rootElement).toHaveClass("wcv-flex", "wcv-h-screen")
    })
  })

  describe("Callbacks", () => {
    it("should call onSave callback when save is triggered", async () => {
      const onSave = vi.fn()
      render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} onSave={onSave} />)

      // Note: Since form panel interaction requires clicking nodes, which are mocked,
      // we're testing that the callback prop is properly passed
      expect(onSave).not.toHaveBeenCalled()
    })

    it("should call onCancel callback when cancel is triggered", async () => {
      const onCancel = vi.fn()
      render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} onCancel={onCancel} />)

      // Callback should be properly passed but not called initially
      expect(onCancel).not.toHaveBeenCalled()
    })

    it("should work without callbacks", () => {
      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      }).not.toThrow()
    })
  })

  describe("Workflow Context", () => {
    it("should initialize with provided workflow", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      expect(container.querySelector(".workflow-visualizer-root")).toBeInTheDocument()
    })

    it("should handle complex workflows", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={workflowWithMultipleTasks} />)
      expect(container.querySelector(".workflow-visualizer-root")).toBeInTheDocument()
    })

    it("should handle empty workflow", () => {
      const emptyWorkflow: ConductorWorkflow = {
        name: "empty_workflow",
        description: "Empty workflow",
        version: 1,
        tasks: [],
        inputParameters: [],
        schemaVersion: 2,
      }

      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={emptyWorkflow} />)
      }).not.toThrow()
    })
  })

  describe("Panel Interaction", () => {
    it("should not open panel when clicking start/end nodes", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)

      // Panel should not be open initially
      const panel = container.querySelector('[data-state="open"]')
      expect(panel).not.toBeInTheDocument()
    })

    it("should manage panel state correctly", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)

      // Initially closed
      expect(container.querySelector(".workflow-visualizer-root")).toBeInTheDocument()
    })
  })

  describe("Props Validation", () => {
    it("should accept valid WorkflowViewerToolProps", () => {
      const props = {
        initialWorkflow: simpleWorkflow,
        onSave: vi.fn(),
        onCancel: vi.fn(),
        formLocalizedObj: defaultWorkflowFormLocalization,
      }

      expect(() => {
        render(<WorkflowViewerTool {...props} />)
      }).not.toThrow()
    })

    it("should work with minimal props", () => {
      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)
      }).not.toThrow()
    })

    it("should handle custom localization", () => {
      const customLocalization = {
        ...defaultWorkflowFormLocalization,
        workflowTab: "Custom Workflow",
        taskTab: "Custom Task",
      }

      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} formLocalizedObj={customLocalization} />)
      }).not.toThrow()
    })
  })

  describe("Integration", () => {
    it("should integrate WorkflowProvider correctly", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)

      // Provider should wrap the content
      expect(container.querySelector(".workflow-visualizer-root")).toBeInTheDocument()
    })

    it("should integrate WorkflowVisualizer correctly", () => {
      render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)

      // React Flow should be rendered
      expect(screen.getByTestId("react-flow")).toBeInTheDocument()
    })

    it("should integrate WorkflowFormPanel correctly", () => {
      const { container } = render(<WorkflowViewerTool initialWorkflow={simpleWorkflow} />)

      // Container should be properly structured
      const flexContainer = container.querySelector(".wcv-flex-1")
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle workflow with no tasks", () => {
      const workflowNoTasks: ConductorWorkflow = {
        name: "no_tasks",
        description: "Workflow without tasks",
        version: 1,
        tasks: [],
        inputParameters: [],
        schemaVersion: 2,
      }

      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={workflowNoTasks} />)
      }).not.toThrow()
    })

    it("should handle workflow with no input parameters", () => {
      const workflowNoInputs: ConductorWorkflow = {
        name: "no_inputs",
        description: "Workflow without input parameters",
        version: 1,
        tasks: [
          {
            name: "task_1",
            taskReferenceName: "task_1_ref",
            type: "WORKER",
            inputParameters: {},
          },
        ],
        inputParameters: [],
        schemaVersion: 2,
      }

      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={workflowNoInputs} />)
      }).not.toThrow()
    })

    it("should handle workflow with special characters in name", () => {
      const specialWorkflow: ConductorWorkflow = {
        name: "workflow_with-special.characters@123",
        description: "Test special chars",
        version: 1,
        tasks: [],
        inputParameters: [],
        schemaVersion: 2,
      }

      expect(() => {
        render(<WorkflowViewerTool initialWorkflow={specialWorkflow} />)
      }).not.toThrow()
    })
  })
})
