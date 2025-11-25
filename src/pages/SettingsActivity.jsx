
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Heart, MessageCircle, Eye, Trash2, Download, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function SettingsActivity() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState({
    likes: [],
    comments: [],
    viewingHistory: [],
    deleted: [] // Add state for deleted items
  });
  const navigate = useNavigate();

  // Mock activity data - in a real app, this would come from your backend
  const mockActivityData = {
    likes: [
    {
      id: 1,
      event_title: "Rooftop Summer Vibes",
      event_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop",
      liked_at: "2024-01-15T14:30:00Z",
      event_id: "event_1"
    },
    {
      id: 2,
      event_title: "Underground Art Gallery Opening",
      event_image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=80&h=80&fit=crop",
      liked_at: "2024-01-14T18:45:00Z",
      event_id: "event_2"
    },
    {
      id: 3,
      event_title: "Tech Meetup & Networking",
      event_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=80&h=80&fit=crop",
      liked_at: "2024-01-13T12:20:00Z",
      event_id: "event_3"
    }],

    comments: [
    {
      id: 1,
      event_title: "Mindful Morning Meditation",
      comment_text: "This looks amazing! Can't wait to join 🧘‍♀️",
      commented_at: "2024-01-16T09:15:00Z",
      event_id: "event_4"
    },
    {
      id: 2,
      event_title: "Rooftop Summer Vibes",
      comment_text: "Will there be food available at this event?",
      commented_at: "2024-01-15T16:30:00Z",
      event_id: "event_1"
    }],

    viewingHistory: [
    {
      id: 1,
      event_title: "Jazz Night at The Blue Note",
      event_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop",
      viewed_at: "2024-01-16T20:45:00Z",
      event_id: "event_5"
    },
    {
      id: 2,
      event_title: "Weekend Food Market",
      event_image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop",
      viewed_at: "2024-01-16T19:30:00Z",
      event_id: "event_6"
    },
    {
      id: 3,
      event_title: "Rooftop Summer Vibes",
      event_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop",
      viewed_at: "2024-01-16T15:20:00Z",
      event_id: "event_1"
    }],

    deleted: [
    {
      id: 1,
      event_title: "Beach Bonfire Party",
      event_image: "https://images.unsplash.com/photo-1500989145603-8d7ef71d639e?w=400&h=400&fit=crop",
      deleted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      event_id: "event_deleted_1",
      organizer_name: "Beach Vibe Events",
      organizer_avatar: "https://images.unsplash.com/photo-1520409364224-63400afe26e5?w=60&h=60&fit=crop"
    },
    {
      id: 2,
      event_title: "Mountain Hike Adventure",
      event_image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop",
      deleted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
      event_id: "event_deleted_2",
      organizer_name: "Outdoor Explorers",
      organizer_avatar: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=60&h=60&fit=crop"
    }]

  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Set mock activity data
      setActivityData(mockActivityData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = async (type, enabled) => {
    try {
      const updatedPreferences = {
        ...currentUser.activity_tracking_preferences,
        [type]: enabled
      };

      await User.updateMyUserData({
        activity_tracking_preferences: updatedPreferences
      });

      setCurrentUser((prev) => ({
        ...prev,
        activity_tracking_preferences: updatedPreferences
      }));
    } catch (error) {
      console.error("Error updating activity preferences:", error);
    }
  };

  const handleClearActivity = (type) => {
    if (window.confirm(`Are you sure you want to clear all ${type.replace('_', ' ')}? This action cannot be undone.`)) {
      setActivityData((prev) => ({
        ...prev,
        [type]: []
      }));
      // In a real app, you would make an API call here to clear the data
    }
  };

  const handleDownloadActivity = (type) => {
    const data = activityData[type];
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_activity_${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>);

  }

  const renderActivitySection = (type, data, icon, title, description) => {
    const isEnabled = type === 'deleted' ? true : currentUser?.activity_tracking_preferences?.[`track_${type}`] ?? true;

    const getViewLinkText = () => {
      switch (type) {
        case 'likes':return 'View All Liked Posts';
        case 'comments':return 'View All Comments';
        case 'viewingHistory':return 'View Full History';
        case 'deleted':return 'View Recently Deleted';
        default:return 'View All Activity';
      }
    };

    return (
      <div className="bg-white mt-4 p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {React.createElement(icon, { className: `w-5 h-5 text-gray-500` })}
                        <div>
                            <h3 className="font-semibold">{title}</h3>
                            <p className="text-sm text-gray-500">{description}</p>
                        </div>
                    </div>
                    {type !== 'deleted' &&
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => handleActivityToggle(`track_${type}`, checked)} />

          }
                </div>

                {isEnabled ?
        <div className="mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{data.length} items</span>
                            {type !== 'deleted' &&
            <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleDownloadActivity(type)} className="text-xs">
                                        <Download className="w-3 h-3 mr-1" /> Export
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleClearActivity(type)} className="text-xs text-red-600 hover:text-red-700">
                                        <Trash2 className="w-3 h-3 mr-1" /> Clear All
                                    </Button>
                                </div>
            }
                        </div>
                        
                        {data.length > 0 ?
          <div className="text-center py-2">
                                <Link
              to={createPageUrl(`ActivityDetails?type=${type}`)}
              className="text-blue-600 hover:text-blue-800 font-medium underline">

                                    {getViewLinkText()}
                                </Link>
                            </div> :

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-500 text-sm">No items found.</p>
                            </div>
          }
                    </div> :

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-500 text-sm">Activity tracking is disabled for this category.</p>
                    </div>
        }
            </div>);

  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
                    <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900">

                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6" />
                        Your Activity
                    </h1>
                </div>

                <div className="space-y-4 px-4">
                    {renderActivitySection('likes', activityData.likes, Heart, 'Likes', 'Events and posts you\'ve liked')}
                    {renderActivitySection('comments', activityData.comments, MessageCircle, 'Comments', 'Comments you\'ve posted on')}
                    {renderActivitySection('viewingHistory', activityData.viewingHistory, Eye, 'Viewing History', 'Events and posts you\'ve viewed')}
                    {renderActivitySection('deleted', activityData.deleted, Trash2, 'Recently Deleted', 'Items will be permanently deleted after 30 days')}

                    {/* Privacy Notice - Redesigned as subtle text */}
                    <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 px-4">
                        <p className="text-sm text-gray-500 text-center">
                            Your activity data is private and only visible to you. We use this information to improve your experience and provide personalized recommendations.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>);

}