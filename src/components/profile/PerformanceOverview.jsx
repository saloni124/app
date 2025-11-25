import React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Users } from 'lucide-react';

export default function PerformanceOverview({ reviews = [] }) {
  // Calculate metrics from reviews
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    // Show sample data for demonstration when no real reviews exist
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-4">


        <h2 className="text-gray-900 text-base font-bold text-center">Key Metrics</h2>
        
        <div className="bg-white pt-4 pr-4 pb-4 pl-4 rounded-2xl md:p-6 border border-gray-200/80 shadow-sm">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* Average Rating */}
            <div className="bg-green-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
              <Star className="w-6 h-6 mb-2 text-green-500" />
              <div className="text-xl font-bold text-green-600">4.5</div>
              <div className="text-green-600 mt-1 text-xs font-medium">Average Rating</div>
            </div>
            
            {/* Would Recommend */}
            <div className="bg-blue-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
              <ThumbsUp className="w-6 h-6 mb-2 text-blue-500" />
              <div className="text-xl font-bold text-blue-600 ml-3">75%</div>
              <div className="text-blue-600 mt-1 text-xs font-medium">Would Recommend</div>
            </div>
            
            {/* Total Reviews */}
            <div className="bg-purple-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
              <Users className="w-6 h-6 mb-2 text-purple-500" />
              <div className="text-xl font-bold text-purple-600">4</div>
              <div className="text-purple-600 mt-1 text-xs font-medium">Total Reviews</div>
            </div>
          </div>
        </div>
      </motion.div>);

  }

  // Calculate actual metrics from real reviews
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const averageRating = totalRating / totalReviews;

  const recommendCount = reviews.filter((review) => review.would_recommend).length;
  const recommendPercentage = Math.round(recommendCount / totalReviews * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4">

      <h2 className="text-gray-900 text-base font-semibold text-center">Key Metrics</h2>
      
      <div className="bg-white mx-2 p-4 rounded-2xl md:p-6 border border-gray-200/80 shadow-sm">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Average Rating */}
          <div className="bg-green-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
            <Star className="w-6 h-6 mb-2 text-green-500" />
            <div className="text-xl font-bold text-green-600">
              {averageRating.toFixed(1)}
            </div>
            <div className="text-green-600 mt-1 text-xs font-medium">Average Rating</div>
          </div>
          
          {/* Would Recommend */}
          <div className="bg-blue-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
            <ThumbsUp className="w-6 h-6 mb-2 text-blue-500" />
            <div className="text-xl font-bold text-blue-600 ml-1">
              {recommendPercentage}%
            </div>
            <div className="text-blue-600 mt-1 text-xs font-medium">Would Recommend</div>
          </div>
          
          {/* Total Reviews */}
          <div className="bg-purple-50 p-4 md:px-4 md:py-2 rounded-2xl text-center flex flex-col items-center justify-center">
            <Users className="w-6 h-6 mb-2 text-purple-500" />
            <div className="text-xl font-bold text-purple-600">
              {totalReviews}
            </div>
            <div className="text-purple-600 mt-1 text-xs font-medium">Total Reviews</div>
          </div>
        </div>
      </div>
    </motion.div>);

}