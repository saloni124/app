import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users, Megaphone, Search, Plus, UserPlus, ArrowLeft, Crown, MoreVertical, LogOut, ArrowDownUp, MoreHorizontal, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { sampleChats, sampleGroups, sampleBlasts } from '@/components/chat/ChatData';
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';

export default function Chat() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("chats");
  const [conversations, setConversations] = useState([]); // NEW state
  const [filteredConversations, setFilteredConversations] = useState([]); // NEW state
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  // Removed: const [error, setError] = useState(null);

  // Function to combine sample data and add 'conversationType' and group specific properties
  const getCombinedConversations = useCallback(() => {
    const allConversations = [
    ...sampleChats.map((chat) => ({ ...chat, conversationType: 'chat' })),
    ...sampleGroups.map((group) => ({
      ...group,
      conversationType: 'group',
      // Assuming 'Saloni Bhatia' is the bypass user's name for demo purposes
      isPinned: group.hostName === 'Saloni Bhatia',
      isOwner: group.hostName === 'Saloni Bhatia'
    })),
    ...sampleBlasts.map((blast) => ({ ...blast, conversationType: 'blast' }))];

    return allConversations;
  }, []);

  useEffect(() => {
    const loadUserAndConversations = async () => {
      setLoading(true);

      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      let user = null;

      if (authBypassed && (isAdmin || isDemo)) {
        const baseUser = simulatedDataManager.getBaseUser();
        if (isAdmin) {
          user = { ...baseUser, _isAdminMode: true };
        } else {
          user = simulatedDataManager.applyDemoOverrides(baseUser);
        }
        console.log('✅ Chat: Using bypass user:', user?.email);
      } else {
        try {
          user = await base44.auth.me();
          console.log('✅ Chat: Using authenticated user:', user?.email);
        } catch (error) {
          console.log('⚠️ Chat: No user found, redirecting to feed');
          setLoading(false);
          navigate(createPageUrl("Feed"));
          return;
        }
      }

      setCurrentUser(user);
      const combinedData = getCombinedConversations();
      setConversations(combinedData);
      setFilteredConversations(combinedData);
      setLoading(false);
    };

    loadUserAndConversations();
  }, [navigate, getCombinedConversations]);

  // Removed: retryLoadInitialData function as it's no longer relevant with the bypass user logic

  // Refactored filtering and sorting logic
  const applyFiltersAndSort = useCallback(() => {
    let currentConversations = conversations;

    // Apply tab filtering first
    if (activeTab === "chats") {
      currentConversations = currentConversations.filter((c) => c.conversationType === 'chat');
    } else if (activeTab === "groups") {
      currentConversations = currentConversations.filter((c) => c.conversationType === 'group');
    } else if (activeTab === "blasts") {
      currentConversations = currentConversations.filter((c) => c.conversationType === 'blast');
    }

    // Apply search query
    if (searchQuery) {
      const lowerCaseSearchQuery = searchQuery.toLowerCase();
      currentConversations = currentConversations.filter((c) => {
        if (c.conversationType === 'chat' || c.conversationType === 'group') {
          return c.title && typeof c.title === 'string' && c.title.toLowerCase().includes(lowerCaseSearchQuery);
        } else if (c.conversationType === 'blast') {
          return c.eventTitle && typeof c.eventTitle === 'string' && c.eventTitle.toLowerCase().includes(lowerCaseSearchQuery) ||
          c.message && typeof c.message === 'string' && c.message.toLowerCase().includes(lowerCaseSearchQuery);
        }
        return false;
      });
    }

    // Apply sorting
    const sorted = [...currentConversations].sort((a, b) => {
      let timeA, timeB;

      // Determine time property based on conversation type
      if (a.conversationType === 'blast') {
        timeA = a.sentAt;
      } else {// chat or group
        timeA = a.lastMessageTime;
      }

      if (b.conversationType === 'blast') {
        timeB = b.sentAt;
      } else {// chat or group
        timeB = b.lastMessageTime;
      }

      // Handle group-specific sorting (pinned items)
      if (activeTab === 'groups') {
        const isAPinned = a.conversationType === 'group' && a.isPinned;
        const isBPinned = b.conversationType === 'group' && b.isPinned;
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
      }


      if (sortBy === 'unread') {
        const unreadA = a.unreadCount || 0;
        const unreadB = b.unreadCount || 0;
        if (unreadA > 0 && unreadB === 0) return -1;
        if (unreadA === 0 && unreadB > 0) return 1;
      }
      return (timeB || 0) - (timeA || 0); // Default to recent, handle undefined times
    });

    return sorted;
  }, [conversations, activeTab, searchQuery, sortBy]);

  // Update filteredConversations whenever dependencies change
  useEffect(() => {
    setFilteredConversations(applyFiltersAndSort());
  }, [applyFiltersAndSort]);


  if (loading) {// Removed !error from condition
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);
  }

  // Removed: if (error) block as per new error handling (redirects to Feed)

  const handleChatSelect = (chat) => {
    if (chat.userEmail) {
      console.log('🔍 Chat: Navigating to 1-1 chat with email:', chat.userEmail);
      navigate(createPageUrl(`ChatWindow?user=${encodeURIComponent(chat.userEmail)}`));
    } else {
      console.log('🔍 Chat: Navigating to chat with ID:', chat.id);
      navigate(createPageUrl(`ChatWindow?chatId=${chat.id}`));
    }
  };

  const handleLeaveGroup = (groupId, groupTitle) => {
    if (window.confirm(`Are you sure you want to leave "${groupTitle}"? You'll need to request to rejoin if you change your mind.`)) {
      alert(`You've left "${groupTitle}". You can request to rejoin from the curator's profile.`);
      // In a real app, this would update the user's group memberships in the 'conversations' state
      // For now, it's a simulated action.
    }
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
    setShowCreateChatModal(false);
  };

  const handleNewChat = () => {
    navigate(createPageUrl('NewChat'));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-4 md:pt-16">
        <div className="mb-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => navigate(createPageUrl("Feed"))}>

            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="relative">
            <h1 className="text-3xl font-semibold md:text-4xl gradient-text text-center mb-2">Chat</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Buddies'))}
              className="absolute top-0 right-0 text-gray-600 hover:bg-gray-100 rounded-full">
              <Users className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-center text-gray-500 max-w-2xl mx-auto">
            Stay connected with your friends and event communities
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col h-[600px]">
            {/* Sidebar */}
            <div className="w-full flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setActiveTab("chats");
                    setSearchQuery("");
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === "chats" ?
                  "bg-blue-50 text-blue-600 border-b-2 border-blue-600" :
                  "text-gray-500 hover:text-gray-700"}`
                  }>

                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Chats
                </button>
                <button
                  onClick={() => {
                    setActiveTab("groups");
                    setSearchQuery("");
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === "groups" ?
                  "bg-blue-50 text-blue-600 border-b-2 border-blue-600" :
                  "text-gray-500 hover:text-gray-700"}`
                  }>

                  <Users className="w-4 h-4 inline mr-2" />
                  Groups
                </button>
                <button
                  onClick={() => {
                    setActiveTab("blasts");
                    setSearchQuery("");
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === "blasts" ?
                  "bg-blue-50 text-blue-600 border-b-2 border-blue-600" :
                  "text-gray-500 hover:text-gray-700"}`
                  }>

                  <Megaphone className="w-4 h-4 inline mr-2" />
                  Blasts
                </button>
              </div>

              {/* Search, Sort, and Create */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-300" />

                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto bg-gray-50 border-gray-300 text-sm px-2.5 h-10 gap-1.5 flex-shrink-0">
                    <ArrowDownUp className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>

                {/* Create Button with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-blue-600 text-white pt-2 pr-1 pb-2 pl-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 hover:bg-blue-700 flex-shrink-0">
                      <div className="relative mr-2">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <Plus className="w-2 h-2 text-blue-600" />
                        </div>
                      </div>
                      <span className="pr-3 pl-1 hidden sm:inline">New</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleNewChat}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      New Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (conversations.some(c => c.conversationType === 'group' && c.isOwner)) {
                          alert("You already own a community group chat. You can edit your existing one or remove it to create a new one.");
                        } else {
                          alert('Community group creation is not enabled yet - the feature is disabled.');
                        }
                      }}
                      className="opacity-50 cursor-not-allowed"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Create Community Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Chat List */}
              {activeTab === "chats" &&
              <div className="flex-1 overflow-y-auto">
                  {filteredConversations.filter((c) => c.conversationType === 'chat').map((chat) =>
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                        src={chat.eventImage || chat.avatar}
                        alt={chat.title}
                        className="w-12 h-12 rounded-full object-cover" />

                          {chat.type === "event" &&
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              <Users className="w-3 h-3" />
                            </div>
                      }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {chat.title}
                            </h3>
                            {chat.unreadCount > 0 &&
                        <Badge className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                                {chat.unreadCount}
                              </Badge>
                        }
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {chat.lastMessageTime ? format(chat.lastMessageTime, "h:mm a") : ''}
                            </span>
                            {chat.type === "event" &&
                        <span className="text-xs text-gray-400">
                                {chat.participants} members
                              </span>
                        }
                          </div>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              }

              {/* Groups List */}
              {activeTab === "groups" &&
              <div className="flex-1 overflow-y-auto">
                  <div>
                    {filteredConversations.filter((c) => c.conversationType === 'group').map((group, index) =>
                  <div key={group.id}>
                        <div
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        console.log('🔍 Chat: Navigating to group with ID:', group.id);
                        navigate(createPageUrl(`ChatWindow?groupId=${group.id}`));
                      }}>

                        <div className="relative flex-shrink-0 mr-3">
                            <img
                          src={group.avatar}
                          alt={group.title}
                          className="w-12 h-12 rounded-full object-cover" />

                            {/* Crown indicators for group ownership and type */}
                            {group.type === 'community' &&
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        group.isOwner ? 'bg-yellow-400' : 'bg-blue-500'}`
                        }>
                                <Crown className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                        }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                                {group.title}
                              </h3>
                              <span className="text-xs text-gray-500">{group.lastMessageTime ? format(group.lastMessageTime, "h:mm a") : ''}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-0.5">{group.lastMessage}</p>
                            <div className="flex items-center justify-between mt-1">
                               <span className="text-xs text-gray-400">{group.participants} members</span>
                               {group.unreadCount > 0 &&
                          <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">{group.unreadCount}</span>
                          }
                            </div>
                          </div>
                        </div>
                        {/* Add subtle line divider between groups (except for the last item) */}
                        {index < filteredConversations.filter((c) => c.conversationType === 'group').length - 1 &&
                    <div className="border-b border-gray-100 mx-4" />
                    }
                      </div>
                  )}
                  </div>
                </div>
              }

              {/* Blasts List */}
              {activeTab === "blasts" &&
              <div className="flex-1 overflow-y-auto">
                  {filteredConversations.filter((c) => c.conversationType === 'blast').map((blast) =>
                <div key={blast.id} className="p-4 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">
                            {blast.eventTitle}
                          </h4>
                          <p className="text-sm text-gray-700 mb-2 break-words">
                            {blast.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {blast.sentBy}
                            </span>
                            <span className="text-xs text-gray-400">
                              {blast.sentAt ? format(blast.sentAt, "MMM d, h:mm a") : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              }
            </div>
          </div>
        </div>

        {/* Create Chat Modal */}
        {showCreateChatModal &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Start a New Chat</h3>
              <div className="space-y-3">
                <Button
                onClick={handleNewChat}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Chat with Someone New
                </Button>
                <Button
                onClick={handleCreateGroup}
                variant="outline"
                className="w-full flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Create Community Group
                </Button>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button
                variant="outline"
                onClick={() => setShowCreateChatModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        }

        {/* Create Group Modal */}
        {showCreateGroupModal &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white mr-4 mb-16 ml-4 pt-6 pr-6 pb-6 pl-6 rounded-2xl max-w-md w-full max-h-[83vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Create Community Group</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group Name
                  </label>
                  <Input placeholder="Enter group name..." />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="text-gray-500">
                      <Plus className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Upload group image</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows="3"
                  placeholder="What is this group about?" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Group Privacy
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                      type="radio"
                      name="privacy"
                      value="open"
                      className="mr-2" />
                      <span className="text-sm">
                        Open to all - Anyone can join
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                      type="radio"
                      name="privacy"
                      value="approval"
                      className="mr-2"
                      defaultChecked />
                      <span className="text-sm">
                        Approval required - Users need to be approved
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <p>
                    Note: A "Join Group" button will appear on your profile,
                    allowing others to request to join your community.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button
                variant="outline"
                onClick={() => setShowCreateGroupModal(false)}>
                  Cancel
                </Button>
                <Button
                onClick={() => {
                  alert("Community group created successfully!");
                  setShowCreateGroupModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);
}