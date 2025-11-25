
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Users, Megaphone, X } from 'lucide-react';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { EventAttendance } from '@/api/entities';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";

const sampleMessages = [
{
  id: 1,
  user: 'Sarah M.',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
  message: "So excited for this event! Anyone else coming from downtown?",
  timestamp: new Date(Date.now() - 1000 * 60 * 45),
  isCurrentUser: false
},
{
  id: 2,
  user: 'Marcus T.',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
  message: "Yes! I'll be taking the red line. Want to meet up at the station?",
  timestamp: new Date(Date.now() - 1000 * 60 * 30),
  isCurrentUser: false
},
{
  id: 3,
  user: 'You',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
  message: "That sounds great! I'll be there around 6:30pm",
  timestamp: new Date(Date.now() - 1000 * 60 * 15),
  isCurrentUser: true
}];


export default function EventChatBoard({ event, userStatus, onClose }) {
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showBlastModal, setShowBlastModal] = useState(false);
  const [blastMessage, setBlastMessage] = useState('');
  const [selectedRsvpGroups, setSelectedRsvpGroups] = useState(['going']);
  const [sendingMethod, setSendingMethod] = useState('onesocial');
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [localReminderBlasts, setLocalReminderBlasts] = useState(event.reminder_blasts || []);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    setLocalReminderBlasts(event.reminder_blasts || []);
  }, [event.reminder_blasts]);

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message = {
      id: messages.length + 1,
      user: 'You',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
      message: newMessage.trim(),
      timestamp: new Date(),
      isCurrentUser: true
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isEventOwner = currentUser && event && currentUser.email === event.organizer_email;

  const toggleRsvpGroup = (group) => {
    setSelectedRsvpGroups((prev) => {
      if (prev.includes(group)) {
        return prev.filter((g) => g !== group);
      } else {
        return [...prev, group];
      }
    });
  };

  const handleSendBlast = async () => {
    if (!blastMessage.trim() || selectedRsvpGroups.length === 0 || !currentUser) return;

    setIsSendingBlast(true);

    try {
      // Fetch attendees for this event
      const attendees = await EventAttendance.filter({ event_id: event.id });

      // Filter attendees based on selected RSVP groups
      const recipients = attendees.filter((attendee) =>
      selectedRsvpGroups.includes(attendee.status)
      );

      // Count recipients with phone numbers
      const recipientCount = recipients.filter((r) => r.user_phone).length;

      // Create the blast record
      const newBlast = {
        message: blastMessage.trim(),
        sent_at: new Date().toISOString(),
        sent_by: currentUser.full_name || currentUser.email,
        sent_via: sendingMethod,
        recipient_groups: selectedRsvpGroups,
        recipient_count: recipientCount
      };

      // Update the event with the new blast
      const updatedBlasts = [...(event.reminder_blasts || []), newBlast];
      await Event.update(event.id, { reminder_blasts: updatedBlasts });

      // Update local state
      setLocalReminderBlasts(updatedBlasts);

      // Reset form and close modal
      setBlastMessage('');
      setSelectedRsvpGroups(['going']);
      setSendingMethod('onesocial');
      setShowBlastModal(false);

      // Show success message without configuration details
      alert(`Blast sent successfully to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Error sending blast:', error);
      alert('Failed to send blast. Please try again.');
    } finally {
      setIsSendingBlast(false);
    }
  };

  const renderChat = () =>
  <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) =>
      <div
        key={message.id}
        className={`flex gap-3 ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}>

            <img
          src={message.avatar}
          alt={message.user}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0" />

            <div className={`flex-1 ${message.isCurrentUser ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-2 mb-1 ${message.isCurrentUser ? 'justify-end' : ''}`}>
                {!message.isCurrentUser && <span className="text-sm font-medium text-gray-700">{message.user}</span>}
                <span className="text-xs text-gray-500">
                  {format(message.timestamp, 'h:mm a')}
                </span>
              </div>
              <div
            className={`inline-block px-3 py-2 rounded-2xl max-w-xs break-words ${
            message.isCurrentUser ?
            'bg-blue-600 text-white' :
            'bg-gray-100 text-gray-900'}`
            }>

                {message.message}
              </div>
            </div>
          </div>
      )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1" />

          <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white">

            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Only attendees can see this conversation. Be respectful.
        </p>
      </div>
    </>;


  const renderBlasts = () =>
  <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localReminderBlasts && localReminderBlasts.length > 0 ?
      localReminderBlasts.map((blast, index) =>
      <div key={index} className="flex gap-3 items-start">
              <div className="bg-blue-100 p-2 rounded-full mt-1 flex-shrink-0">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{blast.message}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {blast.recipient_groups && blast.recipient_groups.map((group, i) =>
            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {group}
                    </span>
            )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sent by {blast.sent_by} via {blast.sent_via === 'onesocial' ? 'OneSocial' : 'Personal Phone'} on {format(new Date(blast.sent_at), "MMM d 'at' h:mm a")}
                  {blast.recipient_count && ` • ${blast.recipient_count} recipient${blast.recipient_count !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
      ) :

      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Megaphone className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-medium">No Blasts Yet</p>
            <p className="text-sm">Important updates from the host will appear here.</p>
          </div>
      }
        <div ref={messagesEndRef} />
      </div>

      {isEventOwner &&
    <div className="p-4 border-t border-gray-200">
          <Button
        onClick={() => setShowBlastModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white">

            <Megaphone className="w-4 h-4 mr-2" />
            Send Text Blast
          </Button>
        </div>
    }
    </>;


  const rsvpOptions = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'invited', label: 'Invited' },
  { value: 'pending', label: 'Pending' },
  { value: 'cant_go', label: "Can't Go" }];


  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden h-[70vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Event Board</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                Chat and updates for {event.title}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>

            <MessageCircle className="w-4 h-4" />
            Event Chat
          </button>
          <button
            onClick={() => setActiveTab('blasts')}
            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'blasts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>

            <Megaphone className="w-4 h-4" />
            Host Blasts
          </button>
        </div>

        {activeTab === 'chat' ? renderChat() : renderBlasts()}
      </div>

      {/* Send Blast Modal */}
      <Dialog open={showBlastModal} onOpenChange={setShowBlastModal}>
        <DialogContent className="sm:max-w-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(90vh-5rem)] overflow-y-auto rounded-2xl mb-16 sm:mb-0">
          <DialogHeader>
            <DialogTitle>Send Text Blast</DialogTitle>
            <DialogDescription>
              Send an important update to your event attendees via text message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Message Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message
              </label>
              <Textarea
                placeholder="Type your message here..."
                value={blastMessage}
                onChange={(e) => setBlastMessage(e.target.value)}
                className="resize-none h-24"
                maxLength={160} />

              <p className="text-xs text-gray-500 mt-1 text-right">
                {blastMessage.length}/160 characters
              </p>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Send to (select RSVP groups)
              </label>
              <div className="flex flex-wrap gap-2">
                {rsvpOptions.map((option) => {
                  const isSelected = selectedRsvpGroups.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg transition-all ${
                        isSelected ? 'bg-blue-50 border-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRsvpGroup(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

                      <span className={`text-sm whitespace-nowrap ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sending Method */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Send via
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sending_method"
                    value="onesocial"
                    checked={sendingMethod === 'onesocial'}
                    onChange={(e) => setSendingMethod(e.target.value)}
                    className="mt-0.5" />

                  <div>
                    <span className="text-sm font-medium text-gray-900">Official OneSocial Number</span>
                    <p className="text-xs text-gray-500">Keep your phone number private</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sending_method"
                    value="personal_phone"
                    checked={sendingMethod === 'personal_phone'}
                    onChange={(e) => setSendingMethod(e.target.value)}
                    className="mt-0.5" />

                  <div>
                    <span className="text-sm font-medium text-gray-900">My Personal Phone Number</span>
                    <p className="text-xs text-gray-500">
                      Recipients will see your phone number
                      {!currentUser?.phone_number && <span className="text-orange-600"> (Add phone in settings first)</span>}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBlastModal(false)}
              disabled={isSendingBlast} className="bg-background mt-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">

              Cancel
            </Button>
            <Button
              onClick={handleSendBlast}
              disabled={!blastMessage.trim() || selectedRsvpGroups.length === 0 || isSendingBlast || sendingMethod === 'personal_phone' && !currentUser?.phone_number}
              className="bg-blue-600 hover:bg-blue-700 text-white">

              {isSendingBlast ? 'Sending...' : 'Send Blast'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
