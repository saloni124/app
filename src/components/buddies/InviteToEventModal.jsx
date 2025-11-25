import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, Send } from "lucide-react";
import { Event } from "@/api/entities";
import { format } from "date-fns";

const sampleEvents = [
  {
    id: "evt_1",
    title: "Weekend Photography Walk",
    date: "2027-01-15T14:00:00.000Z",
    location: "Brooklyn Bridge Park",
    cover_image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=60&h=60&fit=crop",
    category: "outdoor"
  },
  {
    id: "evt_2",
    title: "Art Gallery Opening",
    date: "2027-01-20T19:00:00.000Z",
    location: "Downtown Gallery",
    cover_image: "https://images.unsplash.com/photo-1578662996442-48f6103fc6b?w=60&h=60&fit=crop",
    category: "art"
  },
  {
    id: "evt_3",
    title: "Tech Meetup",
    date: "2027-01-25T18:00:00.000Z",
    location: "Innovation Hub",
    cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=60&fit=crop",
    category: "tech"
  }
];

export default function InviteToEventModal({ buddy, children }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(sampleEvents);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = () => {
    if (!selectedEvent) return;
    
    console.log("Sending invite:", {
      buddy: buddy.email,
      event: selectedEvent.id,
      message: message
    });
    
    // Here you would typically send the invitation via API
    alert(`Invitation sent to ${buddy.name} for ${selectedEvent.title}!`);
    
    // Reset form
    setSelectedEvent(null);
    setMessage("");
    setSearchQuery("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite to Event</DialogTitle>
          <DialogDescription>
            Invite {buddy.name} to join you at an event.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Events */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-10"
              />
            </div>
            
            {/* Event List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedEvent?.id === event.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {event.category}
                    </Badge>
                  </div>
                  {selectedEvent?.id === event.id && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hey ${buddy.name}, want to join me at this event?`}
              className="w-full h-20 resize-none"
            />
          </div>

          {/* Selected Event Preview */}
          {selectedEvent && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Inviting to:</p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedEvent.cover_image}
                  alt={selectedEvent.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{selectedEvent.title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(selectedEvent.date), "MMM d, h:mm a")} • {selectedEvent.location}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedEvent(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={!selectedEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}