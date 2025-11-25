import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MessageSquare, Users, Send } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

// Sample users for demonstration
const sampleUsers = [
{
  id: "usr_1",
  name: "Sarah Chen",
  email: "sarah.chen@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop"
},
{
  id: "usr_2",
  name: "Marcus Rodriguez",
  email: "marcus.r@example.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
},
{
  id: "usr_3",
  name: "Emma Thompson",
  email: "emma.t@example.com",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
},
{
  id: "usr_4",
  name: "ArtHaus Collective",
  email: "arthaus@demo.com",
  avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop"
},
{
  id: "usr_5",
  name: "Thursday Dating",
  email: "thursday@demo.com",
  avatar: "https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop"
}];


export default function NewChat() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInSearch, setSelectedInSearch] = useState([]);
  const [draftList, setDraftList] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  const handleSelectInSearch = (user) => {
    setSelectedInSearch((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSaveToList = () => {
    if (selectedInSearch.length === 0) return;

    const newDrafts = selectedInSearch.filter(
      (selectedUser) => !draftList.some((draftUser) => draftUser.id === selectedUser.id)
    );

    setDraftList((prev) => [...prev, ...newDrafts]);
    setSelectedInSearch([]);
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleStartChat = () => {
    const allUsers = [...draftList, ...selectedInSearch];

    if (allUsers.length === 0) {
      alert('Please select at least one person to chat with.');
      return;
    }

    if (allUsers.length === 1) {
      // Direct 1-on-1 chat
      navigate(createPageUrl(`ChatWindow?user=${encodeURIComponent(allUsers[0].email)}`));
    } else {
      // Multiple people selected - show group creation modal
      setShowGroupModal(true);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    // In a real app, this would create a new group chat
    alert(`Group chat "${groupName}" created with ${draftList.length + selectedInSearch.length} members!`);
    navigate(createPageUrl('Chat'));
  };

  const handleRemoveFromDraft = (userId) => {
    setDraftList((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleClearList = () => {
    setDraftList([]);
  };

  const filteredUsers = sampleUsers.filter((u) =>
  !draftList.some((d) => d.id === u.id) && (
  searchQuery.trim() === '' || u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  u.email.toLowerCase().includes(searchQuery.toLowerCase()))

  );

  const totalSelected = draftList.length + selectedInSearch.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-gray-50">
        {/* Header */}
        <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)} className="mt-12 mb-1 text-sm font-medium rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9">

            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="bg-clip-text text-slate-900 mt-12 text-xl font-bold flex-1 from-cyan-400 to-blue-600">New Chat</h1>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-50 p-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Input
              placeholder="Type a name to start chatting..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`pl-10 bg-white border border-gray-300 ${isSearching ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} transition-all focus-visible:ring-0 focus-visible:ring-offset-0`} />

          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearching &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-l border-r border-b border-gray-300 rounded-b-xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex gap-2">
                    <Button
                    variant="outline"
                    onClick={handleSaveToList}
                    disabled={selectedInSearch.length === 0}
                    className="flex-1 text-xs py-2 px-3">
                      Group Chat ({selectedInSearch.length})
                    </Button>
                    <Button
                    onClick={handleStartChat}
                    disabled={totalSelected === 0}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-700 text-xs py-2 px-3">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat ({totalSelected})
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const isSelected = selectedInSearch.some((u) => u.id === user.id);

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectInSearch(user)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer">
                        <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded" />

                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{user.name}</h4>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>);

                }) :
                <div className="p-6 text-center text-gray-500 text-sm">
                      <p>No matching users found.</p>
                    </div>
                }
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Draft List */}
        <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 text-sm">
              SELECTED ({draftList.length})
            </h3>
            {draftList.length > 0 &&
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearList}>
                  Clear
                </Button>
                <Button
                size="sm"
                onClick={handleStartChat}
                className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-700">
                  <MessageSquare className="w-3 h-3 mr-1.5" />
                  Chat
                </Button>
              </div>
            }
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {draftList.length > 0 ? draftList.map((user) =>
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFromDraft(user.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600">
                    Remove
                  </Button>
                </motion.div>
              ) :
              <div className="text-center py-10 text-gray-500">
                  <p>No one selected yet.</p>
                  <p className="text-sm mt-1">Use the search bar above to find people.</p>
                </div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Group Creation Modal */}
      {showGroupModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Create Group Chat</h3>
                <p className="text-sm text-gray-500">{totalSelected} members selected</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full" />

              </div>

              <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-medium text-gray-700 mb-2">Members:</p>
                <div className="flex flex-wrap gap-2">
                  {[...draftList, ...selectedInSearch].map((user) =>
                <Badge key={user.id} variant="secondary" className="text-xs">
                      {user.name}
                    </Badge>
                )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
              variant="outline"
              onClick={() => {
                setShowGroupModal(false);
                setGroupName("");
              }}>
                Cancel
              </Button>
              <Button
              onClick={handleCreateGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white">
                <Users className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </motion.div>
        </div>
      }
    </div>);

}