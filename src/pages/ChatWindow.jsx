import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, MoreVertical, Phone, Video, Users, Ban, LogOut, UserPlus, Trash2, Edit, Pin, Settings, Crown, UserX, Pencil, Search, BellOff, CircleSlash, User as UserIcon, X } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns"; // Added for date formatting
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator } from
"@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Importing sample data from dedicated files
import { sampleGroupChats, sampleChats, sampleOneOnOneMessages } from "@/components/chat/ChatData";

const curatorProfiles = {
  'ArtHaus Collective': {
    email: 'arthaus@demo.com',
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop'
  },
  'Thursday Dating': {
    email: 'thursday@demo.com',
    avatar: 'https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop'
  },
  'Wellness Studio Downtown': {
    email: 'wellness@demo.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  'Underground Rave': {
    email: 'underground@demo.com',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop'
  },

  'NYC Outdoor Adventures': {
    email: 'outdoor@demo.com',
    avatar: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop'
  }
};

export default function ChatWindow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatDetails, setChatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [deleteGroupMessage, setDeleteGroupMessage] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now - date;
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'h:mm a');
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch (error) {
      console.error("Error formatting message time:", error); // Added error logging for debugging
      return '';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
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
      } else {
        user = await base44.auth.me();
      }
      setCurrentUser(user);

      const chatId = searchParams.get('chatId');
      const groupId = searchParams.get('groupId');
      const userIdentifier = decodeURIComponent(searchParams.get('user') || '');

      console.log('🔍 ChatWindow: Loading chat with params:', { chatId, groupId, userIdentifier });

      let details = null;
      let initialMessages = [];
      let partnerName = "Chat Partner";
      let partnerAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

      if (groupId) {
        console.log('🔍 Looking for group with id:', groupId);
        console.log('🔍 Available groups:', sampleGroupChats.map(g => ({ id: g.id, title: g.title })));

        // Map alternative group IDs to the correct ones in ChatData
        const groupIdMap = {
          'thursday_dating_group': 'thursday_dating_group',
          'group-thursday-dating': 'group-thursday-dating',
          'group-art-house': 'group-art-house',
          'group-underground-rave': 'group-underground-rave',
          'group-mindful-moments': 'group-mindful-moments',
          'mindful_moments_group': 'group-mindful-moments',
          'sarah_friend_group': 'sarah-birthday-planning',
          'sarah-birthday-planning': 'sarah-birthday-planning'
        };

        const mappedGroupId = groupIdMap[groupId] || groupId;
        const foundGroup = sampleGroupChats.find((g) => g.id === mappedGroupId);
        console.log('🔍 Mapped group ID:', mappedGroupId, '-> Found group:', foundGroup?.title);
        if (foundGroup) {
          const isOwner = user && foundGroup.hostName === user.full_name;
          details = {
            ...foundGroup,
            name: foundGroup.title,
            isOwner,
            type: foundGroup.type || 'regular',
            participants: foundGroup.participants,
            canLeave: foundGroup.canLeave
          };
          initialMessages = [
            { id: 1, sender: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=100&h=100&fit=crop", message: "Can't wait for the next event! 🎉", timestamp: new Date(Date.now() - 1000 * 60 * 120), isMe: false },
            { id: 2, sender: "Mike T.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", message: "Same here! The last one was amazing.", timestamp: new Date(Date.now() - 1000 * 60 * 90), isMe: false },
            { id: 3, sender: 'You', avatar: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", message: "Hey everyone! Excited to be here 👋", timestamp: new Date(Date.now() - 1000 * 60 * 60), isMe: true },
            { id: 4, sender: "Jamie L.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", message: "Welcome! Looking forward to meeting everyone at the next meetup!", timestamp: new Date(Date.now() - 1000 * 60 * 30), isMe: false }
          ];
        }
      } else if (chatId) {
        console.log('🔍 Looking for chat with id:', chatId);
        const foundChat = sampleChats.find((c) => c.id === chatId);
        console.log('🔍 Found chat:', foundChat?.title);
        if (foundChat) {
          details = {
            ...foundChat,
            name: foundChat.title,
            email: foundChat.userEmail,
            avatar: foundChat.eventImage || foundChat.avatar,
            isFollowingBack: foundChat.isFollowingBack,
            isFollowing: foundChat.isFollowing,
            type: foundChat.type || 'curator'
          };
          partnerName = details.name;
          partnerAvatar = details.avatar;
          initialMessages = sampleOneOnOneMessages.map((msg) => ({
            ...msg,
            sender: msg.isMe ? "You" : partnerName,
            avatar: msg.isMe && user ? user.avatar : partnerAvatar
          }));
        }
      } else if (userIdentifier) {
        console.log('🔍 Looking for user:', userIdentifier);
        let targetProfile = null;
        let targetProfileName = '';

        for (const name in curatorProfiles) {
          const profile = curatorProfiles[name];
          if (profile.email === userIdentifier || name === userIdentifier) {
            targetProfile = profile;
            targetProfileName = name;
            break;
          }
        }

        if (targetProfile) {
          partnerName = targetProfileName;
          partnerAvatar = targetProfile.avatar;
        } else {
          partnerName = userIdentifier.includes('@') ? userIdentifier.split('@')[0] : userIdentifier;
        }

        details = {
          name: partnerName,
          email: userIdentifier,
          avatar: partnerAvatar,
          type: 'curator',
          isOnline: Math.random() > 0.3
        };

        initialMessages = sampleOneOnOneMessages.map((msg) => ({
          ...msg,
          sender: msg.isMe ? "You" : partnerName,
          avatar: msg.isMe && user ? user.avatar : partnerAvatar
        }));
      }

      console.log('✅ ChatWindow: Chat details loaded:', details);
      setChatDetails(details);
      setMessages(initialMessages);

    } catch (error) {
      console.error("Error loading chat data:", error);
      navigate(createPageUrl('Chat'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    const newMessageObj = {
      id: messages.length + 1,
      sender: "You",
      avatar: currentUser.avatar,
      message: message,
      timestamp: new Date(),
      isMe: true
    };

    setMessages([...messages, newMessageObj]);
    setMessage("");
  };

  const handleEditGroup = () => {
    if (chatDetails) {
      setEditFormData({
        name: chatDetails.name,
        description: chatDetails.description || ''
      });
    }
    setShowEditGroupModal(true);
  };

  const handleManageUsers = () => {
    // This function might not be directly called from the new menu,
    // as the menu directly navigates. Keeping for "preserve functionality".
    navigate(createPageUrl(`GroupSettings?groupId=${chatDetails.id}`));
  };

  const handleDeleteGroup = () => {
    setShowDeleteGroupModal(true);
  };

  const confirmDeleteGroup = () => {
    if (deleteGroupMessage.trim()) {
      alert(`Group deleted. Members will receive the message: "${deleteGroupMessage}"`);
    } else {
      alert("Group deleted successfully.");
    }
    setShowDeleteGroupModal(false);
    navigate(createPageUrl('Chat'));
  };

  const isGroupChat = chatDetails?.type === 'community' || chatDetails?.type === 'event' || chatDetails?.type === 'regular';

  const filteredMessages = messages.filter((msg) =>
  msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (!chatDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-4">Chat Not Found</h2>
        <p className="text-gray-500 mb-6">The chat you are looking for does not exist.</p>
        <Link to={createPageUrl("Chat")}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chats
          </Button>
        </Link>
      </div>);

  }

  return (
    <div className="flex flex-col h-screen bg-white"> {/* Changed bg-gray-50 to bg-white */}
      {/* Header */}
      <header className="bg-white mt-10 px-4 py-3 flex-shrink-0 border-b border-gray-200">
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img
                  src={chatDetails.avatar}
                  alt={chatDetails.name}
                  className="w-10 h-10 rounded-full object-cover" />

                <div>
                  <div className="flex items-center gap-2">
                    {isGroupChat ?
                    <h2 className="font-semibold text-gray-900">{chatDetails.name}</h2> :

                    <button
                      onClick={() => navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(chatDetails.name)}`))}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-left">

                        {chatDetails.name}
                      </button>
                    }
                    {chatDetails.type === 'community' && chatDetails.isOwner &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-shrink-0">
                            <Crown className="w-5 h-5 text-yellow-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You are the owner of this community</p>
                        </TooltipContent>
                      </Tooltip>
                    }
                  </div>

                  {isGroupChat &&
                  <p className="text-xs text-gray-500">{chatDetails.participants} members</p>
                  }
                </div>
              </div>
            </div>
            
            {/* Right side action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {isGroupChat && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigate(createPageUrl(`Buddies?groupId=${chatDetails.id}`));
                  }}
                  className="text-gray-600 hover:bg-gray-100 rounded-full">
                  <Users className="w-5 h-5" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isGroupChat ?
                  <>
                      <DropdownMenuItem onClick={() => setShowSearchBar(true)}>
                        <Search className="w-4 h-4 mr-2" />
                        Search in Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl(`ChatMedia?groupId=${chatDetails.id}`))}>
                        <Paperclip className="w-4 h-4 mr-2" />
                        View Media
                      </DropdownMenuItem>
                      {chatDetails.isOwner &&
                    <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleEditGroup}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Group Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(createPageUrl(`GroupSettings?groupId=${chatDetails.id}`))}>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Group
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500" onClick={handleDeleteGroup}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Group
                          </DropdownMenuItem>
                        </>
                    }
                       {!chatDetails.isOwner && chatDetails.canLeave !== false &&
                    <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => alert('Leave group feature coming soon!')}>
                              <LogOut className="w-4 h-4 mr-2" />
                              Leave Group
                            </DropdownMenuItem>
                          </>
                    }
                    </> :
                  <>
                      <DropdownMenuItem onClick={() => setShowSearchBar(true)}>
                        <Search className="w-4 h-4 mr-2" />
                        Search in Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl(`ChatMedia?user=${encodeURIComponent(chatDetails.name)}`))}>
                        <Paperclip className="w-4 h-4 mr-2" />
                        View Media
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => alert('Mute Notifications feature coming soon!')}>
                        <BellOff className="w-4 h-4 mr-2" />
                        Mute Notifications
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500" onClick={() => alert('Block User feature coming soon!')}>
                        <CircleSlash className="w-4 h-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                    </>
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </TooltipProvider>
      </header>

      {/* New Search Bar */}
      {showSearchBar &&
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className="p-2 border-b border-gray-200 bg-white">

          <div className="relative">
            <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-300"
            autoFocus />

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <button
            onClick={() => {
              setShowSearchBar(false);
              setSearchQuery("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">

              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      }



      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
        <div className="max-w-full">
          {filteredMessages.map((msg) =>
          <div key={msg.id} className={`flex mb-4 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[75%] ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                {!msg.isMe &&
              <img
                src={msg.avatar}
                alt={msg.sender}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0" />

              }
                <div className={`px-3 py-2 rounded-2xl shadow-sm break-words ${
              msg.isMe ?
              'bg-blue-500 text-white rounded-br-md' :
              'bg-white text-gray-800 rounded-bl-md'}`
              }>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="flex-shrink-0 bg-white border-t border-gray-200 p-3 safe-area-inset-bottom">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            className="bg-gray-200 hover:bg-gray-300 rounded-full flex-shrink-0 w-10 h-10 text-gray-600">

            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 min-w-0"
            autoComplete="off" />

          <Button
            type="submit"
            size="icon"
            className="bg-blue-500 hover:bg-blue-600 rounded-full flex-shrink-0 w-10 h-10"
            disabled={!message.trim()}>

            <Send className="w-4 h-4" />
          </Button>
        </form>
      </footer>

      {/* Edit Group Modal */}
      {showEditGroupModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Group Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Group Description</label>
                <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
                placeholder="What is this group about?"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} />

              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Group Image</label>
                <div className="flex items-center gap-3">
                  <img
                  src={chatDetails.avatar}
                  alt="Current group image"
                  className="w-12 h-12 rounded-full object-cover" />

                  <Button variant="outline" size="sm">
                    Change Image
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <Button
              variant="outline"
              onClick={() => setShowEditGroupModal(false)}>

                Cancel
              </Button>
              <Button
              onClick={() => {
                alert("Group details updated!");
                setShowEditGroupModal(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white">

                Save Changes
              </Button>
            </div>
          </div>
        </div>
      }

      {/* Delete Group Modal */}
      {showDeleteGroupModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-red-600">Delete Group</h3>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                ⚠️ This will permanently delete the group and all its messages. This action cannot be undone.
              </p>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group deletion notice to members (optional)
                </label>
                <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="3"
                placeholder="Let members know why the group is being deleted..."
                value={deleteGroupMessage}
                onChange={(e) => setDeleteGroupMessage(e.target.value)} />

              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <Button
              variant="outline"
              onClick={() => setShowDeleteGroupModal(false)}>

                Cancel
              </Button>
              <Button
              onClick={confirmDeleteGroup}
              className="bg-red-600 hover:bg-red-700 text-white">

                Delete Group
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

}