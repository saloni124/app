
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';

// Dummy/Mock classes for demonstration purposes to make the file runnable.
// In a real application, these would be imported from a data layer or API client.
class EventReview {
  static async filter(query, sortBy, limit) {
    // console.log("Mock EventReview.filter called with:", query, sortBy, limit);
    // Return some dummy data for testing
    const allDummyReviews = [
      { id: 'r1', user_email: 'test@example.com', event_id: 'e1', rating: 5, review_text: 'Absolutely fantastic event! The atmosphere was electric and the performances were top-notch. Highly recommend to everyone.', created_date: new Date(Date.now() - 3600000).toISOString() },
      { id: 'r2', user_email: 'test@example.com', event_id: 'e2', rating: 4, review_text: 'A truly inspiring exhibition. Some pieces were breathtaking, others thought-provoking. Well curated.', created_date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'r3', user_email: 'another@example.com', event_id: 'e1', rating: 3, review_text: 'It was okay, not exactly what I expected but still an enjoyable evening.', created_date: new Date(Date.now() - 2 * 86400000).toISOString() },
    ];
    return allDummyReviews.filter(r => r.user_email === query.user_email);
  }
}

class Event {
  static async filter(query) {
    // console.log("Mock Event.filter called with:", query);
    // Return some dummy data for testing
    const allDummyEvents = [
      { id: 'e1', title: 'Summer Music Festival', cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop', organizer_name: 'Groove Productions' },
      { id: 'e2', title: 'Modern Art Expo', cover_image: 'https://images.unsplash.com/photo-1579783902671-92576ef68e82?w=100&h=100&fit=crop', organizer_name: 'Art House Gallery' },
    ];
    if (query.id && query.id.$in) {
      return allDummyEvents.filter(e => query.id.$in.includes(e.id));
    }
    return [];
  }
}

// ReviewCard component definition.
// This component remains in the file as per instructions ("keep existing code"),
// but its usage within UserReviewsTab will be replaced by inlined code based on the outline.
const ReviewCard = ({ review, event }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Event Info */}
        <Link
          to={event ? createPageUrl(`EventDetails?id=${event.id}`) : '#'}
          className="flex-shrink-0 w-full sm:w-28"
        >
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={event?.cover_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'}
              alt={event?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="font-semibold text-sm mt-2 text-gray-800 truncate block sm:hidden">{event?.title || 'Event'}</h4>
        </Link>

        {/* Review Content */}
        <div className="flex-1">
          <h4 className="font-semibold text-base hidden sm:block text-gray-800 truncate mb-1">{event?.title || 'Event'}</h4>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="text-xs text-gray-500">
              {review.created_date ? formatDistanceToNow(new Date(review.created_date), { addSuffix: true }) : 'a while ago'}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            "{review.review_text}"
          </p>
          {event?.organizer_name && (
            <div className="text-xs text-gray-500">
              Hosted by{' '}
              <Link to={createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.organizer_name)}`)} className="font-medium text-blue-600 hover:underline">
                {event.organizer_name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};


export default function UserReviewsTab({ currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserReviews = useCallback(async () => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load all reviews by this user
      const userReviews = await EventReview.filter(
        { user_email: currentUser.email },
        '-created_date', // Sort by created_date descending
        20 // Limit to 20 reviews
      );
      
      // Get event details for each review
      const eventIds = userReviews.map(review => review.event_id).filter(Boolean); // Filter out any null/undefined event_ids
      let eventsMap = {};
      if (eventIds.length > 0) {
        const events = await Event.filter({ id: { $in: eventIds } });
        eventsMap = events.reduce((acc, event) => {
          acc[event.id] = event;
          return acc;
        }, {});
      }
      
      // Combine reviews with event data
      const reviewsWithEvents = userReviews.map(review => ({
        ...review,
        event: eventsMap[review.event_id] // Attach the full event object
      })).filter(review => review.event); // Filter out reviews without valid events (e.g., event might have been deleted)
      
      setReviews(reviewsWithEvents);
    } catch (error) {
      console.error("Error loading user reviews:", error);
      // Optionally set an error state here
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Dependency array includes currentUser to re-fetch if user changes

  useEffect(() => {
    if (currentUser && currentUser.email) {
      loadUserReviews();
    } else {
      setLoading(false); // No user, so no reviews to load
    }
  }, [currentUser, loadUserReviews]); // Dependency array includes currentUser and loadUserReviews

  if (loading) {
    return (
      <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-blue-500/10">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-blue-500/10">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Reviews written by {currentUser?.full_name || 'this user'} will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Reviews by {currentUser?.full_name || 'user'} ({reviews.length})</h2>
      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => {
          const event = review.event; // Event data is now directly part of the review object
          return (
            // Apply new styling from the outline's div to the outer motion.div
            <motion.div
              key={review.id} // Using review.id as a stable key
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              {/* New user avatar, name, and stars section from the outline */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={currentUser?.profile_image_url || 'https://via.placeholder.com/150/cccccc/ffffff?text=User'} // Use currentUser's avatar, with a fallback
                  alt={currentUser?.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {currentUser?.full_name || 'User'} {/* Use currentUser's full name */}
                    </h4>
                    <div className="flex items-center">
                      {/* Render stars based on review.rating */}
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining content adapted from the original ReviewCard, ensuring functionality is preserved */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mt-4"> {/* Added mt-4 for visual separation */}
                {/* Event Info */}
                <Link
                  to={event ? createPageUrl(`EventDetails?id=${event.id}`) : '#'}
                  className="flex-shrink-0 w-full sm:w-28"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={event?.cover_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop'}
                      alt={event?.title || 'Event'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-sm mt-2 text-gray-800 truncate block sm:hidden">{event?.title || 'Event'}</h4>
                </Link>

                {/* Review Details (excluding stars which are now with user info) */}
                <div className="flex-1">
                  <h4 className="font-semibold text-base hidden sm:block text-gray-800 truncate mb-1">{event?.title || 'Event'}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {/* The stars rendering from ReviewCard is removed here as it's now handled above */}
                    <span className="text-xs text-gray-500">
                      {review.created_date ? formatDistanceToNow(new Date(review.created_date), { addSuffix: true }) : 'a while ago'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    "{review.review_text}"
                  </p>
                  {event?.organizer_name && (
                    <div className="text-xs text-gray-500">
                      Hosted by{' '}
                      <Link to={createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.organizer_name)}`)} className="font-medium text-blue-600 hover:underline">
                        {event.organizer_name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
