import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bookmark, MapPin, Calendar, Share2, Heart, MessageCircle, MoreHorizontal, X, UserCheck, UserPlus, Edit3, Trash2, Users, Type, Clock, Flag, UserX, EyeOff, Sparkles, BookOpen } from 'lucide-react';
import { format, isValid } from 'date-fns';
import SceneCommentsModal from "../SceneCommentsModal";
import SaveCollectionsBottomSheet from "../collections/SaveCollectionsBottomSheet";
import { SaveToCollectionModal } from '../collections/SaveToCollectionModal';
import { User } from '@/api/entities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter } from

'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPromptDialog from "../shared/LoginPromptDialog";


const ActionButton = ({ icon: Icon, text, onClick, className }) =>
<button
  onClick={(e) => {
    e.stopPropagation();
    onClick(e);
  }}
  className={`flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300 ${className}`}>
    <Icon className="w-5 h-5 drop-shadow" />
    {text && <span className="text-[10px] font-semibold tracking-wide">{text}</span>}
  </button>;




const DropdownMenuItem = ({ children, onSelect, className = '' }) =>
<button
  onMouseDown={onSelect} // use onMouseDown to fire before blur event
  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-md transition-colors ${className}`}>
    {children}
  </button>;




const UnsavePostModal = ({ isOpen, onClose, onConfirm, postId }) => {// Added postId prop
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsave Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this post from your saved items?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(postId)}>Unsave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

};


export default function PoppinEventCard({
  event,
  currentUser,
  setCurrentUser, // Added setCurrentUser prop
  onDataChange,
  isDesktopFrame = false,
  showTicketButton = false,
  hideEventSaveButton = false,
  onShowFriends,
  onGenerateMemoryPost, // New prop
  onLoginRequired // NEW PROP
}) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEventLiked, setIsEventLiked] = useState(false);
  const [showSaveBottomSheet, setShowSaveBottomSheet] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isSaved, setIsSaved] = useState(currentUser?.saved_events?.includes(event.id) || false); // Fixed syntax error here
  const [showSaveToCollectionModal, setShowSaveToCollectionModal] = useState(false);
  const [showUnsavePostModal, setShowUnsavePostModal] = useState(false);
  const [localIsFollowing, setLocalIsFollowing] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFeatureComingSoonDialog, setShowFeatureComingSoonDialog] = useState(false); // New state for the generic "coming soon" dialog
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState("continue");

  // Touch swipe state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const videoRef = useRef(null);
  const cardRef = useRef(null);
  // Removed dropdownRef

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  useEffect(() => {
    setIsSaved(currentUser?.saved_events?.includes(event.id) || false);
  }, [currentUser, event.id]);

  useEffect(() => {
    if (currentUser?.followed_curator_ids && currentEvent.organizer_email) {
      setLocalIsFollowing(currentUser.followed_curator_ids.includes(currentEvent.organizer_email));
    } else {
      setLocalIsFollowing(false);
    }
  }, [currentUser, currentEvent.organizer_email]);

  // Removed useEffect for handleClickOutside as the new modal handles it differently.

  // Updated isScenePost to include 'memory-post' as an entry post type.
  const isScenePost = useMemo(() => {
    return ['vibe-post', 'vibe-post-seed', 'profile-entries-seed', 'memory-post'].includes(currentEvent.source);
  }, [currentEvent.source]);

  const isVibePostSaved = useMemo(() => {
    if (!isScenePost || !currentUser?.saved_posts) return false;
    return Object.values(currentUser.saved_posts).some((posts) =>
    Array.isArray(posts) && posts.includes(currentEvent.id)
    );
  }, [isScenePost, currentEvent.id, currentUser?.saved_posts]);

  const allImages = useMemo(() => {
    const mediaImages = (currentEvent.media || []).filter((m) => m && m.type === 'image').map((m) => m.url);
    const gallery = currentEvent.gallery_images || [];
    // Prioritize media, then cover image, then gallery
    return [currentEvent.cover_image, ...mediaImages, ...gallery].filter(Boolean);
  }, [currentEvent]);

  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentEvent.id]);

  useEffect(() => {
    // Only add overflow-hidden for comments modal or delete confirm, not "coming soon" dialog
    if (showCommentsModal || showDeleteConfirm || isMoreMenuOpen) {// Added isMoreMenuOpen here
      document.body.classList.add('overflow-hidden');
      document.body.classList.add('comments-modal-open');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.body.classList.remove('comments-modal-open');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.body.classList.remove('comments-modal-open');
    };
  }, [showCommentsModal, showDeleteConfirm, isMoreMenuOpen]); // Added isMoreMenuOpen to dependencies

  const nextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const previousImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    // Only navigate if there are multiple images
    if (hasMultipleImages) {
      if (distance > minSwipeDistance && currentImageIndex < allImages.length - 1) {// Left swipe
        e.stopPropagation();
        e.preventDefault();
        setCurrentImageIndex((prev) => prev + 1);
      } else if (distance < -minSwipeDistance && currentImageIndex > 0) {// Right swipe
        e.stopPropagation();
        e.preventDefault();
        setCurrentImageIndex((prev) => prev - 1);
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const is222Promo = currentEvent.organizer_name === "222 Events" && currentEvent.is_promotional;
  const finalIsSaved = isScenePost ? isVibePostSaved : isSaved;

  const eventLink = isScenePost ?
  createPageUrl(`VibeReel?organizer_email=${encodeURIComponent(currentEvent.organizer_email)}&index=0`) :
  is222Promo ?
  createPageUrl(`CuratorProfile?curator=${encodeURIComponent(currentEvent.organizer_email)}`) :
  createPageUrl(`EventDetails?id=${currentEvent.id}`);

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Check if user is logged in
    if (!currentUser) {
      if (onLoginRequired) {
        onLoginRequired("save events");
      } else {
        setLoginPromptAction("save events");
        setShowLoginPrompt(true);
      }
      return;
    }

    // Only vibe posts go to collections - regular events save normally
    if (isScenePost) {
      setShowSaveBottomSheet(true);
      return;
    }

    // Immediately update UI state
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      let updatedSavedEvents = [...(currentUser.saved_events || [])];
      if (newSavedState) {
        updatedSavedEvents.push(event.id);
      } else {
        updatedSavedEvents = updatedSavedEvents.filter((id) => id !== event.id);
      }
      await User.updateMyUserData({ saved_events: updatedSavedEvents });

      // Update local currentUser state to prevent refresh
      if (setCurrentUser) {
        setCurrentUser((prev) => ({
          ...prev,
          saved_events: updatedSavedEvents
        }));
      }
      // DON'T call onDataChange - it causes refresh
    } catch (error) {
      console.error("Failed to update saved events:", error);
      setIsSaved(!newSavedState);
    }
  };

  // Modified handleConfirmUnsave to accept postId
  const handleConfirmUnsave = async (postId) => {
    if (!currentUser) {
      console.warn("User not logged in, cannot unsave event.");
      return;
    }

    const newSavedState = false;
    setIsSaved(newSavedState);
    setShowUnsavePostModal(false);

    try {
      let updatedSavedEvents = (currentUser.saved_events || []).filter((id) => id !== postId);
      await User.updateMyUserData({ saved_events: updatedSavedEvents });

      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Failed to update saved events:", error);
      setIsSaved(true); // Revert UI state if API fails
    }
  };


  const handleLikeClick = (e) => {
    e.stopPropagation();

    if (!currentUser) {
      if (onLoginRequired) {
        onLoginRequired("like posts");
      } else {
        setLoginPromptAction("like posts");
        setShowLoginPrompt(true);
      }
      return;
    }

    // Immediately update UI state
    setIsEventLiked((prev) => !prev);
  };

  const handleCommentsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      if (onLoginRequired) {
        onLoginRequired("comment on posts");
      } else {
        setLoginPromptAction("comment on posts");
        setShowLoginPrompt(true);
      }
      return;
    }

    setShowCommentsModal(true);
  };

  const handleAddCommentInCard = (newCommentText) => {
    if (!newCommentText.trim() || !currentUser) return;

    const comment = {
      user: currentUser?.full_name || "You",
      text: newCommentText.trim(),
      avatar: currentUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"
    };

    setCurrentEvent((prevEvent) => {
      const updatedComments = prevEvent.comments ? [...prevEvent.comments, comment] : [comment];
      return { ...prevEvent, comments: updatedComments };
    });
  };

  const handleDataChange = async () => {
    // Don't trigger data change for save operations to prevent refresh
    // Only trigger for follow/unfollow operations
    try {
      if (onDataChange) {






















        // We'll skip calling this for now to prevent refreshes
        // await onDataChange();
      }} catch (error) {console.error('Error in data change callback:', error);}};const handleFollowToggle = async (e) => {e.stopPropagation();e.preventDefault();if (!currentUser) {if (onLoginRequired) {onLoginRequired("follow curators");}return;}if (!currentEvent.organizer_email) {
      console.warn('Cannot toggle follow: organizer email is missing.');
      return;
    }

    try {
      setLocalIsFollowing((prev) => !prev);

      const freshUser = await User.me();
      const currentFollowed = new Set(freshUser.followed_curator_ids || []);

      if (localIsFollowing) {
        currentFollowed.delete(currentEvent.organizer_email);
      } else {
        currentFollowed.add(currentEvent.organizer_email);
      }

      const updatedFollowedIds = Array.from(currentFollowed);
      await User.updateMyUserData({ followed_curator_ids: updatedFollowedIds });

      window.dispatchEvent(new CustomEvent('followChanged', {
        detail: {
          curatorEmail: currentEvent.organizer_email,
          isFollowing: !localIsFollowing
        }
      }));

      console.log('Successfully updated followed_curator_ids:', updatedFollowedIds);

    } catch (error) {
      console.error('Error toggling follow:', error);
      setLocalIsFollowing((prev) => !prev);
    }
  };

  const getIconBarBottomPosition = () => {
    if (isDesktopFrame) {
      return isScenePost ? '24px' : '8px';
    }
    return '80px';
  };

  const isOwnProfile = useMemo(() => {
    return currentUser?.email === currentEvent?.organizer_email;
  }, [currentUser, currentEvent]);

  // Renamed from isOwnProfile in the outline, but functionally the same for checking post ownership
  const isOwnPost = isOwnProfile;

  const handleOrganizerClick = (e) => {
    e.stopPropagation();
    navigate(createPageUrl(`Profile?user=${encodeURIComponent(currentEvent.organizer_email)}`));
  };

  const handleShowFriendsWrapper = (e) => {
    e.stopPropagation();
    if (onShowFriends) {
      const realFriendsGoing = (currentEvent.friends_going || []).filter(
        (friend) => !friend.is_demo_user
      );
      onShowFriends(realFriendsGoing, currentEvent.title);
    }
  };

  const handleDelete = async () => {
    console.log('Confirming delete for post:', currentEvent.id);
    // Placeholder for actual API call to delete the post
    // In a real application, you'd call your backend API here
    try {
      // Example: await YourApi.deletePost(currentEvent.id);
      console.log(`Post with ID ${currentEvent.id} deleted (mock action).`);
      setShowDeleteConfirm(false);
      // After successful deletion, you might want to refresh data or navigate away
      if (onDataChange) {
        onDataChange(); // Notify parent to refresh data
      }
      navigate('/'); // Example: navigate to home page after deletion
    } catch (error) {
      console.error('Failed to delete post:', error);
      setShowDeleteConfirm(false); // Close modal even if delete fails
    }
  };

  // Robust date/timestamp formatting
  const getRelativeTime = () => {
    // For scene posts, use timestamp field
    if (isScenePost) {
      const timestamp = currentEvent.timestamp || currentEvent.date || currentEvent.created_date;
      if (!timestamp) return null;

      const dateObj = new Date(timestamp);
      if (!isValid(dateObj)) return null;

      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return format(dateObj, 'MMM d, yyyy');
    }

    // For regular events - show date AND time with comma separator
    const eventDateStr = currentEvent.date || currentEvent.start_date;
    if (!eventDateStr) return null;

    const eventDate = new Date(eventDateStr);
    if (!isValid(eventDate)) return null;

    const now = new Date();

    const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const daysDifference = Math.round((eventDayStart - todayDayStart) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) return `Today, ${format(eventDate, 'h:mm a')}`;
    if (daysDifference === 1) return `Tomorrow, ${format(eventDate, 'h:mm a')}`;
    if (daysDifference > 1 && daysDifference <= 7) return `${format(eventDate, 'EEEE')}, ${format(eventDate, 'h:mm a')}`;
    return `${format(eventDate, 'MMM d')}, ${format(eventDate, 'h:mm a')}`;
  };

  const mediaType = useMemo(() => {
    if (event.media && event.media.length > 0) {
      const firstMedia = event.media[0];
      if (firstMedia.type === 'video' && firstMedia.url) {
        return 'video';
      }
    }
    return 'image';
  }, [event.media]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // handleMoreClick is no longer used directly to toggle, just opens the modal
  // const handleMoreClick = (e) => {
  //   e.stopPropagation();
  //   setIsMoreMenuOpen((prev) => !prev);
  // };

  const isPastEvent = useMemo(() => {
    if (!currentEvent.date) return false;
    return new Date(currentEvent.date) < new Date();
  }, [currentEvent.date]);

  // Check if current user is the host
  const isCurrentUserHost = currentUser?.email === currentEvent.organizer_email;

  const displayDate = getRelativeTime();

  const handleMoreOptionsClick = (e) => {
    e.stopPropagation();
    // Don't require login to open more menu - only specific actions inside will require it
    setIsMoreMenuOpen(true);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    // Share functionality can work without login
    console.log('Share feature triggered!');
    // TODO: Implement native share API
  };


  // Content for OWNED posts
  const ownedPostOptions =
  <>
      {(() => {
      const isEntry = currentEvent.source === 'memory-post' || currentEvent.source === 'vibe-post-seed' || currentEvent.source === 'vibe-post';
      const canEditEvent = (!isPastEvent || currentEvent.status === 'draft') && !isEntry;

      if (isEntry) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreMenuOpen(false);
              setShowFeatureComingSoonDialog(true);
            }}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
              <Edit3 className="w-5 h-5" />
              <span className="text-sm font-medium">Edit Post</span>
            </button>);

      }

      if (canEditEvent) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = createPageUrl(`CreateEvent?edit=${currentEvent.id}`);
            }}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
              <Edit3 className="w-5 h-5" />
              <span className="text-sm font-medium">Edit Event</span>
            </button>);

      }
      return null;
    })()}

      {(() => {
      const isEntry = currentEvent.source === 'memory-post' || currentEvent.source === 'vibe-post-seed' || currentEvent.source === 'vibe-post';
      return isPastEvent && !isEntry && onGenerateMemoryPost &&
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMoreMenuOpen(false);
          onGenerateMemoryPost(currentEvent);
        }}
        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Generate Memory Post</span>
          </button>;

    })()}

      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowDeleteConfirm(true);
      }}
      className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/10 transition-colors flex items-center gap-3">
        <Trash2 className="w-5 h-5" />
        <span className="text-sm font-medium">Delete Post</span>
      </button>

      <div className="h-px my-1 bg-white/20"></div>

      {/* Global options, previously outside specific conditional blocks */}
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Hide Comments</span>
      </button>
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
        <Heart className="w-5 h-5" />
        <span className="text-sm font-medium">Hide Likes</span>
      </button>
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">Hide Shares</span>
      </button>

      <div className="h-px my-1 bg-white/20"></div>

      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
        <Type className="w-5 h-5" />
        <span className="text-sm font-medium">Subtitles</span>
      </button>
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Playback Speed</span>
      </button>
    </>;



  // Content for NON-OWNED posts (from outline)
  const nonOwnedPostOptions =
  <>
      <button
      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white"
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        if (!currentUser) {
          if (onLoginRequired) {
            onLoginRequired("add to album");
          } else {
            setLoginPromptAction("add to album");
            setShowLoginPrompt(true);
          }
          return;
        }
        setShowFeatureComingSoonDialog(true);
      }}>
        <BookOpen className="w-4 h-4" />
        Add to Album
      </button>
      <button
      className="text-red-500 px-4 py-2 text-sm text-left w-full hover:bg-white/10 flex items-center gap-2"
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        // Check login for report
        if (!currentUser) {
          if (onLoginRequired) {
            onLoginRequired("report content");
          } else {
            setLoginPromptAction("report content");
            setShowLoginPrompt(true);
          }
          return;
        }
        setShowFeatureComingSoonDialog(true);
      }}>
        <Flag className="w-4 h-4" />
        Report
      </button>
      <button
      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white"
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        // Check login for block
        if (!currentUser) {
          if (onLoginRequired) {
            onLoginRequired("block users");
          } else {
            setLoginPromptAction("block users");
            setShowLoginPrompt(true);
          }
          return;
        }
        setShowFeatureComingSoonDialog(true);
      }}>
        <UserX className="w-4 h-4" />
        Block
      </button>
      <button
      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white"
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        // Check login for see less
        if (!currentUser) {
          if (onLoginRequired) {
            onLoginRequired("customize your feed");
          } else {
            setLoginPromptAction("customize your feed");
            setShowLoginPrompt(true);
          }
          return;
        }
        setShowFeatureComingSoonDialog(true);
      }}>
        <EyeOff className="w-4 h-4" />
        See less of this
      </button>
      <div className="h-px my-1 bg-white/20"></div>
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white">
        <Type className="w-4 h-4" />
        Subtitles
      </button>
      <button
      onClick={(e) => {
        e.stopPropagation();
        setIsMoreMenuOpen(false);
        setShowFeatureComingSoonDialog(true);
      }}
      className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-white">
        <Clock className="w-4 h-4" />
        Playback Speed
      </button>
    </>;





  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full flex flex-col transition-all duration-300 bg-black ${!isDesktopFrame ? '' : 'rounded-2xl overflow-hidden'}`}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}>

      <LoginPromptDialog
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction} />


      {/* Image/Video Background */}
      <div className="absolute inset-0 w-full h-full" style={{ overflow: 'hidden' }}>
        {mediaType === "video" ?
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          src={event.media?.[0]?.url || "https://videos.pexels.com/video-files/7579446/7579446-hd_1080_1920_25fps.mp4"}
          autoPlay
          loop
          muted
          playsInline
          onClick={togglePlayPause} /> :


        <div
          className="w-full h-full relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>

            <img
            src={allImages[currentImageIndex]}
            alt={event.title || "Event image"}
            className="w-full h-full object-cover"
            style={{ maxWidth: '100%', maxHeight: '100%' }} />

          </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
      </div>


      {/* Navigation buttons for multiple images - LOWEST Z-INDEX */}
      {hasMultipleImages && mediaType !== "video" &&
      <>
          {/* Left button - covers left half completely */}
          <button
          className={`absolute left-0 bg-transparent ${isDesktopFrame ? 'inset-y-0' : 'top-0 bottom-14'}`}
          style={{
            zIndex: 20,
            pointerEvents: 'auto',
            width: '50%'
          }}
          onClick={previousImage}
          aria-label="Previous image" />

          {/* Right button - covers right half completely */}
          <button
          className={`absolute right-0 bg-transparent ${isDesktopFrame ? 'inset-y-0' : 'top-0 bottom-14'}`}
          style={{
            zIndex: 20,
            pointerEvents: 'auto',
            width: '50%'
          }}
          onClick={nextImage}
          aria-label="Next image" />

        </>
      }

      <div className="relative z-[100] flex flex-col h-full p-4 text-white" style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div className="flex-grow" style={{ pointerEvents: 'none' }}></div>

        <div className="flex justify-between items-end gap-3 md:pb-2" style={{ pointerEvents: 'none', paddingBottom: '60px' }}>
          <div className="mr-10 py-1 flex-1 space-y-0 min-w-0 relative" style={{ pointerEvents: 'none' }}>
            {hasMultipleImages &&
            <div className="flex justify-start items-center gap-1.5 mb-2 pointer-events-none">
                {allImages.map((_, index) =>
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-4 bg-white/90' : 'w-1.5 bg-white/50'}`} />

              )}
              </div>
            }

            {/* FIXED: Only show Friends Going if user is logged in */}
            {!isScenePost && currentUser && currentEvent.privacy_level !== 'private' && currentEvent.friends_going && currentEvent.friends_going.length > 0 && (() => {
              const realFriendsGoing = currentEvent.friends_going.filter(
                (friend) => !friend.is_demo_user
              );
              if (realFriendsGoing.length === 0) return null;

              return (
                <button
                  onClick={handleShowFriendsWrapper}
                  className="block group mb-1 transition-opacity active:opacity-70 text-left w-full p-0 border-none bg-transparent relative"
                  style={{ pointerEvents: 'auto', zIndex: 150 }}>
                  <div className="flex items-center gap-2 text-xs text-white/90 group-hover:text-white transition-colors">
                    <div className="flex -space-x-2">
                      {realFriendsGoing.slice(0, 3).map((friend, index) =>
                      <img key={index} src={friend.avatar} alt={friend.name} className="w-5 h-5 rounded-full ring-2 ring-white/20 object-cover" />
                      )}
                    </div>
                    <p className="drop-shadow-md group-hover:underline decoration-white/50 decoration-1 underline-offset-2">
                      {realFriendsGoing.length} {realFriendsGoing.length > 1 ? 'people' : 'person'} going
                    </p>
                  </div>
                </button>);

            })()}

            <button
              onClick={handleOrganizerClick}
              className="relative flex items-center gap-2 group hover:bg-black/30 rounded-full px-2 py-1 -mx-2 -my-1 transition-all duration-200 w-fit"
              style={{ pointerEvents: 'auto', zIndex: 150 }}>

              {currentEvent.organizer_avatar &&
              <img src={currentEvent.organizer_avatar} className="w-5 h-5 rounded-full object-cover drop-shadow-sm" />
              }
              <span className="text-white text-sm font-semibold underline-offset-2 drop-shadow-md group-hover:underline decoration-white/50 decoration-1 group-hover:text-blue-200 transition-all duration-200">
                {currentEvent.organizer_name || 'Organizer'}
              </span>
            </button>

            {/* ONLY show event details for actual events, NOT for entry posts */}
            {!isScenePost &&
            <>
                <div className="py-1 flex flex-wrap gap-1" style={{ pointerEvents: 'none' }}>
                  {/* Sponsored badge */}
                  {currentEvent.is_promotional &&
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-gray-900/80 border-gray-700/50 text-gray-200">
                      Sponsored
                    </div>
                }
                  {currentEvent.price !== undefined && currentEvent.price !== null &&
                <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-normal border bg-black/60 backdrop-blur-sm text-white border-white/30">
                      {currentEvent.price > 0 ? `$${currentEvent.price}` : "Free"}
                    </div>
                }
                  {currentEvent.scene_tags?.map((tag) =>
                <div key={tag} className="bg-black/60 backdrop-blur-sm text-white text-xs font-normal px-1.5 py-0.5 rounded-full border border-white/30">
                      {tag}
                    </div>
                )}
                </div>

                <h2 className="text-sm font-semibold leading-tight break-words relative" style={{ pointerEvents: 'none' }}>
                  {currentEvent.title}
                </h2>
              </>
            }

            {/* Title for Scene Posts */}
            {isScenePost &&
            <h2 className="pt-1 pb-1 text-sm font-normal leading-tight break-words relative" style={{ pointerEvents: 'none' }}>
                {currentEvent.title}
              </h2>
            }

            <div style={{ pointerEvents: 'none' }}>
              <p
                className={`font-sans text-xs text-gray-200 leading-relaxed transition-all duration-300 relative ${!isDescriptionExpanded && currentEvent.description?.length > 100 ? 'line-clamp-2' : ''}`}>
                {currentEvent.description}
              </p>
              {currentEvent.description?.length > 100 &&
              <button
                onClick={(e) => {e.stopPropagation();setIsDescriptionExpanded(!isDescriptionExpanded);}}
                className="text-xs text-white/70 font-semibold mt-1 relative"
                style={{ pointerEvents: 'auto', zIndex: 150 }}>
                  {isDescriptionExpanded ? 'less' : 'more'}
                </button>
              }
            </div>

            {/* Date and location - always show for ALL posts */}
            <div className="font-mono text-xs text-gray-300 mt-0.5 mb-2 relative" style={{ pointerEvents: 'none' }}>
              <div className="flex items-center gap-2" style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}>

                {displayDate &&
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{displayDate}</span>
                  </div>
                }

                {displayDate && (currentEvent.privacy_level === 'private' && !isCurrentUserHost || currentEvent.location) &&
                <span className="text-gray-500 flex-shrink-0">•</span>
                }

                {/* Location */}
                {currentEvent.privacy_level === 'private' && !isCurrentUserHost ?
                <div className="flex items-center gap-1 flex-shrink-0">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>Private Location</span>
                  </div> :
                currentEvent.location ?
                <div className="flex items-center gap-1 flex-shrink-0">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{currentEvent.location}</span>
                    </div> :
                null}
              </div>
            </div>


            {(showTicketButton === undefined || showTicketButton) && !isScenePost &&
            <Link to={eventLink} className="block relative" onClick={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto', zIndex: 150 }}>
                <div className="bg-gradient-to-r mt-2 mb-0 pt-1 pr-1 pb-1 pl-1 font-bold text-center rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm border border-white/30 from-cyan-500 to-blue-600">

                  <span className="text-sm">
                    {isPastEvent ? 'View Info' : 'Tickets/Info'}
                  </span>
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            }
          </div>

          <div className="bg-transparent pt-2 pb-2 pl-1 rounded-xl flex-shrink-0 flex flex-col backdrop-blur-sm gap-2 border border-white/30"
          style={{
            width: '47px', // Changed from 48px to 47px
            position: 'absolute',
            right: '8px',
            bottom: getIconBarBottomPosition(),
            zIndex: 250,
            overflow: 'visible',
            pointerEvents: 'auto'
          }}>

            <button
              onClick={handleMoreOptionsClick}
              className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300 active:opacity-70"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 251 }}>
              <MoreHorizontal className="w-5 h-5 drop-shadow" />
              <span className="text-[10px] font-semibold tracking-wide">More</span>
            </button>

            <button
              onClick={handleLikeClick}
              className="flex flex-col items-center gap-0.5 text-center w-full transition-colors hover:text-gray-300 active:opacity-70"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 251 }}>
              <Heart className={`w-5 h-5 drop-shadow ${isEventLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
              <span className={`text-[10px] font-semibold tracking-wide ${isEventLiked ? "text-red-500" : "text-white"}`}>
                {isScenePost ? currentEvent.likes || 'Like' : isEventLiked ? "Liked" : "Like"}
              </span>
            </button>

            <button
              onClick={handleCommentsClick}
              className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300 active:opacity-70"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 251 }}>
              <MessageCircle className="w-5 h-5 drop-shadow" />
              <span className="text-[10px] font-semibold tracking-wide">
                {currentEvent.comments?.length || 0}
              </span>
            </button>

            {!hideEventSaveButton &&
            <button
              onClick={handleSaveClick}
              className="flex flex-col items-center gap-0.5 text-center w-full transition-colors hover:text-gray-300 active:opacity-70"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 251 }}>
                <Bookmark className={`w-5 h-5 drop-shadow ${finalIsSaved ? "fill-pink-500 text-pink-500" : "text-white"}`} />
                <span className={`text-[10px] font-semibold tracking-wide ${finalIsSaved ? "text-pink-500" : "text-white"}`}>
                  {finalIsSaved ? "Saved" : "Save"}
                </span>
              </button>
            }

            <button
              onClick={handleShareClick}
              className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300 active:opacity-70"
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 251 }}>
              <Share2 className="w-5 h-5 drop-shadow" />
              <span className="text-[10px] font-semibold tracking-wide">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Only show the full-card navigation overlay if there's a single image - FIXED HEIGHT */}
      {!isOwnProfile && isScenePost && !hasMultipleImages &&
      <div
        className={`absolute cursor-pointer ${isDesktopFrame ? 'inset-0' : 'inset-x-0 top-0 bottom-14'}`}
        style={{ zIndex: 10 }}
        onClick={(e) => {
          e.stopPropagation();
          navigate(createPageUrl(`VibeReel?organizer_email=${encodeURIComponent(event.organizer_email)}&index=0`));
        }} />
      }


      {/* More Menu Bottom Sheet Modal */}
      <AnimatePresence>
        {isMoreMenuOpen &&
        <>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreMenuOpen(false);
            }} />


            <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md rounded-t-3xl z-[201] overflow-hidden md:w-[375px] md:max-w-[375px] md:rounded-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2"
            onClick={(e) => e.stopPropagation()}>

              <div className="flex flex-col">
                {/* Header */}
                <div className="pt-1 pr-4 pb-1 pl-4 flex-shrink-0 border-b border-white/10">
                  <div className="flex justify-center py-3 md:hidden">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-white font-semibold text-lg">Options</h3>
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMoreMenuOpen(false);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors">

                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4 py-2">
                  {isOwnPost ? ownedPostOptions : nonOwnedPostOptions}
                </div>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>


      {showSaveBottomSheet &&
      <SaveCollectionsBottomSheet
        isOpen={showSaveBottomSheet}
        onClose={() => setShowSaveBottomSheet(false)}
        postData={currentEvent}
        currentUser={currentUser}
        onDataChange={null} />
      }

      {/* SceneCommentsModal */}
      {showCommentsModal &&
      <SceneCommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        postId={currentEvent.id}
        postTitle={currentEvent.title}
        postImage={currentEvent.cover_image}
        currentUser={currentUser}
        organizerEmail={currentEvent.organizer_email} />

      }

      {/* Save to Collection Modal */}
      {showSaveToCollectionModal &&
      <SaveToCollectionModal
        isOpen={showSaveToCollectionModal}
        onClose={() => setShowSaveToCollectionModal(false)}
        postId={currentEvent.id}
        postData={{
          id: currentEvent.id,
          title: currentEvent.title,
          cover_image: currentEvent.cover_image,
          organizer_name: currentEvent.organizer_name,
          date: currentEvent.date,
          location: currentEvent.location,
          price: currentEvent.price
        }} />

      }

      {/* Unsave Post Modal */}
      {showUnsavePostModal &&
      <UnsavePostModal
        isOpen={showUnsavePostModal}
        onClose={() => setShowUnsavePostModal(false)}
        onConfirm={handleConfirmUnsave} // Pass the function to the modal
        postId={currentEvent.id} // Pass postId to the modal
      />
      }

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm &&
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-md z-[150]">
            <DialogHeader>
              <DialogTitle>Delete Post?</DialogTitle>
              <DialogDescription>
                This will permanently delete this post. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="bg-background mt-2 pt-2 pr-4 pb-2 pl-4 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }

      {/* Feature Coming Soon Dialog */}
      {showFeatureComingSoonDialog &&
      <Dialog open={showFeatureComingSoonDialog} onOpenChange={setShowFeatureComingSoonDialog}>
          <DialogContent className="sm:max-w-md z-[150]">
            <DialogHeader>
              <DialogTitle>Feature Coming Soon</DialogTitle>
              <DialogDescription>
                This feature is currently under development and will be available soon.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowFeatureComingSoonDialog(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }

    </div>);

}