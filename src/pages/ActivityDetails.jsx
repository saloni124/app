
import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, Eye, X, Share2, Bookmark, Trash2, RotateCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ReelView = ({ activityType, allPosts, startIndex, onClose, onPostUpdate, onUserClick }) => {
  const [expandedCaptions, setExpandedCaptions] = useState({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = startIndex * window.innerHeight;
      scrollContainerRef.current.scrollTo(0, scrollPosition);
    }
  }, [startIndex]);

  const toggleCaption = (postId) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAction = (postId, action) => {
    let updatedPosts;
    switch(action) {
        case 'like':
            updatedPosts = allPosts.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p);
            break;
        case 'save':
            updatedPosts = allPosts.map(p => p.id === postId ? { ...p, saved: !p.saved } : p);
            break;
        case 'recover':
            if (window.confirm("Are you sure you want to recover this post? It will be removed from this list.")) {
                updatedPosts = allPosts.filter(p => p.id !== postId);
            } else {
                return;
            }
            break;
        case 'delete':
             if (window.confirm("This will permanently delete the post. This action cannot be undone. Are you sure?")) {
                updatedPosts = allPosts.filter(p => p.id !== postId);
            } else {
                return;
            }
            break;
        default:
            updatedPosts = allPosts;
    }
    if (onPostUpdate) {
        onPostUpdate(updatedPosts);
    }
    if ((action === 'recover' || action === 'delete') && updatedPosts.length === 0) {
        onClose();
    }
  };
  
  const calculateDaysLeft = (deletedAt) => {
      const deletedDate = new Date(deletedAt);
      const thirtyDaysLater = new Date(deletedDate.setDate(deletedDate.getDate() + 30));
      const now = new Date();
      const diffTime = thirtyDaysLater - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      <div ref={scrollContainerRef} className="h-full w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {allPosts.map((post) => {
          const isExpanded = expandedCaptions[post.id];
          const isLongCaption = post.caption && post.caption.length > 100;

          return (
            <div key={post.id} className="h-full w-full snap-start relative flex items-center justify-center">
              <img src={post.event_image} alt="Event" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />

              {activityType === 'deleted' && (
                  <div className="absolute top-20 left-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-lg text-center z-10">
                      <p className="text-white text-xs font-medium">
                          Permanently deleted in {calculateDaysLeft(post.deleted_at)} days
                      </p>
                  </div>
              )}

              <div className="absolute bottom-16 left-0 right-0 p-4 text-white z-10">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                        {post.organizer_avatar && (
                            <img src={post.organizer_avatar} alt={post.organizer_name} className="w-8 h-8 rounded-full border-2 border-white/50"/>
                        )}
                        <button onClick={() => onUserClick(post.organizer_name)} className="font-semibold text-sm drop-shadow hover:underline truncate">
                            {post.organizer_name || 'Anonymous'}
                        </button>
                    </div>
                    <h2 className="font-bold text-lg drop-shadow">{post.event_title}</h2>
                    {post.caption && (
                      <div>
                        <p className={`text-sm text-gray-200 leading-relaxed transition-all duration-300 break-words ${!isExpanded && isLongCaption ? 'line-clamp-2' : ''}`}>
                          {post.caption}
                        </p>
                        {isLongCaption && (
                          <button
                            onClick={() => toggleCaption(post.id)}
                            className="text-xs text-white/70 font-semibold"
                          >
                            {isExpanded ? 'less' : 'more'}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-white/60">
                      {activityType === 'deleted' ? 'Deleted' : 'Viewed'} on {format(new Date(post.deleted_at || post.liked_at || post.commented_at || post.viewed_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                      {activityType === 'deleted' ? (
                          <>
                              <button onClick={() => handleAction(post.id, 'recover')} className="flex flex-col items-center gap-1">
                                  <RotateCw className="w-7 h-7 text-white" />
                                  <span className="text-xs font-semibold">Recover</span>
                              </button>
                              <button onClick={() => handleAction(post.id, 'delete')} className="flex flex-col items-center gap-1">
                                  <Trash2 className="w-7 h-7 text-red-500" />
                                  <span className="text-xs font-semibold">Delete</span>
                              </button>
                          </>
                      ) : (
                          <>
                              <button onClick={() => handleAction(post.id, 'like')} className="flex flex-col items-center gap-1">
                                  <Heart className={`w-7 h-7 transition-colors ${post.liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                  <span className="text-xs font-semibold">{post.likes || 0}</span>
                              </button>
                              <button className="flex flex-col items-center gap-1">
                                  <MessageCircle className="w-7 h-7 text-white" />
                                  <span className="text-xs font-semibold">{post.comments_count || 0}</span>
                              </button>
                              <button onClick={() => handleAction(post.id, 'save')} className="flex flex-col items-center gap-1">
                                  <Bookmark className={`w-7 h-7 transition-colors ${post.saved ? 'fill-pink-500 text-pink-500' : 'text-white'}`} />
                              </button>
                              <button className="flex flex-col items-center gap-1">
                                  <Share2 className="w-7 h-7 text-white" />
                              </button>
                          </>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 left-4 bg-black/50 text-white rounded-full hover:bg-black/70"
      >
          <X className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

const mockActivityData = {
    likes: [
        {
            id: 1,
            event_title: "Rooftop Summer Vibes",
            event_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
            liked_at: "2024-01-15T14:30:00Z",
            event_id: "event_1",
            caption: "Amazing rooftop party with incredible city views! The music was perfect and the crowd was so energetic. Can't wait for the next one! 🌃✨",
            likes: 247,
            comments_count: 18,
            liked: true,
            saved: false,
            organizer_name: "Rooftop Crew",
            organizer_avatar: "https://images.unsplash.com/photo-1527422194833-b6c8f4b05537?w=60&h=60&fit=crop"
        },
        {
            id: 2,
            event_title: "Underground Art Gallery Opening",
            event_image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=800&fit=crop",
            liked_at: "2024-01-14T18:45:00Z",
            event_id: "event_2",
            caption: "The most incredible art exhibition I've seen this year. Every piece told a story and the artist was there to discuss their work.",
            likes: 156,
            comments_count: 12,
            liked: true,
            saved: true,
            organizer_name: "ArtHaus Collective",
            organizer_avatar: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=60&h=60&fit=crop"
        },
        {
            id: 3,
            event_title: "Tech Meetup & Networking",
            event_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop",
            liked_at: "2024-01-13T12:20:00Z",
            event_id: "event_3",
            caption: "Great networking event with amazing speakers from top tech companies. Made some valuable connections!",
            likes: 89,
            comments_count: 7,
            liked: true,
            saved: false,
            organizer_name: "TechHub NYC",
            organizer_avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=60&h=60&fit=crop"
        },
        {
            id: 4,
            event_title: "Jazz Night at The Blue Note",
            event_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
            liked_at: "2024-01-12T20:15:00Z",
            event_id: "event_4",
            caption: "Intimate jazz performance in a cozy venue. The saxophonist was incredible and the atmosphere was perfect for a date night.",
            likes: 198,
            comments_count: 23,
            liked: true,
            saved: true,
            organizer_name: "Brooklyn Music Co.",
            organizer_avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=60&h=60&fit=crop"
        },
        {
            id: 5,
            event_title: "Weekend Food Market",
            event_image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
            liked_at: "2024-01-11T11:30:00Z",
            event_id: "event_5",
            caption: "Fresh local produce and amazing food trucks. Found some incredible artisanal cheeses and homemade bread!",
            likes: 134,
            comments_count: 15,
            liked: true,
            saved: false,
            organizer_name: "Local Food Co.",
            organizer_avatar: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=60&h=60&fit=crop"
        },
        {
            id: 6,
            event_title: "Mindful Morning Meditation",
            event_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
            liked_at: "2024-01-10T07:45:00Z",
            event_id: "event_6",
            caption: "Starting the day with intention and mindfulness. The guided meditation was exactly what I needed for inner peace.",
            likes: 67,
            comments_count: 8,
            liked: true,
            saved: true,
            organizer_name: "Maya Patel",
            organizer_avatar: "https://images.unsplash.com/photo-1549887552-6108726ad392?w=60&h=60&fit=crop"
        }
    ],
    comments: [
        { id: 1, event_title: "Mindful Morning Meditation", event_image: "https://images.unsplash.com/photo-1591291621210-dd7e2e3c7490?w=800&h=800&fit=crop", comment_text: "This looks amazing! Can't wait to join 🧘‍♀️", commented_at: "2024-01-16T09:15:00Z", event_id: "event_4", organizer_name: "Maya Patel", organizer_avatar: "https://images.unsplash.com/photo-1549887552-6108726ad392?w=60&h=60&fit=crop" },
        { id: 2, event_title: "Rooftop Summer Vibes", event_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop", comment_text: "Will there be food available at this event?", commented_at: "2024-01-15T16:30:00Z", event_id: "event_1", organizer_name: "Rooftop Crew", organizer_avatar: "https://images.unsplash.com/photo-1527422194833-b6c8f4b05537?w=60&h=60&fit=crop" },
    ],
    viewingHistory: [
        {
            id: 1,
            event_title: "Jazz Night at The Blue Note",
            event_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T20:45:00Z",
            event_id: "event_5",
            caption: "Recently viewed: Intimate jazz performance venue with amazing live music and cozy atmosphere.",
            likes: 198,
            comments_count: 23,
            liked: false,
            saved: false,
            organizer_name: "Brooklyn Music Co.",
            organizer_avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=60&h=60&fit=crop"
        },
        {
            id: 2,
            event_title: "Weekend Food Market",
            event_image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T19:30:00Z",
            event_id: "event_6",
            caption: "Recently viewed: Local farmers market with fresh produce and artisanal food vendors.",
            likes: 134,
            comments_count: 15,
            liked: false,
            saved: false,
            organizer_name: "Local Food Co.",
            organizer_avatar: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=60&h=60&fit=crop"
        },
        {
            id: 3,
            event_title: "Rooftop Summer Vibes",
            event_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T15:20:00Z",
            event_id: "event_1",
            caption: "Recently viewed: Rooftop party with incredible city views and amazing music.",
            likes: 247,
            comments_count: 18,
            liked: false,
            saved: false,
            organizer_name: "Rooftop Crew",
            organizer_avatar: "https://images.unsplash.com/photo-1527422194833-b6c8f4b05537?w=60&h=60&fit=crop"
        },
        {
            id: 4,
            event_title: "Underground Art Gallery Opening",
            event_image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T14:10:00Z",
            event_id: "event_2",
            caption: "Recently viewed: Contemporary art exhibition featuring local and international artists.",
            likes: 156,
            comments_count: 12,
            liked: false,
            saved: false,
            organizer_name: "ArtHaus Collective",
            organizer_avatar: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=60&h=60&fit=crop"
        },
        {
            id: 5,
            event_title: "Tech Meetup & Networking",
            event_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T12:30:00Z",
            event_id: "event_3",
            caption: "Recently viewed: Professional networking event with industry leaders and innovators.",
            likes: 89,
            comments_count: 7,
            liked: false,
            saved: false,
            organizer_name: "TechHub NYC",
            organizer_avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?w=60&h=60&fit=crop"
        },
        {
            id: 6,
            event_title: "Mindful Morning Meditation",
            event_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
            viewed_at: "2024-01-16T08:45:00Z",
            event_id: "event_6",
            caption: "Recently viewed: Peaceful morning meditation session to start your day with intention.",
            likes: 67,
            comments_count: 8,
            liked: false,
            saved: false,
            organizer_name: "Maya Patel",
            organizer_avatar: "https://images.unsplash.com/photo-1549887552-6108726ad392?w=60&h=60&fit=crop"
        }
    ],
    deleted: [
        { id: 1, event_title: "Beach Bonfire Party", event_image: "https://images.unsplash.com/photo-1500989145603-8d7ef71d639e?w=800&h=800&fit=crop", deleted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), event_id: "event_deleted_1", organizer_name: "Beach Vibe Events", organizer_avatar: "https://images.unsplash.com/photo-1520409364224-63400afe26e5?w=60&h=60&fit=crop", caption: "This event was deleted by the user 5 days ago.", likes: 0, comments_count: 0, liked: false, saved: false },
        { id: 2, event_title: "Mountain Hike Adventure", event_image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=800&fit=crop", deleted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), event_id: "event_deleted_2", organizer_name: "Outdoor Explorers", organizer_avatar: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=60&h=60&fit=crop", caption: "This event was deleted by the user 12 days ago.", likes: 0, comments_count: 0, liked: false, saved: false },
    ]
};

export default function ActivityDetails() {
    const [activityData, setActivityData] = useState([]);
    const [activityType, setActivityType] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPostIndex, setSelectedPostIndex] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const loadData = async () => {
            setLoading(true);
            try {
                const user = await User.me();
                setCurrentUser(user);

                const urlParams = new URLSearchParams(window.location.search);
                const type = urlParams.get('type');
                
                if (type && mockActivityData[type]) {
                    setActivityType(type);
                    setActivityData(mockActivityData[type]);
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const openReel = (index) => {
        setSelectedPostIndex(index);
    };

    const closeReel = () => {
        setSelectedPostIndex(null);
    };

    const handlePostUpdate = (updatedPosts) => {
        setActivityData(updatedPosts);
    };

    const handleUserClick = (userName) => {
        navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(userName)}`));
    };

    const getTitle = () => {
        switch(activityType) {
            case 'likes': return 'Liked Posts';
            case 'comments': return 'Comment History';
            case 'viewingHistory': return 'Viewing History';
            case 'deleted': return 'Recently Deleted';
            default: return 'Activity';
        }
    };

    const getIcon = () => {
        switch(activityType) {
            case 'likes': return Heart;
            case 'comments': return MessageCircle;
            case 'viewingHistory': return Eye;
            case 'deleted': return Trash2;
            default: return Heart;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 md:py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link to={createPageUrl("SettingsActivity")}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">{getTitle()}</h1>
                    </div>
                </div>

                {activityData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No activity to show here.</p>
                    </div>
                ) : activityType === 'comments' ? (
                    <div className="space-y-4">
                        {activityData.map((comment, index) => (
                            <div key={comment.id} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-200">
                                <img
                                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop'}
                                    alt="Your avatar"
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{currentUser?.full_name?.split(' ')[0].toLowerCase() || 'you'}</p>
                                    <p className="text-gray-800 mt-1 whitespace-pre-wrap">{comment.comment_text}</p>
                                    <p className="text-xs text-gray-500 mt-2">{format(new Date(comment.commented_at), "MMM d, yyyy")}</p>
                                </div>
                                <button onClick={() => openReel(index)} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                    <img
                                        src={comment.event_image}
                                        alt={comment.event_title}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
                        {activityData.map((post, index) => (
                            <motion.div
                                key={post.id}
                                layoutId={`post-${post.id}`}
                                onClick={() => openReel(index)}
                                className="aspect-square bg-gray-200 cursor-pointer overflow-hidden rounded-lg group relative"
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <img src={post.event_image} alt={post.event_title} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedPostIndex !== null && (
                    <ReelView
                        activityType={activityType}
                        allPosts={activityType === 'comments' ? [activityData[selectedPostIndex]] : activityData}
                        startIndex={activityType === 'comments' ? 0 : selectedPostIndex}
                        onClose={closeReel}
                        onPostUpdate={handlePostUpdate}
                        onUserClick={handleUserClick}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
