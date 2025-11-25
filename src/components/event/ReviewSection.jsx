import React, { useState, useEffect } from 'react';
import { EventReview } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewSection({ eventId, organizerName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadReviews();
    loadCurrentUser();
  }, [eventId]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const eventReviews = await EventReview.filter({ event_id: eventId }, '-created_date', 10);
      setReviews(eventReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Reviews
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const likedPercentage = reviews.filter(r => r.liked).length / reviews.length * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex">{renderStars(Math.round(averageRating))}</div>
          <span className="text-sm text-gray-600">
            {averageRating.toFixed(1)} average
          </span>
        </div>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(likedPercentage)}%</div>
          <div className="text-sm text-gray-600">Enjoyed it</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {reviews.filter(r => r.would_recommend).length}
          </div>
          <div className="text-sm text-gray-600">Would recommend</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.slice(0, 3).map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-gray-100 pb-4 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <img
                src={review.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=random`}
                alt={review.user_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{review.user_name}</span>
                  <div className="flex">{renderStars(review.rating)}</div>
                  {review.liked ? (
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                {review.review_text && (
                  <p className="text-gray-700 mb-2">{review.review_text}</p>
                )}
                
                {review.vibe_tags && review.vibe_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {review.vibe_tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="mt-4 text-center">
          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            View All Reviews ({reviews.length})
          </Button>
        </div>
      )}
    </motion.div>
  );
}