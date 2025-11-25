import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Calendar, X, Loader, Bookmark, Share2, UserCheck, Download, UserPlus, Camera, BookmarkCheck, TrendingUp, ChevronDown } from 'lucide-react';
import SaveToCollectionModal from '../components/collections/SaveToCollectionModal';
import EventReelModal from '../components/event/EventReelModal';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { apiCache } from '../components/apiCache';
import { simulatedDataManager } from '../components/simulatedDataManager';
import { base44 } from '@/api/base44Client';
import { format, isValid, formatDistanceToNowStrict } from 'date-fns';

const categoryOptions = [
  { id: "music", label: "🎵 Music" },
  { id: "art", label: "🎨 Art" },
  { id: "food", label: "🍽️ Food" },
  { id: "tech", label: "💻 Tech" },
  { id: "sports", label: "⚽ Sports" },
  { id: "business", label: "💼 Business" },
  { id: "wellness", label: "🧘 Wellness" },
  { id: "nightlife", label: "🌃 Nightlife" },
  { id: "happy-hour", label: "🍻 Happy Hour" },
  { id: "rooftop", label: "🏙️ Rooftop" },
  { id: "bar", label: "🍸 Bar" },
  { id: "park", label: "🌳 Park" },
  { id: "co-working", label: "🧑‍💻 Co-working" },
  { id: "culture", label: "🏛️ Culture" },
  { id: "outdoor", label: "🏕️ Outdoor" },
  { id: "market", label: "🛍️ Market" },
  { id: "talk", label: "🎤 Talk" },
  { id: "rave", label: "⚡ Rave" },
  { id: "popup", label: "✨ Pop-up" },
  { id: "party", label: "🎉 Party" },
  { id: "picnic", label: "🧺 Picnic" },
  { id: "other", label: "🤔 Other" }
];

const specialCalendars = [
  { id: "tech-week", label: "📱 Tech Week" },
  { id: "fashion-week", label: "👗 Fashion Week" },
  { id: "art-week", label: "🎨 Art Week" },
  { id: "music-festival", label: "🎵 Music Festival Season" },
  { id: "restaurant-week", label: "🍽️ Restaurant Week" },
  { id: "film-festival", label: "🎬 Film Festival" },
  { id: "design-week", label: "✨ Design Week" },
  { id: "pride", label: "🏳️‍🌈 Pride" },
  { id: "holiday-markets", label: "🎄 Holiday Markets" }
];

const locationSuggestions = [
  { name: "New York City", city: "New York, USA" },
  { name: "Los Angeles", city: "California, USA" },
  { name: "Chicago", city: "Illinois, USA" },
  { name: "San Francisco", city: "California, USA" },
  { name: "Boston", city: "Massachusetts, USA" },
  { name: "Miami", city: "Florida, USA" },
  { name: "Seattle", city: "Washington, USA" },
  { name: "Denver", city: "Colorado, USA" },
  { name: "Atlanta", city: "Georgia, USA" },
  { name: "Austin", city: "Texas, USA" }
];

const sampleUsers = [
  {
    email: 'arthaus@demo.com',
    full_name: 'ArtHaus Collective',
    bio: 'Curating underground art experiences',
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop',
    location: 'Brooklyn, NY',
    account_type: 'business',
    profile_structure: 'community'
  },
  {
    email: 'thursday@demo.com',
    full_name: 'Thursday Dating',
    bio: 'Bringing singles together IRL',
    avatar: 'https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=200&h=200&fit=crop',
    location: 'London, UK',
    account_type: 'business',
    profile_structure: 'community'
  }
];

const trendingItems = [
  { id: 'trend-1', text: 'Tech Week NYC', type: 'search' },
  { id: 'trend-2', text: 'Rooftop Happy Hours', type: 'search' },
  { id: 'trend-3', text: 'Art Basel Miami', type: 'search' },
  { id: 'trend-4', text: 'Thursday Dating', type: 'search' },
  { id: 'trend-5', text: 'Free Events This Weekend', type: 'search' },
  { id: 'trend-6', text: 'Fashion Week', type: 'search' },
  { id: 'trend-7', text: 'Live Music Tonight', type: 'search' },
  { id: 'trend-8', text: 'Food Festivals', type: 'search' }
];

const searchTabs = [
  { id: 'all', name: 'All' },
  { id: 'events', name: 'Events' },
  { id: 'entries', name: 'Entries' },
  { id: 'people', name: 'People' },
  { id: 'communities', name: 'Communities' },
  { id: 'apps', name: 'Apps' }
];

