import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  music: "bg-blue-100 text-blue-800",
  art: "bg-purple-100 text-purple-800",
  food: "bg-orange-100 text-orange-800",
  tech: "bg-indigo-100 text-indigo-800",
  sports: "bg-green-100 text-green-800",
  business: "bg-gray-200 text-gray-800",
  wellness: "bg-teal-100 text-teal-800",
  nightlife: "bg-fuchsia-100 text-fuchsia-800",
  culture: "bg-yellow-100 text-yellow-800",
  outdoor: "bg-lime-100 text-lime-800",
  rave: "bg-pink-100 text-pink-800",
  popup: "bg-cyan-100 text-cyan-800"
};

export default function MoreFromOrganizer({ events, organizerName }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-slate-950 mb-6 text-xl font-semibold">More from {organizerName}</h3>
      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-hide">
        {events.map((event, index) =>
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="w-80 flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">

            <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
              <div className="aspect-video relative overflow-hidden">
                <img
                src={event.cover_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop'}
                alt={event.title}
                className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-lg font-bold text-white mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-200">{event.venue_name || event.location}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    {event.date ? format(new Date(event.date), "MMM d, h:mm a") : 'Date TBA'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.category &&
                <Badge className={`${categoryColors[event.category] || 'bg-gray-100 text-gray-800'} text-xs`}>
                      {event.category}
                    </Badge>
                }
                  {event.vibe_tags?.slice(0, 2).map((tag) =>
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                )}
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>);

}