import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, BookmarkCheck, Folder } from 'lucide-react';
import { User } from '@/api/entities';

function SaveToCollectionModal({ isOpen, onClose, postData, currentUser }) {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState(''); // New state for description
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null); // Ref for name input
  const descriptionInputRef = useRef(null); // Ref for description input

  React.useEffect(() => {
    if (isOpen && currentUser) {
      loadCollections();
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isCreatingCollection && nameInputRef.current) {
      // Use setTimeout to ensure the input is rendered before focusing
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isCreatingCollection]);

  const loadCollections = async () => {
    try {
      // Load user's collections from their profile, preserving existing ones
      const userCollections = currentUser?.collections || [
        { id: 'saved', name: 'Saved Posts', count: 0, description: 'Private' }, // Added default description
        { id: 'favorites', name: 'Favorites', count: 0, description: 'Private' } // Added default description
      ];
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setLoading(true);
    try {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || 'Private', // Include description, default to 'Private' if empty
        count: 0,
        created_at: new Date().toISOString()
      };

      const updatedCollections = [...collections, newCollection];
      setCollections(updatedCollections);

      // Update user's collections
      await User.updateMyUserData({
        collections: updatedCollections
      });

      setNewCollectionName('');
      setNewCollectionDescription(''); // Clear description state
      setIsCreatingCollection(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = (collectionId) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save post to selected collections
      const savedPosts = { ...currentUser?.saved_posts } || {};
      const postId = postData.id;

      // Add post to each selected collection
      selectedCollections.forEach(collectionId => {
        if (!savedPosts[collectionId]) {
          savedPosts[collectionId] = [];
        }
        if (!savedPosts[collectionId].includes(postId)) {
          savedPosts[collectionId].push(postId);
        }
      });

      // Update collections with new counts
      const updatedCollections = collections.map(collection => {
        if (selectedCollections.has(collection.id)) {
          return {
            ...collection,
            count: (savedPosts[collection.id] || []).length
          };
        }
        return collection;
      });

      await User.updateMyUserData({
        saved_posts: savedPosts,
        collections: updatedCollections
      });

      onClose();
      
      // Trigger a page refresh or state update to reflect the save
      window.location.reload();
    } catch (error) {
      console.error('Error saving to collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.target === nameInputRef.current) {
        // If Enter is pressed in name input, focus on description input
        e.preventDefault(); // Prevent form submission
        descriptionInputRef.current?.focus();
      } else if (e.target === descriptionInputRef.current) {
        // If Enter is pressed in description input, create collection
        e.preventDefault(); // Prevent form submission
        handleCreateCollection();
      }
    } else if (e.key === 'Escape') {
      setIsCreatingCollection(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    }
  };

  const handleClose = () => {
    setSelectedCollections(new Set());
    setNewCollectionName('');
    setNewCollectionDescription(''); // Clear description state on close
    setIsCreatingCollection(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] max-w-[90vw] mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5" />
            Save to Collection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Collections List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => handleToggleCollection(collection.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCollections.has(collection.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  selectedCollections.has(collection.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedCollections.has(collection.id) && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z" />
                    </svg>
                  )}
                </div>
                <Folder className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="font-medium">{collection.name}</span>
                  <p className="text-xs text-gray-500">{collection.description}</p> {/* Display description */}
                  <p className="text-xs text-gray-400">{collection.count} posts</p> {/* Display post count below description */}
                </div>
              </div>
            ))}
          </div>

          {/* Create New Collection */}
          {isCreatingCollection ? (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200"> {/* Added styling for the creation block */}
              <Input
                ref={nameInputRef} // Assign ref
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={handleKeyPress} // Use onKeyDown to handle Enter and Escape
                className="rounded-lg"
              />
              <Input
                ref={descriptionInputRef} // Assign ref
                placeholder="Description (optional)"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                onKeyDown={handleKeyPress} // Use onKeyDown to handle Enter and Escape
                className="rounded-lg text-sm" // Smaller text for description
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingCollection(false);
                    setNewCollectionName('');
                    setNewCollectionDescription(''); // Clear description state on cancel
                  }}
                  className="flex-1 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim() || loading}
                  className="flex-1 rounded-lg"
                >
                  {loading ? 'Creating...' : 'Create'} {/* Updated button text */}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsCreatingCollection(true)}
              className="w-full rounded-lg border-dashed border-gray-300 hover:border-gray-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Collection
            </Button>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={selectedCollections.size === 0 || loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 rounded-lg"
          >
            {loading ? 'Saving...' : `Save to ${selectedCollections.size} collection${selectedCollections.size !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SaveToCollectionModal };
export default SaveToCollectionModal;