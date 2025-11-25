import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { EventReview } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Instagram, Globe, Users, Calendar, ArrowLeft, CheckCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ProfileEventCard from '../components/profile/ProfileEventCard';
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';
import { apiCache } from '../components/apiCache';

const tabIcons = {
  events: <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-current rounded-full"></div></div>,
  reviews: <Star className="w-4 h-4" />
};

const curatorTabs = [
  { id: 'events', label: 'EVENTS', icon: tabIcons.events },
  { id: 'reviews', label: 'REVIEWS', icon: tabIcons.reviews }
];

const sampleEventsMap = {
  'mock_event_arthaus': {
    id: 'mock_event_arthaus',
    title: 'Underground Art Gallery',
    organizer_name: 'ArtHaus Collective',
    cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop'
  },
  'mock_event_thursday': {
    id: 'mock_event_thursday',
    title: 'Thursday Singles Mixer',
    organizer_name: 'Thursday Dating',
    cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=80&fit=crop'
  },
  'mock_event_brooklyn': {
    id: 'mock_event_brooklyn',
    title: 'Rooftop DJ Set',
    organizer_name: 'Brooklyn Music Co.',
    cover_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'
  }
};

const sampleUserReviews = {
  'Maya Patel': [
    {
      id: 'maya_written_r1',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 5,
      review_text: "ArtHaus Collective always puts on the most visually stunning and immersive events. The gallery opening was no exception. A truly inspiring evening.",
      event_id: 'mock_event_arthaus',
      liked: true,
      vibe_tags: ['artsy', 'inspiring', 'networking'],
      created_date: '2023-11-15T18:00:00Z',
      attended: true
    },
    {
      id: 'maya_written_r2',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 4,
      review_text: "A fantastic way to meet new people. While dating events can be hit or miss, Thursday's was well-organized with a great, relaxed atmosphere.",
      event_id: 'mock_event_thursday',
      liked: true,
      vibe_tags: ['social', 'relaxed', 'friendly'],
      created_date: '2023-10-22T19:30:00Z',
      attended: true
    },
    {
      id: 'maya_written_r3',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 5,
      review_text: "Brooklyn Music Co's rooftop party was absolutely magical! The sound quality was perfect and the city views made it unforgettable.",
      event_id: 'mock_event_brooklyn',
      liked: true,
      vibe_tags: ['magical', 'great sound', 'city views'],
      created_date: '2023-09-10T20:15:00Z',
      attended: true
    }
  ]
};