const ItemDisplay = ({ item, onClick, currentUser, followedCurators, savedEvents, onFollowToggle, handleSavePost }) => {
  const isEntry = item.source === 'vibe-post' ||
    item.source === 'vibe-post-seed' ||
    item.source === 'profile-entries-seed' ||
    item.source === 'memory-post';

  const formatPostDate = (item) => {
    if (item.type !== 'event' && item.type !== 'entry') {
      const timestamp = item.timestamp || item.created_date;
      if (!timestamp) return null;
      const dateObj = new Date(timestamp);
      if (!isValid(dateObj)) return null;
      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      if (diffInHours < 24 && diffInHours >= 0) {
        return formatDistanceToNowStrict(dateObj, { addSuffix: true });
      }
      return format(dateObj, 'MMM d, yyyy');
    }
    const eventDate = item.date || item.start_date || item.timestamp;
    if (!eventDate) return null;
    const dateObj = new Date(eventDate);
    if (!isValid(dateObj)) return null;
    try {
      if (item.type === 'event') {
        return format(dateObj, 'EEE, MMM d · h:mm a');
      } else if (item.type === 'entry') {
        return format(dateObj, 'MMM d, yyyy');
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
    return null;
  };

  if (item.type === 'event') {
    const displayDate = formatPostDate(item);
    return (
      <div
        className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex"
        onClick={() => onClick(item)}>
        <div className="w-1/3 flex-shrink-0 p-2">
          {item.cover_image ? (
            <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover rounded-lg border border-gray-200" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200">
              <Camera className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
          <div>
            <h3 className="text-gray-900 text-base font-semibold truncate mb-1">{item.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
            {item.location && (
              <p className="text-gray-500 text-xs flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </p>
            )}
            {displayDate && (
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{displayDate}</span>
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {item.price !== undefined && item.price !== null && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {item.price > 0 ? `$${item.price}` : 'Free'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleSavePost && handleSavePost(item, e)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                {savedEvents && savedEvents.has(item.id) ? (
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEntry) {
    const displayDate = formatPostDate(item);
    return (
      <div
        className="relative group w-full aspect-[3/4] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer"
        onClick={() => onClick(item)}>
        <img
          src={item.cover_image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=800&fit=crop'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-base md:text-lg leading-tight truncate mb-1">{item.title}</h3>
          <p className="text-xs md:text-sm opacity-80 truncate mb-1">{item.organizer_name}</p>
          {displayDate && <p className="text-xs opacity-70">{displayDate}</p>}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSavePost && handleSavePost(item, e);
            }}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
            {savedEvents && savedEvents.has(item.id) ? (
              <BookmarkCheck className="w-4 h-4 text-white" />
            ) : (
              <Bookmark className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    );
  }

  const typeLabel = {
    'people': 'Person',
    'community': 'Community',
    'event': 'Event',
    'app': 'App',
    'entry': 'Entry'
  }[item.type] || 'Item';

  const isProfile = item.type === 'people' || item.type === 'community';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => onClick(item)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {item.cover_image ? (
            <img
              src={item.cover_image}
              alt={item.title}
              className="mt-4 rounded-[32px] w-16 h-16 object-cover" />
          ) : (
            <div className={`w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 ${isProfile ? 'rounded-full' : 'rounded-lg'}`}>
              <Camera className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="text-gray-900 text-base font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{typeLabel}</p>
            </div>
            <div className="flex items-center gap-0 flex-shrink-0">
              {(item.type === 'people' || item.type === 'community') && (
                <button
                  onClick={(e) => { e.stopPropagation(); onFollowToggle && onFollowToggle(item); }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  {followedCurators && followedCurators.has(item.id) ? (
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              )}
              {item.type === 'app' && (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Share2 className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
          {item.location && (
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [categorySearch, setCategorySearch] = useState('');
  const [showFree, setShowFree] = useState(true);
  const [showPaid, setShowPaid] = useState(true);
  const [showDeals, setShowDeals] = useState(false);
  const [selectedSpecialCalendars, setSelectedSpecialCalendars] = useState(new Set());
  const [specialCalendarSearch, setSpecialCalendarSearch] = useState('');
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = useState(false);
  const [isAnytimePopoverOpen, setIsAnytimePopoverOpen] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [isSpecialCalendarPopoverOpen, setIsSpecialCalendarPopoverOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Anytime');
  const [currentUser, setCurrentUser] = useState(null);
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [followedCurators, setFollowedCurators] = useState(new Set());
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [showVibeReel, setShowVibeReel] = useState(false);
  const [vibeReelItems, setVibeReelItems] = useState([]);
  const [vibeReelStartIndex, setVibeReelStartIndex] = useState(0);

  const secondaryFiltersRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('q') || '');
    setLocationFilter(params.get('loc') || '');
    setActiveSearchTab(params.get('filter') || 'all');
    const categories = params.get('categories');
    setSelectedCategories(categories ? new Set(categories.split(',')) : new Set());
    const specialCals = params.get('special_calendars');
    setSelectedSpecialCalendars(specialCals ? new Set(specialCals.split(',')) : new Set());
    const date = params.get('date');
    if (date && ['Anytime', 'Today', 'Tomorrow', 'This Weekend', 'This Week', 'Next Weekend', 'This Month'].includes(date)) {
      setDateFilter(date);
    } else {
      setDateFilter('Anytime');
    }

    const free = params.get('free');
    if (free !== null) setShowFree(free === 'true');
    const paid = params.get('paid');
    if (paid !== null) setShowPaid(paid === 'true');
    const deals = params.get('deals');
    if (deals !== null) setShowDeals(deals === 'true');

    const loadExploreData = async () => {
      setLoading(true);
      setError(null);

      try {
        let user = null; // This will be the effective user (API or simulated)
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';
        let fetchedUserFromApi = null; // Store user fetched directly from base44

        try {
          // Attempt to fetch user from the authentication service
          fetchedUserFromApi = await base44.auth.me();

          if (isDemo && fetchedUserFromApi) {
            try {
              // If in demo mode and an API user was fetched, apply simulated overrides.
              // This is wrapped in its own try-catch to handle potential errors in simulatedDataManager.
              user = simulatedDataManager.applyDemoOverrides(fetchedUserFromApi);
            } catch (simulatedError) {
              // If applying overrides fails, log the error and fall back to the original API user.
              console.error("Error applying simulatedDataManager overrides, using original fetched user:", simulatedError);
              user = fetchedUserFromApi; // Fallback to original if override fails
            }
          } else {
            // If not in demo mode, or if no API user was fetched, use the API user directly.
            user = fetchedUserFromApi;
          }

          setCurrentUser(user);
          // Only set followed curators and saved events if a valid authenticated user exists (e.g., has an email)
          if (user && user.email) {
            setFollowedCurators(new Set(user.followed_curator_ids || []));
            setSavedEvents(new Set(user.saved_events || []));
          } else {
            // If no valid user (null or lacks identifier), clear user-specific states
            setFollowedCurators(new Set());
            setSavedEvents(new Set());
          }

        } catch (authError) {
          // This catch block handles errors specifically from base44.auth.me() (e.g., network error, 401 unauthenticated)
          if (authError.response?.status !== 401 && authError.status !== 401) {
            console.error("Error fetching user from authentication service:", authError);
          }
          // If authentication fails or errors, ensure no user-specific states are populated
          setCurrentUser(null);
          setFollowedCurators(new Set());
          setSavedEvents(new Set());
        }

        let allUsers = [];
        let sampleEvents = [];

        // Only attempt to list other users if the current user is authenticated (user && user.email check from above)
        if (user && user.email) {
          try {
            allUsers = await User.list();
          } catch (err) {
            console.error("Error loading users:", err);
            allUsers = [];
          }
        }

        const peopleItems = allUsers
          .filter((u) => u.email !== user?.email) // Filter out the current user's own profile if it exists
          .map((u) => ({
            id: u.email, // Using email as ID for consistency with User entity and sample data
            type: u.profile_structure === 'community' ? 'community' : 'people',
            title: u.full_name || u.business_name || u.email,
            description: u.bio || `${u.account_type === 'business' ? 'Business' : 'Personal'} profile`,
            cover_image: u.avatar,
            organizer_name: u.full_name || u.business_name,
            organizer_email: u.email,
            organizer_avatar: u.avatar,
            location: u.location || '',
            category: u.business_category || 'general',
            business_name: u.business_name || '',
            source: 'user-profile'
          }));

        const appItems = [
          {
            id: 'app-1',
            type: 'app',
            title: 'Social Club Analytics',
            description: 'Track your social life and discover patterns in your event attendance',
            cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=700&fit=crop',
            category: 'productivity',
            source: 'app-seed'
          },
          {
            id: 'app-2',
            type: 'app',
            title: 'Scene Matcher',
            description: 'AI-powered event recommendations based on your vibe',
            cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=700&fit=crop',
            category: 'social',
            source: 'app-seed'
          }
        ];

        const sponsoredContent = [
          {
            id: 'sponsored-discover',
            type: 'event',
            title: "Discover Amazing Local Events",
            description: "Find your next adventure with our curated event recommendations.",
            cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=700&fit=crop",
            is_promotional: true,
            organizer_name: "VibeSpot",
            organizer_email: "sponsored@vibespot.com",
            organizer_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
            location: "Everywhere",
            price: 0,
            category: "other",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            scene_tags: ["discover", "local", "community"]
          }
        ];

        try {
          const allEvents = await Event.list();
          sampleEvents = allEvents.filter((event) => {
            const isSampleContent = event.source && (
              event.source.includes('sample') ||
              event.source.includes('demo') ||
              event.source.includes('seed')
            ) || event.is_promotional;

            // Ensure not to show the current user's own events among sample/demo content
            const notUserEvent = (user && user.email) ?
              event.organizer_email !== user.email &&
              event.created_by !== user.email :
              true; // If no user is logged in, all sample events are valid

            return isSampleContent && notUserEvent;
          }).map((e) => ({ ...e, type: 'event' }));
        } catch (error) {
          console.error("Error fetching sample events:", error);
        }

        const allContent = [
          ...sponsoredContent, 
          ...sampleEvents, 
          ...peopleItems, 
          ...sampleUsers.map(u => ({ 
            ...u, 
            id: u.email, 
            source: 'user-seed', 
            type: u.profile_structure === 'community' ? 'community' : 'people' 
          })), 
          ...appItems
        ];
        const shuffledContent = allContent.sort(() => Math.random() - 0.5);

        setEvents(shuffledContent.length > 0 ? shuffledContent : []);

      } catch (outerError) { // This outer catch is for errors from Event.list() or subsequent processing
        console.error("Error loading explore data:", outerError);
        setError("Failed to load content. Please try again.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadExploreData();
  }, [location.search]);

  const handleCategorySelect = (categoryId) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const handleClearCategories = () => {
    setSelectedCategories(new Set());
  };

  const handleSpecialCalendarSelect = (calendarId) => {
    const newSelection = new Set(selectedSpecialCalendars);
    if (newSelection.has(calendarId)) {
      newSelection.delete(calendarId);
    } else {
      newSelection.add(calendarId);
    }
    setSelectedSpecialCalendars(newSelection);
  };

  const handleClearSpecialCalendars = () => {
    setSelectedSpecialCalendars(new Set());
  };

  const onFollowToggle = useCallback(async (itemToFollow) => {
    if (!currentUser || !itemToFollow || requestInProgress) return;
    setRequestInProgress(true);

    const curatorId = itemToFollow.id;
    const newFollowedCurators = new Set(followedCurators);

    if (newFollowedCurators.has(curatorId)) {
      newFollowedCurators.delete(curatorId);
    } else {
      newFollowedCurators.add(curatorId);
    }

    setFollowedCurators(newFollowedCurators);

    try {
      await User.updateMyUserData({ followed_curator_ids: Array.from(newFollowedCurators) });
      apiCache.invalidate('current_user');
    } catch (error) {
      console.error("Error updating followed curators:", error);
      // Revert state if API call fails
      setFollowedCurators(followedCurators);
    } finally {
      setRequestInProgress(false);
    }
  }, [currentUser, requestInProgress, followedCurators]);

  const handleSavePost = useCallback((post, e) => {
    if (e) e.stopPropagation();
    if (!currentUser || !post) return;

    if (post.type === 'event' || post.type === 'entry') {
      const newSavedEvents = new Set(savedEvents);
      const isSaved = newSavedEvents.has(post.id);

      if (isSaved) {
        newSavedEvents.delete(post.id);
      } else {
        newSavedEvents.add(post.id);
      }
      setSavedEvents(newSavedEvents); // Optimistic update
      
      User.updateMyUserData({ saved_events: Array.from(newSavedEvents) }).catch((err) => {
        console.error("Error updating saved events:", err);
        // Revert state if API call fails
        setSavedEvents(savedEvents);
      });
      apiCache.invalidate('current_user');
    } else {
      setSelectedPost(post);
      setShowSaveModal(true);
    }
  }, [currentUser, savedEvents]);

  const processAndFilterItems = useCallback(() => {
    let filtered = events.filter((item) => item != null);

    try {
      if (activeSearchTab !== 'all') {
        filtered = filtered.filter((item) => {
          if (!item) return false;
          if (activeSearchTab === 'events') return item.type === 'event';
          if (activeSearchTab === 'entries') {
            const isEntry = item.source === 'vibe-post' ||
              item.source === 'vibe-post-seed' ||
              item.source === 'profile-entries-seed' ||
              item.source === 'memory-post';
            return isEntry;
          }
          if (activeSearchTab === 'people') return item.type === 'people';
          if (activeSearchTab === 'communities') return item.type === 'community';
          if (activeSearchTab === 'apps') return item.type === 'app';
          return false;
        });
      }

      if (selectedCategories.size > 0) {
        const categoryMap = {
          music: 'music', art: 'art', food: 'food', tech: 'tech', sports: 'sports',
          business: 'business', wellness: 'wellness', nightlife: 'nightlife',
          'happy-hour': 'happy hour', rooftop: 'rooftop', bar: 'bar', park: 'park',
          'co-working': 'co-working', culture: 'culture', outdoor: 'outdoor',
          market: 'market', talk: 'talk', rave: 'rave', popup: 'pop-up',
          party: 'party', picnic: 'picnic', other: 'other', dating: 'dating',
          social: 'social', productivity: 'productivity', analytics: 'analytics',
          general: 'general'
        };

        filtered = filtered.filter((item) => {
          if (!item) return false;
          try {
            const itemCategoryLower = item?.category && typeof item.category === 'string' && item.category !== '' ? item.category.toLowerCase() : '';
            const itemDescriptionLower = item?.description && typeof item.description === 'string' && item.description !== '' ? item.description.toLowerCase() : '';
            const itemTitleLower = item?.title && typeof item.title === 'string' && item.title !== '' ? item.title.toLowerCase() : '';
            const itemSceneTagsLower = item?.scene_tags && Array.isArray(item.scene_tags) ?
              item.scene_tags.filter((tag) => tag && typeof tag === 'string' && tag !== '').map((tag) => tag.toLowerCase()).join(' ') : '';

            return Array.from(selectedCategories).some((selectedId) => {
              if (!selectedId || typeof selectedId !== 'string') return false;
              const keyword = categoryMap[selectedId];
              if (!keyword || typeof keyword !== 'string') return false;

              return (
                itemCategoryLower.includes(keyword) ||
                itemDescriptionLower.includes(keyword) ||
                itemTitleLower.includes(keyword) ||
                itemSceneTagsLower.includes(keyword)
              );
            });
          } catch (error) {
            console.warn('Error filtering item by category:', error, { item });
            return false;
          }
        });
      }

      if (selectedSpecialCalendars.size > 0) {
        const calendarMap = {
          'tech-week': ['tech week', 'techweek', 'technology conference'],
          'fashion-week': ['fashion week', 'fashionweek', 'runway'],
          'art-week': ['art week', 'artweek', 'art basel'],
          'music-festival': ['music festival', 'coachella', 'lollapalooza', 'concert series'],
          'restaurant-week': ['restaurant week', 'dine out', 'food week'],
          'film-festival': ['film festival', 'sundance', 'tribeca', 'movie festival'],
          'design-week': ['design week', 'designweek', 'design conference'],
          'pride': ['pride', 'lgbtq', 'pride parade'],
          'holiday-markets': ['holiday market', 'christmas market', 'winter market']
        };

        filtered = filtered.filter((item) => {
          if (!item) return false;
          try {
            const itemTitleLower = item?.title?.toLowerCase() || '';
            const itemDescriptionLower = item?.description?.toLowerCase() || '';
            const itemSceneTagsLower = item?.scene_tags?.map((tag) => tag?.toLowerCase()).join(' ') || '';
            const searchText = `${itemTitleLower} ${itemDescriptionLower} ${itemSceneTagsLower}`;

            return Array.from(selectedSpecialCalendars).some((calendarId) => {
              const keywords = calendarMap[calendarId] || [];
              return keywords.some((keyword) => searchText.includes(keyword));
            });
          } catch (error) {
            console.warn('Error filtering item by special calendar:', error, { item });
            return false;
          }
        });
      }

      if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
        try {
          const query = searchTerm.toLowerCase();
          filtered = filtered.filter((item) => {
            if (!item) return false;
            try {
              const titleMatch = item.title && typeof item.title === 'string' && item.title !== '' ?
                item.title.toLowerCase().includes(query) : false;
              const descriptionMatch = item.description && typeof item.description === 'string' && item.description !== '' ?
                item.description.toLowerCase().includes(query) : false;
              const categoryMatch = item.category && typeof item.category === 'string' && item.category !== '' ?
                item.category.toLowerCase().includes(query) : false;
              const locationMatch = item.location && typeof item.location === 'string' && item.location !== '' ?
                item.location.toLowerCase().includes(query) : false;
              const organizerNameMatch = item.organizer_name && typeof item.organizer_name === 'string' && item.organizer_name !== '' ?
                item.organizer_name.toLowerCase().includes(query) : false;
              const organizerEmailMatch = item.organizer_email && typeof item.organizer_email === 'string' && item.organizer_email !== '' ?
                item.organizer_email.toLowerCase().includes(query) : false;
              const businessNameMatch = item.business_name && typeof item.business_name === 'string' && item.business_name !== '' ?
                item.business_name.toLowerCase().includes(query) : false;

              return titleMatch || descriptionMatch || categoryMatch || locationMatch || organizerNameMatch || organizerEmailMatch || businessNameMatch;
            } catch (error) {
              console.warn('Error filtering item by search term:', error, { item });
              return false;
            }
          });
        } catch (error) {
          console.warn('Error processing search term:', error, { searchTerm });
        }
      }

      if (locationFilter && typeof locationFilter === 'string' && locationFilter.trim() !== '') {
        try {
          const locQuery = locationFilter.toLowerCase();
          filtered = filtered.filter((item) => {
            if (!item) return false;
            try {
              return item.location && typeof item.location === 'string' && item.location !== '' ?
                item.location.toLowerCase().includes(locQuery) : false;
            } catch (error) {
              console.warn('Error filtering item by location:', error, { item });
              return false;
            }
          });
        } catch (error) {
          console.warn('Error processing location filter:', error, { locationFilter });
        }
      }

      if ((activeSearchTab === 'all' || activeSearchTab === 'events') && searchTerm.trim() !== '') {
        filtered = filtered.filter((item) => {
          if (!item) return false;
          if (item.type !== 'event') return true; // Price filters only apply to events

          if (item.price !== undefined && item.price !== null) {
            const isFree = item.price === 0;
            const isPaid = item.price > 0;
            const hasSpecialDeal = item.scene_tags?.some((tag) =>
              tag.toLowerCase().includes('deal') ||
              tag.toLowerCase().includes('discount') ||
              tag.toLowerCase().includes('special')
            ) || item.is_promotional;

            if (showDeals && !hasSpecialDeal) {
              return false;
            }

            if (!(showFree && isFree) && !(showPaid && isPaid)) {
              return false;
            }
          }
          return true;
        });
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      filtered = filtered.filter((item) => {
        if (!item) return false;

        // Date filter only applies to events
        if (item.type !== 'event' || !item.date) {
          return true;
        }

        try {
          const itemDate = new Date(item.date);
          if (isNaN(itemDate.getTime())) return false;
          itemDate.setHours(0, 0, 0, 0);

          if (dateFilter === 'Anytime') {
            return itemDate >= now;
          } else if (dateFilter === 'Today') {
            return itemDate.getTime() === now.getTime();
          } else if (dateFilter === 'Tomorrow') {
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            return itemDate.getTime() === tomorrow.getTime();
          } else if (dateFilter === 'This Week') {
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + (7 - now.getDay())); // Assuming Sunday is 0, Saturday is 6
            endOfWeek.setHours(23, 59, 59, 999);
            return itemDate >= now && itemDate <= endOfWeek;
          } else if (dateFilter === 'This Month') {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return itemDate >= now && itemDate <= endOfMonth;
          } else if (dateFilter === 'This Weekend') {
            const todayDay = now.getDay();
            let weekendStart = new Date(now);
            let weekendEnd = new Date(now);

            if (todayDay === 0) { // If today is Sunday
              weekendStart.setDate(now.getDate()); // Sunday
              weekendEnd.setDate(now.getDate() + 1); // Monday (end of weekend)
            } else if (todayDay === 6) { // If today is Saturday
              weekendStart.setDate(now.getDate()); // Saturday
              weekendEnd.setDate(now.getDate() + 1); // Sunday (end of weekend)
            } else { // If weekday, look for upcoming Saturday/Sunday
              weekendStart.setDate(now.getDate() + (6 - todayDay)); // Next Saturday
              weekendEnd.setDate(now.getDate() + (6 - todayDay) + 1); // Next Sunday
            }
            weekendStart.setHours(0, 0, 0, 0);
            weekendEnd.setHours(23, 59, 59, 999);

            return itemDate >= weekendStart && itemDate <= weekendEnd;
          } else if (dateFilter === 'Next Weekend') {
            const todayDay = now.getDay();
            let daysToNextSaturday;
            if (todayDay === 6) { // If today is Saturday, next Saturday is in 7 days
              daysToNextSaturday = 7;
            } else if (todayDay === 0) { // If today is Sunday, next Saturday is in 6 days
              daysToNextSaturday = 6;
            } else { // If weekday, calculate days to next Saturday, then add 7 for *next* weekend
              daysToNextSaturday = (6 - todayDay + 7) % 7; // Days until next Saturday in current week
              if (daysToNextSaturday === 0) daysToNextSaturday = 7; // If today is Sat, it's 7 days away
              daysToNextSaturday += 7; // Add 7 for the *next* weekend
            }

            let nextWeekendStart = new Date(now);
            nextWeekendStart.setDate(now.getDate() + daysToNextSaturday);
            nextWeekendStart.setHours(0, 0, 0, 0);

            let nextWeekendEnd = new Date(nextWeekendStart);
            nextWeekendEnd.setDate(nextWeekendStart.getDate() + 1); // Sunday of next weekend
            nextWeekendEnd.setHours(23, 59, 59, 999);

            return itemDate >= nextWeekendStart && itemDate <= nextWeekendEnd;
          }
        } catch (error) {
          console.warn('Error processing event date for item:', error, { itemDate: item.date });
          return false;
        }
        return false;
      });
    } catch (outerError) {
      console.error('An unexpected error occurred during filtering:', outerError);
      return [];
    }
    return filtered;
  }, [activeSearchTab, selectedCategories, selectedSpecialCalendars, searchTerm, locationFilter, showFree, showPaid, showDeals, dateFilter, events]);

  const filteredItems = useMemo(() => processAndFilterItems(), [processAndFilterItems]);

  const getSegmentedResults = (items) => {
    if (!Array.isArray(items)) {
      return { events: [], entries: [], people: [], communities: [], apps: [] };
    }

    const segments = {
      events: items.filter((item) => item && item.type === 'event'),
      entries: items.filter((item) => {
        if (!item) return false;
        const isEntry = item.source === 'vibe-post' ||
          item.source === 'vibe-post-seed' ||
          item.source === 'profile-entries-seed' ||
          item.source === 'memory-post';
        return isEntry;
      }),
      people: items.filter((item) => item && item.type === 'people'),
      communities: items.filter((item) => item && item.type === 'community'),
      apps: items.filter((item) => item && item.type === 'app')
    };
    return Object.fromEntries(Object.entries(segments).filter(([_, value]) => value.length > 0));
  };

  const segmentedResults = getSegmentedResults(filteredItems);

  const handleLocationSelect = (location) => {
    setLocationFilter(location.name);
    setIsLocationPopoverOpen(false);
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationFilter(value);
    setIsLocationPopoverOpen(!!value);
  };

  const filteredLocationSuggestions = locationFilter ? 
    locationSuggestions.filter((loc) => 
      loc.name.toLowerCase().includes(locationFilter.toLowerCase()) || 
      loc.city.toLowerCase().includes(locationFilter.toLowerCase())
    ).slice(0, 20) : [];

  const handleTimeFilterSelect = (filter) => {
    setDateFilter(filter);
    setIsAnytimePopoverOpen(false);
  };

  const scrollToActiveFilter = () => {
    if (secondaryFiltersRef.current) {
      const container = secondaryFiltersRef.current;
      const activeButton = container.querySelector(`[data-filter="${activeSearchTab}"]`);
      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const scrollLeft = buttonRect.left - containerRect.left + container.scrollLeft - containerRect.width / 2 + buttonRect.width / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  useEffect(scrollToActiveFilter, [activeSearchTab]);

  const handleItemClick = (item) => {
    if (!item) return;

    const isEntry = item.source === 'vibe-post' ||
      item.source === 'vibe-post-seed' ||
      item.source === 'profile-entries-seed' ||
      item.source === 'memory-post';

    if (item.type === 'event' || isEntry) {
      const itemIndex = filteredItems.findIndex((i) => i.id === item.id && i.type === item.type);
      setVibeReelItems(filteredItems);
      setVibeReelStartIndex(itemIndex !== -1 ? itemIndex : 0);
      setShowVibeReel(true);
    } else if (item.type === 'people' || item.type === 'community') {
      navigate(createPageUrl(`CuratorProfile?id=${item.id}`));
    } else if (item.type === 'app') {
      alert(`Opening app: ${item.title}`);
    }
  };

  const totalResults = filteredItems.length;
  const hasSearchTerm = searchTerm.trim() !== '';

  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setActiveSearchTab("all");
    setSelectedCategories(new Set());
    setSelectedSpecialCalendars(new Set());
    setCategorySearch('');
    setSpecialCalendarSearch('');
    setDateFilter("Anytime");
    setShowFree(true);
    setShowPaid(true);
    setShowDeals(false);
  };

  const showSearchPrompt = searchTerm === '' && (
    activeSearchTab !== 'all' ||
    selectedCategories.size > 0 ||
    selectedSpecialCalendars.size > 0 ||
    locationFilter !== '' ||
    dateFilter !== 'Anytime');

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center">
            <h1 className="text-3xl font-semibold md:text-4xl gradient-text mb-2">
              Discover Curators
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find and follow curators who match your vibe and never miss their next event
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            <div className="mt-6 flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for experiences, people, places..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-full h-8" />
              </div>
              <div className="relative">
                <Popover open={isLocationPopoverOpen} onOpenChange={setIsLocationPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        placeholder="Location"
                        value={locationFilter}
                        onChange={handleLocationInputChange}
                        onFocus={() => { if (locationFilter) setIsLocationPopoverOpen(true); }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-32 md:w-40 pl-9 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-full h-8" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-white border-gray-200 text-gray-900 max-h-80 overflow-y-auto" align="start">
                    <div className="p-2">
                      {filteredLocationSuggestions.length > 0 ?
                        filteredLocationSuggestions.map((location, index) =>
                          <button
                            key={index}
                            onClick={() => handleLocationSelect(location)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900 text-base mb-1">{location.name}</div>
                              <div className="text-sm text-gray-500">{location.city}</div>
                            </div>
                          </button>
                        ) :
                        locationFilter && <div className="p-4 text-center text-sm text-gray-500">No locations found.</div>
                      }
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative">
                <Popover open={isAnytimePopoverOpen} onOpenChange={setIsAnytimePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={['people', 'communities', 'apps', 'entries'].includes(activeSearchTab)}
                      className="bg-white border-gray-300 flex items-center rounded-full px-2 h-8 text-sm transition-opacity text-gray-500 hover:bg-gray-100">
                      <Calendar className="w-4 h-4 mr-1" />
                      {dateFilter}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 bg-white border-gray-200 text-gray-900">
                    <div className="space-y-1">
                      {['Anytime', 'Today', 'Tomorrow', 'This Weekend', 'This Week', 'Next Weekend', 'This Month'].map((filter) =>
                        <button
                          key={filter}
                          onClick={() => handleTimeFilterSelect(filter)}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                          {filter}
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex w-full md:w-auto md:inline-flex items-center gap-2 bg-gray-100 p-0.5 rounded-full h-9">
                <div className="flex-1 md:flex-none min-w-0">
                  <div ref={secondaryFiltersRef} className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-full">
                      {searchTabs.map((tab) =>
                        <button
                          key={tab.id}
                          data-filter={tab.id}
                          onClick={() => setActiveSearchTab(tab.id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${activeSearchTab === tab.id ?
                            'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' :
                            'text-gray-500 hover:text-gray-700'}`}>
                          {tab.name}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

                {activeSearchTab === 'events' &&
                  <>
                    <div className="relative flex-shrink-0">
                      <Popover open={isSpecialCalendarPopoverOpen} onOpenChange={setIsSpecialCalendarPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-gray-600 px-2 py-1.5 text-sm font-medium justify-center gap-1 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 flex items-center rounded-full hover:bg-gray-200">
                            Calendar {selectedSpecialCalendars.size > 0 && `(${selectedSpecialCalendars.size})`}
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 bg-white border-gray-200 text-gray-900 z-[2000]" align="start">
                          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                            <h4 className="font-medium text-sm">Calendar</h4>
                            {selectedSpecialCalendars.size > 0 &&
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto py-1 text-blue-600 hover:text-blue-700"
                                onClick={handleClearSpecialCalendars}>
                                Clear
                              </Button>
                            }
                          </div>
                          <div className="p-2">
                            <Input
                              placeholder="Search calendars..."
                              value={specialCalendarSearch}
                              onChange={(e) => setSpecialCalendarSearch(e.target.value)}
                              className="h-9" />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto p-1">
                            {specialCalendars.filter((c) => {
                              if (!c || !c.label || typeof c.label !== 'string') return false;
                              const searchLower = specialCalendarSearch && typeof specialCalendarSearch === 'string' ? specialCalendarSearch.toLowerCase() : '';
                              return c.label.toLowerCase().includes(searchLower);
                            }).map((calendar) =>
                              <div
                                key={calendar.id}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSpecialCalendarSelect(calendar.id)}>
                                <Checkbox
                                  id={`explore-cal-${calendar.id}`}
                                  checked={selectedSpecialCalendars.has(calendar.id)}
                                  onCheckedChange={() => handleSpecialCalendarSelect(calendar.id)}
                                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" />
                                <label
                                  htmlFor={`explore-cal-${calendar.id}`}
                                  className="text-sm font-medium leading-none flex-1 cursor-pointer select-none">
                                  {calendar.label}
                                </label>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>
                  </>
                }

                <div className="relative flex-shrink-0">
                  <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-gray-600 px-2 py-1.5 text-sm font-medium justify-center gap-1 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 flex items-center rounded-full hover:bg-gray-200">
                        Category {selectedCategories.size > 0 && `(${selectedCategories.size})`}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 bg-white border-gray-200 text-gray-900 z-[2000]" align="start">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                        <h4 className="font-medium text-sm">Category</h4>
                        {selectedCategories.size > 0 &&
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 text-blue-600 hover:text-blue-700"
                            onClick={handleClearCategories}>
                            Clear
                          </Button>
                        }
                      </div>
                      <div className="p-2">
                        <Input
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="h-9" />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-1">
                        {categoryOptions.filter((c) => {
                          if (!c || !c.label || typeof c.label !== 'string') return false;
                          const categorySearchLower = categorySearch && typeof categorySearch === 'string' ? categorySearch.toLowerCase() : '';
                          return c.label.toLowerCase().includes(categorySearchLower);
                        }).map((category) =>
                          <div
                            key={category.id}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleCategorySelect(category.id)}>
                            <Checkbox
                              id={`explore-cat-${category.id}`}
                              checked={selectedCategories.has(category.id)}
                              onCheckedChange={() => handleCategorySelect(category.id)}
                              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" />
                            <label
                              htmlFor={`explore-cat-${category.id}`}
                              className="text-sm font-medium leading-none flex-1 cursor-pointer select-none">
                              {category.label}
                            </label>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {(activeSearchTab === 'all' || activeSearchTab === 'events') && hasSearchTerm &&
              <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free"
                    checked={showFree}
                    onCheckedChange={setShowFree}
                    className="border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600" />
                  <label htmlFor="free" className="text-sm font-medium text-gray-800 cursor-pointer">Free</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid"
                    checked={showPaid}
                    onCheckedChange={setShowPaid}
                    className="border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600" />
                  <label htmlFor="paid" className="text-sm font-medium text-gray-800 cursor-pointer">Paid</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deals"
                    checked={showDeals}
                    onCheckedChange={setShowDeals}
                    className="border-gray-300 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600" />
                  <label htmlFor="deals" className="text-sm font-medium text-gray-800 cursor-pointer">Deals</label>
                </div>
              </div>
            }
          </div>
        </div>

        <main className="pb-12 md:pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {loading ?
              <div className="flex flex-col justify-center items-center py-12 min-h-[300px]">
                <Loader className="animate-spin h-8 w-8 text-blue-600" />
                <p className="mt-4 text-gray-600">Finding your scene...</p>
              </div> :
              error ?
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-1 mb-6 py-5">
                  <div className="text-6xl mb-4">🚨</div>
                  <h3 className="text-2xl font-bold mb-2">Error loading content</h3>
                  <p className="text-gray-500 mb-6">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Reload Page
                  </Button>
                </motion.div> :
                showSearchPrompt ?
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Please type in the search box
                    </h3>
                    <p className="text-gray-500">
                      Start typing to find events, entries, people, communities, and apps
                    </p>
                  </motion.div> :
                  filteredItems.length === 0 && hasSearchTerm ?
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mt-1 mb-6 py-5">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold mb-2">No results found</h3>
                      <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
                      <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50">
                        Clear all filters
                      </Button>
                    </motion.div> :
                    searchTerm === '' && activeSearchTab === 'all' && selectedCategories.size === 0 && selectedSpecialCalendars.size === 0 && locationFilter === '' && dateFilter === 'Anytime' ?
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 mb-4 mx-auto pb-16">
                        <div className="max-w-2xl mx-auto">
                          <h2 className="text-gray-900 mb-4 text-xl font-medium text-center flex items-center justify-center gap-2">
                            <span className="flex items-center justify-center">
                              <TrendingUp className="w-5 h-5" />
                            </span>
                            Trending Now
                          </h2>
                          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                            {trendingItems.map((item, index) =>
                              <button
                                key={item.id}
                                onClick={() => setSearchTerm(item.text)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left first:rounded-t-xl last:rounded-b-xl">
                                <span className="flex-shrink-0">
                                  <TrendingUp className="w-4 h-4 text-blue-600" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900">{item.text}</p>
                                </div>
                                <span className="text-xs text-gray-400 flex-shrink-0">#{index + 1} trending</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div> :
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <p className="text-sm text-gray-500">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>
                        </div>
                        {activeSearchTab === 'all' ?
                          <div className="space-y-8">
                            {Object.entries(segmentedResults).map(([type, items]) => {
                              if (items.length === 0) return null;
                              const title = type.charAt(0).toUpperCase() + type.slice(1);
                              const isCardLayout = type === 'entries';

                              return (
                                <div key={type}>
                                  <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
                                  <div className={isCardLayout ?
                                    "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" :
                                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                                    {items.map((item) => (
                                      <ItemDisplay
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onClick={handleItemClick}
                                        currentUser={currentUser}
                                        followedCurators={followedCurators}
                                        savedEvents={savedEvents}
                                        onFollowToggle={onFollowToggle}
                                        handleSavePost={handleSavePost}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div> :
                          <div className={activeSearchTab === 'entries' ?
                            "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" :
                            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                            {filteredItems.map((item) => (
                              <ItemDisplay
                                key={`${item.type}-${item.id}`}
                                item={item}
                                onClick={handleItemClick}
                                currentUser={currentUser}
                                followedCurators={followedCurators}
                                savedEvents={savedEvents}
                                onFollowToggle={onFollowToggle}
                                handleSavePost={handleSavePost}
                              />
                            ))}
                          </div>
                        }
                      </>
            }
          </div>
        </main>
      </div>

      <SaveToCollectionModal
        isOpen={showSaveModal}
        onClose={() => { setShowSaveModal(false); setSelectedPost(null); }}
        postData={selectedPost}
        currentUser={currentUser} />

      {showVibeReel && (
        <EventReelModal
          events={vibeReelItems}
          startIndex={vibeReelStartIndex}
          isOpen={showVibeReel}
          onClose={() => setShowVibeReel(false)}
          currentUser={currentUser} />
      )}
    </>
  );
}