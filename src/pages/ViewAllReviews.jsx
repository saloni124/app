
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EventReview } from "@/api/entities";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { createPageUrl } from "@/utils";
import BusinessReviewsTab from "../components/profile/BusinessReviewsTab";
import { simulatedDataManager } from '@/components/simulatedDataManager';

// Import the same sample reviews used in Profile.js
const reviewsAboutSalonisEvents = [
{
  user_email: 'attendee1@example.com',
  user_name: 'Jessica R.',
  user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
  rating: 5,
  review_text: "Incredible event! The vibes were perfect and everyone was so welcoming. Can't wait for the next one!",
  liked: true,
  vibe_tags: ['welcoming', 'great energy', 'well-organized'],
  would_recommend: true,
  attended: true,
  created_date: '2024-12-15T20:30:00Z'
},
{
  user_email: 'attendee2@example.com',
  user_name: 'Michael T.',
  user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
  rating: 4,
  review_text: "Great venue and awesome people! Had such a good time. Definitely recommend checking out their events.",
  liked: true,
  vibe_tags: ['social', 'fun', 'good crowd'],
  would_recommend: true,
  attended: true,
  created_date: '2024-12-14T19:00:00Z'
},
{
  user_email: 'attendee3@example.com',
  user_name: 'Priya S.',
  user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
  rating: 5,
  review_text: "One of the best events I've been to in a while. Everything was on point!",
  liked: true,
  vibe_tags: ['amazing', 'memorable', 'top-notch'],
  would_recommend: true,
  attended: true,
  created_date: '2024-12-13T21:15:00Z'
},
{
  user_email: 'attendee4@example.com',
  user_name: 'David L.',
  user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
  rating: 5,
  review_text: "Absolutely loved it! Great music, great people, and a perfect atmosphere.",
  liked: true,
  vibe_tags: ['electric', 'friendly', 'amazing vibes'],
  would_recommend: true,
  attended: true,
  created_date: '2024-12-12T22:00:00Z'
},
{
  user_email: 'attendee5@example.com',
  user_name: 'Emma K.',
  user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
  rating: 4,
  review_text: "Really fun event! Met some cool people and had a great time. Looking forward to more!",
  liked: true,
  vibe_tags: ['social', 'welcoming', 'fun'],
  would_recommend: true,
  attended: true,
  created_date: '2024-12-11T20:45:00Z'
}];


const salonisPastEvent = {
  id: 'saloni_past_pool_party',
  title: 'Pool Party',
  organizer_name: 'Saloni Bhatia',
  organizer_email: 'salonibhatia99@gmail.com',
  cover_image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop',
  date: '2024-12-15T14:00:00Z',
  location: 'San Francisco, CA',
  status: 'active'
};

export default function ViewAllReviews() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [organizerName, setOrganizerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(location.search);
        const organizerEmail = urlParams.get('organizer');

        if (!organizerEmail) {
          setIsLoading(false);
          return;
        }

        // CRITICAL FIX: Check if this is the demo user viewing their own profile
        const isDemo = simulatedDataManager.isDemoMode();
        const isAdmin = simulatedDataManager.isAdminMode();
        let displayName = organizerEmail.split('@')[0]; // Default to email part

        if ((isDemo || isAdmin) && organizerEmail === 'salonibhatia99@gmail.com') {
          // Get the CURRENT name from simulatedDataManager
          const currentUser = simulatedDataManager.getBypassUser();
          displayName = currentUser?.full_name || 'Saloni Bhatia'; // Fallback if no full_name
          console.log('⭐ Using simulated user name for ViewAllReviews:', displayName);
        } else {
          // For other users, fetch from database
          try {
            const organizerUsers = await User.filter({ email: organizerEmail });
            const organizerUser = organizerUsers?.[0];
            if (organizerUser) {
              displayName = organizerUser.full_name || displayName;
            }
          } catch (error) {
            console.error('Error fetching organizer user:', error);
          }
        }

        setOrganizerName(displayName);

        // Check if this is Saloni - use hardcoded reviews
        if (organizerEmail === 'salonibhatia99@gmail.com') {
          console.log('⭐ Loading hardcoded reviews for Saloni');
          const mappedReviews = reviewsAboutSalonisEvents.map((review) => ({
            ...review,
            id: `review_saloni_${review.user_email}_${Math.random().toString(36).substr(2, 9)}`,
            event_id: salonisPastEvent.id,
            event_title: salonisPastEvent.title,
            organizer_name: displayName
          }));
          setReviews(mappedReviews);
          setEventsMap({ [salonisPastEvent.id]: { ...salonisPastEvent, organizer_name: displayName } });
          setIsLoading(false);
          return;
        }

        // For other organizers, fetch from database
        const organizerEvents = await Event.filter({ organizer_email: organizerEmail });
        const eventIds = organizerEvents.map((e) => e.id);

        if (eventIds.length === 0) {
          setReviews([]);
          setEventsMap({});
          setIsLoading(false);
          return;
        }

        const reviewsData = await EventReview.filter({
          event_id: { $in: eventIds }
        }, '-created_date');

        setReviews(reviewsData || []);

        const eventsMapData = organizerEvents.reduce((acc, event) => {
          acc[event.id] = event;
          return acc;
        }, {});
        setEventsMap(eventsMapData);

      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-50 px-4 py-4 sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-medium text-gray-900">
              Reviews for {organizerName}
            </h1>
          </div>
        </div>

        <div className="bg-slate-50 pt-6 b bg">
          {reviews.length > 0 ?
          <BusinessReviewsTab
            profileUser={{ email: new URLSearchParams(location.search).get('organizer'), full_name: organizerName }}
            reviews={reviews}
            eventsMap={eventsMap}
            isOwnProfile={false}
            limitTo3={false} /> :
          <div className="text-center py-16 px-4">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">
                This organizer hasn't received any reviews yet.
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}