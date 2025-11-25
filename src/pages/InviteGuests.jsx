
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { EventAttendance } from '@/api/entities';
import { Event } from '@/api/entities';

const sampleInvitableUsers = [
  { id: 'usr_101', name: 'Chris Evans', email: 'chris.evans@example.com', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=60&h=60&fit=crop' },
  { id: 'usr_102', name: 'Olivia Martinez', email: 'olivia.m@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop' },
  { id: 'usr_103', name: 'Jordan Lee', email: 'jordan.lee@example.com', avatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=60&h=60&fit=crop' },
  { id: 'usr_104', name: 'Sophia Nguyen', email: 'sophia.n@example.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop' },
  { id: 'usr_105', name: 'Liam Wilson', email: 'liam.w@example.com', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=60&h=60&fit=crop' },
  { id: 'usr_106', name: 'Ava Garcia', email: 'ava.garcia@example.com', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=60&h=60&fit=crop' }
];

export default function InviteGuests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [draftList, setDraftList] = useState([]);
  const [selectedInSearch, setSelectedInSearch] = useState([]);
  const [eventId, setEventId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [existingAttendances, setExistingAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id') || urlParams.get('eventId');
      
      if (id) {
        setEventId(id);
        try {
          const attendances = await EventAttendance.filter({ event_id: id });
          setExistingAttendances(Array.isArray(attendances) ? attendances : []);
        } catch (error) {
          console.error("Error loading existing attendances:", error);
          setExistingAttendances([]);
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const isUserInvited = (userEmail) => {
    return existingAttendances.some(att => att.user_email === userEmail);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  const handleSelectInSearch = (user) => {
    if (isUserInvited(user.email)) {
      return;
    }

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

    setDraftList((prev) => [...prev, ...newDrafts.map(u => ({ ...u, status: 'draft' }))]);
    setSelectedInSearch([]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleSendInvites = async () => {
    const allToInvite = [...draftList];
    selectedInSearch.forEach((selectedUser) => {
      if (!allToInvite.some((u) => u.id === selectedUser.id)) {
        allToInvite.push(selectedUser);
      }
    });

    if (allToInvite.length === 0) {
      alert('Please select at least one person to invite.');
      return;
    }

    if (!eventId) {
      alert('Error: Event ID is missing. Please try again.');
      return;
    }

    setIsSending(true);

    try {
      const attendanceRecords = allToInvite.map(user => ({
        event_id: eventId,
        user_email: user.email,
        user_name: user.name,
        user_avatar: user.avatar,
        status: 'invited',
        requested_at: new Date().toISOString()
      }));

      await EventAttendance.bulkCreate(attendanceRecords);

      setDraftList([]);
      setSelectedInSearch([]);

      // Use replace to update the existing page instead of creating a new one
      navigate(createPageUrl(`EventAttendees?id=${eventId}`), { replace: true, state: { refresh: true } });
    } catch (error) {
      console.error('Error sending invites:', error);
      alert('Failed to send invites. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearList = () => {
    setDraftList([]);
  };

  const handleRemoveFromDraft = (userId) => {
    setDraftList((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredUsersForSearch = sampleInvitableUsers.filter(u =>
    !draftList.some(d => d.id === u.id) && (
      searchQuery.trim() === '' || u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalInviteCount = draftList.length + selectedInSearch.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-gray-50">
        <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl(`EventAttendees?id=${eventId}`))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Invite Guests</h1>
        </div>

        <div className="bg-gray-50 p-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`pl-10 bg-white border border-gray-300 ${isSearching ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'} transition-all focus-visible:ring-0 focus-visible:ring-offset-0`}
            />
          </div>

          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border-l border-r border-b border-gray-300 rounded-b-xl shadow-lg overflow-hidden"
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSaveToList}
                      disabled={selectedInSearch.length === 0}
                      className="flex-1 text-xs py-2 px-3"
                    >
                      Save to List ({selectedInSearch.length})
                    </Button>
                    <Button
                      onClick={handleSendInvites}
                      disabled={totalInviteCount === 0 || isSending}
                      className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-700 text-xs py-2 px-3"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      {isSending ? 'Sending...' : `Send (${totalInviteCount})`}
                    </Button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {filteredUsersForSearch.length > 0 ? filteredUsersForSearch.map((user) => {
                    const invited = isUserInvited(user.email);
                    const isSelected = selectedInSearch.some((u) => u.id === user.id);
                    
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectInSearch(user)}
                        className={`flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          invited ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={invited}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold text-sm ${invited ? 'text-gray-400' : 'text-gray-900'}`}>
                              {user.name}
                            </h4>
                            {invited && (
                              <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                                Invited
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs ${invited ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      <p>No matching users found.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 text-sm">
              DRAFT LIST ({draftList.length})
            </h3>
            {draftList.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearList}>
                  Clear List
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendInvites}
                  disabled={isSending}
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-700"
                >
                  <Send className="w-3 h-3 mr-1.5" />
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {draftList.length > 0 ? draftList.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
                >
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromDraft(user.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Remove
                  </Button>
                </motion.div>
              )) : (
                <div className="text-center py-10 text-gray-500">
                  <p>Your draft invite list is empty.</p>
                  <p className="text-sm mt-1">Use the search bar above to find and add guests.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
