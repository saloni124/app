
import React from 'react';
import PoppinEventCard from '../feed/PoppinEventCard';
import { ArrowLeft, Sparkles, Search, Bookmark, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventReelModal({ events, startIndex, isOpen, onClose, currentUser, onGenerateMemoryPost }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[100]"
        >
          {/* Back button */}
          <button
            onClick={onClose}
            className="fixed top-4 left-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* Full screen scrollable container - remove overflow hidden that clips dropdown */}
          <div className="w-full h-full snap-y snap-mandatory scrollbar-hide" style={{ overflowY: 'auto', overflowX: 'visible' }}>
            {events.map((event, index) => {
              // Only hide save button if this is the current user's own event
              const isOwnEvent = currentUser?.email === event.organizer_email;
              
              return (
                <div key={event.id || index} className="h-full w-full snap-start flex items-center justify-center" style={{ overflow: 'visible' }}>
                  <PoppinEventCard
                    event={event}
                    currentUser={currentUser}
                    isDesktopFrame={false}
                    showTicketButton={true}
                    hideEventSaveButton={isOwnEvent}
                    showEventDropdownOnly={false}
                    onGenerateMemoryPost={onGenerateMemoryPost}
                  />
                </div>
              );
            })}
          </div>

          {/* Mobile Bottom Navigation - same as layout but with comments modal class check */}
          <nav id="event-reel-nav" className="md:hidden fixed bottom-0 left-0 right-0 border-t z-50 bg-black/80 backdrop-blur-md border-white/20">
            <div className="h-14 flex items-center px-2">
              <a href="/Feed" className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-gray-400 hover:text-white">
                <Sparkles className="w-5 h-5 mb-0.5" />
                Explore
              </a>
              <a href="/Explore" className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-gray-400 hover:text-white">
                <Search className="w-5 h-5 mb-0.5" />
                Search
              </a>
              
              {/* Central Create Button */}
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-10 h-9 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg mb-0.5">
                  <Plus className="w-4 h-4" />
                </div>
              </div>

              <a href="/MyList" className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-gray-400 hover:text-white">
                <Bookmark className="w-5 h-5 mb-0.5" />
                Planner
              </a>
              <a href="/Profile" className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-white">
                <User className="w-5 h-5 mb-0.5" />
                Profile
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
