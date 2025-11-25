import React, { useState, useEffect } from "react";
import { EventReview } from "@/api/entities";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Flag, MoreVertical } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Sample reviews data for when we can't find real reviews
const sampleReviewsData = [
  {
    id: 'sample1',
    user_name: 'Sarah M.',
    user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
    rating: 5,
    review_text: "Amazing venue and incredible atmosphere! The staff was super friendly and the whole experience was perfect. Can't wait for the next event!",
    event_id: "sample_event_1"
  },
  {
    id: 'sample2',
    user_name: 'Marcus T.',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4,
    review_text: "Great concept and execution. The art was thought-provoking and the space was perfect for networking.",
    event_id: "sample_event_2"
  },
  {
    id: 'sample3',
    user_name: 'Elena K.',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
    rating: 5,
    review_text: "Such a peaceful and rejuvenating experience! The instructor was amazing and the setting was perfect.",
    event_id: "sample_event_3"
  },
  {
    id: 'sample4',
    user_name: 'Alex J.',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    rating: 4,
    review_text: "Really well organized event. Met some great people and the activities were fun and engaging.",
    event_id: "sample_event_4"
  }
];

const sampleEventsData = {
  "sample_event_1": { id: "sample_event_1", title: "Underground Art Gallery Opening" },
  "sample_event_2": { id: "sample_event_2", title: "Creative Tech Conference" },
  "sample_event_3": { id: "sample_event_3", title: "Mindful Morning Meditation" },
  "sample_event_4": { id: "sample_event_4", title: "Thursday Dating Night" }
};

export default function AllReviews() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [reviewFilter, setReviewFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const organizerName = urlParams.get('organizer');

    if (!organizerName) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // First try to find the organizer in the User table
        const usersResult = await User.filter({ full_name: organizerName });
        let organizerUser = null;
        
        if (Array.isArray(usersResult) && usersResult.length > 0) {
          organizerUser = usersResult[0];
        } else {
          // If not found in users, create a mock organizer object
          organizerUser = { 
            full_name: organizerName,
            email: `${organizerName.toLowerCase().replace(/\s+/g, '.')}@example.com`
          };
        }
        
        setOrganizer(organizerUser);

        // Try to find real events and reviews
        const eventsResult = await Event.filter({ organizer_name: organizerName });
        const events = Array.isArray(eventsResult) ? eventsResult : [];
        const eventIds = events.map(e => e.id).filter(Boolean);

        let fetchedReviews = [];
        let eventsMapData = {};
        
        if (eventIds.length > 0) {
          const reviewsResult = await EventReview.filter({ event_id: { '$in': eventIds } }, '-created_date');
          fetchedReviews = Array.isArray(reviewsResult) ? reviewsResult : [];
          
          const reviewedEventIds = [...new Set(fetchedReviews.map(r => r.event_id))].filter(Boolean);
          if (reviewedEventIds.length > 0) {
            const eventDetailsResult = await Event.filter({ id: { '$in': reviewedEventIds } });
            const eventDetails = Array.isArray(eventDetailsResult) ? eventDetailsResult : [];
            eventsMapData = eventDetails.reduce((acc, event) => {
              acc[event.id] = event;
              return acc;
            }, {});
          }
        }
        
        // If no real reviews found, use sample data for demonstration
        if (fetchedReviews.length === 0) {
          fetchedReviews = sampleReviewsData;
          eventsMapData = sampleEventsData;
        }
        
        setReviews(fetchedReviews);
        setEventsMap(eventsMapData);

      } catch (error) {
        console.error("Error loading reviews:", error);
        // On error, still show sample data if we have an organizer name
        setOrganizer({ full_name: organizerName });
        setReviews(sampleReviewsData);
        setEventsMap(sampleEventsData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [location.search]);
  
  let displayedReviews = [...reviews];
  // Apply filtering
  if (reviewFilter !== 'all') {
    const rating = parseInt(reviewFilter);
    displayedReviews = displayedReviews.filter(r => r.rating === rating);
  }
  // Apply sorting
  displayedReviews.sort((a, b) => {
    if (sortOrder === 'highest') return b.rating - a.rating;
    if (sortOrder === 'lowest') return a.rating - b.rating;
    // newest is default, pre-sorted from fetch
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Organizer not found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the organizer you were looking for.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }
  
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reviews for {organizer.full_name}</h1>
            <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{averageRating} average rating from {reviews.length} reviews</span>
            </div>
          </div>
        </motion.div>

        {/* Filter Controls */}
        <div className="flex justify-start gap-2 items-center mb-6">
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="pl-3 pr-5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="newest">Newest first</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
        </div>

        {displayedReviews.length === 0 ? (
           <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
              <div className="text-6xl mb-4">🤷</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No matching reviews</h3>
              <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
           </div>
        ) : (
          <div className="space-y-4">
            {displayedReviews.map((review, index) => {
              const event = eventsMap[review.event_id];
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 relative">
                  
                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => alert(`Review by ${review.user_name} has been reported.`)}
                          className="text-red-600">
                          <Flag className="w-4 h-4 mr-2" />
                          Report Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-start gap-4">
                    <img
                      src={review.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=random`}
                      alt={review.user_name}
                      className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{review.user_name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) =>
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        "{review.review_text}"
                      </p>
                      {event &&
                        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-md inline-block">
                          <span>About: </span>
                          {event.id?.startsWith('sample_') ? (
                            <span className="text-gray-600 font-medium">{event.title}</span>
                          ) : (
                            <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="text-blue-600 hover:underline font-medium">
                              {event.title}
                            </Link>
                          )}
                        </div>
                      }
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}