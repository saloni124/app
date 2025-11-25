import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Bookmark, MapPin, Loader2, User, Check, X, Ticket, CheckCircle, HelpCircle, XCircle, Camera } from 'lucide-react';

const categoryColors = {
  music: "bg-teal-100 text-teal-800",
  art: "bg-purple-100 text-purple-800",
  food: "bg-orange-100 text-orange-800",
  business: "bg-gray-200 text-gray-800",
  wellness: "bg-green-100 text-green-800",
  tech: "bg-indigo-100 text-indigo-800",
  nightlife: "bg-pink-100 text-pink-800",
  culture: "bg-amber-100 text-amber-800",
  outdoor: "bg-lime-100 text-lime-800",
  market: "bg-cyan-100 text-cyan-800",
  talk: "bg-fuchsia-100 text-fuchsia-800",
  rave: "bg-rose-100 text-rose-800",
  popup: "bg-sky-100 text-sky-800",
  party: "bg-red-100 text-red-800",
  picnic: "bg-emerald-100 text-emerald-800",
  "happy-hour": "bg-yellow-100 text-yellow-800",
  "rooftop": "bg-violet-100 text-violet-800",
  "bar": "bg-slate-100 text-slate-800",
  "park": "bg-teal-50 text-teal-700",
  "co-working": "bg-blue-100 text-blue-800",
  other: "bg-stone-100 text-stone-800"
};

