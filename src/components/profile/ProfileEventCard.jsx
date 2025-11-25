
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MoreVertical, Users, Edit3, Trash2, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProfileEventCard({ event, eventType, onCancel, onDelete, onGenerateMemoryPost, isOwnProfile, onClick }) {
  const navigate = useNavigate();

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
  };

  const isPastEvent = eventType === 'past';

  const renderDropdownMenu = () => {
    if (!isOwnProfile) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 rounded-full bg-black/50 text-white hover:bg-black/60"
            onClick={(e) => e.stopPropagation()}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="bg-popover text-popover-foreground rounded-md z-50 min-w-[8rem] overflow-hidden border shadow-md" onClick={(e) => e.stopPropagation()}>
          {eventType === 'upcoming' &&
          <>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => navigate(createPageUrl(`EventAttendees?id=${event.id}&manage=true`)))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Guests</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => navigate(createPageUrl(`CreateEvent?edit=${event.id}`)))} className="text-blue-600 px-2 py-1.5 text-sm rounded-sm relative flex cursor-default select-none items-center outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => onCancel(event))} className="text-amber-500 px-2 py-1.5 text-sm rounded-sm relative flex cursor-default select-none items-center outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Cancel</span>
              </DropdownMenuItem>
            </>
          }
          {eventType === 'past' &&
          <>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => navigate(createPageUrl(`EventAttendees?id=${event.id}&manage=true`)))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Guests</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => onGenerateMemoryPost(event))} className="text-blue-600">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Generate Memory Post</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => onDelete(event.id))} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          }
          {eventType === 'drafts' &&
          <>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => navigate(createPageUrl(`CreateEvent?edit=${event.id}`)))}>
                <Edit3 className="mr-2 h-4 w-4" />
                <span>{event.status === 'draft' ? 'Continue Editing' : 'Edit Cancelled Event'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction(e, () => onDelete(event.id))} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          }
        </DropdownMenuContent>
      </DropdownMenu>);

  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(createPageUrl(`EventDetails?id=${event.id}`));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group w-full aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer"
      onClick={handleCardClick}>
      <img
        src={event.cover_image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=800&fit=crop'}
        alt={event.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-0.5">
          <div className={`w-fit flex flex-col items-start text-xs font-normal px-1.5 py-px rounded-md shadow-md ${isPastEvent ? 'bg-black/40 backdrop-blur-sm text-white/90' : 'bg-blue-500/80 backdrop-blur-sm text-white'}`}>
            <span>{event.date ? format(new Date(event.date), 'MMM d') : 'TBD'}</span>
          </div>
          <div className={`w-fit flex flex-col items-start text-xs font-normal px-1.5 py-px rounded-md shadow-md ${isPastEvent ? 'bg-black/40 backdrop-blur-sm text-white/90' : 'bg-blue-500/80 backdrop-blur-sm text-white'}`}>
            <span>{event.date ? format(new Date(event.date), 'h:mm a') : ''}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs font-normal px-1.5 py-px rounded-full shadow-md ${isPastEvent ? 'bg-black/40 backdrop-blur-sm text-white/90' : 'bg-blue-500/80 backdrop-blur-sm text-white'}`}>
          <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex flex-col items-start gap-1">
          <div className="pointer-events-auto mb-1">
            {renderDropdownMenu()}
          </div>
          <div className="w-full pointer-events-none">
            <h3 className="font-bold text-base md:text-lg leading-tight truncate">{event.title}</h3>
            <p className="text-xs md:text-sm opacity-80 truncate">{event.venue_name || event.location}</p>
          </div>
        </div>
        <div className="mt-2 pointer-events-none">
          {event.status === 'cancelled' && eventType === 'drafts' &&
          <Badge variant="destructive" className="mt-2">Cancelled</Badge>
          }
          {event.status === 'draft' && eventType === 'drafts' &&
          <Badge variant="outline" className="mt-2 bg-yellow-500 text-white border-yellow-500">Draft</Badge>
          }
        </div>
      </div>
    </motion.div>);

}