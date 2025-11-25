import React, { useState, useEffect, useRef, useCallback } from "react";
import { Event } from "@/api/entities";
import { EventAttendance as EventAttendanceEntity } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { EventReview as EventReviewEntity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Bookmark,
  Share2,
  Lock,
  Users,
  ArrowLeft,
  Info,
  Ticket,
  ExternalLink,
  Clock,
  Star,
  Loader2,
  Check,
  DollarSign,
  Sparkles,
  Wand2,
  Paintbrush,
  X,
  Pencil,
  Trash2,
  MessageCircle,
  Camera,
  Upload,
  CheckCircle,
  CalendarPlus,
  ChevronLeft,
  ShieldCheck,
  Tag,
  User as UserIcon,
  MoreHorizontal
} from "lucide-react";
import { format, isSameDay, isSameYear } from "date-fns";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UploadFile } from "@/api/integrations";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

// Component imports
import EventInfo from "../components/event/EventInfo";
import PhotoGallery from "../components/event/PhotoGallery";
import TicketPurchase from "../components/event/TicketPurchase";
import RequestToJoinModal from "../components/event/RequestToJoinModal";
import FriendsGoingModal from "../components/event/FriendsGoingModal";
import EventChatBoard from "../components/event/EventChatBoard";
import ReviewSection from "../components/event/ReviewSection";
import LocationSection from "../components/event/LocationSection";
import MoreFromOrganizer from '../components/event/MoreFromOrganizer';
import RsvpModal from '../components/event/RsvpModal';
import CancelMessageDialog from '../components/shared/CancelMessageDialog';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoginPromptDialog from '../components/shared/LoginPromptDialog'; // New import

