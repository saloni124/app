
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  DollarSign,
  ArrowLeft,
  Flag,
  Check,
  Loader2 // Added Loader2 for loading indicator
} from 'lucide-react';
import { Event } from '@/api/entities';
import { EventAttendance } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const sampleAttendees = [
  {
    id: 'sample_1',
    event_id: 'future-event',
    user_email: 'sarah.m@example.com',
    user_name: 'Sarah Martinez',
    user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=100&h=100&fit=crop',
    status: 'going',
    requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    message: 'Excited to attend!',
    payment_status: 'paid'
  },
  {
    id: 'sample_2',
    event_id: 'future-event',
    user_email: 'james.t@example.com',
    user_name: 'James Thompson',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'going',
    requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: 'unpaid'
  },
  {
    id: 'sample_3',
    event_id: 'future-event',
    user_email: 'emma.w@example.com',
    user_name: 'Emma Wilson',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'going',
    requested_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    message: "Would love to come!",
    payment_status: 'paid'
  },
  {
    id: 'sample_4',
    event_id: 'future-event',
    user_email: 'alex.c@example.com',
    user_name: 'Alex Chen',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    status: 'maybe',
    requested_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample_5',
    event_id: 'future-event',
    user_email: 'maria.g@example.com',
    user_name: 'Maria Garcia',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    status: 'maybe',
    requested_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample_6',
    event_id: 'future-event',
    user_email: 'david.k@example.com',
    user_name: 'David Kim',
    user_avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    status: 'pending',
    requested_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    message: "Would love to join this event!",
    payment_status: 'unpaid'
  },
  {
    id: 'sample_7',
    event_id: 'future-event',
    user_email: 'lisa.p@example.com',
    user_name: 'Lisa Park',
    user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    status: 'pending',
    requested_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: "Can't wait!"
  },
  {
    id: 'sample_8',
    event_id: 'future-event',
    user_email: 'tom.b@example.com',
    user_name: 'Tom Brown',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    status: 'invited',
    requested_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample_9',
    event_id: 'future-event',
    user_email: 'jen.s@example.com',
    user_name: 'Jennifer Smith',
    user_avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
    status: 'invited',
    requested_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'sample_10',
    event_id: 'future-event',
    user_email: 'mike.j@example.com',
    user_name: 'Mike Johnson',
    user_avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop',
    status: 'cant_go',
    requested_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];


export default function EventAttendees() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get URL parameters directly
  const urlParams = new URLSearchParams(location.search);
  const eventId = urlParams.get('id');
  const fromPage = urlParams.get('from'); // Get the source page

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]); // Start with empty array
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'going'); // Initialize activeTab from URL or default
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [attendeeToRemove, setAttendeeToRemove] = useState(null);
  const [shouldRefreshAttendees, setShouldRefreshAttendees] = useState(false); // State to trigger refresh

  const goingAttendees = useMemo(() => attendees.filter((a) => a.status === 'going' || a.status === 'approved'), [attendees]);
  const maybeAttendees = useMemo(() => attendees.filter((a) => a.status === 'maybe'), [attendees]);
  const cantGoAttendees = useMemo(() => attendees.filter((a) => a.status === 'cant_go'), [attendees]);
  const invitedAttendees = useMemo(() => attendees.filter((a) => a.status === 'invited'), [attendees]);
  const pendingAttendees = useMemo(() => attendees.filter((a) => a.status === 'pending'), [attendees]);

  const filterAndSearchAttendees = useCallback(() => {
    let filtered = [];

    switch (activeTab) {
      case 'going':
        filtered = goingAttendees;
        break;
      case 'maybe':
        filtered = maybeAttendees;
        break;
      case 'cant_go':
        filtered = cantGoAttendees;
        break;
      case 'invited':
        filtered = invitedAttendees;
        break;
      case 'pending':
        filtered = pendingAttendees;
        break;
      default:
        filtered = attendees;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(query) ||
        a.email?.toLowerCase().includes(query) ||
        a.instagram?.toLowerCase().includes(query) ||
        a.user_name?.toLowerCase().includes(query) ||
        a.user_email?.toLowerCase().includes(query)
      );
    }

    setFilteredAttendees(filtered);
  }, [activeTab, searchQuery, attendees, goingAttendees, maybeAttendees, cantGoAttendees, invitedAttendees, pendingAttendees]);

  const loadEventData = useCallback(async () => {
    if (!eventId) {
      navigate(createPageUrl('Profile'));
      return;
    }

    setLoading(true);

    try {
      const [fetchedEvent, user] = await Promise.all([
        Event.filter({ id: eventId }),
        User.me().catch(() => null)
      ]);

      const eventData = Array.isArray(fetchedEvent) ? fetchedEvent[0] : fetchedEvent;
      setEvent(eventData);
      setCurrentUser(user);
      setIsOwner(user && eventData && user.email === eventData.organizer_email);

      // Try to fetch real attendance data
      try {
        const fetchedAttendees = await EventAttendance.filter({ event_id: eventId });

        if (fetchedAttendees && fetchedAttendees.length > 0) {
          console.log("Found real attendees:", fetchedAttendees.length);
          setAttendees(fetchedAttendees); // Replace sample with real data
        } else {
          console.log("No attendees found - using sample data with", sampleAttendees.length, "guests");
          // Map sample attendees to current eventId
          setAttendees(sampleAttendees.map(att => ({ ...att, event_id: eventId })));
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        console.log("Using sample data due to error");
        setAttendees(sampleAttendees.map(att => ({ ...att, event_id: eventId })));
      }

    } catch (error) {
      console.error("Error loading event:", error);
      setAttendees(sampleAttendees.map(att => ({ ...att, event_id: eventId })));
    } finally {
      setDataLoaded(true);
      setLoading(false);
    }
  }, [eventId, navigate]);

  // Effect to trigger refresh if navigation state indicates it (e.g., after inviting guests)
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Navigation state indicates refresh needed.");
      // Add a small delay to allow backend to process new attendance records
      setTimeout(() => {
        loadEventData();
      }, 300);

      // Clear the state to prevent re-triggering
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location.state, loadEventData, navigate, location.pathname, location.search]);

  // Main effect for loading data, now also dependent on shouldRefreshAttendees
  useEffect(() => {
    if (eventId) {
      console.log("Loading event data due to eventId or refresh trigger change.");
      loadEventData();
    }
  }, [eventId, loadEventData, shouldRefreshAttendees]);

  useEffect(() => {
    if (dataLoaded) { // Trigger filtering once data is loaded (whether real or sample)
      filterAndSearchAttendees();
    }
  }, [dataLoaded, filterAndSearchAttendees]);

  const handleStatusChange = async (attendeeId, newStatus) => {
    try {
      // Simulate API call for sample data
      const isSampleAttendee = sampleAttendees.some((a) => a.id === attendeeId);
      if (!isSampleAttendee) { // Only call API if it's not a sample attendee
        await EventAttendance.update(attendeeId, { status: newStatus });
      }

      setAttendees((prev) => prev.map((att) => att.id === attendeeId ? { ...att, status: newStatus } : att));
    } catch (error) {
      console.error("Error updating status:", error);
      // For sample data or if API fails, update locally for responsiveness
      setAttendees((prev) => prev.map((att) => att.id === attendeeId ? { ...att, status: newStatus } : att));
    }
  };

  const handlePaymentStatusChange = async (attendee, newPaymentStatus) => {
    try {
      // Simulate API call for sample data
      const isSampleAttendee = sampleAttendees.some((a) => a.id === attendee.id);
      if (!isSampleAttendee) { // Only call API if it's not a sample attendee
        await EventAttendance.update(attendee.id, { payment_status: newPaymentStatus });
      }
      setAttendees((prev) => prev.map((a) => a.id === attendee.id ? { ...a, payment_status: newPaymentStatus } : a));
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handleRemoveGuestInitiate = (attendee) => {
    setAttendeeToRemove(attendee);
    setIsConfirmRemoveOpen(true);
  };

  const handleRemoveGuest = async () => {
    if (!attendeeToRemove) return;

    try {
      // Simulate API call for sample data
      const isSampleAttendee = sampleAttendees.some((a) => a.id === attendeeToRemove.id);
      if (!isSampleAttendee) { // Only call API if it's not a sample attendee
        await EventAttendance.delete(attendeeToRemove.id);
      }
      setAttendees((prev) => prev.filter((att) => att.id !== attendeeToRemove.id));
    } catch (error) {
      console.error("Error removing guest:", error);
      // For sample data or if API fails, just remove locally
      setAttendees((prev) => prev.filter((att) => att.id !== attendeeToRemove.id));
    }

    setIsConfirmRemoveOpen(false);
    setAttendeeToRemove(null);
  };

  const isPastEvent = event?.date && new Date(event.date) < new Date();

  const tabs = [
    { value: 'going', label: 'Going', count: goingAttendees.length },
    { value: 'maybe', label: 'Maybe', count: maybeAttendees.length },
    { value: 'cant_go', label: "Can't Go", count: cantGoAttendees.length },
    { value: 'pending', label: 'Pending', count: pendingAttendees.length },
    { value: 'invited', label: 'Invited', count: invitedAttendees.length }
  ];


  // Handle back button with source page awareness
  const handleBack = () => {
    if (fromPage === 'Profile') {
      navigate(createPageUrl('Profile'));
    } else if (eventId) {
      navigate(createPageUrl(`EventDetails?id=${eventId}`));
    } else {
      // Fallback if no eventId and not from Profile
      navigate(-1); // Go back one in history
    }
  };

  const renderStatusBadge = (status) => {
    const styles = {
      going: 'bg-green-100 text-green-800 border-green-200',
      approved: 'bg-green-100 text-green-800 border-green-200', // Added approved for consistency
      maybe: 'bg-orange-100 text-orange-800 border-orange-200',
      cant_go: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      invited: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const labels = {
      going: 'Going',
      approved: 'Approved',
      maybe: 'Maybe',
      cant_go: "Can't Go",
      pending: 'Pending',
      invited: 'Invited'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[status] || status}
      </span>
    );

  };

  const AttendeeCard = ({ attendee }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <img
              src={attendee.avatar || attendee.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name || attendee.user_name || 'Guest')}&background=random`}
              alt={attendee.name || attendee.user_name || 'Guest'}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <Link
                to={createPageUrl(`Profile?user=${encodeURIComponent(attendee.email || attendee.user_email || '')}`)}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate">
                {attendee.name || attendee.user_name}
              </Link>
              <p className="text-sm text-gray-500 truncate">{attendee.email || attendee.user_email}</p>
              {attendee.phone && <p className="text-sm text-gray-500 truncate">{attendee.phone}</p>}
              {attendee.instagram &&
                <a href={`https://instagram.com/${attendee.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline truncate block">
                  {attendee.instagram}
                </a>
              }
              {attendee.website &&
                <a href={`https://${attendee.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                  {attendee.website}
                </a>
              }
              <div className="mt-2">
                {renderStatusBadge(attendee.status)}
                {event?.price > 0 && attendee.payment_status && (
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    attendee.payment_status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                    attendee.payment_status === 'unpaid' ? 'bg-red-100 text-red-800 border-red-200' :
                    attendee.payment_status === 'refunded' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                    'bg-orange-100 text-orange-800 border-orange-200'
                  }`}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    {attendee.payment_status === 'paid' ? 'Paid' :
                     attendee.payment_status === 'unpaid' ? 'Unpaid' :
                     attendee.payment_status === 'refunded' ? 'Refunded' :
                     attendee.payment_status === 'partially_paid' ? 'Partial' : attendee.payment_status}
                  </span>
                )}
              </div>
              {attendee.plus_ones_count > 0 &&
                <p className="text-sm text-gray-600 mt-1">
                  Plus {attendee.plus_ones_count}: {attendee.plus_ones_names?.join(', ')}
                </p>
              }
              {(attendee.note || attendee.message) &&
                <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600 italic">"{attendee.note || attendee.message}"</p>
                </div>
              }
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Payment Status Menu - Only for future paid events */}
              {event?.price > 0 && !isPastEvent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(attendee, 'paid')}>
                      Mark as <span className="text-green-600 font-medium ml-1">Paid</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(attendee, 'unpaid')}>
                      Mark as <span className="text-red-600 font-medium ml-1">Unpaid</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(attendee, 'refunded')}>
                      Mark as <span className="text-gray-600 font-medium ml-1">Refunded</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isPastEvent && (
                    <>
                      <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, 'going')}>
                        <span className="text-gray-900">Mark as </span>
                        <span className="text-green-600 font-medium ml-1">Going</span>
                        {(attendee.status === 'going' || attendee.status === 'approved') && <Check className="ml-auto h-4 w-4 text-green-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, 'maybe')}>
                        <span className="text-gray-900">Mark as </span>
                        <span className="text-orange-600 font-medium ml-1">Maybe</span>
                        {attendee.status === 'maybe' && <Check className="ml-auto h-4 w-4 text-orange-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, 'cant_go')}>
                        <span className="text-gray-900">Mark as </span>
                        <span className="text-red-600 font-medium ml-1">Can't Go</span>
                        {attendee.status === 'cant_go' && <Check className="ml-auto h-4 w-4 text-red-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(attendee.id, 'pending')}>
                        <span className="text-gray-900">Mark as </span>
                        <span className="text-yellow-600 font-medium ml-1">Pending</span>
                        {attendee.status === 'pending' && <Check className="ml-auto h-4 w-4 text-yellow-600" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveGuestInitiate(attendee)}
                        className="text-red-600">
                        Remove Guest
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-200 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full">

          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Guest List</h1>
          {event && <p className="text-sm text-gray-600">{event.title}</p>}
        </div>
        {isOwner && !isPastEvent && // Preserve the !isPastEvent condition for the invite button
          <Button
            onClick={() => navigate(createPageUrl(`InviteGuests?id=${eventId}`))}
            size="sm" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 rounded-md px-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:bg-blue-700 text-white">


            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        }
      </div>

      <div className="mx-auto px-4 max-w-xl">
        <div className="flex items-center gap-2 mt-4"> {/* Added margin-top for spacing after new header */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white" />
          </div>
          {/* Original invite button moved to the sticky header */}
        </div>

        <div className="mt-4 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="flex -mb-px space-x-6 whitespace-nowrap px-4 min-w-max">
            {tabs.map((tab) =>
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`py-3 px-1 text-sm font-medium flex-shrink-0 ${
                  activeTab === tab.value ?
                    'border-b-2 border-blue-600 text-blue-600' :
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }>
                {tab.label} <span className="bg-gray-200 text-gray-700 text-xs font-bold ml-1 px-2 py-0.5 rounded-full">{tab.count}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="mt-6 space-y-3 pb-6 overflow-y-auto max-h-[calc(100vh-280px)]">
          <AnimatePresence mode="wait">
            {filteredAttendees.length > 0 ?
              filteredAttendees.map((attendee) =>
                <AttendeeCard key={attendee.id} attendee={attendee} />
              ) :

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-gray-50">

                <p>No guests found</p>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Guest?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {attendeeToRemove?.name || attendeeToRemove?.user_name} from this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRemoveOpen(false)} className="bg-background mt-2 px-4 py-4 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveGuest}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
