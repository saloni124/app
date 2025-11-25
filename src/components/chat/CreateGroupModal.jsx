import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, X, Plus, Search } from "lucide-react";

const sampleContacts = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    email: "marcus.r@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop"
  },
  {
    id: 3,
    name: "Emma Thompson",
    email: "emma.t@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop"
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop"
  }
];

export default function CreateGroupModal({ isOpen, onClose }) {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = sampleContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberToggle = (contact) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === contact.id);
      if (exists) {
        return prev.filter(m => m.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleCreateGroup = () => {
    console.log("Creating group:", { groupName, groupDescription, selectedMembers });
    // Here you would typically create the group via API
    onClose();
    // Reset form
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription>
            Create a group to chat with multiple friends about events.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full"
            />
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <Textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full h-20 resize-none"
            />
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Members ({selectedMembers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-2 pr-2"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-4 h-4 rounded-full"
                    />
                    {member.name}
                    <button
                      onClick={() => handleMemberToggle(member)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Contacts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10"
              />
            </div>
            
            {/* Contact List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleMemberToggle(contact)}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedMembers.find(m => m.id === contact.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                  </div>
                  {selectedMembers.find(m => m.id === contact.id) && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}