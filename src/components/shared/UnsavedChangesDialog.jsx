import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function UnsavedChangesDialog({ isOpen, onConfirm, onCancel }) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
          </div>
          <DialogTitle className="pt-2 text-center sm:text-left">Unsaved Changes</DialogTitle>
          <DialogDescription className="pt-2 text-center sm:text-left">
            You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onCancel} className="bg-background mt-2 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
            Stay on Page
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Leave Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}