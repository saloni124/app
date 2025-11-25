import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Star, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function FeaturedEvents({ events }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {events.slice(0, 5).map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0"
          >
            <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {event.cover_image ? (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                </div>

                {/* Event Info */}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h3 className="text-xs font-bold line-clamp-2 mb-1">{event.title}</h3>
                  <div className="flex items-center gap-1 text-xs opacity-90">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(event.date), "MMM d")}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}