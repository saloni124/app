import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bookmark, MapPin, Calendar, Loader2, Check, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EventCard({
  event,
  onSaveToggle,
  savedEvents,
  onRsvpChange,
  onDataChange,
  currentUser,
  isSaving = false,
  ...props
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const navigate = useNavigate(); // Move to top level - always call hooks unconditionally

  if (!event) return null;

  const isSaved = savedEvents?.includes(event.id);

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate(createPageUrl("Profile"));
      return;
    }
    
    if (isSaving) return;
    if (onSaveToggle) {
      onSaveToggle(event.id);
    }
  };

  const handleOrganizerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let url = `CuratorProfile?curator=${encodeURIComponent(event.organizer_name || 'Unknown')}`;
      navigate(createPageUrl(url));
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleRsvpClick = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate(createPageUrl("Profile"));
      return;
    }
    
    if (isProcessing) return;
    if (onRsvpChange) {
      onRsvpChange(event, status);
    }
  };

  const handleFriendsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate(createPageUrl("Profile"));
      return;
    }
    
    if (props.onShowFriends) {
      props.onShowFriends(event);
    }
  };

  const handleCommentsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate(createPageUrl("Profile"));
      return;
    }
    
    if (props.onCommentClick) {
      props.onCommentClick(event);
    }
  };

  const handleShowLessClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      navigate(createPageUrl("Profile"));
      return;
    }
    
    if (props.onShowLess) {
      props.onShowLess(event);
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop";

  const formatEventDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return 'Time TBA';
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Date TBA';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.2 }}
        className="h-full">
        <Link 
          to={createPageUrl(`EventDetails?id=${event.id}`)}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="relative">
            <img
              src={event.cover_image || defaultImage}
              alt={event.title || 'Event'}
              className="w-full h-40 object-cover"
              onError={(e) => { e.target.src = defaultImage; }}
            />
            <Badge className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur-sm border-white/20 capitalize">
              {event.privacy_level === 'semi-public' ? 'Semi-Public' : (event.privacy_level || 'Public')}
            </Badge>

            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="absolute top-3 right-3 w-8 h-8 flex-shrink-0 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Bookmark
                  className={`w-4 h-4 transition-all ${isSaved ? 'fill-white text-white' : 'text-white'}`}
                />
              )}
            </button>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <div className="mb-2">
              <p className="text-sm font-bold text-blue-600">
                {event.date ? format(new Date(event.date), 'E, MMM d') : 'Date TBA'} • {formatEventDate(event.date)}
              </p>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                {event.title || 'Untitled Event'}
              </h3>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1 mb-3">
              <button 
                onClick={handleOrganizerClick}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors text-left w-full">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.organizer_name || 'Unknown Organizer'}</span>
              </button>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{event.venue_name || event.location || 'Location TBA'}</span>
              </div>
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{formatFullDate(event.date)}</span>
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-wrap gap-2">
              {event.category && (
                <Badge className="bg-blue-100 text-blue-800 capitalize">
                  {event.category}
                </Badge>
              )}
              {(event.price !== undefined && event.price !== null) && (
                <Badge variant="outline">
                  {event.price > 0 ? `$${event.price}` : 'Free'}
                </Badge>
              )}
              {event.scene_tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>

            {(event.price !== undefined && event.price !== null) && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTicketModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors mt-4">
                {event.price === 0 ? 'Get Free Tickets' : `Get Tickets • $${event.price}`}
              </Button>
            )}
          </div>
        </Link>
      </motion.div>

      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Tickets</DialogTitle>
            <DialogDescription>
              {event.ticket_url ? (
                <>
                  Click the button below to purchase tickets or get more information.
                  {event.price > 0 ? (
                    <p className="mt-2">Price: ${event.price}</p>
                  ) : (
                    <p className="mt-2">This event is free.</p>
                  )}
                </>
              ) : (
                <>
                  Ticket information is not available through a direct link.
                  {event.price > 0 ? (
                    <p className="mt-2">Price: ${event.price}</p>
                  ) : (
                    <p className="mt-2">This event is free.</p>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {event.ticket_url && (
              <Button
                onClick={() => {
                  window.open(event.ticket_url, '_blank');
                  setShowTicketModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Ticket Site
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowTicketModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}