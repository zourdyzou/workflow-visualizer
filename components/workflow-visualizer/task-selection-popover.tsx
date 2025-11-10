"use client"
import { Globe, FunctionSquare, Sparkles, GitBranch, GitFork, GitMerge, Code2, Zap, XCircle } from "lucide-react"
import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TaskSelectionPopoverProps {
  children: React.ReactNode
  nodeId: string
}

export function TaskSelectionPopover({ children, nodeId }: TaskSelectionPopoverProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const taskTypes = [
    {
      id: "WORKER",
      label: "Worker Task",
      icon: FunctionSquare,
    },
    {
      id: "HTTP",
      label: "HTTP Task",
      icon: Globe,
    },
    {
      id: "DECISION",
      label: "Decision",
      icon: GitBranch,
    },
    {
      id: "FORK_JOIN",
      label: "Fork",
      icon: GitFork,
    },
    {
      id: "JOIN",
      label: "Join",
      icon: GitMerge,
    },
    {
      id: "JSON_JQ_TRANSFORM",
      label: "JSON JQ Transform",
      icon: Code2,
    },
    {
      id: "DYNAMIC_FORK",
      label: "Dynamic Fork",
      icon: Zap,
    },
    {
      id: "TERMINATE",
      label: "Terminate",
      icon: XCircle,
    },
  ]

  const filteredTaskTypes = taskTypes.filter((task) => task.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSelectTask = (taskType: string) => {
    console.log("[v0] Task selected:", taskType, "for node:", nodeId)

    // Call the global addNodeAfter function
    if ((window as any).__addNodeAfter) {
      ;(window as any).__addNodeAfter(nodeId, taskType)
    }

    // Close the popover
    setOpen(false)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="center" side="bottom">
        <div className="space-y-4">

          {/* Quick Add section */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent">
                QUICK ADD
              </h3>
            </div>

            {/* Task type grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredTaskTypes.map((task) => {
                const Icon = task.icon
                return (
                  <Button
                    key={task.id}
                    variant="ghost"
                    className="flex h-auto flex-col items-center gap-2 p-4 hover:bg-gray-50"
                    onClick={() => handleSelectTask(task.id)}
                  >
                    <Icon className="h-6 w-6 text-gray-600" />
                    <span className="text-xs text-gray-700">{task.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