// New: apiCache definition
const apiCache = {
  cache: new Map(), // Stores { value, expiry }
  requestTimestamps: new Map(), // Stores last request time for a key
  ongoingRequests: new Map(), // Stores Promises for ongoing requests

  cacheDuration: 5 * 60 * 1000, // 5 minutes
  throttleDuration: 500, // 500 ms between requests for the same key

  get(key) {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.value;
    }
    this.cache.delete(key); // Clear expired entry
    return undefined;
  },

  set(key, value, duration = this.cacheDuration) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + duration
    });
  },

  async throttledRequest(key, requestFn) {
    // 1. Check ongoing requests
    if (this.ongoingRequests.has(key)) {
      return this.ongoingRequests.get(key);
    }

    // 2. Check cache
    const cachedData = this.get(key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    // 3. Check last request timestamp (client-side throttling)
    const lastRequestTime = this.requestTimestamps.get(key);
    if (lastRequestTime && Date.now() - lastRequestTime < this.throttleDuration) {
      const timeToWait = this.throttleDuration - (Date.now() - lastRequestTime);
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    // 4. Execute request
    const requestPromise = requestFn();
    this.ongoingRequests.set(key, requestPromise);
    this.requestTimestamps.set(key, Date.now()); // Record request initiation time

    try {
      const data = await requestPromise;
      this.set(key, data); // Cache the successful response
      return data;
    } catch (error) {
      // If the API call fails, clear related cache and ongoing request flag
      this.cache.delete(key); // Don't cache errors
      throw error;
    } finally {
      this.ongoingRequests.delete(key);
    }
  },

  // Utility to clear specific cache entries on successful writes/updates
  invalidate(key) {
    this.cache.delete(key);
    this.requestTimestamps.delete(key); // Also clear timestamp to allow immediate re-fetch
  },

  // Invalidate all keys related to a specific event ID (e.g., after an update)
  invalidateEventRelated(eventId) {
    const keysToInvalidate = Array.from(this.cache.keys()).filter((key) => key.includes(eventId));
    keysToInvalidate.forEach((key) => this.invalidate(key));
    // Also invalidate current user cache potentially, if user-specific event lists are affected
    this.invalidate('current-user');
  }
};


// Use entities directly
const User = UserEntity;
const EventAttendance = EventAttendanceEntity;
const EventReview = EventReviewEntity;

const allDummyEvents = [
  { id: 'dummy_event_1', title: 'Singles Mixer', date: '2027-08-15T18:00:00.000Z', venue_name: 'The Social Club', cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop', organizer_name: 'Thursday Dating', description: 'Meet other singles in a fun and relaxed atmosphere.', price: 25, category: 'social', location: 'London, UK', privacy_level: 'public', gallery_images: [], gallery_metadata: [], status: 'active' },
  { id: 'dummy_event_2', title: 'Rooftop Party', date: '2027-08-22T20:00:00.000Z', venue_name: 'The Rooftop Bar', cover_image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=600&fit=crop', organizer_name: 'Thursday Dating', description: 'Enjoy cocktails and music with a view.', price: 30, category: 'nightlife', location: 'London, UK', privacy_level: 'public', gallery_images: [], gallery_metadata: [], status: 'active' },
  { id: 'past_event_1', title: 'Historical Walking Tour', date: '2024-12-15T14:00:00Z', location: 'Downtown Historic District', venue_name: 'City History Tours', organizer_name: 'City History Tours', organizer_email: 'city.history@example.com', description: 'A fascinating tour of the city\'s most historic landmarks and hidden secrets.', cover_image: 'https://images.unsplash.com/photo-1541892212-85994a4c0363?w=800&h=600&fit=crop', price: 20, category: 'culture', privacy_level: 'public', gallery_images: [], gallery_metadata: [], status: 'active' }
];


const findDummyEventById = (id) => allDummyEvents.find((event) => event.id === id);

// New: simulatedDataManager definition
const simulatedDataManager = {
  isAdminMode: () => localStorage.getItem('bypass_mode') === 'admin',
  isTemporaryDemoMode: () => localStorage.getItem('bypass_mode') === 'demo'
};

export default function EventDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [backUrl, setBackUrl] = useState(null);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [goingAttendeesCount, setGoingAttendeesCount] = useState(6);
  const [maybeAttendeesCount, setMaybeAttendeesCount] = useState(4);
  const [attendees, setAttendees] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [mapPreference, setMapPreference] = useState('google');
  const [error, setError] = useState("");
  const [showPrettyModal, setShowPrettyModal] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: "",
    liked: true,
    vibe_tags: "",
    would_recommend: true
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  // Replaced isProcessingPayment with showPurchaseFlow, and requestInProgress is now differentiated
  const [requestInProgress, setRequestInProgress] = useState(false); // General API request loading state
  const [isRequesting, setIsRequesting] = useState(false); // For RequestToJoinModal submission
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false); // For TicketPurchase flow
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false); // For RsvpModal
  const [selectedRsvpStatus, setSelectedRsvpStatus] = useState(null); // Status selected before opening RsvpModal
  const [processingRsvp, setProcessingRsvp] = useState(false); // For RsvpModal submission
  const [showRequestModal, setShowRequestModal] = useState(false); // Renamed from showRequestModal to isRequestToJoinModalModalOpen in outline, keeping original name since RequestToJoinModal uses `showRequestModal` prop
  const [didAttend, setDidAttend] = useState(false);
  const [showEventBoard, setShowEventBoard] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [hasPermanentlyOptedOut, setHasPermanentlyOptedOut] = useState(false);
  const [privateEventConfirmOpen, setPrivateEventConfirmOpen] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false); // New state for CancelMessageDialog
  const [friendsGoing, setFriendsGoing] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [attendanceRecordId, setAttendanceRecordId] = useState(null); // New state to store attendance record ID
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // New state for login prompt

  const eventIdFromUrl = new URLSearchParams(location.search).get("id");


  const safeFormatDate = (dateString, dateFormat, fallback = 'Date TBA') => {
    if (!dateString) return fallback;
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    return format(dateObj, dateFormat);
  };

  const getEventDateTimeDisplay = useCallback((event) => {
    if (!event.date) return 'Date TBA';

    const startDate = new Date(event.date);
    if (isNaN(startDate.getTime())) return 'Date TBA';

    const startFormat = "EEE, MMM d, yyyy 'at' h:mm a";
    const startTimeFormat = "h:mm a";
    const dateFormat = "MMM d, yyyy";
    const dayMonthFormat = "MMM d";

    if (!event.end_date) {
      return format(startDate, startFormat);
    }

    const endDate = new Date(event.end_date);
    if (isNaN(endDate.getTime())) {
      return format(startDate, startFormat);
    }

    if (!isSameDay(startDate, endDate)) {
      if (isSameYear(startDate, endDate)) {
        return `${format(startDate, dayMonthFormat)} - ${format(endDate, dateFormat)}`;
      } else {
        return `${format(startDate, dateFormat)} - ${format(endDate, dateFormat)}`;
      }
    } else {
      if (endDate.getTime() > startDate.getTime()) {
        return `${format(startDate, "EEE, MMM d, yyyy 'at' h:mm a")} - ${format(endDate, startTimeFormat)}`;
      } else {
        return format(startDate, startFormat);
      }
    }
  }, []);

  const loadEventData = useCallback(async () => {
    setLoading(true);
    setError("");
    setGoingAttendeesCount(0);
    setMaybeAttendeesCount(0);
    setAttendees([]);
    setExistingReview(null);
    setHasPermanentlyOptedOut(false);
    setFriendsGoing([]); // Reset friendsGoing for each load

    const currentEventId = new URLSearchParams(location.search).get('id');

    try {
      // NEW LOGIC: First, try to find the event in the local dummy/sample data.
      let dummyEvent = findDummyEventById(currentEventId);

      // Also handle numeric dummy IDs
      if (!dummyEvent) {
        const numericId = parseInt(currentEventId);
        if (!isNaN(numericId) && numericId >= 1 && numericId <= allDummyEvents.length) {
          dummyEvent = allDummyEvents[numericId - 1];
          if (dummyEvent) {
            dummyEvent = { ...dummyEvent, id: currentEventId };
          }
        }
      }

      if (dummyEvent && simulatedDataManager.isTemporaryDemoMode()) {
        // If a dummy event is found, display it and stop.
        if (dummyEvent.organizer_name === 'Thursday Dating' && (!dummyEvent.gallery_images || dummyEvent.gallery_images.length === 0)) {
          dummyEvent.gallery_images = [
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1546221448-81201e513176?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=600&fit=crop'];

          dummyEvent.gallery_metadata = [
          { uploaded_by: 'organizer@thursday.com', uploaded_at: new Date().toISOString(), image_url: dummyEvent.gallery_images[0] },
          { uploaded_by: 'another.user@example.com', uploaded_at: new Date().toISOString(), image_url: dummyEvent.gallery_images[1] },
          { uploaded_by: 'organizer@thursday.com', uploaded_at: new Date().toISOString(), image_url: dummyEvent.gallery_images[2] }];

        }

        setEvent(dummyEvent);
        // Mock user for dummy events
        const dummyUser = {
          full_name: "Demo User",
          email: "demo@user.com",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          saved_events: [],
          attended_events: [dummyEvent.id],
          map_preference: 'google'
        };
        setCurrentUser(dummyUser);

        // MOCK friends going data for demo
        if (dummyEvent.id === 'dummy_event_1' || dummyEvent.id === '1') {
          const friends = [
          { name: 'Maya Patel', avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=50&h=50&fit=crop' },
          { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' },
          { name: 'Chris Rodriguez', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=50&h=50&fit=crop' },
          { name: 'Sam Davis', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop' },
          { name: 'Riley Thompson', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=50&h=50&fit=crop' }];

          setFriendsGoing(friends);
        } else {
          setFriendsGoing([]);
        }

        const otherDummyEvents = allDummyEvents.
        filter((e) => e.organizer_name === dummyEvent.organizer_name && e.id !== dummyEvent.id).
        slice(0, 5);
        setOrganizerEvents(otherDummyEvents);

        const mockAttendees = [
        { id: 'dummy_user_1', name: 'Alice', email: 'alice@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?w=100&h=100&fit=crop', status: 'going', isFollowing: true },
        { id: 'dummy_user_2', name: 'Bob', email: 'bob@example.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', status: 'going', isFollowing: false },
        { id: 'dummy_user_3', name: 'Charlie', email: 'charlie@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', status: 'going', isFollowing: true },
        { id: 'dummy_user_4', name: 'Diana', email: 'diana@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', status: 'going', isFollowing: false },
        { id: 'dummy_user_7', name: 'Grace', email: 'grace@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', status: 'going', isFollowing: false },
        { id: 'dummy_user_8', name: 'Henry', email: 'henry@example.com', avatar: 'https://images.unsplash.com/photo-1546555190-ae63ad1b9d47?w=100&h=100&fit=crop', status: 'going', isFollowing: true },
        { id: 'dummy_user_5', name: 'Eve', email: 'eve@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', status: 'maybe', isFollowing: false },
        { id: 'dummy_user_6', name: 'Frank', email: 'frank@example.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop', status: 'maybe', isFollowing: true },
        { id: 'dummy_user_9', name: 'Ivy', email: 'ivy@example.com', avatar: 'https://images.unsplash.com/photo-1542155823-ce6ae270a4a8?w=100&h=100&fit=crop', status: 'maybe', isFollowing: false },
        { id: 'dummy_user_10', name: 'Jack', email: 'jack@example.com', avatar: 'https://images.unsplash.com/photo-1503443207922-ac7f786960cc?w=100&h=100&fit=crop', status: 'maybe', isFollowing: false }];


        setAttendees(mockAttendees);
        setGoingAttendeesCount(mockAttendees.filter((a) => a.status === 'going').length);
        setMaybeAttendeesCount(mockAttendees.filter((a) => a.status === 'maybe').length);

        if (dummyEvent.id === 'dummy_event_1' || dummyEvent.id === '1') {
          setExistingReview({
            id: 'mock_review_1',
            event_id: dummyEvent.id,
            user_email: 'demo@user.com',
            user_name: 'Demo User',
            user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
            rating: 4,
            review_text: 'Great event! Very social and fun.',
            liked: true,
            vibe_tags: ['social', 'fun'],
            would_recommend: true
          });
          setReviewForm({
            rating: 4,
            review_text: 'Great event! Very social and fun.',
            liked: true,
            vibe_tags: 'social, fun',
            would_recommend: true
          });
        }
        setDidAttend(true);
        setLoading(false);
        setIsDataLoaded(true);
        return;
      }

      // If not a dummy event, proceed with cached API calls to avoid rate limits
      const cacheKey = `event-${currentEventId}`;
      let eventData = apiCache.get(cacheKey);

      if (!eventData) {
        eventData = await apiCache.throttledRequest(cacheKey, () => Event.get(currentEventId));
      }

      if (!eventData) {
        setError("Event not found.");
        setLoading(false);
        setIsDataLoaded(true);
        return;
      }

      // Get user data with caching
      let user = null;
      if (simulatedDataManager.isAdminMode()) {
          user = {
            id: 'admin_saloni_bhatia_id',
            email: 'salonibhatia99@gmail.com',
            full_name: 'Saloni Bhatia',
            avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop',
            cover_image: 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop',
            bio: 'Curator :)',
            role: 'admin',
            account_type: 'personal',
            saved_events: ['dummy_event_1', 'past_event_1'], // Example saved/attended events for admin
            attended_events: ['dummy_event_2'],
            followers: 245,
            following: 128,
            is_verified: true,
            events_hosted: 2,
            ai_scheduling: true,
            followed_curator_ids: []
          };
          console.log('👑 EventDetails using admin user:', user.email);
      } else {
          const userCacheKey = 'current-user';
          user = apiCache.get(userCacheKey);

          if (!user) {
              try {
                  user = await apiCache.throttledRequest(userCacheKey, () => User.me());
              } catch (error) {
                  // Silently handle 401 - user not logged in
                  if (error.response?.status !== 401 && error.status !== 401) {
                      console.error('Error fetching current user:', error);
                  }
                  user = null; // Set user to null for 401 or any other error
              }
          }
      }
      setCurrentUser(user);

      if (eventData.organizer_name === 'Thursday Dating' && (!eventData.gallery_images || eventData.gallery_images.length === 0)) {
        eventData.gallery_images = [
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1546221448-81201e513176?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=600&fit=crop'];

        eventData.gallery_metadata = [
        { uploaded_by: 'organizer@thursday.com', uploaded_at: new Date().toISOString(), image_url: eventData.gallery_images[0] },
        { uploaded_by: 'another.user@example.com', uploaded_at: new Date().toISOString(), image_url: eventData.gallery_images[1] },
        { uploaded_by: 'organizer@thursday.com', uploaded_at: new Date().toISOString(), image_url: eventData.gallery_images[2] }];

      }

      setEvent({
        ...eventData,
        gallery_images: eventData.gallery_images || [],
        gallery_metadata: eventData.gallery_metadata || []
      });

      // Load attendance data with caching
      const attendanceCacheKey = `attendance-${currentEventId}`;
      let attendanceData = apiCache.get(attendanceCacheKey);

      if (!attendanceData) {
        try {
          attendanceData = await apiCache.throttledRequest(attendanceCacheKey, () => EventAttendance.filter({ event_id: currentEventId }));
        } catch (error) {
          attendanceData = [];
        }
      }

      let allAttendees = [];
      if (attendanceData.length === 0 && eventData.friends_going?.length > 0) {
        allAttendees = eventData.friends_going.map((friend, index) => ({
          id: `mock-${index}-${friend.email || friend.name}`,
          name: friend.name,
          avatar: friend.avatar,
          status: 'going',
          isFollowing: true,
          email: friend.email || `${String(friend.name).toLowerCase().replace(/\s+/g, '.')}@example.com`
        }));
      } else {
        allAttendees = attendanceData.map((att) => ({
          id: att.id,
          name: att.user_name,
          avatar: att.user_avatar,
          email: att.user_email,
          isFollowing: user ? user.following_users?.includes(att.user_email) : false,
          status: att.status
        }));
      }
      setAttendees(allAttendees);

      const goingAttendees = allAttendees.filter((att) =>
      att.status === 'going' || att.status === 'approved'
      );
      setGoingAttendeesCount(goingAttendees.length);

      const maybeAttendees = allAttendees.filter((att) =>
      att.status === 'maybe'
      );
      setMaybeAttendeesCount(maybeAttendees.length);

      if (eventData.organizer_name) {
        const orgEventsCacheKey = `organizer-events-${eventData.organizer_name}`;
        let allOrganizerEvents = apiCache.get(orgEventsCacheKey);

        if (!allOrganizerEvents) {
          try {
            allOrganizerEvents = await apiCache.throttledRequest(orgEventsCacheKey, () =>
            Event.filter({ organizer_name: eventData.organizer_name }, "-date")
            );
          } catch (error) {
            allOrganizerEvents = [];
          }
        }

        const otherEvents = allOrganizerEvents.
        filter((e) => e.id !== currentEventId).
        slice(0, 5);

        setOrganizerEvents(otherEvents);
      }

      if (user) {
        setIsOwner(user.email === eventData.created_by && user.full_name === eventData.organizer_name);
        setIsSaved((user.saved_events || []).includes(eventData.id));
        setMapPreference(user.map_preference || 'google');
        setDidAttend((user.attended_events || []).includes(eventData.id));

        const attendance = allAttendees.find((att) => att.email === user.email);
        if (attendance) {
          setAttendanceStatus(attendance.status);
          setHasPermanentlyOptedOut(attendance.permanently_opted_out || false);
          setAttendanceRecordId(attendance.id); // Set the attendance record ID
        } else {
          setAttendanceStatus(null);
          setHasPermanentlyOptedOut(false);
          setAttendanceRecordId(null); // Clear the attendance record ID
        }

        // Load reviews with caching
        const reviewsCacheKey = `reviews-${eventData.id}-${user.email}`;
        let reviews = apiCache.get(reviewsCacheKey);

        if (!reviews) {
          try {
            reviews = await apiCache.throttledRequest(reviewsCacheKey, () =>
            EventReview.filter({ event_id: eventData.id, user_email: user.email })
            );
          } catch (error) {
            reviews = [];
          }
        }

        if (reviews.length > 0) {
          setExistingReview(reviews[0]);
          setReviewForm({
            rating: reviews[0].rating,
            review_text: reviews[0].review_text || "",
            liked: reviews[0].liked,
            vibe_tags: (reviews[0].vibe_tags || []).join(', '),
            would_recommend: reviews[0].would_recommend ?? true
          });
        } else {
          setExistingReview(null);
          setReviewForm({ rating: 5, review_text: '', liked: true, vibe_tags: '', would_recommend: true });
        }
      } else {
        setIsOwner(false);
        setIsSaved(false);
        setMapPreference('google');
        setDidAttend(false);
        setAttendanceStatus(null);
        setExistingReview(null);
        setReviewForm({ rating: 5, review_text: '', liked: true, vibe_tags: '', would_recommend: true });
        setHasPermanentlyOptedOut(false);
      }
    } catch (err) {
      console.error("Error loading event details:", err);
      if (err.message.includes("not found") || err.name === "NotFoundError") {
        setError("Event not found.");
      } else if (err.message.includes("Rate limit")) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError("Failed to load event details. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsDataLoaded(true);
    }
  }, [location.search]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const backParam = urlParams.get('back');

    if (backParam) {
      setBackUrl(decodeURIComponent(backParam));
    }

    const currentEventId = urlParams.get('id');
    if (!currentEventId) {
      navigate(createPageUrl('Feed'));
      return;
    }

    loadEventData();
  }, [location.search, navigate, loadEventData]);

  const handleToggleSave = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (requestInProgress || !event || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Feature not available for demo events or request in progress.");
      return;
    }
    setRequestInProgress(true); // General request in progress
    try {
      const currentEventId = event.id;
      const newSavedEvents = new Set(currentUser.saved_events || []);
      if (isSaved) {
        newSavedEvents.delete(currentEventId);
      } else {
        newSavedEvents.add(currentEventId);
      }
      await User.updateMyUserData({ saved_events: Array.from(newSavedEvents) });
      setIsSaved(!isSaved);
      apiCache.invalidate('current-user'); // Invalidate user cache
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to update save status. Please try again.");
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!event || !currentUser) return;
    if (event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Review submission not available for demo events.");
      setReviewDialogOpen(false); // Close dialog anyway for demo
      setExistingReview({ // Mock update for demo
        id: existingReview?.id || `mock_review_${Date.now()}`,
        event_id: event.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        user_avatar: currentUser.avatar,
        rating: reviewForm.rating,
        review_text: reviewForm.review_text,
        liked: reviewForm.liked,
        vibe_tags: reviewForm.vibe_tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
        would_recommend: reviewForm.would_recommend,
        attended: true
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const vibeTagsArray = reviewForm.vibe_tags ?
      reviewForm.vibe_tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) :
      [];

      if (existingReview) {
        await EventReview.update(existingReview.id, {
          rating: reviewForm.rating,
          review_text: reviewForm.review_text,
          liked: reviewForm.liked,
          vibe_tags: vibeTagsArray,
          would_recommend: reviewForm.would_recommend
        });
        setExistingReview((prev) => ({ ...prev, ...reviewForm, vibe_tags: vibeTagsArray }));
      } else {
        await EventReview.create({
          event_id: event.id,
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          user_avatar: currentUser.avatar,
          rating: reviewForm.rating,
          review_text: reviewForm.review_text,
          liked: reviewForm.liked,
          vibe_tags: vibeTagsArray,
          would_recommend: reviewForm.would_recommend,
          attended: true
        });
      }

      apiCache.invalidate(`reviews-${event.id}-${currentUser.email}`); // Invalidate review cache
      apiCache.invalidate('current-user'); // User's attended_events might be implicitly updated

      setReviewDialogOpen(false);
      // Re-fetch data to reflect the new/updated review
      await loadEventData();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview || requestInProgress || !event || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Review deletion not available for demo events or request in progress.");
      return;
    }

    if (window.confirm("Are you sure you want to delete your review? This action cannot be undone.")) {
      setRequestInProgress(true); // General request in progress
      try {
        await EventReview.delete(existingReview.id);
        setExistingReview(null);
        setReviewForm({ rating: 5, review_text: '', liked: true, vibe_tags: '', would_recommend: true });
        alert("Your review has been deleted.");
        apiCache.invalidate(`reviews-${event.id}-${currentUser.email}`); // Invalidate review cache
        apiCache.invalidate('current-user'); // User's attended_events might be implicitly updated
        await loadEventData(); // Refresh event and attendance data
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review. Please try again.");
      } finally {
        setRequestInProgress(false);
      }
    }
  };

  const handleRequestToJoin = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (!event || isRequesting || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Request to join not available for demo events or request in progress.");
      return;
    }

    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (requestData) => {
    if (!event || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) return;
    setIsRequesting(true); // Specific request loading state
    try {
      const newAttendance = await EventAttendance.create({
        event_id: event.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        user_avatar: currentUser.avatar,
        status: 'pending',
        message: requestData.message,
        user_phone: requestData.contact_type === 'phone' ? requestData.contact_info : undefined,
        user_instagram: requestData.contact_type === 'instagram' ? requestData.contact_info : undefined
      });
      apiCache.invalidate(`attendance-${event.id}`); // Invalidate attendance cache
      apiCache.invalidate('current-user'); // User's attendance status might be implicitly updated
      setShowRequestModal(false);

      setAttendanceStatus('pending'); // Set local state to 'pending');
      setAttendanceRecordId(newAttendance.id); // Store the ID of the new attendance record

      // We'll remove loadEventData() here since the state is updated locally and loadEventData is called on mount
      // await loadEventData(); // Refresh attendance status
    } catch (error) {
      console.error("Error sending request to join:", error);
      alert("Failed to send request. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!currentUser) return;
    if (!event || isRequesting || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Cancel request not available for demo events or request in progress.");
      return;
    }

    if (!attendanceRecordId || attendanceStatus !== 'pending') {// Ensure there's a pending record to cancel
      alert("No pending request to cancel.");
      return;
    }

    setIsRequesting(true); // Specific request loading state
    try {
      await EventAttendance.delete(attendanceRecordId); // Delete the record using its ID
      apiCache.invalidate(`attendance-${event.id}`); // Invalidate attendance cache
      apiCache.invalidate('current-user'); // User's attendance status might be implicitly updated

      setAttendanceStatus(null); // Clear local attendance status
      setAttendanceRecordId(null); // Clear local attendance record ID
      // alert("Your request to join has been cancelled."); // Removed per instructions

      await loadEventData(); // Refresh attendance status
    } catch (error) {
      console.error("Error cancelling request:", error);
      setError("Could not cancel the request. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRsvp = (status) => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (processingRsvp || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("RSVP not available for demo events or request in progress.");
      return;
    }

    setSelectedRsvpStatus(status);
    setIsRsvpModalOpen(true);
  };

  const handleRsvpSubmit = async (rsvpData) => {
    if (!currentUser || !selectedRsvpStatus || processingRsvp) return;
    if (!event || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("RSVP not available for demo events.");
      return;
    }

    setProcessingRsvp(true);
    try {
      const existingAttendance = attendees.find((att) => att.email === currentUser.email);
      const payload = {
        event_id: event.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name || currentUser.email,
        user_avatar: currentUser.avatar,
        status: selectedRsvpStatus,
        ...rsvpData
      };

      if (existingAttendance) {
        await EventAttendance.update(existingAttendance.id, payload);
      } else {
        await EventAttendance.create(payload);
      }

      apiCache.invalidate(`attendance-${event.id}`); // Invalidate attendance cache
      apiCache.invalidate('current-user'); // User's attendance status might be implicitly updated

      setIsRsvpModalOpen(false);
      setSelectedRsvpStatus(null);
      await loadEventData(); // Refresh event and attendance data
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('There was an issue submitting your RSVP. Please try again.');
    } finally {
      setProcessingRsvp(false);
    }
  };

  const handleTicketPurchase = (purchaseDetails) => {
    // This function would typically integrate with a payment gateway.
    // For now, it's a placeholder.
    console.log("Processing ticket purchase:", purchaseDetails);
    setShowPurchaseFlow(false); // Close the modal after "purchase"
    alert("Ticket purchase simulated successfully!");
  };

  const executeAttendanceChange = async () => {
    setRequestInProgress(true); // General request in progress
    const originallyAttended = didAttend;

    setDidAttend(!originallyAttended);

    const attendedEvents = new Set(Array.isArray(currentUser.attended_events) ? currentUser.attended_events : []);
    if (!originallyAttended) {
      attendedEvents.add(event.id);
    } else {
      attendedEvents.delete(event.id);
    }

    try {
      await User.updateMyUserData({ attended_events: Array.from(attendedEvents) });
      setCurrentUser((prev) => ({ ...prev, attended_events: Array.from(attendedEvents) }));
      apiCache.invalidate('current-user'); // Invalidate user cache

      if (event.privacy_level === 'private') {
        try {
          const attendanceRecords = attendees.find((att) => att.email === currentUser.email);

          if (originallyAttended && !attendedEvents.has(event.id)) {
            if (attendanceRecords) {
              await EventAttendance.update(attendanceRecords.id, {
                permanently_opted_out: true,
                status: 'cant_go'
              });
            } else {
              await EventAttendance.create({
                event_id: event.id,
                user_email: currentUser.email,
                user_name: currentUser.full_name,
                user_avatar: currentUser.avatar,
                status: 'cant_go',
                permanently_opted_out: true
              });
            }
            setHasPermanentlyOptedOut(true);
            apiCache.invalidate(`attendance-${event.id}`); // Invalidate attendance cache
          } else if (!originallyAttended && attendedEvents.has(event.id)) {
            if (attendanceRecords) {
              await EventAttendance.update(attendanceRecords.id, {
                permanently_opted_out: false,
                status: 'going'
              });
            }
            setHasPermanentlyOptedOut(false);
            apiCache.invalidate(`attendance-${event.id}`); // Invalidate attendance cache
          }
        } catch (attendanceError) {
          console.error("Error updating attendance record:", attendanceError);
          alert("Failed to update attendance record for this private event.");
        }
      }

      if (originallyAttended && !attendedEvents.has(event.id)) {
        if (existingReview) {
          try {
            await EventReview.delete(existingReview.id);
            setExistingReview(null);
            setReviewForm({ rating: 5, review_text: '', liked: true, vibe_tags: '', would_recommend: true });
            apiCache.invalidate(`reviews-${event.id}-${currentUser.email}`); // Invalidate review cache
            console.log("Review removed as user marked 'didn't go'.");
          } catch (reviewError) {
            console.error("Error deleting review:", reviewError);
          }
        }
      } else
      if (!originallyAttended && attendedEvents.has(event.id)) {
        if (!existingReview) {
          setReviewDialogOpen(true);
        }
      }

      setTimeout(() => {
        console.log("Attendance status updated successfully");
      }, 500);
      await loadEventData(); // Refresh data after attendance change

    } catch (error) {
      console.error("Failed to update past attendance status:", error);

      setDidAttend(originallyAttended);

      if (originallyAttended && event.privacy_level === 'private') {
        setHasPermanentlyOptedOut(false);
      }

      if (error.message?.includes("Network Error") || error.code === "NETWORK_ERROR") {
        alert("Network connection issue. Please check your internet and try again.");
      } else {
        alert("Could not update your status. Please try again.");
      }
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleTogglePastAttendance = async () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (requestInProgress || event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Past attendance toggle not available for demo events or request in progress.");
      return;
    }

    if (event.privacy_level === 'private' && !didAttend) {
      try {
        const currentUserAttendance = attendees.find((att) => att.email === currentUser?.email);

        if (currentUserAttendance && currentUserAttendance.permanently_opted_out) {
          alert("You have permanently opted out of this private event.");
          return;
        }
      } catch (error) {
        console.error("Error checking attendance status:", error);
      }

      alert("For privacy and security reasons, you cannot mark attendance for private events you didn't originally attend.");
      return;
    }

    if (event.privacy_level === 'private' && didAttend) {
      setPrivateEventConfirmOpen(true);
      return;
    }

    await executeAttendanceChange();
  };

  const handleConfirmPrivateEventChange = async () => {
    setPrivateEventConfirmOpen(false);
    await executeAttendanceChange();
  };

  const handleAddToCalendar = () => {
    if (!event) return;

    const startDate = event.date ? new Date(event.date) : null;
    if (!startDate || isNaN(startDate.getTime())) {
      console.error("Invalid event start date for calendar:", event.date);
      alert("Could not add to calendar: Event start date is invalid or missing.");
      return;
    }

    let endDate = event.end_date ? new Date(event.end_date) : null;
    if (!endDate || isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) {
      endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    }

    const formatDateForCalendar = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue_name || event.location || '')}`;

    window.open(calendarUrl, '_blank');
  };

  const handleVenueClick = () => {
    if (!event) return;
    const address = encodeURIComponent(event.venue_name || event.location);
    let mapsUrl;
    switch (mapPreference) {
      case 'apple':
        mapsUrl = `http://maps.apple.com/?q=${address}`;
        break;
      case 'waze':
        mapsUrl = `https://www.waze.com/ul?q=${address}`;
        break;
      default:
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
        break;
    }
    window.open(mapsUrl, '_blank');
  };

  const canSeeAttendeeList = () => {
    if (!event) return false;
    if (event.privacy_level !== 'private') return true;
    if (isOwner) return true;
    return attendanceStatus === 'approved' || attendanceStatus === 'going';
  };

  const canSeePrivateDetails = () => {
    if (!event) return false;
    if (isOwner) return true;

    const eventIsPast = event.date ? new Date(event.date) < new Date() : false;
    if (eventIsPast && didAttend) {
      return true;
    }

    if (event.privacy_level === 'public') return true;
    if (event.privacy_level === 'semi-public') {
      return attendanceStatus === 'going' || attendanceStatus === 'maybe';
    }
    if (event.privacy_level === 'private') {
      return attendanceStatus === 'going' || attendanceStatus === 'approved';
    }
    return false;
  };

  const handleImageUpload = async (e) => {
    if (event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Image upload not available for demo events.");
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !event || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingGalleryImage(true);
    try {
      const { file_url } = await UploadFile({ file });

      const currentImages = event.gallery_images || [];
      const currentMetadata = event.gallery_metadata || [];

      const updatedImages = [...currentImages, file_url];
      const updatedMetadata = [...currentMetadata, {
        uploaded_by: currentUser.email,
        uploaded_at: new Date().toISOString(),
        image_url: file_url
      }];

      await Event.update(event.id, {
        gallery_images: updatedImages,
        gallery_metadata: updatedMetadata
      });

      setEvent((prev) => ({
        ...prev,
        gallery_images: updatedImages,
        gallery_metadata: updatedMetadata
      }));
      apiCache.invalidate(`event-${event.id}`); // Invalidate event cache

      e.target.value = '';
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const handleImageDelete = async (imageUrl, imageIndex) => {
    if (event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString())) {
      alert("Image deletion not available for demo events.");
      return;
    }
    if (!currentUser || !event) return;

    setUploadingGalleryImage(true);
    try {
      const currentImages = event.gallery_images || [];
      const currentMetadata = event.gallery_metadata || [];

      const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
      const updatedMetadata = currentMetadata.filter((_, index) => index !== imageIndex);

      await Event.update(event.id, {
        gallery_images: updatedImages,
        gallery_metadata: updatedMetadata
      });

      setEvent((prev) => ({
        ...prev,
        gallery_images: updatedImages,
        gallery_metadata: updatedMetadata
      }));
      apiCache.invalidate(`event-${event.id}`); // Invalidate event cache
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const canMarkAttendanceForPrivateEvent = useCallback(() => {
    if (!event) return false;
    if (event.privacy_level !== 'private') return true;

    // For private events, you can only mark attendance if you were approved/going,
    // AND have not permanently opted out.
    // If you were approved/going, you can mark 'did not go'.
    // If you were not approved/going, you cannot mark 'did go'.
    const currentUserAttendance = attendees.find((att) => att.email === currentUser?.email);
    if (currentUserAttendance && (currentUserAttendance.status === 'going' || currentUserAttendance.status === 'approved')) {
      return !hasPermanentlyOptedOut;
    }
    return false;
  }, [event, currentUser, attendees, hasPermanentlyOptedOut]);

  // Function to handle share (might be redundant with existing share button logic, but added from outline context)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCancelEvent = async (cancelMessage) => {
    if (!event) return; // Ensure event exists
    const isDummy = event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString()); // Use the pre-computed isDummyEvent value

    if (isDummy) {
      alert("Event cancellation simulated successfully for demo event!");
      setShowCancelDialog(false);
      setEvent((prevEvent) => ({ ...prevEvent, status: 'cancelled', cancellation_message: cancelMessage }));
      return;
    }

    setShowCancelDialog(false);
    try {
      await Event.update(event.id, {
        status: 'cancelled',
        cancellation_message: cancelMessage || ""
      });
      setEvent((prevEvent) => ({ ...prevEvent, status: 'cancelled', cancellation_message: cancelMessage }));
      alert("Event has been cancelled. All attendees will be notified.");
      apiCache.invalidate(`event-${event.id}`); // Invalidate cache for the event
      apiCache.invalidateEventRelated(event.id); // Invalidate any other event-related caches
    } catch (error) {
      console.error("Error cancelling event:", error);
      alert("Failed to cancel the event. Please try again.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 font-semibold text-lg text-center mb-4">{error}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>);

  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-gray-500 font-semibold text-lg text-center mb-4">Event not found.</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>);

  }

  const canUploadPhotos = isOwner || attendanceStatus === 'going' || attendanceStatus === 'approved';

  const eventStartDate = event.date ? new Date(event.date) : null;
  const isPastEvent = eventStartDate && !isNaN(eventStartDate.getTime()) ? eventStartDate < new Date() : false;

  const peopleGoingCount = goingAttendeesCount;

  const locationDisplayString = canSeePrivateDetails() ?
  event.venue_name && event.venue_name.toLowerCase() !== "revealed upon rsvp" ? event.venue_name : event.location :
  "Location locked - RSVP to see details";

  const isDummyEvent = event.id.toString().startsWith('dummy_') || /^\d+$/.test(event.id.toString());

  const renderRsvpControls = () =>
  <div>
      {event.privacy_level === 'private' ? // Check if the event is private
    <div className="text-center">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-slate-950 mb-2 text-lg font-semibold">Private Event</h3>
          <p className="text-gray-600 mb-4">This event requires approval to attend</p>

          {attendanceStatus === 'pending' ? // State: Request is pending approval
      <div className="space-y-3">
              <Button
          disabled={true}
          className="w-full bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed">
                <Loader2 className="w-4 h-4 mr-2" />
                Request Pending
              </Button>
              <Button
          variant="outline"
          onClick={handleCancelRequest} // Trigger cancel request
          disabled={isRequesting || isDummyEvent}
          className="w-full text-red-600 border-red-300 hover:bg-red-50">
                {isRequesting ?
          <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </> :

          'Cancel Request'
          }
              </Button>
            </div> :
      attendanceStatus === 'approved' || attendanceStatus === 'going' ? // State: Request approved or user is already going
      <Button
        disabled={true}
        className="w-full bg-green-100 text-green-800 border-green-300 cursor-not-allowed">
              <Check className="w-4 h-4 mr-2" />
              Approved - You're In!
            </Button> :
      attendanceStatus === 'rejected' ? // State: Request rejected
      <Button
        disabled={true}
        className="w-full bg-red-100 text-red-800 border-red-300 cursor-not-allowed">
              Request Declined
            </Button> :
      // Default state for private events: User can request to join
      <Button
        onClick={() => handleRequestToJoin()} // Open RequestToJoinModal
        disabled={isRequesting || isDummyEvent}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3">
              {isRequesting ?
        <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </> :

        'Request to Join'
        }
            </Button>
      }
        </div> :

    <div>
          <h3 className="text-gray-950 mb-4 text-lg font-semibold">RSVP Options</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
          variant={attendanceStatus === 'going' ? 'default' : 'outline'}
          onClick={() => handleRsvp('going')}
          disabled={processingRsvp || isDummyEvent}
          className={`h-auto py-2 flex flex-col items-center justify-center gap-1 ${
          attendanceStatus === 'going' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-gray-900 border-gray-300'}`
          }>

              <Check className="w-4 h-4" />
              <span className="text-xs font-medium">Going</span>
            </Button>
            <Button
          variant={attendanceStatus === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleRsvp('maybe')}
          disabled={processingRsvp || isDummyEvent}
          className={`h-auto py-2 flex flex-col items-center justify-center gap-1 ${
          attendanceStatus === 'maybe' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'text-gray-900 border-gray-300'}`
          }>

              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Maybe</span>
            </Button>
            <Button
          variant={attendanceStatus === 'cant_go' ? 'default' : 'outline'}
          onClick={() => handleRsvp('cant_go')}
          disabled={processingRsvp || isDummyEvent}
          className={`h-auto py-2 flex flex-col items-center justify-center gap-1 ${
          attendanceStatus === 'cant_go' ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-900 border-gray-300'}`
          }>

              <X className="w-4 h-4" />
              <span className="text-xs font-medium">Can't Go</span>
            </Button>
          </div>
          {canSeeAttendeeList() &&
      <Button
        variant="outline"
        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        onClick={() => navigate(createPageUrl('EventAttendees', { id: event.id }))}>

              <Users className="w-4 h-4 mr-2" />
              See Who's Going ({goingAttendeesCount + maybeAttendeesCount})
            </Button>
      }
        </div>
    }
    </div>;


  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Back Button */}
      {backUrl &&
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">

            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Activity</span>
          </button>
        </div>
      }

      <div className="relative">
        <div className="h-64 md:h-96 w-full relative">
          <img src={event.cover_image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent" />
          {/* Default "Back to Feed" button, if no specific backUrl is provided or as a fallback */}
          {!backUrl &&
          <button
            onClick={() => {
              const params = new URLSearchParams(location.search);
              const backParam = params.get('back'); // Use a different variable name to avoid conflict with state `backUrl`
              if (backParam) {
                navigate(createPageUrl(`Explore${backParam}`));
              } else {
                navigate(-1);
              }
            }}
            className="absolute z-20 top-4 left-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors">

              <ArrowLeft className="w-5 h-5" />
            </button>
          }
          {/* Share button */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button onClick={handleShare} className="bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative -mt-16 md:-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-200/50">

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={`font-bold text-sm px-3 py-1 flex items-center gap-1 w-fit ${
                  event.privacy_level === 'private' ? 'bg-blue-100 text-blue-800' :
                  event.privacy_level === 'semi-public' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'}`
                  }>
                    {event.privacy_level === 'private' && <Lock className="w-3 h-3" />}
                    {(event.privacy_level || 'public').charAt(0).toUpperCase() + (event.privacy_level || 'public').slice(1).replace('-', ' ')} Event
                  </Badge>

                  {isOwner &&
                  <Button
                    variant="outline"
                    onClick={() => setShowPrettyModal(true)}
                    className="bg-white border-blue-300 text-blue-600 hover:bg-blue-50 p-2 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">

                      <Sparkles className="w-4 h-4" />
                    </Button>
                  }
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight mb-6">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span
                      className={`text-sm ${canSeePrivateDetails() ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                      onClick={canSeePrivateDetails() ? handleVenueClick : undefined}>

                      {locationDisplayString}
                    </span>
                  </div>
                  {event.category &&
                  <Badge className="bg-blue-100 text-blue-800 text-sm">
                      {event.category}
                    </Badge>
                  }
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">
                      {getEventDateTimeDisplay(event)}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">About This Event</h3>
                  <div className="space-y-4">
                    {canSeePrivateDetails() ?
                    <>
                        <p className="text-gray-700 leading-relaxed">{event.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          {event.age_requirement && event.age_requirement !== 'all_ages' &&
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Info className="w-4 h-4 text-gray-500" />
                              <span className="text-slate-950 font-medium">Min. Age: {event.age_requirement}</span>
                            </div>
                        }
                          {event.age_range &&
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">Age Range: {event.age_range}</span>
                            </div>
                        }
                          {event.price !== undefined &&
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Ticket className="w-4 h-4 text-gray-500" />
                              <span className="text-slate-950 font-medium">
                                {event.price === 0 ? 'Free' : `$${event.price}`}
                                {event.payment_type === 'optional' && event.price > 0 && <span className="text-gray-500 ml-1">(suggested)</span>}
                              </span>
                            </div>
                        }
                          {event.rsvp_deadline &&
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                RSVP by {safeFormatDate(event.rsvp_deadline, "MMM d, h:mm a")}
                              </span>
                            </div>
                        }
                        </div>
                      </> :

                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-700 mb-2">Event Details Locked</h4>
                        <p className="text-gray-600 text-sm">
                          {event.privacy_level === 'private' ?
                        "Request to join this private event to see full details." :
                        "RSVP 'Going' or 'Maybe' to see full event details."
                        }
                        </p>
                      </div>
                    }
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Button
                    onClick={handleToggleSave}
                    variant="outline"
                    className={`flex items-center gap-2 border-gray-300 ${
                    isSaved ? 'bg-pink-50 text-pink-600 border-pink-300' : 'bg-white text-gray-700 hover:bg-gray-50'}`
                    }
                    disabled={requestInProgress || isDummyEvent}>

                    {requestInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>

                  <Button
                    onClick={handleShare} // Using the new handleShare function
                    variant="outline"
                    className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">

                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>

                  <Button
                    onClick={handleAddToCalendar}
                    variant="outline"
                    className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">

                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Calendar</span>
                    <span className="sm:hidden">Calendar</span>
                  </Button>

                  {(event.price > 0 || event.source_url || event.event_links?.length > 0) &&
                  <Button
                    onClick={() => {
                      // If it's a paid event, open the purchase flow instead of direct link
                      if (event.price > 0) {
                        setShowPurchaseFlow(true);
                      } else {
                        const url = event.source_url || event.event_links?.[0]?.url;
                        if (url) window.open(url, '_blank');
                      }
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90"
                    disabled={!event.source_url && !event.event_links?.length > 0 && event.price === 0}>

                      <ExternalLink className="w-4 h-4" />
                      {event.price > 0 ? 'Purchase Tickets' : 'Visit Website'}
                    </Button>
                  }
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:sticky md:top-24 bg-white/80 backdrop-blur-md md:bg-white border rounded-2xl p-6 shadow-lg md:shadow-sm mb-8">

                  {isPastEvent ?
                  <div>
                      <h3 className="text-slate-950 mb-4 text-lg font-semibold">Event Status</h3>
                      {didAttend ?
                    <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-center">
                            <p className="font-semibold">You went to this event.</p>
                          </div>
                          <Button
                        onClick={handleTogglePastAttendance}
                        variant="outline"
                        className="w-full"
                        disabled={requestInProgress || isDummyEvent}>

                            {requestInProgress ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                            Change to "Didn't Go"
                          </Button>
                          {existingReview ?
                      <div className="flex items-center gap-3">
                              <Button onClick={() => setReviewDialogOpen(true)} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white">
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Your Review
                              </Button>
                              <Button onClick={handleDeleteReview} variant="destructive" size="icon" disabled={requestInProgress || isDummyEvent}>
                                {requestInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                <span className="sr-only">Delete review</span>
                              </Button>
                            </div> :

                      <Button onClick={() => setReviewDialogOpen(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isDummyEvent}>
                              <Star className="w-4 h-4 mr-2" />
                              Leave a Review
                            </Button>
                      }
                          {canSeeAttendeeList() &&
                      <Button
                        variant="outline"
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate(createPageUrl('EventAttendees', { id: event.id }))}>

                              <Users className="w-4 h-4 mr-2" />
                              See Who Went ({goingAttendeesCount})
                            </Button>
                      }
                        </div> :

                    <div className="space-y-3">
                          <div className="bg-gray-100 border border-gray-200 text-gray-700 rounded-lg p-3 text-center">
                            <p className="font-semibold">This event has already ended.</p>
                          </div>
                          <Button
                        onClick={handleTogglePastAttendance}
                        className={`w-full ${
                        canMarkAttendanceForPrivateEvent() ?
                        "bg-blue-500 hover:bg-blue-600 text-white" :
                        "bg-gray-300 text-gray-500 cursor-not-allowed"}`
                        }
                        disabled={requestInProgress || isDummyEvent || !canMarkAttendanceForPrivateEvent()}>

                            {requestInProgress ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            Mark as "I Went"
                          </Button>
                          {event.privacy_level === 'private' && !canMarkAttendanceForPrivateEvent() &&
                      <p className="text-xs text-gray-500 text-center mt-2">
                              For privacy and security reasons, you cannot mark attendance for private events you didn't originally attend.
                            </p>
                      }
                          {canSeeAttendeeList() &&
                      <Button
                        variant="outline"
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => navigate(createPageUrl('EventAttendees', { id: event.id }))}>

                              <Users className="w-4 h-4 mr-2" />
                              See Who Went ({goingAttendeesCount})
                            </Button>
                      }
                        </div>
                    }
                    </div> :

                  isOwner ?
                  <div className="space-y-3">
                        <h3 className="text-slate-950 text-lg font-semibold">Host Tools</h3>
                        <Button
                      variant="outline" className="bg-background text-slate-950 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10 w-full"

                      onClick={() => {
                        const editUrl = `${createPageUrl('CreateEvent')}?edit=${event.id}`;
                        window.location.href = editUrl;
                      }}>

                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Event
                        </Button>
                        <Button
                      variant="outline" className="bg-background text-slate-950 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10 w-full"

                      onClick={() => {
                        const manageUrl = `${createPageUrl('EventAttendees')}?id=${event.id}&manage=true`;
                        window.location.href = manageUrl;
                      }}>

                          <Users className="w-4 h-4 mr-2" />
                          Manage Guests
                        </Button>
                        <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={event.status === 'cancelled'} // Only disabled if already cancelled
                    >
                          <X className="w-4 h-4 mr-2" />
                          {event.status === 'cancelled' ? 'Event Cancelled' : 'Cancel Event'}
                        </Button>
                      </div> :

                  renderRsvpControls()

                  }
                </motion.div>

                <LocationSection event={event} canSeePrivateDetails={canSeePrivateDetails()} />

                {friendsGoing.length > 0 && // Conditionally render FriendsGoingModal if friendsGoing has data
                <div className="mt-8">
                    <FriendsGoingModal friends={friendsGoing} eventId={event.id} />
                  </div>
                }

                {event.chat_enabled && (event.privacy_level === 'public' || attendanceStatus === 'going' || attendanceStatus === 'maybe' || attendanceStatus === 'approved' || isOwner) &&
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8">

                    <Button
                    onClick={() => setShowEventBoard(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">

                      <MessageCircle className="w-5 h-5" />
                      Open Event Board
                    </Button>
                  </motion.div>
                }

                <div className="mt-12">
                  <MoreFromOrganizer events={organizerEvents} organizerName={event.organizer_name} />
                </div>
              </div>

              <div className="md:w-80 space-y-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200"> {/* Added border to this section for consistency */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={event.organizer_avatar} alt={event.organizer_name} />
                        <AvatarFallback>
                          {event.organizer_name ? event.organizer_name.charAt(0).toUpperCase() : 'O'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <button
                          onClick={() => {
                            navigate(createPageUrl(`CuratorProfile?curator=${encodeURIComponent(event.organizer_name || 'TestName')}`));
                          }}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0 text-left">

                          {event.organizer_name || 'Event Host'}
                        </button>
                        <p className="text-sm text-gray-500">Event Host</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled={isDummyEvent} className="bg-background text-slate-950 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md">
                      Follow
                    </Button>
                  </div>
                </div>

                {event.vibe_tags && event.vibe_tags.length > 0 &&
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Vibe</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.vibe_tags.map((tag, index) =>
                    <Badge key={index} className="bg-blue-100 text-blue-800 text-sm">
                          {tag}
                        </Badge>
                    )}
                    </div>
                  </div>
                }

                {/* Photos Section */}
                {(event.gallery_images?.length > 0 || canUploadPhotos) &&
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-slate-950 mb-4 text-xl font-semibold">Photos</h3>
                    <PhotoGallery
                    imageList={event.gallery_images}
                    eventName={event.title}
                    canAddPhotos={canUploadPhotos}
                    onImageUpload={handleImageUpload}
                    isUploading={uploadingGalleryImage}
                    currentUser={currentUser}
                    onImageDelete={handleImageDelete}
                    isDeleting={uploadingGalleryImage}
                    imageMetadata={event.gallery_metadata} />

                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <RequestToJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestSubmit}
        isSubmitting={isRequesting}
        eventTitle={event?.title} />


      {showPurchaseFlow &&
      <TicketPurchase
        event={event}
        onPurchase={handleTicketPurchase}
        onClose={() => setShowPurchaseFlow(false)}
        currentUser={currentUser} />

      }

      <RsvpModal
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        onSubmit={handleRsvpSubmit}
        isSubmitting={processingRsvp}
        event={event}
        selectedRsvpStatus={selectedRsvpStatus} />


      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>How was {event?.title}?</DialogTitle>
            <DialogDescription>
              Help us recommend better events by sharing your experience (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) =>
                <button
                  key={star}
                  onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                  className="focus:outline-none">

                    <Star
                    className={`w-6 h-6 transition-colors ${
                    star <= reviewForm.rating ?
                    "fill-yellow-400 text-yellow-400" :
                    "text-gray-300 hover:text-yellow-300"}`
                    } />

                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Did you enjoy it?</label>
              <div className="flex gap-3">
                <Button
                  onClick={() => setReviewForm((prev) => ({ ...prev, liked: true }))}
                  className={`flex-1 ${
                  reviewForm.liked ?
                  "bg-green-100 border-green-300 text-green-800" :
                  "bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-50"}`
                  }>

                  👍 Loved it
                </Button>
                <Button
                  onClick={() => setReviewForm((prev) => ({ ...prev, liked: false }))}
                  className={`flex-1 ${
                  !reviewForm.liked ?
                  "bg-red-100 border-red-300 text-red-800" :
                  "bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-50"}`
                  }>

                  👎 Not my vibe
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tell us more (optional)</label>
              <Textarea
                placeholder="What did you love or what could be improved?"
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, review_text: e.target.value }))}
                className="resize-none"
                rows={3} />

            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vibe tags (optional)</label>
              <Input
                placeholder="e.g. energetic, crowded, great music (separate with commas)"
                value={reviewForm.vibe_tags}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, vibe_tags: e.target.value }))} />

            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recommend"
                checked={reviewForm.would_recommend}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, would_recommend: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4" />

              <label htmlFor="recommend" className="text-sm font-medium">
                I would recommend this event to friends
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Skip Review
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview || isDummyEvent}>
              {isSubmittingReview ?
              <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </> :

              <>
                  <Check className="w-4 h-4 mr-2" />
                  {existingReview ? 'Update Review' : 'Submit Review'}
                </>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrettyModal} onOpenChange={setShowPrettyModal}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-center">Make it Pretty</DialogTitle>
            <DialogDescription className="text-center">
              Enhance your event card with AI effects or manual edits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {alert('AI Enhance feature is coming soon!');setShowPrettyModal(false);}}
              className="p-6 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group">

              <Wand2 className="w-10 h-10 text-blue-500 mx-auto mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-lg text-gray-800">AI Enhance</h3>
              <p className="text-sm text-gray-500">Let AI suggest styles, emojis, and more.</p>
            </button>
            <button
              onClick={() => {alert('Manual Edit feature is coming soon!');setShowPrettyModal(false);}}
              className="p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all text-center group">

              <Paintbrush className="w-10 h-10 text-gray-500 mx-auto mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-bold text-lg text-gray-800">Manual Edit</h3>
              <p className="text-sm text-gray-500">Customize backgrounds, effects, and text.</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventBoard} onOpenChange={setShowEventBoard}>
        <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-2rem)] max-h-[calc(90vh-5rem)] p-0 rounded-2xl mb-16 sm:mb-0 overflow-hidden">
          <EventChatBoard event={event} userStatus={attendanceStatus} onClose={() => setShowEventBoard(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={privateEventConfirmOpen} onOpenChange={setPrivateEventConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="py-2">
              You are about to mark that you didn't attend a private event. For your privacy and security, this action is permanent and you will not be able to mark your attendance again for this event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrivateEventConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmPrivateEventChange} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, change to "Didn't Go"
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CancelMessageDialog
        isOpen={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelEvent}
        eventTitle={event?.title} />

      {/* LoginPromptDialog implementation */}
      <LoginPromptDialog
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action="RSVP, save events, or interact with event features"
      />

    </div>);

}