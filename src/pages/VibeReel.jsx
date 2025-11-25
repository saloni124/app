import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Event } from '@/api/entities';
import { User } from '@/api/entities';
import PoppinEventCard from '../components/feed/PoppinEventCard';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Search, Plus, Bookmark, User as UserIcon } from 'lucide-react'; // Added new icons for mobile nav
import { apiCache } from '../components/apiCache';
import { simulatedDataManager } from '@/components/simulatedDataManager'; // Import simulatedDataManager
import { createPageUrl } from '@/utils';

// Re-using the sample data logic from Profile.js to ensure consistency
const getSampleEntriesFor = (profileEmail, userName, avatar) => {
  const curatorSampleData = {
    "saloni.bhatia@example.com": [
      {
        id: 'saloni_entry_1',
        title: "Coffee shop vibes in Mission District",
        description: "Found this cozy corner cafe with the best matcha latte and perfect lighting for getting work done.",
        cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1200&fit=crop",
        source: 'vibe-post-seed',
        organizer_name: "Saloni Bhatia",
        organizer_email: "saloni.bhatia@example.com",
        organizer_avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop",
        location: "Mission District, SF",
        likes: 89,
        timestamp: "2 hours ago",
        comments: [
          { user: "Priya Sharma", text: "This place looks so cozy!", avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop' },
          { user: "Alex Chen", text: "Need to check this out", avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' }
        ]
      },
      {
        id: 'saloni_entry_2',
        title: "Night market adventures",
        description: "Exploring the best street food and local vendors. The energy here is incredible!",
        cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop",
        source: 'vibe-post-seed',
        organizer_name: "Saloni Bhatia",
        organizer_email: "saloni.bhatia@example.com",
        organizer_avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop",
        location: "Chinatown, SF",
        likes: 124,
        timestamp: "1 day ago",
        comments: [
          { user: "Chris Rodriguez", text: "The food looks amazing!", avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=40&h=40&fit=crop' },
          { user: "Jordan Kim", text: "So jealous of this adventure", avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop' }
        ]
      },
      {
        id: 'saloni_entry_3',
        title: "Brunch spot discovery",
        description: "This hole-in-the-wall place has the most incredible avocado toast and bottomless mimosas!",
        cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop",
        source: 'vibe-post-seed',
        organizer_name: "Saloni Bhatia",
        organizer_email: "saloni.bhatia@example.com",
        organizer_avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop",
        location: "Castro District, SF",
        likes: 73,
        timestamp: "3 days ago",
        comments: [
          { user: "Riley Thompson", text: "Those mimosas look perfect!", avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop' },
          { user: "Sam Davis", text: "Adding this to my list!", avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' }
        ]
      }
    ],
    "maya.patel@example.com": [
      {
        id: 'maya_entry_1',
        title: "Morning yoga session",
        description: "Starting the day with mindfulness and movement. The sunrise made it even more special.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
        source: 'vibe-post-seed',
        organizer_name: "Maya Patel",
        organizer_email: "maya.patel@example.com",
        organizer_avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop",
        location: "Griffith Park, LA",
        likes: 67,
        timestamp: "3 hours ago",
        comments: [
          { user: "Alex Chen", text: "So peaceful and inspiring", avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
          { user: "Sam Davis", text: "Love this spot!", avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' }
        ]
      }
    ]
  };

  if (curatorSampleData[profileEmail]) {
    return curatorSampleData[profileEmail];
  }

  // Fallback for the current user's sample entries
  return [
    {
      id: 'entry_1',
      title: "Coffee shop vibes in Mission District",
      description: "Found this cozy corner cafe with the best matcha latte and perfect lighting for getting work done.",
      cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1200&fit=crop",
      source: 'vibe-post-seed',
      organizer_name: userName,
      organizer_email: profileEmail,
      organizer_avatar: avatar,
      location: "Mission District, SF",
      likes: 89,
      timestamp: "2 hours ago",
      comments: [
        { user: "Priya Sharma", text: "This place looks amazing!", avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop' },
        { user: "Alex Chen", text: "Need to check this out", avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' }
      ]
    },
    {
      id: 'entry_2',
      title: "Golden hour at Dolores Park",
      description: "Perfect evening for a picnic with friends. The city skyline looks amazing from here.",
      cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
      source: 'vibe-post-seed',
      organizer_name: userName,
      organizer_email: profileEmail,
      organizer_avatar: avatar,
      location: "Dolores Park, SF",
      likes: 156,
      timestamp: "1 day ago",
      comments: [
        { user: "Chris Rodriguez", text: "Beautiful sunset!", avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=40&h=40&fit=crop' }
      ]
    },
    {
      id: 'entry_3',
      title: "Brunch spot discovery",
      description: "This hole-in-the-wall place has the most incredible avocado toast and bottomless mimosas!",
      cover_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=1200&fit=crop",
      source: 'vibe-post-seed',
      organizer_name: userName,
      organizer_email: profileEmail,
      organizer_avatar: avatar,
      location: "Castro District, SF",
      likes: 73,
      timestamp: "3 days ago",
      comments: [
        { user: "Riley Thompson", text: "Those mimosas look perfect!", avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop' },
        { user: "Jordan Kim", text: "Adding this to my list!", avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' }
        ]
    }
  ];
};

export default function VibeReel() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [followedCurators, setFollowedCurators] = useState(new Set());
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadUserData = useCallback(async () => {
    try {
      let user = null;
      if (simulatedDataManager.isTemporaryDemoMode()) {
          user = simulatedDataManager.getSimulatedUser();
          console.log('📱 VibeReel using temporary simulated user:', user?.email);
      } else if (simulatedDataManager.isAdminMode()) {
          user = {
            id: 'admin_saloni_bhatia_id',
            email: 'salonibhatia99@gmail.com',
            full_name: 'Saloni Bhatia',
            avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop',
            cover_image: 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop',
            bio: 'Curator :)',
            role: 'admin',
            account_type: 'personal',
            saved_events: [],
            attended_events: [],
            followers: 245,
            following: 128,
            is_verified: true,
            events_hosted: 2,
            ai_scheduling: true,
            followed_curator_ids: []
          };
          console.log('👑 VibeReel using admin user:', user.email);
      } else {
          user = await apiCache.throttledRequest('current_user', () => User.me());
          console.log('✅ VibeReel using real logged-in user:', user.email);
      }
      
      setCurrentUser(user);
      setSavedEvents(new Set(user?.saved_events || []));
      setFollowedCurators(new Set(user?.followed_curator_ids || []));
      return user;
    } catch (error) {
      console.error("Failed to load user data:", error);
      return null;
    }
  }, [setSavedEvents, setFollowedCurators]);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const user = await loadUserData();

        const urlParams = new URLSearchParams(location.search);
        const organizerEmail = urlParams.get('organizer_email');
        
        // Always fetch from database, use sample data as fallback
        const cacheKey = organizerEmail ? `vibe_posts_${organizerEmail}` : 'all_vibe_posts';
        const fetchedPosts = await apiCache.throttledRequest(cacheKey, async () => {
            const filter = { source: { '$in': ['vibe-post', 'vibe-post-seed'] } };
            if (organizerEmail) {
                filter.organizer_email = organizerEmail;
            }
            let events = await Event.filter(filter, '-created_date');
            
            // Merge with simulated events if in simulated mode
            if (simulatedDataManager.isSimulatedMode()) {
              const simulatedEvents = simulatedDataManager.getSimulatedEvents();
              const vibeSimulatedEvents = simulatedEvents.filter(e => 
                e.source === 'vibe-post' || e.source === 'vibe-post-seed'
              );
              events = [...events, ...vibeSimulatedEvents]; // Combine real and simulated
            }
            
            // If no posts (real or simulated) are found for a specific organizer, use the sample data as a fallback.
            if (organizerEmail && events.length === 0) {
                const profileUserFromUrl = await User.filter({email: organizerEmail});
                const name = profileUserFromUrl?.[0]?.full_name || 'Curator';
                const avatar = profileUserFromUrl?.[0]?.avatar || '';
                return getSampleEntriesFor(organizerEmail, name, avatar);
            }
            return events;
        });
        
        const postsArray = Array.isArray(fetchedPosts) ? fetchedPosts : [];
        setPosts(postsArray);
        
        const indexParam = urlParams.get('index');
        const initialIndex = indexParam ? parseInt(indexParam, 10) : 0;
        
        // Ensure index is within bounds
        const finalIndex = Math.max(0, Math.min(initialIndex, postsArray.length > 0 ? postsArray.length - 1 : 0));
        setCurrentIndex(finalIndex);

        if (containerRef.current && postsArray.length > 0) {
            // Scroll to the correct initial item for mobile
            // Check if there's a first child and its offsetHeight is available
            const firstChild = containerRef.current.firstChild;
            if (firstChild && firstChild.offsetHeight > 0) {
                const itemHeight = firstChild.offsetHeight;
                containerRef.current.scrollTop = finalIndex * itemHeight;
            }
        }

      } catch (error) {
        console.error("Initial Vibe Reel load failed:", error);
        setPosts([]);
        setCurrentIndex(0);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, [location.search, loadUserData]);

  const handleDataChange = async () => {
    await loadUserData();
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = container.scrollLeft;
      const containerCenter = container.offsetWidth / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      Array.from(container.children).forEach((child, index) => {
        if (child.offsetWidth > 0) {
          const childCenter = child.offsetLeft + (child.offsetWidth / 2);
          const distance = Math.abs(scrollLeft + containerCenter - childCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 50, overflow: 'visible' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full flex items-center justify-center transition-colors"
        style={{ zIndex: 51 }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Mobile view */}
      <div ref={containerRef} className="md:hidden h-full w-full overflow-y-auto snap-y snap-mandatory bg-black scrollbar-hide">
        {posts.map((post, index) => (
          <div
            key={post.id || index}
            className="h-full w-full snap-start flex items-center justify-center"
          >
            <PoppinEventCard
              event={post}
              currentUser={currentUser}
              onDataChange={handleDataChange}
              isDesktopFrame={false}
              savedEvents={savedEvents}
              followedCurators={followedCurators}
              hideEventSaveButton={currentUser?.email === post.organizer_email}
            />
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-center h-screen w-screen">
        <div 
          ref={containerRef} 
          onScroll={handleScroll}
          className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollPadding: '0 calc(50% - 375px / 2)', overflow: 'visible' }}
        >
          {posts.map((post, index) => {
            const isCenter = index === currentIndex;
            const opacity = isCenter ? 1 : 0.4;
            const scale = isCenter ? 1 : 0.85;

            return (
              <motion.div
                key={post.id || index}
                className="flex-shrink-0 w-[375px] h-full snap-center flex items-center justify-center px-4"
                animate={{ opacity, scale }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ overflow: 'visible' }}
              >
                <div className="w-full h-[95%] max-h-[800px] rounded-2xl overflow-hidden shadow-2xl">
                  <PoppinEventCard
                    event={post}
                    currentUser={currentUser}
                    onDataChange={handleDataChange}
                    isDesktopFrame={true}
                    savedEvents={savedEvents}
                    followedCurators={followedCurators}
                    hideEventSaveButton={currentUser?.email === post.organizer_email}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile Nav Bar (Fixed at bottom) */}
      <nav
        id="event-reel-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20"
        style={{ height: '72px', zIndex: 99999, paddingTop: '12px' }}
      >
        <div className="pt-2 pr-2 pb-10 pl-2 h-16 flex items-center">
          <button
            onClick={() => navigate(createPageUrl("Feed"))}
            className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            Explore
          </button>
          <button
            onClick={() => navigate(createPageUrl("Explore"))}
            className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5 mb-0.5" />
            Search
          </button>
          <div className="flex flex-col items-center justify-center flex-1 relative">
            <button className="w-10 h-9 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg mb-0.5">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            onClick={() => navigate(createPageUrl("MyList"))}
            className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            <Bookmark className="w-5 h-5 mb-0.5" />
            Planner
          </button>
          <button
            onClick={() => navigate(createPageUrl("Profile"))}
            className="flex flex-col items-center justify-center flex-1 text-xs font-medium text-white transition-colors"
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            Profile
          </button>
        </div>
      </nav>
    </div>
  );
}