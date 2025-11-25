
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Heart, MessageCircle, Share2, Bookmark, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PoppinEventCard from '../components/feed/PoppinEventCard';

// Dummy implementations for shadcn/ui components for this single-file setup
// In a real app, these would be imported from a UI library/component collection.

// DropdownMenu (simplified)
const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: (e) => {
              e.stopPropagation(); // Stop propagation to prevent parent clicks
              setIsOpen((prev) => !prev);
              if (child.props.onClick) child.props.onClick(e);
            },
            'aria-expanded': isOpen
          });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen ? React.cloneElement(child, { setIsOpen: setIsOpen }) : null;
        }
        return child;
      })}
    </div>);

};
const DropdownMenuTrigger = ({ children, asChild, onClick }) => {
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, { onClick: onClick });
  }
  return <button onClick={onClick}>{children}</button>;
};
const DropdownMenuContent = ({ children, align, setIsOpen }) => {
  let positionClasses = "absolute top-full right-0 mt-2";
  if (align === "end") {
    positionClasses = "absolute top-full right-0 mt-2";
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md origin-top-right ${positionClasses}`}
      onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking content
    >
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuItem) {
          return React.cloneElement(child, {
            onSelect: (e) => {
              if (child.props.onSelect) child.props.onSelect(e);
              setIsOpen(false); // Close dropdown after selection
            }
          });
        }
        return child;
      })}
    </motion.div>);

};
const DropdownMenuItem = ({ children, onSelect, className }) =>
<button
  onClick={onSelect} className="text-red-600 ml-3 pl-6 text-sm relative flex cursor-pointer select-none items-center rounded-sm outline-none transition-colors focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-half">


    {children}
  </button>;


// Dialog (simplified)
const Dialog = ({ open, onOpenChange, children }) =>
<AnimatePresence>
    {open &&
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
    onClick={() => onOpenChange(false)}>

        <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
          {children}
        </motion.div>
      </motion.div>
  }
  </AnimatePresence>;


const DialogContent = ({ children }) => <div>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children }) => <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>;
const DialogDescription = ({ children }) => <p className="text-sm text-gray-500">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;

// Input (simplified)
const Input = ({ value, onChange, placeholder, className }) =>
<input
  className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  value={value}
  onChange={onChange}
  placeholder={placeholder} />;



// A simple Button component for demonstration. In a real app, this would be imported from a UI library.
const Button = ({ children, onClick, className, variant, size, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100'
  }[variant || 'default'];
  const sizeStyles = {
    icon: 'h-9 w-9 p-0',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-8',
    default: 'h-10 px-4 py-2'
  }[size || 'default'];

  return (
    <button onClick={onClick} className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
      {children}
    </button>);

};

// All collections data, now including 'title' for each post as required by the outline.
const allCollectionsData = {
  'collection-1': {
    title: 'Romantic Dinner Spots',
    description: 'A curated list of the most romantic spots for an unforgettable date night.',
    posts: [
    {
      id: 101,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c?w=800&q=80',
      caption: 'This candlelit Italian spot is pure magic. The pasta was divine, and the atmosphere was perfect for a special night out. Felt like we were in a movie!',
      author_name: 'Maya Patel',
      author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
      likes: 350,
      comments_count: 18,
      liked: false,
      saved: true,
      title: 'Candlelit Italian Dream'
    },
    {
      id: 102,
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
      caption: 'Rooftop dining with the best city views. The food was incredible, but that skyline was the real star. Highly recommend for an anniversary or special occasion.',
      author_name: 'Alex Chen',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      likes: 520,
      comments_count: 25,
      liked: true,
      saved: true,
      title: 'Rooftop City Views'
    },
    {
      id: 103,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      caption: 'Found the coziest little French bistro with the most amazing steak frites. It\'s hidden away from the crowds, making it feel super intimate and special. A true gem.',
      author_name: 'Sophia Dubois',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
      likes: 280,
      comments_count: 15,
      liked: false,
      saved: true,
      title: 'Hidden French Bistro'
    },
    {
      id: 104,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      caption: 'Private dining room with a view of the chef\'s table. Watching the culinary artistry while enjoying a 7-course tasting menu was absolutely incredible. Worth every penny!',
      author_name: 'James Morrison',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
      likes: 410,
      comments_count: 31,
      liked: true,
      saved: true,
      title: 'Chef\'s Table Experience'
    },
    {
      id: 105,
      image: 'https://images.unsplash.com/photo-1559329007-40df8881c9fe?w=800&q=80',
      caption: 'Cozy wine bar with the most knowledgeable sommelier. Each glass paired perfectly with our small plates. The ambiance was intimate and conversation flowed naturally.',
      author_name: 'Isabella Martinez',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
      likes: 295,
      comments_count: 22,
      liked: false,
      saved: true,
      title: 'Intimate Wine Bar'
    }]

  },
  'collection-2': {
    title: 'Happy Hour Deals',
    description: 'Best after-work spots for great drinks and even better prices.',
    posts: [
    {
      id: 201,
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
      caption: '$5 cocktails and amazing vibes every Friday. This place is always buzzing after 5 PM. The perfect spot to unwind with the team.',
      author_name: 'Jordan Kim',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
      likes: 150,
      comments_count: 10,
      liked: false,
      saved: true,
      title: 'Friday $5 Cocktails'
    },
    {
      id: 202,
      image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80',
      caption: 'Hidden speakeasy with half-price drinks until 7pm. You have to know where to look, but it\'s worth it. The cocktails are top-notch.',
      author_name: 'Sarah M.',
      author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop',
      likes: 210,
      comments_count: 14,
      liked: true,
      saved: true,
      title: 'Secret Speakeasy'
    },
    {
      id: 203,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
      caption: 'Rooftop bar with 2-for-1 drinks during sunset hours. The city view is spectacular and the crowd is always fun and energetic.',
      author_name: 'Mike Chen',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      likes: 185,
      comments_count: 18,
      liked: false,
      saved: true,
      title: 'Sunset Rooftop Bar'
    },
    {
      id: 204,
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80',
      caption: 'Wine Wednesday at this cozy bistro - all bottles half price! Great selection of natural wines and small plates. Perfect for a midweek treat.',
      author_name: 'Emma Rodriguez',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
      likes: 142,
      comments_count: 9,
      liked: true,
      saved: true,
      title: 'Wine Wednesday Bistro'
    }]

  },
  'collection-3': {
    title: 'Weekend Vibes',
    description: 'All the best things to do, see, and eat over the weekend.',
    posts: [
    {
      id: 301,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      caption: 'Best farmers market in the city! Fresh everything. Woke up early to grab these beautiful carrots and some fresh bread. My favorite weekend ritual.',
      author_name: 'Elena K.',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
      likes: 415,
      comments_count: 22,
      liked: false,
      saved: true,
      title: 'Farmers Market Haul'
    },
    {
      id: 302,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      caption: 'Sunday brunch is a sacred ritual. Found a new spot with bottomless mimosas and the best eggs benedict. Already planning to come back next week.',
      author_name: 'Jordan Kim',
      author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
      likes: 290,
      comments_count: 16,
      liked: false,
      saved: true,
      title: 'Sunday Brunch Spot'
    },
    {
      id: 303,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      caption: 'Weekend warehouse party was absolutely unreal! The beats, the crowd, the energy - everything was perfect. Dancing until sunrise with the best people.',
      author_name: 'Alex Rodriguez',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      likes: 624,
      comments_count: 38,
      liked: true,
      saved: true,
      title: 'Warehouse Party Vibes'
    },
    {
      id: 304,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      caption: 'Saturday morning yoga in the park followed by coffee with new friends. There\'s something magical about starting the weekend with intention and mindfulness.',
      author_name: 'Maya Singh',
      author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop',
      likes: 203,
      comments_count: 12,
      liked: false,
      saved: true,
      title: 'Yoga in the Park'
    },
    {
      id: 305,
      image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80',
      caption: 'Vintage shopping haul from the weekend flea market! Found some incredible pieces and met the most interesting vendors. Love supporting local artisans.',
      author_name: 'Sophie Chen',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
      likes: 178,
      comments_count: 25,
      liked: true,
      saved: true,
      title: 'Vintage Flea Market'
    },
    {
      id: 306,
      image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80',
      caption: 'Sunset picnic with the crew in Central Park. Good food, great friends, and perfect weather. These are the moments that make the weekend special.',
      author_name: 'Carlos Martinez',
      author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      likes: 342,
      comments_count: 19,
      liked: false,
      saved: true,
      title: 'Central Park Picnic'
    }]

  },
  'collection-4': {
    title: 'Empty Collection',
    description: 'A collection with no items',
    posts: []
  }
};

// Mock User API for demonstration purposes. In a real app, this would be an actual API call.
const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'user@test.com',
  // Simulate saved posts by IDs. These IDs correspond to posts in allCollectionsData.
  saved_posts: {
    'collection-1': [101, 103, 105],
    'collection-2': [201, 204],
    'collection-3': [301, 306, 302]
  },
  saved_events: ['some-event-id-1', 'some-event-id-2'],
  // Example of a post saved outside of a specific collection (e.e., from a general save action)
  general_saved_posts: [102, 203, 304],
  collections: [
  { id: 'collection-1', name: 'Romantic Dinner Spots', description: 'A curated list of the most romantic spots for an unforgettable date night.' },
  { id: 'collection-2', name: 'Happy Hour Deals', description: 'Best after-work spots for great drinks and even better prices.' },
  { id: 'collection-3', name: 'Weekend Vibes', description: 'All the best things to do, see, and eat over the weekend.' },
  { id: 'collection-4', name: 'Empty Collection', description: 'A collection with no items' }]

};

const User = {
  me: () => Promise.resolve(mockUser),
  // Simulate an API call to update saved posts. In a real app, this would persist changes.
  updateSavedPosts: (userId, updatedSavedPosts) => {
    // For this mock, we just log and return success
    console.log(`Simulating update of saved posts for user ${userId}:`, updatedSavedPosts);
    mockUser.saved_posts = updatedSavedPosts; // Update mock user's saved posts for subsequent calls
    return Promise.resolve({ success: true });
  },
  updateMyUserData: (updates) => {
    console.log(`Simulating update of user data for ${mockUser.id}:`, updates);
    // Deep merge for specific properties, like collections
    if (updates.collections) {
      mockUser.collections = updates.collections;
    }
    if (updates.saved_posts) {
      mockUser.saved_posts = updates.saved_posts;
    }
    if (updates.saved_events) {
      mockUser.saved_events = updates.saved_events;
    }
    if (updates.general_saved_posts) {
      mockUser.general_saved_posts = updates.general_saved_posts;
    }
    // For other properties, direct assignment
    Object.assign(mockUser, updates);
    return Promise.resolve({ success: true });
  },
  // New mock API methods for granular save control
  removePostFromCollection: async (userId, postId, collectionKey) => {
    console.log(`Simulating removing post ${postId} from collection ${collectionKey} for user ${userId}`);
    if (mockUser.saved_posts[collectionKey]) {
      mockUser.saved_posts[collectionKey] = mockUser.saved_posts[collectionKey].filter((id) => id !== postId);
    }
    return Promise.resolve({ success: true });
  },
  removePostFromAllCollections: async (userId, postId) => {
    console.log(`Simulating unsaving post ${postId} from all collections for user ${userId}`);
    for (const key in mockUser.saved_posts) {
      mockUser.saved_posts[key] = mockUser.saved_posts[key].filter((id) => id !== postId);
    }
    mockUser.general_saved_posts = mockUser.general_saved_posts.filter((id) => id !== postId);
    return Promise.resolve({ success: true });
  },
  addPostToCollection: async (userId, postId, collectionKey) => {
    console.log(`Simulating adding post ${postId} to collection ${collectionKey} for user ${userId}`);
    if (!mockUser.saved_posts[collectionKey]) {
      mockUser.saved_posts[collectionKey] = [];
    }
    if (!mockUser.saved_posts[collectionKey].includes(postId)) {
      mockUser.saved_posts[collectionKey].push(postId);
    }
    // Ensure it's not in general if explicitly added to a collection. (Optional, depends on exact save logic)
    mockUser.general_saved_posts = mockUser.general_saved_posts.filter((id) => id !== postId);
    return Promise.resolve({ success: true });
  }
};

// Flatten all posts from allCollectionsData into a map for easy lookup by ID
const allPostsById = new Map();
Object.values(allCollectionsData).forEach((collection) => {
  collection.posts.forEach((post) => {
    allPostsById.set(post.id, post);
  });
});

// Helper function to create page URLs. In a real app, this might come from a router config.
const createPageUrl = (path) => `/${path}`;

// New mock Event API for demonstration purposes.
// This mimics fetching "Event" or "Post" objects from a backend,
// similar to how `fetchMockCollectionById` used `allPostsById` previously.
const Event = {
  filter: async (query) => {
    // Assuming query looks like { $or: [{ id: { $in: [...] } }, { _id: { $in: [...] } }], source?: string }
    const itemIds = query.$or ? query.$or.flatMap((condition) => condition.id?.$in || condition._id?.$in || []) : [];
    const sourceFilter = query.source;

    let fetchedItems = itemIds.map((id) => allPostsById.get(id)).filter(Boolean); // Filter out undefined if ID not found

    if (sourceFilter) {
      fetchedItems = fetchedItems.filter((item) => item.source === sourceFilter || !item.source); // If item has no source, include it
    }

    // Fetch current user to determine saved status for each item
    const user = await User.me();
    const userSavedPostIds = new Set();
    if (user?.saved_posts) {
      Object.values(user.saved_posts).forEach((postIds) =>
      postIds.forEach((id) => userSavedPostIds.add(id))
      );
    }
    if (user?.general_saved_posts) {
      user.general_saved_posts.forEach((id) => userSavedPostIds.add(id));
    }

    return fetchedItems.map((item) => ({
      ...item,
      // Mark whether the item is saved by the current user
      is_saved: userSavedPostIds.has(item.id),
      // PoppinEventCard expects `cover_image`, `title`, `description` etc.
      // Map post properties to event properties required by PoppinEventCard
      cover_image: item.image,
      description: item.caption,
      organizer_name: item.author_name,
      organizer_avatar: item.author_avatar,
      // Add other properties that PoppinEventCard might expect but are not directly in post
      gallery_images: [],
      comments: item.comments || [],
      privacy_level: 'public',
      friends_going: [], // This is hardcoded to empty array as there's no dynamic data for it in the mock
      scene_tags: [],
      source: 'vibe-post', // Indicate source if needed
      // Adding dummy dates for "Date Filters" as per request
      start_date: '2023-11-20T18:00:00Z',
      end_date: '2023-11-20T22:00:00Z'
    }));
  }
};

export default function CollectionPage() {
  const [collection, setCollection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [requestInProgress, setRequestInProgress] = useState(false);

  // Get collectionId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get('id');

  // New loadCollectionData function
  const loadCollectionData = async (currentCollectionId) => {
    setLoading(true);
    setError(null);
    try {
      if (!currentCollectionId) {
        setError('Collection ID is required');
        setLoading(false);
        return;
      }

      const user = await User.me();
      setCurrentUser(user);

      const userCollections = user.collections || [];
      let foundCollection = null;

      if (currentCollectionId === 'all') {
        foundCollection = {
          id: 'all',
          name: 'All Saved Items',
          description: 'All your saved items across all collections',
          created_at: new Date().toISOString()
        };
      } else {
        // Look for collection by simple ID (no email suffix)
        foundCollection = userCollections.find((c) => c.id === currentCollectionId);
      }

      if (!foundCollection) {
        setError("Collection not found.");
        setLoading(false);
        return;
      }

      setCollection(foundCollection);

      const savedPosts = user.saved_posts || {};

      let itemIds = [];
      if (currentCollectionId === 'all') {
        // Get all items from all collections (including _general_saves)
        const allIds = new Set();
        Object.values(savedPosts).forEach((ids) => {
          if (Array.isArray(ids)) {// Ensure it's an array
            ids.forEach((i) => allIds.add(i));
          }
        });
        // This line ensures general_saved_posts are also included in the 'all' view.
        if (Array.isArray(user.general_saved_posts)) {
          user.general_saved_posts.forEach((i) => allIds.add(i));
        }
        itemIds = Array.from(allIds);
      } else {
        // Get items from specific collection
        itemIds = savedPosts[currentCollectionId] || [];
      }

      if (itemIds.length > 0) {
        const fetchedItems = await Event.filter({
          $or: [
          { id: { $in: itemIds } },
          { _id: { $in: itemIds } }],

          source: 'vibe-post'
        });
        setPosts(fetchedItems);
      } else {
        setPosts([]);
      }

    } catch (err) {
      console.error("Failed to load collection:", err);
      setError("Could not load your collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (collectionId) {
      loadCollectionData(collectionId);
    }
  }, [collectionId]);

  useEffect(() => {
    if (collection) {
      setNewCollectionName(collection.title || collection.name);
    }
  }, [collection]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const openReel = (index) => {
    setSelectedPostIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeReel = () => {
    setSelectedPostIndex(null);
    document.body.style.overflow = 'auto';
    loadCollectionData(collectionId);
  };

  const handleDataChange = async () => {
    await loadCollectionData(collectionId);
  };

  const handleUnsaveItem = async (item) => {// Renamed from handleUnsave and takes item object
    if (!currentUser || requestInProgress) return;

    setRequestInProgress(true);
    try {
      if (isAllItemsView) {
        // If viewing "All Saved Items", 'Remove' means remove from all saved places
        await User.removePostFromAllCollections(currentUser.id, item.id);
      } else {
        // If viewing a specific collection, 'Remove' means remove from THIS collection
        await User.removePostFromCollection(currentUser.id, item.id, collectionId);
      }

      // After a successful unsave, refresh the data
      await handleDataChange();

    } catch (error) {
      console.error("Failed to unsave item:", error);
      alert("Could not unsave item. Please try again.");
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleAuthorClick = (authorName, e) => {
    if (e) e.stopPropagation();
    navigate(`/curator/${encodeURIComponent(authorName)}`);
  };

  const handleDeleteCollection = () => {
    if (!currentUser || !collection || collectionId === 'all') return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCollection = async () => {
    if (!currentUser || !collection || collectionId === 'all') return;
    try {
      const updatedCollections = (currentUser.collections || []).filter((c) => c.id !== collectionId);
      const updatedSavedPosts = { ...currentUser.saved_posts };
      delete updatedSavedPosts[collectionId];

      await User.updateMyUserData({
        collections: updatedCollections,
        saved_posts: updatedSavedPosts
      });

      setIsDeleteDialogOpen(false);
      navigate(createPageUrl('MyList'));

    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection. Please try again.");
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRenameCollection = async () => {
    if (!currentUser || !collection || !newCollectionName.trim() || collectionId === 'all') {
      setIsRenameDialogOpen(false);
      return;
    }
    try {
      const updatedCollections = (currentUser.collections || []).map((c) =>
      c.id === collectionId ? { ...c, name: newCollectionName.trim() } : c
      );

      await User.updateMyUserData({ collections: updatedCollections });

      setCurrentUser((prev) => ({ ...prev, collections: updatedCollections }));
      setCollection((prev) => ({ ...prev, name: newCollectionName.trim() }));
      setIsRenameDialogOpen(false);
    } catch (error) {
      console.error("Error renaming collection:", error);
      alert("Failed to rename collection. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading collection...</p>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col p-4">
        <p className="text-lg font-semibold text-red-700 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
      </div>);

  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <p className="text-lg font-semibold text-gray-700 mb-4">Collection not found.</p>
        <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
      </div>);

  }

  const isReelView = selectedPostIndex !== null;
  const isAllItemsView = collectionId === 'all';

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-40 px-4 md:px-6 py-3 border-b">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("MyList")}>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
            </Link>
            <div className="flex-grow min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">{collection?.title || collection?.name}</h1>
              <p className="text-sm text-gray-500 line-clamp-2 md:truncate break-words">{collection?.description}</p>
            </div>
            {collectionId !== 'all' && currentUser &&
            <div className="relative" ref={menuRef}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setIsMenuOpen((prev) => !prev)}>
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  {isMenuOpen &&
                <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => {setIsRenameDialogOpen(true);setIsMenuOpen(false);}}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => {handleDeleteCollection();setIsMenuOpen(false);}} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                }
                </DropdownMenu>
              </div>
            }
          </div>
        </div>

        <main className={`${isReelView ? '' : 'max-w-6xl mx-auto'}`}>
          {isReelView ?
          <div className="fixed inset-0 bg-black z-50">
              {posts.length > 0 ?
            <div className="h-full w-full overflow-y-auto snap-y snap-mandatory">
                  {posts.map((post, index) =>
              <div key={post.id} className="h-full w-full snap-start flex items-center justify-center">
                      <PoppinEventCard
                  event={post}
                  currentUser={currentUser}
                  isFromCollection={true}
                  onDataChange={handleDataChange}
                  currentCollectionId={collectionId} />

                    </div>
              )}
                </div> :

            <div className="flex items-center justify-center h-full text-white">No items in this collection.</div>
            }
              <button
              onClick={closeReel}
              className="absolute top-5 left-5 z-50 w-10 h-10 bg-black/50 rounded-full hover:bg-black/70 flex items-center justify-center">

                <X className="w-5 h-5 text-white" />
              </button>
            </div> :

          <div className="p-4 sm:p-6 lg:p-8">
              {loading ?
            <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div> :
            error ?
            <div className="text-center py-12">
                  <p className="text-red-600 text-lg font-medium">{error}</p>
                  <Link to={createPageUrl("MyList")}>
                    <Button className="mt-4" variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Collections
                    </Button>
                  </Link>
                </div> :
            posts.length === 0 ?
            <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">This collection is empty.</p>
                  <p className="text-gray-400 mt-2">Start saving posts to see them here!</p>
                </div> :

            <>
                  {isAllItemsView ?
              <div className="grid grid-cols-3 gap-1.5 md:gap-4">
                      {posts.map((item, index) =>
                <div key={`all-${item.id || index}`} className="relative group cursor-pointer" onClick={() => openReel(index)}>
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative">
                            <img
                      src={item.cover_image || item.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop';
                      }} />

                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            {/* Removed text overlay as per request */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white">

                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                            onSelect={(e) => {e.stopPropagation();handleUnsaveItem(item);}}
                            className="text-red-600">

                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                )}
                    </div> :
              // currentCollection refers to `collection` state, currentCollection.posts refers to `posts` state
              <div className="grid grid-cols-3 gap-3">
                      {posts.map((item, index) =>
                <div key={`collection-${item.id || index}`} className="relative group cursor-pointer" onClick={() => openReel(index)}>
                          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
                            <img
                      src={item.cover_image || item.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop';
                      }} />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            {/* Removed text overlay as per request */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white">

                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                            onSelect={(e) => {e.stopPropagation();handleUnsaveItem(item);}}
                            className="text-red-600">

                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove from collection
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                )}
                    </div>
              }
                </>
            }
            </div>
          }
        </main>

        {/* Dialogs */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Collection</DialogTitle>
              <DialogDescription>Enter a new name for your collection.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter new collection name" />

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRenameCollection}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete "{collection?.title || collection?.name}"?</DialogTitle>
              <DialogDescription className="pt-2">
                This will permanently delete this collection and all of its saved posts. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteCollection}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>);

}
