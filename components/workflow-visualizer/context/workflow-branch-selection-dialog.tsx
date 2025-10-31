"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WorkflowBranchSelectionDialogProps {
  isOpen: boolean
  branches: string[]
  onSelect: (branch: string) => void
  onCancel: () => void
}

export function WorkflowBranchSelectionDialog({
  isOpen,
  branches,
  onSelect,
  onCancel,
}: WorkflowBranchSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Branch</DialogTitle>
          <DialogDescription>Choose which branch to add the task to</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          {branches.map((branch) => (
            <Button
              key={branch}
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => onSelect(branch)}
            >
              {branch === "default" ? "Default Case" : `Case: ${branch}`}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