function ReviewsTab({ reviews, eventsMap }) {
  const getReviewTimestamp = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      if (new Date().getFullYear() - date.getFullYear() > 0) {
        return format(date, 'MMM d, yyyy');
      }
      let relativeTime = formatDistanceToNow(date);
      if (relativeTime.startsWith('about ')) {
        relativeTime = relativeTime.substring(6);
      }
      return `${relativeTime} ago`;
    } catch {
      return "a while ago";
    }
  };

  const filteredReviews = reviews.filter((review) => review.attended !== false);

  if (!filteredReviews || filteredReviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
        <p className="text-gray-500 mb-4">
          This user hasn't reviewed any events they've attended yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto pr-4 pl-4 max-w-4xl sm:px-6 lg:px-8">
      <div className="space-y-4">
        {filteredReviews.map((review, index) => {
          const event = eventsMap[review.event_id];
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex w-full relative">
                <div className="w-24 md:w-32 flex-shrink-0">
                  <img
                    src={event?.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"}
                    alt={event?.title || 'Event'}
                    className="mx-2 my-2 w-full h-40 object-cover rounded-xl border"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"; }}
                  />
                </div>
                <div className="p-3 md:p-4 flex-1 flex flex-col min-w-0">
                  <div className="flex-grow flex flex-col">
                    <div className="px-1">
                      <Link to={createPageUrl(`EventDetails?id=${event?.id}`)}>
                        <h4 className="text-gray-900 mb-1 text-base font-semibold hover:text-blue-600 cursor-pointer pr-8">
                          {event?.title || review.event_title || 'Event'}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        Hosted by {event?.organizer_name || 'Unknown Organizer'}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      {review.review_text ? (
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {review.review_text}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mb-1">
                          No comments provided.
                        </p>
                      )}
                    </div>
                    <div className="px-1 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{getReviewTimestamp(review.created_date)}</span>
                      </div>
                      {review.vibe_tags && review.vibe_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
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
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function CuratorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [curator, setCurator] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [isLoading, setIsLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewedEventsMap, setReviewedEventsMap] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadCuratorData = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        // Load current user
        try {
          const user = await base44.auth.me();
          setCurrentUser(user);
          
          const urlParams = new URLSearchParams(location.search);
          const curatorEmail = urlParams.get('curator');
          
          if (user && curatorEmail) {
            setIsFollowing(user.followed_curator_ids?.includes(curatorEmail) || false);
          }
        } catch (err) {
          console.log('User not authenticated');
        }
        
        const urlParams = new URLSearchParams(location.search);
        const curatorEmail = urlParams.get('curator');
        const tabFromUrl = urlParams.get('tab');

        if (!curatorEmail) {
          console.warn('No curator email provided, redirecting to Feed');
          navigate(createPageUrl("Feed"));
          return;
        }

        console.log('Loading curator profile for:', curatorEmail);

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        // Fetch events with timeout
        let curatorEvents;
        try {
          const eventsPromise = base44.entities.Event.filter({ organizer_email: curatorEmail }, "-date");
          curatorEvents = await Promise.race([eventsPromise, timeoutPromise]);
        } catch (timeoutError) {
          console.error('Timeout or error loading events:', timeoutError);
          setLoadError('Unable to load profile. Please try again.');
          setIsLoading(false);
          return;
        }
        
        if (!curatorEvents || curatorEvents.length === 0) {
          console.warn('No events found for curator.');
          setLoadError('No events found for this curator.');
          setIsLoading(false);
          return;
        }

        // Map specific curator emails to their proper display names
        const curatorNameMap = {
          'wellness@demo.com': 'Wellness Studio Downtown',
          'arthaus@demo.com': 'ArtHaus Collective',
          'thursday@demo.com': 'Thursday Dating',
          'underground@demo.com': 'Underground Rave',
          'brooklyn.nightlife@demo.com': 'Brooklyn Nightlife',
          'outdoor@demo.com': 'NYC Outdoor Adventures'
        };

        const curatorData = {
          email: curatorEmail,
          full_name: curatorNameMap[curatorEmail] || curatorEvents[0].organizer_name || curatorEmail,
          avatar: curatorEvents[0].organizer_avatar,
          bio: `Curator of amazing events in the city`,
          account_type: 'personal',
          is_verified: false,
          events_count: curatorEvents.length
        };

        setCurator(curatorData);
        setEvents(curatorEvents);

        // Load reviews written by this curator if personal account
        if (curatorData.account_type === 'personal') {
          try {
            const reviewsPromise = base44.entities.EventReview.filter({ user_email: curatorEmail }, '-created_date');
            let reviews = await Promise.race([reviewsPromise, timeoutPromise]);
            
            if (reviews.length === 0) {
              // Use sample data if available
              const userName = Object.keys(sampleUserReviews).find(
                (name) => sampleUserReviews[name][0]?.user_email === curatorEmail
              );
              if (userName) {
                setUserReviews(sampleUserReviews[userName]);
                setReviewedEventsMap(sampleEventsMap);
              } else {
                setUserReviews([]);
                setReviewedEventsMap({});
              }
            } else {
              const validEventIds = reviews.map((review) => review.event_id).filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
              let eventDetailsMap = {};

              if (validEventIds.length > 0) {
                try {
                  const reviewEvents = await base44.entities.Event.filter({ id: { $in: validEventIds } });
                  eventDetailsMap = reviewEvents.reduce((acc, event) => {
                    acc[event.id] = event;
                    return acc;
                  }, {});
                } catch (error) {
                  console.warn("Failed to load event details for reviews:", error);
                }
              }

              setUserReviews(reviews);
              setReviewedEventsMap(eventDetailsMap);
            }
          } catch (error) {
            console.error("Error loading reviews (might be timeout or API issue), using empty reviews:", error);
            setUserReviews([]);
            setReviewedEventsMap({});
          }
        }

        // Set tab from URL or default to events
        const allowedTabs = curatorData.account_type === 'personal' ? ['events', 'reviews'] : ['events'];
        if (tabFromUrl && allowedTabs.includes(tabFromUrl)) {
          setActiveTab(tabFromUrl);
        } else {
          setActiveTab("events");
        }

      } catch (error) {
        console.error("An unexpected error occurred during curator data loading:", error);
        setLoadError(error.message || "Failed to load curator profile.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCuratorData();
  }, [location.search, navigate]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('tab', tabName);
    navigate(`?${urlParams.toString()}`, { replace: true });
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !curator) return;
    
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    
    try {
      const currentFollowedIds = currentUser.followed_curator_ids || [];
      let updatedFollowedIds;
      
      if (newFollowState) {
        updatedFollowedIds = [...currentFollowedIds, curator.email];
      } else {
        updatedFollowedIds = currentFollowedIds.filter(id => id !== curator.email);
      }
      
      await base44.auth.updateMe({ followed_curator_ids: updatedFollowedIds });
      
      setCurrentUser(prev => ({
        ...prev,
        followed_curator_ids: updatedFollowedIds
      }));
      
      window.dispatchEvent(new CustomEvent('followStatusChanged', {
        detail: { curatorEmail: curator.email, isFollowing: newFollowState }
      }));
      
      apiCache.invalidate('feed_events_following');
      apiCache.invalidate('feed_events_forYou');
    } catch (error) {
      console.error('Error updating follow status:', error);
      setIsFollowing(!newFollowState);
      alert('Failed to update follow status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error loading profile</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Button onClick={() => navigate(createPageUrl("Feed"))}>
            Go to Feed
          </Button>
        </div>
      </div>
    );
  }

  if (!curator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Curator not found</h2>
          <p className="text-gray-600 mb-4">The requested curator profile could not be displayed.</p>
          <Button onClick={() => navigate(createPageUrl("Feed"))}>
            Go to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Cover Image */}
      <div className="relative h-48 md:h-48 overflow-hidden">
        <img
          src='https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop'
          alt="Profile Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/40 hover:bg-black/60 text-white rounded-full"
            onClick={() => navigate(createPageUrl("Feed"))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Avatar */}
          <div className="relative -mt-12 md:-mt-16 px-4 sm:px-6 lg:px-8">
            <img
              src={curator.avatar || 'https://via.placeholder.com/128'}
              alt="Profile Avatar"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white mx-auto"
            />
          </div>

          {/* Profile Info */}
          <div className="mt-2 md:mt-4 text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              {curator.full_name}
              {curator.is_verified && (
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              )}
            </h1>

            {curator.account_type === 'business' && (
              <Badge className="bg-purple-600 text-white mt-1 px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-purple-700">
                BUSINESS
              </Badge>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto mt-2 md:mt-4"
            >
              <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                {curator.bio}
              </p>
            </motion.div>

            <div className="mt-4 md:mt-6 flex justify-center gap-2 sm:gap-4">
              {currentUser?.email !== curator.email && (
                <>
                  <Button 
                    onClick={() => {
                      if (!currentUser) {
                        navigate(createPageUrl("Profile") + "?logout=true");
                        return;
                      }
                      handleFollowToggle();
                    }}
                    className={`h-8 text-xs px-3 md:h-10 md:text-sm md:px-4 ${
                      isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300' 
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  
                  {/* Show Join Group Chat button for specific curators */}
                  {(curator.email === 'thursday@demo.com' || 
                    curator.email === 'arthaus@demo.com' ||
                    curator.email === 'brooklyn.nightlife@demo.com' ||
                    curator.email === 'underground@demo.com' ||
                    curator.email === 'wellness@demo.com' ||
                    curator.email === '222events@demo.com' ||
                    curator.email === 'outdoor@demo.com' ||
                    curator.email === 'vibemaster@demo.com') && (
                    <Button
                    onClick={() => {
                      if (!currentUser) {
                        navigate(createPageUrl("Profile") + "?logout=true");
                        return;
                      }
                      const groupChatMap = {
                        'thursday@demo.com': 'group-thursday-dating',
                        'arthaus@demo.com': 'group-art-house',
                        'brooklyn.nightlife@demo.com': 'group-brooklyn-nightlife',
                        'underground@demo.com': 'group-underground-rave',
                        'wellness@demo.com': 'group-mindful-moments',
                        '222events@demo.com': 'group-222-events',
                        'outdoor@demo.com': 'group-nyc-outdoor',
                        'vibemaster@demo.com': 'group-vibemaster'
                      };
                      const groupId = groupChatMap[curator.email];
                      if (groupId) {
                        navigate(createPageUrl(`ChatWindow?groupId=${groupId}`));
                      }
                    }}
                    className="h-8 text-xs px-3 md:h-10 md:text-sm md:px-4 bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 flex items-center gap-1"
                    >
                    <Users className="w-4 h-4" />
                    Group Chat
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mt-4 md:mt-8 mb-4 md:mb-6">
            <div className="flex justify-center -mb-px space-x-4 md:space-x-8">
              {curatorTabs.map((tab) => {
                // Hide reviews tab for business accounts
                if (tab.id === 'reviews' && curator.account_type === 'business') {
                  return null;
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold tracking-wider ${
                      activeTab === tab.id
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                    } md:text-sm md:gap-2 md:pb-3`}
                  >
                    {tab.icon}
                    {tab.label.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'events' && (
          <div className="mt-4 mb-2 px-4 grid grid-cols-2 md:grid-cols-3 gap-4 sm:px-6 lg:px-8">
            {events.map((event, index) => (
              <ProfileEventCard
                key={event.id}
                event={event}
                eventType="past"
                isOwnProfile={false}
                onClick={() => navigate(createPageUrl(`EventDetails?id=${event.id}`))}
              />
            ))}
          </div>
        )}

        {activeTab === 'reviews' && curator.account_type === 'personal' && (
          <ReviewsTab reviews={userReviews} eventsMap={reviewedEventsMap} />
        )}
      </div>
    </div>
  );
}