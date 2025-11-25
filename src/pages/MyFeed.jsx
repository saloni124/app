

import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Users, Search, RefreshCw, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import FeedEventListItem from "../components/feed/FeedEventListItem";
import FriendsGoingModal from "../components/event/FriendsGoingModal";
import { groupBy } from "lodash";
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from "date-fns";

const categories = [
    { value: "all", label: "All Categories" }, // Keep "all" for display, but will filter slice(1) for checkbox
    { value: "music", label: "🎵 Music" },
    { value: "art", label: "🎨 Art" },
    { value: "food", label: "🍽️ Food" },
    { value: "tech", label: "💻 Tech" },
    { value: "sports", label: "⚽ Sports" },
    { value: "business", label: "💼 Business" },
    { value: "wellness", label: "🧘 Wellness" },
    { value: "nightlife", label: "🌃 Nightlife" },
    { value: "culture", label: "🏛️ Culture" },
    { value: "outdoor", label: "🏕️ Outdoor" },
    { value: "market", label: "🛍️ Market" },
    { value: "talk", label: "🎤 Talk" },
    { value: "rave", label: "⚡ Rave" },
    { value: "popup", label: "✨ Pop-up" },
    { value: "party", label: "🎉 Party" },
    { value: "picnic", label: "🧺 Picnic" },
    { value: "other", label: "🤔 Other" }
];

