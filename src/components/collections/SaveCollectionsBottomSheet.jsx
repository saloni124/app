
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/api/entities';
import { Plus, Check, Bookmark, X, Loader2, AlertTriangle } from 'lucide-react';

export default function SaveCollectionsBottomSheet({ isOpen, onClose, postData, currentUser, onDataChange }) {
  const [collections, setCollections] = useState([]);
  const [savedIn, setSavedIn] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [showUnsaveWarning, setShowUnsaveWarning] = useState(false);
  const inputRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (isOpen && currentUser && postData) {
      // Apply class to body to hide mobile nav and prevent scrolling
      document.body.classList.add('comments-modal-open');
      loadCurrentState();
    } else {
      // Reset creation state when closing
      setIsCreating(false);
      // CRITICAL: Remove class from body when closing
      document.body.classList.remove('comments-modal-open');
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowUnsaveWarning(false);
    }

    // CRITICAL: Cleanup function to ensure class is removed
    return () => {
      document.body.classList.remove('comments-modal-open');
    };
  }, [isOpen, currentUser, postData]);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCreating]);

  const loadCurrentState = async () => {
    setIsLoading(true); // Indicate loading when fetching state
    try {
      const freshUser = await User.me();

      const userCollections = freshUser.collections || [];
      const userSavedPosts = freshUser.saved_posts || {};

      setCollections(userCollections);

      const savedInSet = new Set();
      // Check user-created collections
      for (const collection of userCollections) {
        if (Array.isArray(userSavedPosts[collection.id]) && userSavedPosts[collection.id].includes(postData.id)) {
          savedInSet.add(collection.id);
        }
      }
      // Also check if post is in the internal _general_saves
      if (Array.isArray(userSavedPosts._general_saves) && userSavedPosts._general_saves.includes(postData.id)) {
        savedInSet.add('_general_saves');
      }
      setSavedIn(savedInSet);
    } catch (error) {
      console.error('Error loading current state:', error);
    } finally {
      setIsLoading(false); // End loading regardless of success or error
    }
  };

  const handleToggleCollection = async (collectionId) => {
    if (isUpdating === collectionId) return;

    setIsUpdating(collectionId);
    try {
      const freshUser = await User.me();
      const currentSavedPosts = { ...(freshUser.saved_posts || {}) };
      const isCurrentlySaved = savedIn.has(collectionId);

      if (isCurrentlySaved) {
        // Remove from this collection
        currentSavedPosts[collectionId] = (currentSavedPosts[collectionId] || []).filter((pid) => pid !== postData.id);
      } else {
        // Add to this collection
        if (!Array.isArray(currentSavedPosts[collectionId])) {
          currentSavedPosts[collectionId] = [];
        }
        if (!currentSavedPosts[collectionId].includes(postData.id)) {
          currentSavedPosts[collectionId].push(postData.id);
        }
      }

      await User.updateMyUserData({ saved_posts: currentSavedPosts });

      // Update local state immediately
      const newSet = new Set(savedIn);
      if (isCurrentlySaved) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      setSavedIn(newSet);

      // Don't call onDataChange to prevent refresh
    } catch (error) {
      console.error('Failed to toggle collection save state:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleMasterSaveToggle = async () => {
    if (isLoading) return;

    const isSavedAnywhere = savedIn.size > 0;

    // If not saved anywhere AND it's a non-event post, save to _general_saves
    if (!isSavedAnywhere && postData.source === 'vibe-post') {
      setIsLoading(true);
      try {
        const freshUser = await User.me();
        const currentSavedPosts = { ...(freshUser.saved_posts || {}) };
        if (!Array.isArray(currentSavedPosts._general_saves)) currentSavedPosts._general_saves = [];
        if (!currentSavedPosts._general_saves.includes(postData.id)) {
          currentSavedPosts._general_saves.push(postData.id);
        }
        await User.updateMyUserData({ saved_posts: currentSavedPosts });
        setSavedIn((prev) => new Set(prev).add('_general_saves'));
        // Removed: setTimeout(() => {if (onDataChange) onDataChange();}, 300);
      } catch (error) {
        console.error('Failed to auto-save to _general_saves:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Only show warning if saved in multiple collections OR saved in a user-created collection
    // Do NOT show warning if only saved in _general_saves (the default save)
    const savedInManualCollections = Array.from(savedIn).filter((id) => id !== '_general_saves');

    if (savedInManualCollections.length > 0 || savedIn.has('_general_saves') && savedIn.size > 1) {
      setShowUnsaveWarning(true);
      return;
    }

    // If only saved in _general_saves, just unsave without warning
    if (savedIn.has('_general_saves') && savedIn.size === 1) {
      performMasterSaveToggle();
    }
  };

  const performMasterSaveToggle = async () => {
    setIsLoading(true);
    try {
      const freshUser = await User.me();
      const currentSavedPosts = { ...(freshUser.saved_posts || {}) };
      const isSavedAnywhere = savedIn.size > 0;

      if (isSavedAnywhere) {
        // Unsave from ALL collections
        Object.keys(currentSavedPosts).forEach((cId) => {
          if (Array.isArray(currentSavedPosts[cId])) {
            currentSavedPosts[cId] = currentSavedPosts[cId].filter((pid) => pid !== postData.id);
          }
        });
        await User.updateMyUserData({ saved_posts: currentSavedPosts });
        setSavedIn(new Set());
      }

      // Removed: if (onDataChange) onDataChange();

      setShowUnsaveWarning(false);
    } catch (error) {
      console.error('Failed to toggle master save state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const freshUser = await User.me();
      const newCollection = {
        id: newCollectionName.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || 'Private',
        count: 0,
        created_at: new Date().toISOString()
      };

      const updatedCollections = [...(freshUser.collections || []), newCollection];

      await User.updateMyUserData({
        collections: updatedCollections
      });

      setCollections(updatedCollections);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setIsCreating(false);

      // Removed: if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target === inputRef.current) {
      descriptionRef.current?.focus();
    } else if (e.key === 'Enter' && e.target === descriptionRef.current) {
      handleCreateCollection();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[200]"
          onClick={onClose} />


          <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[201] overflow-hidden flex flex-col md:w-[375px] md:max-w-[375px] md:h-auto md:max-h-[calc(100vh-8rem)] md:rounded-2xl md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2"
          onClick={(e) => e.stopPropagation()}>

            <div className="mb-5 pb-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200">
                <div className="flex justify-center py-3 md:hidden">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'}
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full object-cover" />

                    <div>
                      <h2 className="font-semibold text-gray-900">Saved</h2>
                      <p className="text-xs text-gray-500">Private</p>
                    </div>
                  </div>
                  <button
                  onClick={handleMasterSaveToggle}
                  disabled={isLoading}
                  className="p-2">

                    {isLoading ?
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" /> :

                  <Bookmark
                    className={`w-6 h-6 ${savedIn.size > 0 ? 'fill-current text-black' : 'text-gray-600'}`} />

                  }
                  </button>
                </div>
                <div className="flex items-center justify-between px-4 pb-2">
                  <h3 className="font-medium text-gray-900">Collections</h3>
                  <button
                  onClick={() => setIsCreating(true)}
                  className="text-blue-600 text-sm font-medium">

                    New collection
                  </button>
                </div>
              </div>

              {/* Scrollable Collections List */}
              <div className="pr-4 pl-4 overflow-y-auto flex-1" style={{ maxHeight: '320px' }}>
                {isCreating &&
              <div className="bg-blue-50 mt-4 mb-2 p-3 border border-blue-200 rounded-lg">
                    <input
                  ref={inputRef}
                  type="text"
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-transparent border-none outline-none text-sm font-medium mb-2" />

                    <input
                  ref={descriptionRef}
                  type="text"
                  placeholder="Description (optional)"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-transparent border-none outline-none text-xs text-gray-600" />

                    <div className="flex gap-2 mt-2">
                      <button
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim() || isLoading}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full disabled:opacity-50 hover:bg-blue-700">

                        {isLoading ? 'Creating...' : 'Create'}
                      </button>
                      <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCollectionName('');
                      setNewCollectionDescription('');
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">

                        Cancel
                      </button>
                    </div>
                  </div>
              }

                {collections.map((collection) =>
              <div key={collection.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1">
                      <img
                    src={collection.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'}
                    alt={collection.name}
                    className="w-8 h-8 rounded-full object-cover" />

                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{collection.name}</p>
                        <p className="text-xs text-gray-500">{collection.description || 'Private'}</p>
                      </div>
                    </div>
                    <button
                  onClick={() => handleToggleCollection(collection.id)}
                  disabled={isUpdating === collection.id}
                  className="p-2">

                      {isUpdating === collection.id ?
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" /> :
                  savedIn.has(collection.id) ?
                  <Check className="w-5 h-5 text-green-600" /> :

                  <Plus className="w-5 h-5 text-gray-400" />
                  }
                    </button>
                  </div>
              )}

                {collections.length === 0 && !isCreating &&
              <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No collections yet.</p>
                    <p className="text-xs mt-1">Create your first collection to organize your saves.</p>
                  </div>
              }
              </div>
            </div>

            {/* Unsave Warning Modal */}
            {showUnsaveWarning &&
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Remove from all collections?</h3>
                      <p className="text-gray-600 text-sm mt-2">
                        This post is saved in {savedIn.size} collection{savedIn.size === 1 ? '' : 's'}. Unsaving will remove it from all of them.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                  onClick={() => setShowUnsaveWarning(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium">

                      Cancel
                    </button>
                    <button
                  onClick={performMasterSaveToggle}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium">

                      Remove All
                    </button>
                  </div>
                </div>
              </div>
          }
          </motion.div>
        </>
      }
    </AnimatePresence>);

}