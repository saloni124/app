import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/api/entities';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

const Button = ({ children, onClick, className, variant, disabled }) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
  }[variant || 'default'];
  return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles} ${className} h-10 px-4 py-2`} disabled={disabled}>
      {children}
    </button>
  );
};

export default function UnsavePostModal({ isOpen, onClose, post, currentUser, collectionId, onUnsave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!post) return null;

  const handleUnsave = async (mode) => {
    setIsSaving(true);
    setError(null);
    try {
      const user = await User.me(); // Fetch latest user data
      const currentSavedPosts = { ...(user.saved_posts || {}) };

      if (mode === 'collection') {
        // Ensure the collection exists and is an array before filtering
        if (currentSavedPosts[collectionId] && Array.isArray(currentSavedPosts[collectionId])) {
          currentSavedPosts[collectionId] = currentSavedPosts[collectionId].filter(id => id !== post.id);
        }
      } else if (mode === 'all') {
        // Check each collection and ensure it's an array before filtering
        Object.keys(currentSavedPosts).forEach(cId => {
          if (currentSavedPosts[cId] && Array.isArray(currentSavedPosts[cId])) {
            currentSavedPosts[cId] = currentSavedPosts[cId].filter(id => id !== post.id);
          }
        });
      }

      await User.updateMyUserData({ saved_posts: currentSavedPosts });
      
      if (onUnsave) {
        onUnsave();
      }
      onClose();
    } catch (err) {
      console.error("Failed to unsave post:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg text-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold leading-none tracking-tight">Unsave Post</h3>
            <p className="text-sm text-gray-500 mt-2">
              How would you like to unsave this post?
            </p>
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => handleUnsave('collection')} 
                disabled={isSaving || !collectionId}
                className="w-full"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Unsave from this collection
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleUnsave('all')} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Unsave completely
              </Button>
            </div>
            <div className="mt-4 text-center">
              <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}