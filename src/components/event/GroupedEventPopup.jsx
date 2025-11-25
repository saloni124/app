import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function MiniEventCard({ event }) {
  if (!event) return null;

  return (
    <div className="w-[280px] flex-shrink-0 snap-center bg-white rounded-xl shadow-lg overflow-hidden flex">
      <img
        src={event.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"}
        alt={event.title}
        className="w-24 object-cover flex-shrink-0"
      />
      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm leading-snug break-words">{event.title}</h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.venue_name || event.location}</span>
            </div>
            {event.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              <span>{event.price === 0 ? "Free" : `$${event.price}`}</span>
            </div>
          </div>
        </div>
        <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
          <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function GroupedEventPopup({ events }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      // Allow for a small tolerance, e.g., 1px, to avoid false negatives due to sub-pixel rendering or rounding.
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      // Initial check and re-check if events change (e.g., component mounts, events array updates)
      // Use a timeout to ensure content is rendered before checking scrollWidth
      const timeoutId = setTimeout(checkScrollability, 0); 
      
      // Also, check when the window resizes, as it can affect clientWidth
      window.addEventListener('resize', checkScrollability);

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        clearTimeout(timeoutId);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [events, checkScrollability]);
  
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // If no events are provided or the array is empty, render nothing.
  if (!events || events.length === 0) {
    return null;
  }
  
  if (events.length === 1) {
    return (
       <div className="w-[300px] bg-transparent p-2">
         <MiniEventCard event={events[0]} />
       </div>
    );
  }

  return (
    <div className="w-[300px] bg-transparent relative group">
        <div 
          ref={scrollContainerRef} 
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-4 p-2" 
          onScroll={checkScrollability}
        >
            {events.map(event => (
              <MiniEventCard key={event.id} event={event} />
            ))}
        </div>
        
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
        )}
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        )}
    </div>
  );
}
