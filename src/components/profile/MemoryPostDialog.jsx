import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, Sparkles, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPostDialog({ isOpen, onOpenChange, isGenerating, isSuccess, eventTitle, onAbort }) {
  const handleXClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGenerating && !isSuccess) {
      // Just abort - no embedded confirmation
      if (onAbort) {
        onAbort();
      }
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <button
          onClick={handleXClick}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50"
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <AnimatePresence mode="wait">
          {isGenerating && !isSuccess && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-full">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Creating Your Memory</h3>
              <p className="text-gray-500 text-center mb-4">
                AI is crafting a beautiful reflection of {eventTitle || 'your event'}...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </motion.div>
          )}

          {isSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-green-500 p-4 rounded-full">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-green-600">Memory Created!</h3>
              <p className="text-gray-500 text-center">
                Your memory post has been saved as a draft in your entries.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}