const seedSampleEvents = async () => {
    try {
        // Helper to create dates for the year 2027
        const createFutureDate = (days) => {
            const date = new Date('2027-01-01'); // Start from Jan 1, 2027 for consistent future dates
            date.setDate(date.getDate() + days);
            return date;
        };
        
        const sampleEventDefinitions = [
            {
                title: "Coffee & Networking Meetup",
                description: "Start your week right with coffee, conversation, and connections. Perfect for professionals looking to expand their network in a relaxed setting.",
                cover_image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop",
                date: createFutureDate(25).toISOString(),
                location: "Downtown Coffee Roasters, Seattle",
                latitude: 47.6062,
                longitude: -122.3321,
                venue_name: "Downtown Coffee Roasters",
                category: "business",
                price: 0,
                age_requirement: "all_ages",
                organizer_name: "Seattle Professionals Network",
                organizer_email: "seattle.professionals@example.com",
                organizer_avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
                scene_tags: ["networking", "coffee", "casual"],
                source: "my-feed-sample",
            },
            {
                title: "Morning Yoga in Central Park",
                description: "Start your day with a revitalizing yoga session in the heart of the city. All levels welcome.",
                cover_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
                date: createFutureDate(30).toISOString(),
                location: "Central Park, New York",
                latitude: 40.785091,
                longitude: -73.968285,
                venue_name: "Sheep Meadow",
                category: "wellness",
                price: 15,
                age_requirement: "all_ages",
                organizer_name: "NYC Yoga Collective",
                organizer_email: "nyc.yoga.collective@example.com",
                organizer_avatar: "https://images.unsplash.com/photo-1515023677547-593d7638cbd6?w=60&h=60&fit=crop",
                scene_tags: ["outdoors", "yoga", "wellness"],
                source: "my-feed-sample",
            },
            {
                title: "Indie Music Night at The Fillmore",
                description: "Discover your new favorite indie bands at this legendary venue.",
                cover_image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
                date: createFutureDate(40).toISOString(),
                location: "The Fillmore, San Francisco",
                latitude: 37.7842,
                longitude: -122.4331,
                venue_name: "The Fillmore",
                category: "music",
                price: 25,
                age_requirement: "18+",
                organizer_name: "SF Music Scene",
                organizer_email: "sf.music.scene@example.com",
                organizer_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop",
                scene_tags: ["live music", "indie", "historic venue"],
                source: "my-feed-sample",
            },
            {
                title: "Tech Startup Networking",
                description: "Connect with fellow entrepreneurs and innovators in the tech space.",
                cover_image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
                date: createFutureDate(45).toISOString(),
                location: "Innovation District, Boston",
                latitude: 42.3601,
                longitude: -71.0589,
                venue_name: "Tech Hub Boston",
                category: "tech",
                price: 20,
                age_requirement: "all_ages",
                organizer_name: "Boston Tech Network",
                organizer_email: "boston.tech.network@example.com",
                organizer_avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
                scene_tags: ["networking", "startup", "tech"],
                source: "my-feed-sample",
            },
            {
                title: "Weekend Farmers Market",
                description: "Fresh produce, local artisans, and community vibes every Saturday morning.",
                cover_image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop",
                date: createFutureDate(50).toISOString(),
                location: "Downtown Square, Portland",
                latitude: 45.5152,
                longitude: -122.6784,
                venue_name: "Pioneer Courthouse Square",
                category: "market",
                price: 0,
                age_requirement: "all_ages",
                organizer_name: "Portland Market Co",
                organizer_email: "portland.market.co@example.com",
                organizer_avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop",
                scene_tags: ["farmers market", "local", "community"],
                source: "my-feed-sample",
            },
            {
                title: "Art Exhibition Opening",
                description: "Experience a vibrant display of contemporary art from local artists. Meet the creators and enjoy an evening of culture and conversation.",
                cover_image: "https://images.unsplash.com/photo-1547891654-e6ed5d53957f?w=800&h=600&fit=crop",
                date: createFutureDate(60).toISOString(),
                location: "The Modern Gallery, Los Angeles",
                latitude: 34.0522,
                longitude: -118.2437,
                venue_name: "The Modern Gallery",
                category: "art",
                price: 10,
                age_requirement: "all_ages",
                organizer_name: "LA Art Collective",
                organizer_email: "la.art.collective@demo.com",
                organizer_avatar: "https://images.unsplash.com/photo-1594957657969-95e55b6f3c1b?w=60&h=60&fit=crop",
                scene_tags: ["art", "exhibition", "culture"],
                source: "my-feed-sample",
            },
            {
                title: "Late Night Techno Rave",
                description: "Dive into the pulsating beats of underground techno. An immersive experience with top DJs, light shows, and an unforgettable atmosphere.",
                cover_image: "https://images.unsplash.com/photo-1526402970597-9e7591e13cf6?w=800&h=600&fit=crop",
                date: createFutureDate(70).toISOString(),
                location: "Warehouse District, Brooklyn",
                latitude: 40.7018,
                longitude: -73.9934,
                venue_name: "The Underground Vault",
                category: "rave",
                price: 30,
                age_requirement: "21+",
                organizer_name: "Brooklyn Nightlife",
                organizer_email: "brooklyn.nightlife@demo.com",
                organizer_avatar: "https://images.unsplash.com/photo-1506085446627-86c838d72b2f?w=60&h=60&fit=crop",
                scene_tags: ["techno", "rave", "nightlife", "dj"],
                source: "my-feed-sample",
            }
        ];

        // Create/update the events we want
        for (const sample of sampleEventDefinitions) {
          const existing = await Event.filter({ title: sample.title, source: sample.source });
          if (existing.length > 0) {
            // If event exists, force update it with the new data
            await Event.update(existing[0].id, sample);
          } else {
            // Otherwise, create it
            await Event.create(sample);
          }
          await new Promise(r => setTimeout(r, 500)); // Add delay to avoid rate limiting
        }
    } catch (error) {
        console.error("Error seeding sample events:", error);
        // Don't throw - let the app continue even if seeding fails
    }
};

const formatDateHeader = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMMM d");
};

