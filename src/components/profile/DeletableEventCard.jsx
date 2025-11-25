
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Users } from 'lucide-react'; // Added Users import
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DeletableEventCard({ event, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation(); // prevent link navigation
    if (window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
      onDelete(event.id);
    }
  };

  return (
    <div className="relative bg-red-500 rounded-2xl overflow-hidden shadow-lg">
      <div className="absolute inset-y-0 right-0 flex items-center pr-6 z-0">
        <Button
          size="icon"
          variant="destructive"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 h-12 w-12 rounded-full"
        >
          <Trash2 className="w-6 h-6 text-white" />
        </Button>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.2}
        className="bg-white rounded-2xl overflow-hidden transition-shadow duration-200 border border-gray-200 relative z-10 cursor-grab active:cursor-grabbing"
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">CANCELLED</Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
            <p className="text-sm text-gray-200">{event.venue_name || event.location}</p>
          </div>
        </div>
        {/* New section for event actions */}
        <div className="p-4 flex gap-2">
          <Link to={createPageUrl(`EventAttendees?id=${event.id}&manage=true`)}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              View Guests
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
