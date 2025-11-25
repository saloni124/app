import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CancelMessageDialog({
  isOpen,
  onOpenChange,
  onConfirm
}) {
  const [cancelMessage, setCancelMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(cancelMessage);
    setCancelMessage(''); // Reset after confirm
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setCancelMessage(''); // Reset on close
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Event?</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to cancel this event? You can optionally leave a message for the attendees. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Optional cancellation message..."
            value={cancelMessage}
            onChange={(e) => setCancelMessage(e.target.value)}
            className="h-28" />

        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-background mt-2 px-4 py-1 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
            Keep Event
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Yes, Cancel Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}