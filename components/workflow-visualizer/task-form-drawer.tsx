"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TaskFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskFormDrawer({ open, onOpenChange }: TaskFormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Configuration</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="simple" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">SIMPLE</TabsTrigger>
            <TabsTrigger value="settings">SETTINGS</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="task-definition">Task Definition</Label>
                <Input id="task-definition" placeholder="Enter task name" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reference-name">Reference name</Label>
                <div className="flex gap-2">
                  <Input id="reference-name" placeholder="task_ref" className="flex-1" />
                  <Button variant="outline">Generate</Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Task description" rows={3} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-type">Task Type</Label>
                <Select defaultValue="SIMPLE">
                  <SelectTrigger id="task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">SIMPLE</SelectItem>
                    <SelectItem value="HTTP">HTTP</SelectItem>
                    <SelectItem value="EVENT">EVENT</SelectItem>
                    <SelectItem value="START_WORKFLOW">START_WORKFLOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Input Parameters</Label>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">No input parameters defined</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Add Parameter
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Output Parameters</Label>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">No output parameters defined</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Add Parameter
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input id="timeout" type="number" placeholder="3600" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="retry-count">Retry Count</Label>
                <Input id="retry-count" type="number" placeholder="3" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
                <Input id="retry-delay" type="number" placeholder="60" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start-delay">Start Delay (seconds)</Label>
                <Input id="start-delay" type="number" placeholder="0" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Save Task</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
