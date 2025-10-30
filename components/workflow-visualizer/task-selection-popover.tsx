"use client"
import { Globe, FunctionSquare, Sparkles } from "lucide-react"
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

  const taskTypes = [
    {
      id: "WORKER_TASK",
      label: "Worker Task",
      icon: FunctionSquare,
    },
    {
      id: "HTTP",
      label: "HTTP Task",
      icon: Globe,
    },
  ]

  const handleSelectTask = (taskType: string) => {
    console.log("[v0] Task selected:", taskType, "for node:", nodeId)

    // Call the global addNodeAfter function
    if ((window as any).__addNodeAfter) {
      ;(window as any).__addNodeAfter(nodeId, taskType)
    }

    // Close the popover
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="center" side="bottom">
        <div className="space-y-4">
          {/* Search bar */}
          <Input placeholder="Search tasks..." className="w-full" />

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
              {taskTypes.map((task) => {
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
