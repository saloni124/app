
import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/api/entities'; // Renamed User entity to UserEntity to avoid conflict with Lucide icon
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Sparkles, ChevronRight, X, Plus, Info, User } from 'lucide-react'; // Added User icon from lucide-react
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default function SettingsRecommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [autoUpdateTags, setAutoUpdateTags] = useState(true);
  const [editableTags, setEditableTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false); // New state for save success message

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount
    const loadUser = async () => {
      try {
        const fetchedUser = await UserEntity.me(); // Use UserEntity
        setUser(fetchedUser);
        setEditableTags(fetchedUser.vibe_tags || []);
        setAutoUpdateTags(fetchedUser.auto_update_vibe_tags ?? true);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        auto_update_vibe_tags: autoUpdateTags
      };

      if (!autoUpdateTags) {
        dataToSave.vibe_tags = editableTags;
      }

      await UserEntity.updateMyUserData(dataToSave); // Use UserEntity
      setUser((prev) => ({
        ...prev,
        ...dataToSave,
        vibe_tags: !autoUpdateTags ? editableTags : prev.vibe_tags
      }));
      setSaveSuccess(true); // Set success message
      setTimeout(() => setSaveSuccess(false), 3000); // Hide message after 3 seconds
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = () => {
    navigate(createPageUrl("VibeSurvey"));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !editableTags.includes(trimmedTag) && editableTags.length < 20) {
      setEditableTags([...editableTags, trimmedTag]);
      setNewTag("");
      setAddTagsOpen(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditableTags(editableTags.filter((tag) => tag !== tagToRemove));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("SettingsIndex")} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-gray-900" /> {/* User icon added */}
              Preferences
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200">

          <div className="p-6">
            {/* Auto-Update Tags Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Auto-Update Tags</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Let your vibe profile evolve automatically based on your event reviews.
                </p>
              </div>
              <Switch
                checked={autoUpdateTags}
                onCheckedChange={setAutoUpdateTags}
                className="ml-4" />
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Initial Survey Section */}
          <div className="p-6">
            <div>
              <h3 className="font-medium mb-1">Initial Preferences Survey</h3>
              <p className="text-sm text-gray-600 mb-4">
                {user.has_taken_vibe_survey ?
                  "You can retake the survey anytime to update your preferences." :
                  "Not taken yet. Complete our quick survey to unlock personalized recommendations."
                }
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={handleTakeSurvey}
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:opacity-90"> {/* Updated button classes */}
                  {user.has_taken_vibe_survey ? "Retake Survey" : "Take Survey"}
                  <ChevronRight className="w-4 h-4 ml-2" /> {/* Updated ChevronRight class */}
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Tags Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Your Tags</h4>
              {!autoUpdateTags &&
                <Dialog open={addTagsOpen} onOpenChange={setAddTagsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs px-3 py-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader className="text-center">
                      <DialogTitle className="text-center">Add New Tag</DialogTitle>
                      <DialogDescription className="text-slate-950 pt-1 text-sm text-center">Add a new tag that matches your vibe.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder={editableTags.length >= 20 ? "Tag limit reached" : "Enter a new tag..."}
                        className="col-span-3"
                        disabled={editableTags.length >= 20} />
                      {editableTags.length >= 20 &&
                        <p className="text-sm text-red-500 col-span-3">You have reached the maximum of 20 tags.</p>
                      }
                    </div>
                    <DialogFooter className="justify-center">
                      <Button
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || editableTags.length >= 20}
                        className="bg-blue-600 hover:bg-blue-700 text-white">
                        Add Tag
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              }
            </div>

            {autoUpdateTags ?
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Your tags are updated automatically based on events you review.
                  Turn off auto-update to manage them manually.
                </p>
                <div className="flex flex-wrap gap-2">
                  {editableTags.length > 0 ?
                    <>
                      {(showAllTags ? editableTags : editableTags.slice(0, 10)).map((tag) =>
                        <Badge key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                          {tag}
                        </Badge>
                      )}
                      {editableTags.length > 10 && !showAllTags &&
                        <button
                          onClick={() => setShowAllTags(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline px-2 py-1">
                          +{editableTags.length - 10} more
                        </button>
                      }
                      {showAllTags &&
                        <button
                          onClick={() => setShowAllTags(false)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline px-2 py-1">
                          Show less
                        </button>
                      }
                    </> :
                    <p className="text-sm text-gray-500">No tags yet. Review some events to get started!</p>
                  }
                </div>
              </> :
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Manage your tags manually to get the best recommendations. (Max 20)
                </p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    {editableTags.length > 0 ?
                      <>
                        {(showAllTags ? editableTags : editableTags.slice(0, 10)).map((tag) =>
                          <div key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full flex items-center gap-2">
                            <span>{tag}</span>
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="text-blue-500 hover:text-blue-700">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {editableTags.length > 10 && !showAllTags &&
                          <button
                            onClick={() => setShowAllTags(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline px-2 py-1">
                            +{editableTags.length - 10} more
                          </button>
                        }
                        {showAllTags &&
                          <button
                            onClick={() => setShowAllTags(false)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline px-2 py-1">
                            Show less
                          </button>
                        }
                      </> :
                      <p className="text-sm text-gray-500">No tags yet. Click the + button to add your first!</p>
                    }
                  </div>
                  <div className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Manually Manage Your Tags</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Since "Auto-Update Tags" is off, these tags are used for recommendations.
                        Click the + button to add new tags.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            }
          </div>
        </motion.div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm text-center">
            Settings saved successfully!
          </motion.div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"> {/* Updated button classes */}
            {loading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}
