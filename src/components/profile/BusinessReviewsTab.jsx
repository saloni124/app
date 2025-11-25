import React from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function BusinessReviewsTab({
  profileUser,
  reviews,
  eventsMap,
  isOwnProfile,
  limitTo3 = false
}) {
  const navigate = useNavigate();

  const createPageUrl = (pageName) => {
    return `/${pageName}`;
  };

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const displayedReviews = limitTo3 ? reviews.slice(0, 3) : reviews;
  const hasMore = limitTo3 && reviews.length > 3;

  const getReviewTimestamp = (created_date) => {
    if (!created_date) return '';
    const date = new Date(created_date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleReportReview = (review) => {
    alert(`Report functionality for review by ${review.user_name} will be implemented soon.`);
  };

  if (limitTo3) {
    return (
      <div className="w-full">
        <div className="pb-4 flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory px-4" style={{ scrollPaddingLeft: '1rem' }}>
          {displayedReviews.map((review) => {
            const event = eventsMap?.[review.event_id];

            return (
              <div
                key={review.id}
                className="bg-white px-4 py-4 rounded-xl flex-shrink-0 w-[300px] border border-gray-200 hover:shadow-md transition-all snap-start flex flex-col relative">
                
                {/* 3-dots menu in top right */}
                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleReportReview(review)} className="text-red-600">
                        <Flag className="w-4 h-4 mr-2" />
                        Report Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={review.user_avatar || 'https://via.placeholder.com/40'}
                    alt={review.user_name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="font-semibold text-sm text-gray-900 truncate">{review.user_name}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 flex-shrink-0 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {review.review_text && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-4 break-words">
                    {review.review_text}
                  </p>
                )}

                <div className="mt-auto">
                  {event && (
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      About: <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="text-blue-600 hover:underline">
                        {event.title}
                      </Link>
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{getReviewTimestamp(review.created_date)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center mt-2">
            <button
              onClick={() => {
                navigate(createPageUrl(`ViewAllReviews?organizer=${profileUser.email}`));
                // Scroll to top after navigation
                setTimeout(() => window.scrollTo(0, 0), 100);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all {reviews.length} reviews
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full grid format for dedicated reviews page
  return (
    <div className="mx-auto px-4 max-w-4xl sm:px-6 lg:px-8">
      <div className="grid gap-4">
        {reviews.map((review) => {
          const event = eventsMap?.[review.event_id];

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all p-4 relative">
              
              {/* 3-dots menu in top right */}
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleReportReview(review)} className="text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Report Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.user_avatar || 'https://via.placeholder.com/40'}
                  alt={review.user_name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0 pr-8">
                  <p className="font-semibold text-gray-900">{review.user_name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
              </div>

              {event && (
                <p className="text-xs text-gray-500 mb-2">
                  About: <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="text-blue-600 hover:underline">
                    {event.title}
                  </Link>
                </p>
              )}

              {review.review_text ? (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed break-words">
                  {review.review_text}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-1">
                  No comments provided.
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{getReviewTimestamp(review.created_date)}</span>
                <span className="text-gray-300">•</span>
                <div className={`flex items-center gap-1 ${review.liked ? 'text-green-600' : 'text-red-600'}`}>
                  {review.liked ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                  <span>{review.liked ? 'Loved it' : 'Not my vibe'}</span>
                </div>
              </div>

              {review.vibe_tags && review.vibe_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.vibe_tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {review.vibe_tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                      +{review.vibe_tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}