const Badge = ({ children, className, variant }) => {
  const baseClasses = "text-xs px-1.5 py-0.5 rounded-full inline-flex items-center font-medium";
  const variantClasses = variant === 'outline' ?
  "text-blue-800 border border-blue-200 bg-blue-50" :
  categoryColors[children.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return <span className={`${baseClasses} ${variantClasses} ${className}`}>{children}</span>;
};

export default function FeedEventListItem({
  event,
  onSaveToggle,
  savedEvents,
  isSaved: initialIsSaved,
  onDataChange,
  onShowFriends,
  isSaving,
  showFriendsGoing = false,
  showAttendanceButton = false,
  onAttendanceChange,
  processingAttendance = false,
  isFeedView = false,
  currentAttendanceStatus,
  currentUser,
  ...props
}) {
  // Fix: Move useState call to the top level of the component, before any conditional returns
  const [showTicketModal, setShowTicketModal] = useState(false);
  const navigate = useNavigate();

  // Calculate isSaved based on initialIsSaved or savedEvents Set
  const isSaved = initialIsSaved ?? (savedEvents ? savedEvents.has(event?.id) : false);

  if (!event) {
    return <div className="bg-white rounded-xl shadow p-4 animate-pulse h-[136px]"></div>;
  }

  const {
    id,
    title,
    cover_image,
    date,
    organizer_name,
    venue_name,
    location,
    category,
    price,
    friends_going,
    attended
  } = event;

  const handleCardClick = () => {
    navigate(createPageUrl(`EventDetails?id=${id}`));
  };

  const defaultImage = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop";
  const defaultOrganizerAvatar = "https://www.gravatar.com/avatar/?d=mp";

  const handleAttendanceClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (processingAttendance || !onAttendanceChange) return;
    onAttendanceChange(id);
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return 'Time TBD';
    try {
      const date = new Date(dateString);
      if (isFeedView) {
        return format(date, 'p');
      } else {
        const dayOfWeek = format(date, 'EEE');
        const dateStr = format(date, 'MMMM d');
        const time = format(date, 'p');
        return `${dayOfWeek}, ${dateStr} • ${time}`;
      }
    } catch {
      return 'Time TBD';
    }
  };

  const RsvpDesignator = () => {
    // Always return a div to maintain consistent spacing
    let text = '';
    let icon = null;
    let colorClass = 'text-gray-600';

    if (!showAttendanceButton && currentAttendanceStatus && currentAttendanceStatus !== 'no_rsvp') {
      switch (currentAttendanceStatus) {
        case 'going':
        case 'approved':
          text = "Going";
          icon = <CheckCircle className="w-3 h-3" />;
          colorClass = 'text-green-600';
          break;
        case 'maybe':
          text = 'Might go';
          icon = <HelpCircle className="w-3 h-3" />;
          colorClass = 'text-yellow-600';
          break;
        case 'pending':
          text = 'Request pending';
          icon = <Loader2 className="w-3 h-3 animate-spin" />;
          colorClass = 'text-orange-500';
          break;
        case 'invited':
          text = 'Invited';
          icon = <CheckCircle className="w-3 h-3" />;
          colorClass = 'text-purple-600';
          break;
        case 'cant_go':
          text = "Can't go";
          icon = <XCircle className="w-3 h-3" />;
          colorClass = 'text-red-600';
          break;
      }
    }

    // Return placeholder div with consistent height whether content exists or not
    return (
      <div className={`flex items-center gap-1 text-xs font-semibold mt-1 mb-1 h-4 ${text ? colorClass : ''}`}>
        {icon}
        {text && <span>{text}</span>}
      </div>);

  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex min-h-[180px]"
      onClick={handleCardClick}
      {...props}>

      <div className="px-2 py-2 w-1/3 flex-shrink-0">
        {cover_image ?
        <img
          src={cover_image}
          alt={title}
          className="w-full h-full object-cover rounded-lg border border-gray-200"
          onError={(e) => {e.target.src = defaultImage;}} /> :


        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg border border-gray-200">
            <Camera className="w-8 h-8" />
          </div>
        }
      </div>
      <div className="px-4 py-2 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-bold text-blue-600">
              {formatEventTime(date)}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isSaving) return;
                onSaveToggle(id);
              }}
              disabled={isSaving}
              className="w-6 h-6 flex-shrink-0 -mt-1 -mr-1 flex items-center justify-center rounded-full hover:bg-gray-100">

              {isSaving ?
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> :
              <Bookmark className={`w-5 h-5 transition-all ${isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
              }
            </button>
          </div>
          <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">
            {title}
          </h3>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <User className="w-3 h-3 flex-shrink-0" />
              <p className="truncate">{organizer_name}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <p className="truncate">{venue_name || location}</p>
            </div>
          </div>
          <RsvpDesignator />
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-1">
            <Badge>{category}</Badge>
            {price !== undefined && price !== null &&
            <Badge variant="outline">{price > 0 ? `$${price}` : 'Free'}</Badge>
            }
          </div>

          <div className="mt-1 mb-1 flex items-center justify-between">
            {/* Hide friends going if currentAttendanceStatus is 'pending' */}
            {!showAttendanceButton && showFriendsGoing && friends_going && friends_going.length > 0 && currentAttendanceStatus !== 'pending' &&
            <div onClick={(e) => {e.preventDefault();e.stopPropagation();onShowFriends(event);}} className="flex items-center gap-2 cursor-pointer group">
                <div className="flex -space-x-1">
                  {friends_going.slice(0, 2).map((friend, index) =>
                <img key={index} src={friend.avatar || defaultOrganizerAvatar} alt={friend.name} className="w-4 h-4 rounded-full ring-2 ring-white object-cover" />
                )}
                </div>
                <p className="text-xs text-gray-600 group-hover:text-blue-600">
                  {friends_going.length} {friends_going.length > 1 ? 'friends' : 'friend'} going
                </p>
              </div>
            }
          </div>

          {showAttendanceButton &&
          <div>
              <button
              onClick={handleAttendanceClick}
              disabled={processingAttendance}
              className={`w-full text-xs px-2 py-1 rounded-md font-medium transition-colors h-7 ${attended ? 'bg-green-600 hover:bg-red-600 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}>

                {processingAttendance ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>{attended ? 'I Went' : "Didn't Go"}</span>}
              </button>
            </div>
          }

          {price !== undefined && price !== null && !showAttendanceButton && (
          currentAttendanceStatus === 'going' || currentAttendanceStatus === 'approved' ?
          <div>
                <Link to={createPageUrl("MyTickets")} className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-md font-medium transition-colors h-7">
                  <Ticket className="w-3 h-3 mr-2 inline-block" />
                  Show Tickets
                </Link>
              </div> :
          <div>
                <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTicketModal(true);
              }}
              disabled={currentAttendanceStatus === 'cant_go' || currentAttendanceStatus === 'pending'}
              className={`w-full text-xs px-2 py-1 rounded-md font-medium transition-colors h-7 ${currentAttendanceStatus === 'cant_go' || currentAttendanceStatus === 'pending' ?
              'bg-gray-300 text-gray-500 cursor-not-allowed' :
              'bg-blue-600 hover:bg-blue-700 text-white'}`}>

                  {price === 0 ? 'Get Free Tickets' : `Get Tickets • $${price}`}
                </button>
              </div>)
          }
        </div>
      </div>
    </div>);

}