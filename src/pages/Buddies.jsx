import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Calendar, MapPin, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const sampleBuddyMatches = [
{
  id: "match-1",
  user: {
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop",
    email: "sarah.chen@example.com",
    mutualEvents: 3,
    isFriend: true
  },
  sharedEvents: [
  "Underground Art Gallery Opening",
  "Tech Innovation Summit",
  "Jazz Lounge Night"],

  suggestedEvent: {
    title: "Weekend Photography Walk",
    date: "2027-01-15T14:00:00.000Z",
    location: "Brooklyn Bridge Park",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=100&h=100&fit=crop"
  }
},
{
  id: "match-2",
  user: {
    name: "Marcus Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    email: "marcus.r@example.com",
    mutualEvents: 2,
    isFriend: false
  },
  sharedEvents: [
  "Coffee & Code Meetup",
  "Rooftop Cinema Night"],

  suggestedEvent: {
    title: "Startup Pitch Night",
    date: "2027-01-20T19:00:00.000Z",
    location: "Innovation Hub, SF",
    image: "https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=100&h=100&fit=crop"
  }
},
{
  id: "match-3",
  user: {
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    email: "emma.t@example.com",
    mutualEvents: 4,
    isFriend: true
  },
  sharedEvents: [
  "Art Gallery Opening",
  "Wine Tasting Experience",
  "Morning Yoga Session",
  "Jazz Lounge Night"],

  suggestedEvent: {
    title: "Sunset Rooftop Dinner",
    date: "2027-01-25T18:30:00.000Z",
    location: "Downtown LA",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop"
  }
}];


export default function Buddies() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [buddyFilter, setBuddyFilter] = useState("both");

  const handleStartChat = (buddy) => {
    // Simple navigation to chat window
    window.location.href = createPageUrl(`ChatWindow?user=${encodeURIComponent(buddy.email)}`);
  };

  const handleInviteToEvent = (buddy) => {
    alert(`Invite feature for ${buddy.name} - coming soon!`);
  };

  const filteredBuddies = sampleBuddyMatches.filter((match) => {
    const matchesSearch = match.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.suggestedEvent.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (buddyFilter === "friends") return matchesSearch && match.user.isFriend;
    if (buddyFilter === "strangers") return matchesSearch && !match.user.isFriend;
    return matchesSearch; // both
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-6">
              <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors">

                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">

              <div className="mb-4">
                <h1 className="text-2xl font-medium md:text-4xl gradient-text">Event Buddies

            </h1>
              </div>
              <p className="text-lg text-gray-500">
                Connect with people who share your event interests.
              </p>
            </motion.div>

            {/* Filter Controls */}
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 mb-8 border border-gray-200">

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                placeholder="Search new people"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-gray-50 border-gray-300" />

                </div>
              </div>
            </motion.div>

            {/* Buddy List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuddies.length > 0 ?
          filteredBuddies.map((match, index) =>
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col">

                    {/* Profile Section */}
                    <div className="flex items-center gap-3 mb-4">
                      <Link to={createPageUrl(`Profile?user=${encodeURIComponent(match.user.email)}`)}>
                        <img
                  src={match.user.avatar}
                  alt={match.user.name}
                  className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />

                      </Link>
                      <div className="flex-1">
                        <Link
                  to={createPageUrl(`Profile?user=${encodeURIComponent(match.user.email)}`)}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">

                          {match.user.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {match.user.mutualEvents} shared events
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {match.user.isFriend &&
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Friend
                            </span>
                  }
                        </div>
                      </div>
                    </div>

                    {/* Shared Events */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Events in common:</p>
                      <div className="flex flex-wrap gap-1">
                        {match.sharedEvents.slice(0, 2).map((event, idx) =>
                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {event}
                          </span>
                )}
                        {match.sharedEvents.length > 2 &&
                <span className="text-xs text-gray-500">
                            +{match.sharedEvents.length - 2} more
                          </span>
                }
                      </div>
                    </div>

                    {/* Suggested Event */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">Suggested for you both:</p>
                      <div className="flex items-center gap-2">
                        <img
                  src={match.suggestedEvent.image}
                  alt={match.suggestedEvent.title}
                  className="w-8 h-8 rounded object-cover" />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {match.suggestedEvent.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(match.suggestedEvent.date), "MMM d")}</span>
                            <MapPin className="w-3 h-3 ml-1" />
                            <span className="truncate">{match.suggestedEvent.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                       <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => handleStartChat(match.user)}>

                         <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          Chat
                       </Button>
                       <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={() => handleInviteToEvent(match.user)}>

                         <Plus className="w-3.5 h-3.5 mr-1.5" />
                         Invite to Event
                       </Button>
                    </div>
                  </motion.div>
          ) :

          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No buddies found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
          }
            </div>
        </div>
      </div>);

}