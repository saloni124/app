
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Share2, Bookmark, Download, UserPlus, Check } from 'lucide-react';

export default function ExploreMobileListItem({ event, onSavePost, currentUser, onFollowToggle }) {
  if (!event) {
    return null;
  }
  
  const navigate = useNavigate();

  const handleActionClick = (e) => {
    e.stopPropagation();
    
    const platform = event.platform;
    if (platform === 'app') {
        if (event.url) window.open(event.url, '_blank', 'noopener,noreferrer');
    } else if (['curator', 'venue', 'membership'].includes(platform)) {
        onFollowToggle(event);
    } else {
        onSavePost(event, e);
    }
  };
  
  const platform = event.platform;
  const isAccount = ['curator', 'venue', 'membership'].includes(platform);
  const isApp = platform === 'app';
  
  const isFollowing = isAccount && currentUser?.followed_curator_ids?.includes(event.id);
  const isSaved = !isAccount && !isApp && currentUser?.saved_events?.includes(event.id);

  const renderActionButton = () => {
      if (isApp) {
          return (
              <button onClick={handleActionClick} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Download app">
                  <Download className="w-4 h-4 text-gray-600" />
              </button>
          );
      }

      if (isAccount) {
          return (
              <button onClick={handleActionClick} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label={isFollowing ? "Unfollow" : "Follow"}>
                  {isFollowing ? (
                      <Check className="w-4 h-4 text-green-500" />
                  ) : (
                      <UserPlus className="w-4 h-4 text-gray-600" />
                  )}
              </button>
          );
      }

      return (
          <button onClick={handleActionClick} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Save event">
              <Bookmark className={`w-4 h-4 ${isSaved ? 'text-pink-400 fill-current' : 'text-gray-600'}`} />
          </button>
      );
  };

  const handleClick = () => {
        // Special handling for Thursday Dating - treat as curator even though marked as app
        if (event.name === "Thursday Dating" || event.id === "thursday-dating") {
            navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.name)}`));
            return;
        }

        switch (event.platform) {
            case 'curator':
            case 'person':
            case 'venue':
            case 'membership':
            case 'museum':
                navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.name)}`));
                break;
            case 'event':
                navigate(createPageUrl(`EventDetails?id=${event.id}`));
                break;
            case 'app':
                // For apps, still go to curator profile instead of external URL
                navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.name)}`));
                break;
            default:
                if (event.id && event.linkType === 'event') {
                    navigate(createPageUrl(`EventDetails?id=${event.id}`));
                } else {
                    // Default to curator profile for any other case
                    navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.name)}`));
                }
                break;
        }
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex gap-4 items-center">
        <img
          src={event.coverImage}
          alt={event.name}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="font-bold text-base text-gray-900 line-clamp-1 pr-2">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 capitalize">{event.platform}</p>
            </div>
            <div className="flex gap-1 ml-2 flex-shrink-0">
              {renderActionButton()}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
