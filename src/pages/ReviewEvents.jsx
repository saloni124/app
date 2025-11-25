import React, { useState, useEffect, useCallback } from "react";
import { Event } from "@/api/entities";
import { EventAttendance } from "@/api/entities";
import { EventReview } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, MessageCircle, Calendar, MapPin, Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from

"@/components/ui/dialog";
import ReviewDialog from '../components/event/ReviewDialog';
import { format } from 'date-fns';
import { apiCache } from "../components/apiCache"; // Added import

export default function ReviewEvents() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [eventsToReview, setEventsToReview] = useState([]); // Renamed from pastEvents
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingEvent, setReviewingEvent] = useState(null);
  // `editingReview` is no longer used for existing reviews on this page, only for type consistency with ReviewDialog
  // For this page, we only initiate new reviews.
  const [editingReview, setEditingReview] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [eventToProcess, setEventToProcess] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: "",
    liked: true,
    vibe_tags: "", // This is sent to ReviewDialog, which might pass it back as `scene_tags`
    would_recommend: true,
    share_with_host: false,
    attended: true,
    post_to_events_page: false
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState("");

  const loadEventsToReview = useCallback(async () => {
    if (!currentUser?.email) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      // CRITICAL FIX: Get events from user.attended_events array (the source of truth)
      const attendedEventIds = Array.isArray(currentUser.attended_events) ? currentUser.attended_events : [];

      // Validate ObjectIds
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      const validAttendedEventIds = attendedEventIds.filter((id) => {
        const isValid = isValidObjectId(id);
        if (!isValid) {
          console.warn(`🗑️ Skipping invalid event ID: ${id}`);
        }
        return isValid;
      });

      console.log('✅ Valid attended event IDs from user.attended_events:', validAttendedEventIds);

      if (validAttendedEventIds.length === 0) {
        setEventsToReview([]);
        setLoading(false);
        return;
      }

      // Get all attended events
      const attendedEvents = await Event.filter(
        { id: { $in: validAttendedEventIds } },
        '-date',
        50
      );

      // Get existing reviews to filter out already reviewed events
      const existingReviews = await EventReview.filter(
        { user_email: currentUser.email },
        '-created_date',
        100
      );

      const reviewedEventIds = new Set(existingReviews.map((review) => review.event_id));

      // CRITICAL FIX: Only show past events that haven't been reviewed
      const now = new Date();
      const pastAttendedEvents = attendedEvents.filter((event) => {
        const eventDate = new Date(event.date);
        const isPast = eventDate < now;
        const notReviewed = !reviewedEventIds.has(event.id);

        console.log(`Event: ${event.title}, isPast: ${isPast}, notReviewed: ${notReviewed}`);
        return isPast && notReviewed;
      });

      console.log('✅ Final events to review:', pastAttendedEvents.map((e) => e.title));
      setEventsToReview(pastAttendedEvents);

    } catch (error) {
      console.error("Error loading events to review:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);


  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const user = await User.me();
      if (!user) {
        await User.loginWithRedirect(window.location.href);
        return;
      }
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError("Could not load user data. Please try again.");
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (currentUser) {
      loadEventsToReview();
    }
  }, [currentUser, loadEventsToReview]); // Changed dependency to loadEventsToReview


  // Effect to reset review form for new reviews when dialog opens
  useEffect(() => {
    if (reviewDialogOpen) {// Always reset for a new review on this page
      setReviewForm({
        rating: 5,
        review_text: "",
        liked: true,
        vibe_tags: "",
        would_recommend: true,
        share_with_host: false,
        attended: true,
        post_to_events_page: false
      });
      setEditingReview(null); // Ensure editingReview is null for new review
    }
  }, [reviewDialogOpen]);

  const updateAttendedStatus = async (eventId) => {
    if (!currentUser) {
      alert("User not logged in.");
      return;
    }

    // Immediately remove from UI
    setEventsToReview((prevEvents) => prevEvents.filter((e) => e.id !== eventId)); // Updated state variable

    try {
      // Create a review with attended: false to mark it as "didn't go"
      await EventReview.create({
        event_id: eventId,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        rating: 1, // Dummy rating
        liked: false,
        attended: false
      });

      // Also update the attendance record if it exists
      const attendanceRecords = await EventAttendance.filter({ event_id: eventId, user_email: currentUser.email });
      if (attendanceRecords.length > 0) {
        await EventAttendance.update(attendanceRecords[0].id, { status: 'cant_go' });
      }

      console.log(`Successfully marked event ${eventId} as "didn't go"`);
    } catch (error) {
      console.error("Failed to update attended status:", error);
      alert("Could not update your attended status. Please try again.");
      // Reload to revert UI on failure
      await loadEventsToReview(); // Updated function call
    }
  };

  const handleToggleAttended = (event) => {
    if (event.privacy_level === 'private') {
      setEventToProcess(event);
      setConfirmDialogOpen(true);
    } else {
      updateAttendedStatus(event.id);
    }
  };

  const handleConfirmToggle = async () => {
    if (!eventToProcess) return;
    await updateAttendedStatus(eventToProcess.id);
    setConfirmDialogOpen(false);
    setEventToProcess(null);
  };

  const handleReviewEvent = (event) => {
    setReviewingEvent(event);
    setEditingReview(null); // Always null for new reviews on this page
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {// Changed formData to reviewData
    if (!reviewingEvent || !currentUser) return; // Simplified check
    setIsSubmittingReview(true);
    setError(""); // Added setError("")

    try {
      // Destructure expected fields from reviewData (assuming ReviewDialog sends `scene_tags`)
      const { attended, liked, review_text, rating, scene_tags } = reviewData;
      // Process scene_tags string into an array
      const vibeTagsArray = scene_tags ? scene_tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) : [];

      // Create the review
      await EventReview.create({
        event_id: reviewingEvent.id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        user_avatar: currentUser.avatar,
        attended, // Use the attended status from reviewData
        liked, // Use liked status from reviewData
        review_text,
        rating,
        scene_tags: vibeTagsArray, // Use the processed scene_tags
        would_recommend: liked, // Set would_recommend based on liked status
        post_to_events_page: true, // Always post to events page from here
        share_with_host: true // Always share with host from here
      });

      // CRITICAL FIX: If user "Didn't Go", update their attendance record
      if (!attended) {
        // Find existing attendance record
        const existingAttendance = await EventAttendance.filter({
          event_id: reviewingEvent.id,
          user_email: currentUser.email
        }, '', 1); // Limit to 1 record

        if (existingAttendance && existingAttendance.length > 0) {
          // Update existing record to 'cant_go'
          await EventAttendance.update(existingAttendance[0].id, { status: 'cant_go' });
        } else {
          // Create new record with 'cant_go' if no existing one is found
          await EventAttendance.create({
            event_id: reviewingEvent.id,
            user_email: currentUser.email,
            user_name: currentUser.full_name,
            status: 'cant_go'
          });
        }
      }

      setReviewingEvent(null);
      setReviewDialogOpen(false); // Used setReviewDialogOpen to match existing state
      loadEventsToReview(); // Refresh the list of events to review

      // Invalidate MyList cache and notify it to re-fetch
      apiCache.invalidate('myListInitialData');
      window.dispatchEvent(new CustomEvent('plannerDataChanged'));

    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again."); // Using setError
    } finally {
      setIsSubmittingReview(false);
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
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={loadEventsToReview}>Try Again</Button> {/* Updated function call */}
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }} className="mx-1 my-16 flex items-center gap-4">


          <Button variant="ghost" size="icon" onClick={() => {
            navigate(createPageUrl("Profile?tab=reviews"));
          }} className="text-gray-800 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl text-xl font-semibold">Review Events ({eventsToReview.length})</h1> {/* Updated state variable */}
        </motion.div>

        {eventsToReview.length === 0 ? // Updated state variable
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-16 bg-white border border-gray-200 rounded-2xl">

            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No past events to review</h3>
            <p className="text-gray-500 mb-6">Start attending events to share your experiences!</p>
            <Link to={createPageUrl("Feed")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                Discover Events
              </Button>
            </Link>
          </motion.div> :

        <div className="space-y-4">
            {eventsToReview.map((event, index) => // Updated state variable
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                <div className="flex">
                  {/* Event Image */}
                  <div className="w-28 flex-shrink-0">
                    <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="h-full">
                      <div className="h-full relative cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                      src={event.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop"}
                      alt={event.title}
                      className="w-full h-full object-cover" />

                        <div className="absolute top-1 left-1">
                          <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleAttended(event);
                        }}
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-600 text-white hover:bg-red-600 group transition-colors">
                            <span className="flex items-center">
                              <Check className="w-2.5 h-2.5 mr-0.5 group-hover:hidden" />
                              <span className="group-hover:hidden">I Went</span>
                              <span className="hidden group-hover:inline text-[9px]">Didn't Go?</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Event Details & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
                        <h3 className="font-bold text-gray-900 truncate mb-1 hover:text-blue-600 cursor-pointer">{event.title}</h3>
                      </Link>
                      <div className="space-y-1 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{event.venue_name || event.location}</span>
                        </div>
                      </div>

                      {/* No "Reviewed" badge or Edit/Remove buttons here, as reviewed events are filtered out */}

                      <div className="text-sm text-gray-600 mb-3">
                        Hosted by{' '}
                        <Link to={createPageUrl(`Profile?user=${event?.organizer_email}`)} className="font-medium text-blue-600 hover:underline">
                          {event?.organizer_name || 'Event Organizer'}
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* Always show "Write Review" button as events in this list are unreviewed */}
                      <Button
                    onClick={() => handleReviewEvent(event)}
                    size="sm" className="bg-blue-600 text-white px-12 text-xs font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md hover:bg-blue-700 h-8">

                        <MessageCircle className="w-3 h-3 mr-1" />
                        Write Review
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        }

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription className="py-2">
                You are about to mark that you didn't attend a private event. For your privacy and security, this action is permanent and you will not be able to mark your attendance again for this event.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmToggle} className="bg-red-600 hover:bg-red-700 text-white">Yes, change to "Didn't Go"</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog - Now a separate component */}
        {reviewingEvent &&
        <ReviewDialog
          isOpen={reviewDialogOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              // When dialog closes, reset states
              setReviewingEvent(null);
              setEditingReview(null); // Ensure this is null
            }
            setReviewDialogOpen(isOpen);
          }}
          eventTitle={reviewingEvent.title}
          initialReviewData={reviewForm} // Pass the prepared reviewForm state
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmittingReview}
          isEditing={!!editingReview} // This will always be false on this page as we only create new reviews
        />
        }
      </div>
    </div>);

}