export default function MyFeed() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMutualsEvents, setShowMutualsEvents] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set()); // Updated to Set for multi-select
  const [selectedDate, setSelectedDate] = useState("all");
  const [retryCount, setRetryCount] = useState(0);
  const [savingEventId, setSavingEventId] = useState(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsGoingData, setFriendsGoingData] = useState({ friends: [], eventName: '' });

  useEffect(() => {
    loadData();
    
    const handleFollowChange = (event) => {
        const { curatorEmail, isFollowing } = event.detail;
        
        setCurrentUser(prevUser => {
            if (!prevUser) return null;
            
            const followedIds = new Set(prevUser.followed_curator_ids || []);
            if (isFollowing) {
                followedIds.add(curatorEmail);
            } else {
                followedIds.delete(curatorEmail);
            }
            
            const updatedUser = { ...prevUser, followed_curator_ids: Array.from(followedIds) };
            
            const cachedDataStr = sessionStorage.getItem('my-feed-data');
            if (cachedDataStr) {
                try {
                    const cachedData = JSON.parse(cachedDataStr);
                    cachedData.user = updatedUser;
                    sessionStorage.setItem('my-feed-data', JSON.stringify(cachedData));
                } catch (e) {
                    console.error("Failed to parse or update session storage for my-feed-data", e);
                }
            }

            return updatedUser;
        });
    };

    window.addEventListener('followStatusChanged', handleFollowChange);
    
    // Listen for follow status changes from EventAttendees window
    const handleMessage = (event) => {
      if (event.data.type === 'FOLLOW_STATUS_CHANGED') {
        setCurrentUser(prev => ({
          ...prev,
          followed_curator_ids: event.data.followed_curator_ids
        }));
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('followStatusChanged', handleFollowChange);
        window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !allEvents || !Array.isArray(allEvents)) return;

    const followedEmails = new Set(currentUser.followed_curator_ids || []);
    
    // Always filter by followed curators first.
    let eventsToShow = allEvents.filter(event => event.organizer_email && followedEmails.has(event.organizer_email));

    // Apply showMutualsEvents filter - when checked, show only events with friends going
    if (showMutualsEvents) {
      eventsToShow = eventsToShow.filter(event => {
        return event.friends_going && Array.isArray(event.friends_going) && event.friends_going.length > 0;
      });
    }

    // Apply category filter (multi-select)
    if (selectedCategories.size > 0) {
      eventsToShow = eventsToShow.filter(event => event.category && selectedCategories.has(event.category));
    }

    // Apply date filter
    if (selectedDate !== "all") {
      const now = startOfDay(new Date()); // Get start of today
      
      eventsToShow = eventsToShow.filter(event => {
        if (!event.date) return false;
        
        const eventDate = startOfDay(parseISO(event.date)); // Parse and get start of day for event
        
        switch (selectedDate) {
          case "today":
            return eventDate.getTime() === now.getTime();
          case "this_week":
            const weekFromNow = startOfDay(addDays(now, 7)); // Up to 7 days from now, including today
            return eventDate.getTime() >= now.getTime() && eventDate.getTime() <= weekFromNow.getTime();
          case "this_month":
            const monthFromNow = startOfDay(addDays(now, 30)); // Approximately one month from now
            return eventDate.getTime() >= now.getTime() && eventDate.getTime() <= monthFromNow.getTime();
          default:
            return true;
        }
      });
    }

    // Remove duplicates, sort, and apply search filter
    const uniqueEvents = [...new Map(eventsToShow.map(item => [item['id'], item])).values()];
    const sorted = uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Apply search filter
    let finalFilteredEvents = sorted;
    if (searchQuery.trim()) {
      finalFilteredEvents = sorted.filter(event =>
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.scene_tags && Array.isArray(event.scene_tags) && event.scene_tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    setFilteredEvents(finalFilteredEvents);

    // Group the final filtered events by date
    const eventsByDay = groupBy(finalFilteredEvents, event => 
        format(startOfDay(new Date(event.date)), 'yyyy-MM-dd')
    );
    setGroupedEvents(eventsByDay);

  }, [allEvents, currentUser, searchQuery, showMutualsEvents, selectedCategories, selectedDate]);

  const handleShowFriends = (event) => {
    setFriendsGoingData({ friends: event.friends_going || [], eventName: event.title });
    setShowFriendsModal(true);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for cached data first
      const cachedData = sessionStorage.getItem('my-feed-data');
      const cachedTimestamp = sessionStorage.getItem('my-feed-timestamp');
      
      if (cachedData && cachedTimestamp) {
        const now = Date.now();
        const timestamp = parseInt(cachedTimestamp);
        
        // Use cached data if it's less than 10 minutes old
        if (now - timestamp < 10 * 60 * 1000) {
          const { events, user } = JSON.parse(cachedData);
          setCurrentUser(user);
          setAllEvents(events);
          setRetryCount(0);
          setLoading(false);
          return;
        }
      }

      // Add delay to prevent rapid retries for initial load attempts
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(2000 * retryCount, 10000)));
      }

      // Get current user and add following data
      const user = await User.me().catch(() => null);
      
      // Mock followed curator data for demonstration - updated to include new curators
      const mockFollowedCurators = [
        "seattle.professionals@example.com",
        "nyc.yoga.collective@example.com",
        "sf.music.scene@example.com",
        "boston.tech.network@example.com",
        "portland.market.co@example.com",
        "la.art.collective@demo.com",
        "brooklyn.nightlife@demo.com"
      ];
      
      const enrichedUser = user ? { ...user, followed_curator_ids: mockFollowedCurators } : null;
      setCurrentUser(enrichedUser);

      // Only seed if we don't have cached data
      const lastSeedTime = sessionStorage.getItem('my-feed-seed-time');
      const now = Date.now(); // This 'now' is used for seeding and final caching timestamp
      const shouldSeed = !lastSeedTime || (now - parseInt(lastSeedTime)) > 15 * 60 * 1000;
      
      if (shouldSeed) {
        await seedSampleEvents();
        sessionStorage.setItem('my-feed-seed-time', now.toString());
      }
      
      // Use a more robust approach to fetch events with retry logic
      let fetchedSampleEvents = [];
      let retryAttempts = 0;
      const maxRetries = 3;
      
      while (retryAttempts < maxRetries) {
        try {
          await new Promise(r => setTimeout(r, 1000 * retryAttempts)); // Progressive delay
          fetchedSampleEvents = await Event.filter({ source: 'my-feed-sample' }, "-date", 20);
          break; // Exit loop on successful filter fetch
        } catch (filterError) {
          console.error(`Attempt ${retryAttempts + 1} for Event.filter failed:`, filterError);
          
          if (filterError.response?.status === 429) {
            retryAttempts++;
            if (retryAttempts < maxRetries) {
              await new Promise(r => setTimeout(r, 5000 * retryAttempts)); // 5s, 10s, 15s delays for 429
              continue; // Continue to next attempt of filter
            }
          }
          
          // If filter failed after max retries or not a 429, try Event.list fallback
          try {
            const allEventsList = await Event.list("-date", 50);
            fetchedSampleEvents = allEventsList.filter(event => event.source === 'my-feed-sample');
            break; // Exit loop on successful list fallback fetch
          } catch (listError) {
            console.error(`List attempt ${retryAttempts + 1} failed:`, listError);
            retryAttempts++;
            if (retryAttempts >= maxRetries) {
              throw listError; // Re-throw if all attempts (filter and list) failed
            }
          }
        }
      }
      
      // Add friends_going data to events based on followed curators - make it consistent
      const enrichedEvents = fetchedSampleEvents.map(event => {
        const friendsGoing = [];
        
        if (event.organizer_email === 'nyc.yoga.collective@example.com') {
          friendsGoing.push(
            { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop' },
            { name: 'Diana Kim', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop' }
          );
        }
        
        if (event.organizer_email === 'sf.music.scene@example.com') {
          friendsGoing.push(
            { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop' },
            { name: 'Carlos Gomez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' }
          );
        }

        if (event.organizer_email === 'la.art.collective@demo.com') {
          friendsGoing.push(
            { name: 'Sophie R.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop' },
            { name: 'Marcus L.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' }
          );
        }

        if (event.organizer_email === 'brooklyn.nightlife@demo.com') {
          friendsGoing.push(
            { name: 'Jordan K.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop' },
            { name: 'Taylor M.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop' },
            { name: 'Riley P.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop' }
          );
        }
        
        return { ...event, friends_going: friendsGoing };
      });
      
      const sortedEvents = enrichedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAllEvents(sortedEvents || []);
      setRetryCount(0);

      // Cache the data
      sessionStorage.setItem('my-feed-data', JSON.stringify({
        events: sortedEvents,
        user: enrichedUser
      }));
      sessionStorage.setItem('my-feed-timestamp', now.toString()); // Use the 'now' declared earlier

    } catch (e) {
      console.error("Error loading feed data:", e);
      
      if (e.response?.status === 429) {
        setError("Rate limit exceeded. Please try again in a few minutes.");
      } else {
        setError(`Failed to load feed data: ${e.message || 'Network error'}`);
      }
      
      if (e.message && (e.message.includes('Network') || e.message.includes('timeout')) || e.response?.status === 429) {
        setRetryCount(prev => prev + 1);
      } else {
        // For other types of errors, reset retryCount to avoid infinite retries
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (eventId) => {
    if (!currentUser || savingEventId) return;
    
    setSavingEventId(eventId);
    try {
      const newSaved = new Set(currentUser.saved_events || []);
      if (newSaved.has(eventId)) {
        newSaved.delete(eventId);
      } else {
        newSaved.add(eventId);
      }

      const updatedEvents = Array.from(newSaved);
      await User.updateMyUserData({ saved_events: updatedEvents });
      
      // Optimistic update for UI
      setCurrentUser(prev => ({...prev, saved_events: updatedEvents}));
    } catch (error) {
      console.error("Error saving event:", error);
      // Show user-friendly error message
      alert("Failed to save event. Please check your connection and try again.");
    } finally {
      setSavingEventId(null);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const handleCategoryToggle = (categoryValue) => {
    setSelectedCategories(prev => {
        const newSelected = new Set(prev);
        if (newSelected.has(categoryValue)) {
            newSelected.delete(categoryValue);
        } else {
            newSelected.add(categoryValue);
        }
        return newSelected;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">Retry attempt {retryCount}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Connection Issue</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <p className="text-sm text-gray-400">
              If the problem persists, please check your internet connection
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const sortedDates = Object.keys(groupedEvents).sort();
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
       <FriendsGoingModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        friends={friendsGoingData.friends}
        eventName={friendsGoingData.eventName}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display gradient-text mb-3">
            My Feed
          </h1>
          <p className="text-lg text-gray-500">
            Events from curators you follow
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }}
          className="my-8"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events, organizers, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-4">
            {/* Category and Date Filters in One Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category Filter */}
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-gray-50 border-gray-300 text-gray-900 justify-between text-left font-normal"
                  >
                    <span>
                      Categories {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {selectedCategories.size > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCategories(new Set())} className="text-xs text-blue-600 hover:text-blue-700 w-full justify-start px-2 h-auto py-1.5">
                        Clear all
                      </Button>
                    )}
                    {categories.slice(1).map((category) => ( // Exclude "All Categories" from checkbox list
                      <div
                        key={category.value}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCategoryToggle(category.value)}
                      >
                        <Checkbox
                          id={`myfeed-cat-${category.value}`}
                          checked={selectedCategories.has(category.value)}
                          onCheckedChange={() => handleCategoryToggle(category.value)}
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                        />
                        <label
                          htmlFor={`myfeed-cat-${category.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                        >
                          {category.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date Filter */}
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 'Events with Mutuals Going' Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="mutuals-events"
                checked={showMutualsEvents}
                onCheckedChange={setShowMutualsEvents}
                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
              />
              <label htmlFor="mutuals-events" className="text-sm font-medium text-gray-800 cursor-pointer">
                Events with Mutuals Going
              </label>
            </div>
          </div>
        </motion.div>
        
        {/* Welcome Message */}
        {allEvents.length === 0 && !loading && !error && (
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12 bg-white border border-gray-200 rounded-2xl mb-12"
          >
              <div className="text-5xl mb-4">👋</div>
              <h3 className="text-2xl font-semibold mb-2">Welcome to Your Feed!</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                This is where events from curators you follow will appear. Since you haven't followed anyone yet, here's a taste of what's happening.
              </p>
              <Link to={createPageUrl("Explore")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Discover Curators
                </Button>
              </Link>
          </motion.div>
        )}
        
        {/* Date-Stamped Event Feed */}
        {sortedDates && sortedDates.length > 0 ? (
          <div className="space-y-10">
            {sortedDates.map((dateStr) => (
              <div key={dateStr}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                  {formatDateHeader(dateStr)}
                </h2>
                <div className="space-y-4">
                  {(groupedEvents[dateStr] || []).map((event) => (
                    <FeedEventListItem
                      key={event.id}
                      event={event}
                      isSaved={currentUser?.saved_events?.includes(event.id) || false}
                      onToggleSave={handleToggleSave}
                      onShowFriends={handleShowFriends}
                      showFriendsGoing={true}
                      isSaving={savingEventId === event.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-12 text-gray-500">
             <Search className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
             <h3 className="text-lg font-semibold text-gray-700 mb-2">No events found</h3>
             <p className="text-gray-500">Try adjusting your search or filter settings.</p>
           </div>
        )}
      </div>
    </div>
  );
}