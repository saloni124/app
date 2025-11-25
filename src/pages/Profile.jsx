import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/api/entities";
import { Event } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Instagram, Globe, Users, Calendar, Settings, Edit3, Trash2,
  MessageCircle, Sparkles, Loader2, SquarePlus, MoreVertical, Flag, EyeOff,
  Ban, Star, ThumbsUp, ThumbsDown, Pencil, Check, ArrowLeft, UserPlus, MessageSquare, CheckCircle,
  User as UserIcon, Plus,
  Heart, Share2, Type, Clock, LogIn, Lock, BookOpen, CalendarDays, UserCheck, Tag }
from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiCache } from "../components/apiCache";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { InvokeLLM } from "@/api/integrations";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { EventReview } from "@/api/entities";
import PerformanceOverview from "../components/profile/PerformanceOverview";
import BusinessReviewsTab from "../components/profile/BusinessReviewsTab";
import ProfileEventCard from '../components/profile/ProfileEventCard';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import ReviewDialog from '../components/event/ReviewDialog';
import CancelMessageDialog from '../components/shared/CancelMessageDialog';
import EventReelModal from '../components/event/EventReelModal';
import MemoryPostDialog from '../components/profile/MemoryPostDialog';
import LoginBypass from '../components/auth/LoginBypass';
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';
import { Album } from "@/api/entities";
import AlbumCard from '../components/profile/AlbumCard';
import EditAlbumDialog from '../components/profile/EditAlbumDialog';
import LoginPromptDialog from '../components/shared/LoginPromptDialog';

const CARD_WIDTH = 375;
const CARD_GAP = 32;

const communityAccounts = [
  'ArtHaus Collective',
  'Cucina Segreta',
  'Aura Botanical Drinks',
  'Mindful Moments LA',
  '222 Events',
  'Thursday Dating',
  'Tech Innovators Network',
  'Brooklyn Music Co.',
  'SF Tech Community',
  'NY Coders',
  'Jazz Collective NYC',
  'Austin Entrepreneurs',
  'Urban Art Guide'
];

// EXPANDED: Map profile emails to their corresponding group chat IDs
const profileGroupChatMap = {
  'thursday@demo.com': 'thursday_dating_group',
  'arthaus@demo.com': 'group-art-house',
  'underground@demo.com': 'group-underground-rave',
  '222events@demo.com': '222_events_group',
  'outdoor@demo.com': 'nyc_outdoor_group',
  'vibemaster@demo.com': 'vibemaster_events_group'
};

// Groups that user is automatically part of (always show "Group Chat" button)
const DEFAULT_JOINED_GROUPS = ['thursday_dating_group', 'group-art-house'];

// ISSUE 8 FIX: Ensure accountTypeMap is enforced
const accountTypeMap = {
  // BUSINESS ACCOUNTS
  'arthaus@demo.com': 'business',
  'thursday@demo.com': 'business',
  'wellness@demo.com': 'business',
  'underground@demo.com': 'business',
  'food@demo.com': 'business',

  '222events@demo.com': 'business',
  'city.history@example.com': 'business',
  'outdoor@demo.com': 'business',
  'future.forward@example.com': 'business',
  'bluebottle@demo.com': 'business',
  'napa@demo.com': 'business',
  'vibemaster@demo.com': 'business',

  // PERSONAL ACCOUNTS
  'maya.patel@example.com': 'personal',
  'saloni.bhatia@example.com': 'personal',
  'salonibhatia99@gmail.com': 'personal',
  'tech.innovators@example.com': 'personal',
  'brooklyn.music@example.com': 'personal',
  'maya@demo.com': 'personal',
  'alex.rivera@example.com': 'personal',
  'jordan.lee@example.com': 'personal'
};


// REVIEWS FOR BUSINESS ACCOUNTS (reviews ABOUT their events)
const businessReviewsMap = {
  'arthaus@demo.com': [
    {
      user_email: 'reviewer1@demo.com',
      user_name: 'Sarah M.',
      user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
      rating: 5,
      review_text: "Amazing venue and incredible atmosphere! The staff was super friendly and the whole experience was perfect. Can't wait for the next event!",
      liked: true,
      vibe_tags: ['artsy', 'great atmosphere'],
      would_recommend: true,
      attended: true
    },
    {
      user_email: 'reviewer2@demo.com',
      user_name: 'Marcus T.',
      user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
      rating: 4,
      review_text: "Great concept and execution. The art was thought-provoking and the space was perfect for networking.",
      liked: true,
      vibe_tags: ['networking', 'thought-provoking'],
      would_recommend: true,
      attended: true
    }],


  'thursday@demo.com': [
    {
      user_email: 'reviewer3@demo.com',
      user_name: 'Alex K.',
      user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
      rating: 5,
      review_text: "Best dating event I've been to! Great mix of people, fun icebreakers, and a relaxed atmosphere. Met some really interesting people.",
      liked: true,
      vibe_tags: ['social', 'fun', 'well-organized'],
      would_recommend: true,
      attended: true
    },
    {
      user_email: 'reviewer4@demo.com',
      user_name: 'Jamie L.',
      user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
      rating: 4,
      review_text: "Really enjoyed the event! The venue was perfect and the organizers did a great job facilitating conversations.",
      liked: true,
      vibe_tags: ['dating', 'comfortable', 'friendly'],
      would_recommend: true,
      attended: true
    }],


  'wellness@demo.com': [
    {
      user_email: 'reviewer5@demo.com',
      user_name: 'Priya S.',
      user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
      rating: 5,
      review_text: "The rooftop sunset yoga was absolutely magical! Perfect way to unwind after a long week. The instructor was amazing.",
      liked: true,
      vibe_tags: ['peaceful', 'rejuvenating', 'scenic'],
      would_recommend: true,
      attended: true
    }],


  'underground@demo.com': [
    {
      user_email: 'reviewer6@demo.com',
      user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
      rating: 5,
      review_text: "Incredible energy! The DJ lineup was fire and the warehouse setting was perfect. This is what underground techno should be.",
      liked: true,
      vibe_tags: ['underground', 'high-energy', 'amazing-music'],
      would_recommend: true,
      attended: true
    }],


  'food@demo.com': [
    {
      user_email: 'reviewer7@demo.com',
      user_name: 'Taylor M.',
      user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop',
      rating: 4,
      review_text: "Great selection of local vendors! Found some amazing artisanal products. Family-friendly and well-organized.",
      liked: true,
      vibe_tags: ['artisanal', 'local', 'family-friendly'],
      would_recommend: true,
      attended: true
    }]

};


// Add reviews ABOUT Saloni's events - LINKED TO A PAST EVENT
const reviewsAboutSalonisEvents = [
  {
    user_email: 'attendee1@example.com',
    user_name: 'Jessica R.',
    user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
    rating: 5,
    review_text: "Incredible event! The vibes were perfect and everyone was so welcoming. Can't wait for the next one!",
    liked: true,
    vibe_tags: ['welcoming', 'great energy', 'well-organized'],
    would_recommend: true,
    attended: true,
    created_date: '2024-12-15T20:30:00Z'
  },
  {
    user_email: 'attendee2@example.com',
    user_name: 'Michael T.',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    rating: 4,
    review_text: "Great venue and awesome people! Had such a good time. Definitely recommend checking out their events.",
    liked: true,
    vibe_tags: ['social', 'fun', 'good crowd'],
    would_recommend: true,
    attended: true,
    created_date: '2024-12-14T19:00:00Z'
  },
  {
    user_email: 'attendee3@example.com',
    user_name: 'Priya S.',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
    rating: 5,
    review_text: "One of the best events I've been to in a while. Everything was on point!",
    liked: true,
    vibe_tags: ['amazing', 'memorable', 'top-notch'],
    would_recommend: true,
    attended: true,
    created_date: '2024-12-13T21:15:00Z'
  },
  {
    user_email: 'attendee4@example.com',
    user_name: 'David L.',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
    rating: 5,
    review_text: "Absolutely loved it! Great music, great people, and a perfect atmosphere.",
    liked: true,
    vibe_tags: ['electric', 'friendly', 'amazing vibes'],
    would_recommend: true,
    attended: true,
    created_date: '2024-12-12T22:00:00Z'
  },
  {
    user_email: 'attendee5@example.com',
    user_name: 'Emma K.',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
    rating: 4,
    review_text: "Really fun event! Met some cool people and had a great time. Looking forward to more!",
    liked: true,
    vibe_tags: ['social', 'welcoming', 'fun'],
    would_recommend: true,
    attended: true,
    created_date: '2024-12-11T20:45:00Z'
  }];



const sampleUserReviews = {
  'Maya Patel': [
    {
      id: 'maya_written_r1',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 5,
      review_text: "ArtHaus Collective always puts on the most visually stunning and immersive events. The gallery opening was no exception. A truly inspiring evening.",
      event_id: 'mock_event_arthaus',
      liked: true,
      vibe_tags: ['artsy', 'inspiring', 'networking'],
      created_date: '2023-11-15T18:00:00Z',
      attended: true
    },
    {
      id: 'maya_written_r2',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 4,
      review_text: "A fantastic way to meet new people. While dating events can be hit or miss, Thursday's was well-organized with a great, relaxed atmosphere.",
      event_id: 'mock_event_thursday',
      liked: true,
      vibe_tags: ['social', 'relaxed', 'friendly'],
      created_date: '2023-10-22T19:30:00Z',
      attended: true
    },
    {
      id: 'maya_written_r3',
      user_email: 'maya.patel@example.com',
      user_name: 'Maya Patel',
      rating: 5,
      review_text: "Brooklyn Music Co's rooftop party was absolutely magical! The sound quality was perfect and the city views made it unforgettable.",
      event_id: 'mock_event_brooklyn',
      liked: true,
      vibe_tags: ['magical', 'great sound', 'city views'],
      created_date: '2023-09-10T20:15:00Z',
      attended: true
    }],


  'Saloni Bhatia': [
    {
      id: 'saloni_written_r1',
      user_email: 'saloni.bhatia@example.com',
      user_name: 'Saloni Bhatia',
      rating: 5,
      review_text: "The historical walking tour was incredibly informative and well-paced. A great way to see the city's history!",
      event_id: 'saloni_past_event_1',
      liked: true,
      vibe_tags: ['educational', 'outdoors', 'casual'],
      created_date: '2024-12-20T12:00:00Z',
      attended: true
    },
    {
      id: 'saloni_written_r2',
      user_email: 'saloni.bhatia@example.com',
      user_name: 'Saloni Bhatia',
      rating: 4,
      review_text: "Amazing rooftop sunset yoga session. The views were breathtaking and the instructor was fantastic!",
      event_id: 'saloni_past_event_2',
      liked: true,
      vibe_tags: ['great energy', 'scenic', 'well organized'],
      created_date: '2024-12-18T15:30:00Z',
      attended: true
    },
    {
      id: 'saloni_written_r3',
      user_email: 'saloni.bhatia@example.com',
      user_name: 'Saloni Bhatia',
      rating: 5,
      review_text: "The secret supper club exceeded all expectations! Every dish was a work of art and the atmosphere was perfect.",
      event_id: 'mock_event_cucina',
      liked: true,
      vibe_tags: ['exceeded expectations', 'artistic', 'perfect atmosphere'],
      created_date: '2024-12-15T21:40:00Z',
      attended: true
    }]

};

const sampleEventsMap = {
  'mock_event_arthaus': {
    id: 'mock_event_arthaus',
    title: 'Underground Art Gallery',
    organizer_name: 'ArtHaus Collective',
    cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop'
  },
  'mock_event_thursday': {
    id: 'mock_event_thursday',
    title: 'Thursday Singles Mixer',
    organizer_name: 'Thursday Dating',
    cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=80&fit=crop'
  },
  'mock_event_brooklyn': {
    id: 'mock_event_brooklyn',
    title: 'Rooftop DJ Set',
    organizer_name: 'Brooklyn Music Co.',
    cover_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'
  },
  'mock_event_maya': {
    id: 'mock_event_maya',
    title: 'Morning Meditation Circle',
    organizer_name: 'Mindful Moments LA',
    cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=80&h=80&fit=crop'
  },
  'mock_event_thursday2': {
    id: 'mock_event_thursday2',
    title: 'Speed Dating Night',
    organizer_name: 'Thursday Dating',
    cover_image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=80&h=80&fit=crop'
  },
  'mock_event_cucina': {
    id: 'mock_event_cucina',
    title: 'Secret Supper Club',
    organizer_name: 'Cucina Segreta',
    cover_image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=80&h=80&fit=crop'
  },
  'saloni_past_event_1': {
    id: 'saloni_past_event_1',
    title: 'Historical Walking Tour',
    organizer_name: 'City History Tours',
    organizer_email: 'city.history@example.com',
    cover_image: 'https://images.unsplash.com/photo-1541892212-85994a4c0363?w=80&h=80&fit=crop',
    date: '2024-12-16T10:00:00Z'
  },
  'saloni_past_event_2': {
    id: 'saloni_past_event_2',
    title: 'Rooftop Summer Vibes',
    organizer_name: 'Sky Deck NYC',
    organizer_email: 'events@skydeck.com',
    cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop',
    date: '2024-12-13T17:00:00Z'
  }
};

const sampleBusinessReviews = {
  'ArtHaus Collective': [
    { id: 'arthaus_r1', rating: 5, would_recommend: true, liked: true },
    { id: 'arthaus_r2', rating: 4, would_recommend: true, liked: true },
    { id: 'arthaus_r3', rating: 5, would_recommend: true, liked: true },
    { id: 'arthaus_r4', rating: 4, would_recommend: true, liked: true },
    { id: 'arthaus_r5', rating: 5, would_recommend: false, liked: false }],


  'Brooklyn Music Co.': [
    { id: 'brooklyn_r1', rating: 5, would_recommend: true, liked: true },
    { id: 'brooklyn_r2', rating: 4, would_recommend: true, liked: true },
    { id: 'brooklyn_r3', rating: 5, would_recommend: true, liked: true },
    { id: 'brooklyn_r4', rating: 3, would_recommend: false, liked: false }],


  'Tech Innovators Network': [
    { id: 'tech_r1', rating: 5, would_recommend: true, liked: true },
    { id: 'tech_r2', rating: 4, would_recommend: true, liked: true },
    { id: 'tech_r3', rating: 5, would_recommend: true, liked: true }],


  '222 Events': [
    { id: '222_r1', rating: 5, would_recommend: true, liked: true },
    { id: '222_r2', rating: 4, would_recommend: true, liked: true },
    { id: '222_r3', rating: 5, would_recommend: true, liked: true },
    { id: '222_r4', rating: 4, would_recommend: true, liked: true },
    { id: '222_r5', rating: 3, would_recommend: false, liked: false }]

};

const myProfileSampleEventsMap = {
  'my_past_event_1': {
    id: 'my_past_event_1',
    title: 'Historical Walking Tour',
    organizer_name: 'City History Tours',
    organizer_email: 'city.history@example.com',
    cover_image: 'https://images.unsplash.com/photo-1541892212-85994a4c0363?w=80&h=80&fit=crop'
  },
  'my_past_event_2': {
    id: 'my_past_event_2',
    title: 'Sunset Yoga Flow',
    organizer_name: 'Aura Wellness',
    organizer_email: 'aura.wellness@example.com',
    cover_image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=80&fit=crop'
  }
};

const reviewTexts = [
  "Amazing event with great energy!",
  "Really enjoyed the atmosphere and organization.",
  "Perfect venue and fantastic crowd.",
  "Such a well-curated experience.",
  "Exceeded my expectations completely!"
];



const tabIcons = {
  events: <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center"><div className="w-1 h-1 bg-current rounded-full"></div></div>,
  tagged: <Users className="w-4 h-4" />,
  reviews: <Star className="w-4 h-4" />,
  entries: <SquarePlus className="w-4 h-4" />
};

const getVibeTagColor = (tag) => {
  const colors = {
    'energetic': 'bg-red-100 text-red-800',
    'calm': 'bg-blue-100 text-blue-800',
    'social': 'bg-green-100 text-green-800',
    'artsy': 'bg-purple-100 text-purple-800',
    'inspiring': 'bg-yellow-100 text-yellow-800',
    'networking': 'bg-indigo-100 text-indigo-800',
    'relaxed': 'bg-teal-100 text-teal-800',
    'friendly': 'bg-orange-100 text-orange-800',
    'magical': 'bg-pink-100 text-pink-800',
    'great sound': 'bg-gray-200 text-gray-800',
    'city views': 'bg-lime-100 text-lime-800',
    'transformative': 'bg-emerald-100 text-emerald-800',
    'energizing': 'bg-cyan-100 text-cyan-800',
    'centered': 'bg-violet-100 text-violet-800',
    'scenic': 'bg-fuchsia-100 text-fuchsia-800',
    'well organized': 'bg-amber-100 text-amber-800',
    'exceeded expectations': 'bg-rose-100 text-rose-800',
    'artistic': 'bg-brown-100 text-brown-800',
    'perfect atmosphere': 'bg-blue-gray-100 text-blue-gray-800',
    'great energy': 'bg-light-blue-100 text-light-blue-800'
  };
  const normalizedTag = tag.toLowerCase().trim();
  return colors[normalizedTag] || 'bg-gray-100 text-gray-700';
};

function ReviewsTab({ reviews, eventsMap, isOwnProfile, onEdit, onDelete, onWriteMore, availableReviewCount }) {
  const getReviewTimestamp = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      if (new Date().getFullYear() - date.getFullYear() > 0) {
        return format(date, 'MMM d, yyyy');
      }
      let relativeTime = formatDistanceToNow(date);
      if (relativeTime.startsWith('about ')) {
        relativeTime = relativeTime.substring(6);
      }
      return `${relativeTime} ago`;
    } catch {
      return "a while ago";
    }
  };

  const filteredReviews = reviews.filter((review) => review.attended !== false);

  if (!filteredReviews || filteredReviews.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto pr-4 pl-4 max-w-4xl sm:px-6 lg:px-8">
      {isOwnProfile &&
        <div className="text-left pt-2 pb-4">
          <Button onClick={onWriteMore} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium h-8 px-4 py-2 text-sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Write Reviews
          </Button>
        </div>
      }
      <div className="space-y-4">
        {filteredReviews.map((review, index) => {
          const event = eventsMap[review.event_id];
          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all">

              <div className="flex w-full relative">
                {isOwnProfile &&
                  <div className="absolute top-3 right-3 flex flex-col gap-0 z-10">
                    <button
                      onClick={() => onEdit(review)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100">
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDelete(review.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-gray-100">
                      <Trash2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                }

                <div className="w-24 md:w-32 flex-shrink-0">
                  <Link to={createPageUrl(`EventDetails?id=${event?.id}`)}>
                    <img
                      src={event?.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"}
                      alt={event?.title || 'Event'}
                      className="mx-2 my-2 w-full h-40 object-cover rounded-xl border"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"; }}
                    />
                  </Link>
                </div>

                <div className="p-3 md:p-4 flex-1 flex flex-col min-w-0">
                  <div className="flex-grow flex flex-col">
                    <div className="px-1">
                      <Link to={createPageUrl(`EventDetails?id=${event?.id}`)}>
                        <h4 className="text-gray-900 mb-1 text-base font-semibold hover:text-blue-600 cursor-pointer pr-8">
                          {event?.title || review.event_title || 'Event'}
                        </h4>
                      </Link>

                      <p className="text-sm text-gray-600 mb-2">
                        Hosted by {event?.organizer_name || 'Unknown Organizer'}
                      </p>

                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) =>
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        )}
                      </div>

                      {review.review_text ?
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          "{review.review_text}"
                        </p> :
                        <p className="text-sm text-gray-400 italic mb-1">
                          No comments provided.
                        </p>
                      }
                    </div>

                    <div className="px-1 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{getReviewTimestamp(review.created_date)}</span>
                        <span className="text-gray-300">•</span>
                        {review.attended === false ?
                          <div className="flex items-center gap-1 text-gray-500">
                            <EyeOff className="w-3 h-3" />
                            <span>Didn't Go</span>
                          </div> :
                          <div className={`flex items-center gap-1 ${review.liked ? 'text-green-600' : 'text-red-600'}`}>
                            {review.liked ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                            <span>{review.liked ? 'Loved it' : 'Not my vibe'}</span>
                          </div>
                        }
                      </div>

                      {review.vibe_tags && review.vibe_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {review.vibe_tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {review.vibe_tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                              +{review.vibe_tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


// Extending simulatedDataManager for group chat functionality (local mock for this component)
const groupChatStateKey = 'simulated_group_chat_state';

const getGroupChatState = () => {
  try {
    const state = JSON.parse(localStorage.getItem(groupChatStateKey) || '{}');
    return {
      joinedGroups: state.joinedGroups || [],
      pendingGroupRequests: state.pendingGroupRequests || []
    };
  } catch (e) {
    console.error("Failed to parse group chat state from localStorage", e);
    return { joinedGroups: [], pendingGroupRequests: [] };
  }
};

const setGroupChatState = (state) => {
  localStorage.setItem(groupChatStateKey, JSON.stringify(state));
};

simulatedDataManager.getJoinedGroups = () => getGroupChatState().joinedGroups;
simulatedDataManager.getPendingGroupRequests = () => getGroupChatState().pendingGroupRequests;

simulatedDataManager.addPendingGroupRequest = (groupId) => {
  const state = getGroupChatState();
  if (!state.pendingGroupRequests.includes(groupId)) {
    state.pendingGroupRequests.push(groupId);
    setGroupChatState(state);
  }
};

simulatedDataManager.removePendingGroupRequest = (groupId) => {
  const state = getGroupChatState();
  state.pendingGroupRequests = state.pendingGroupRequests.filter((id) => id !== groupId);
  setGroupChatState(state);
};

simulatedDataManager.joinGroup = (groupId) => {
  const state = getGroupChatState();
  if (!state.joinedGroups.includes(groupId)) {
    state.joinedGroups.push(groupId);
    setGroupChatState(state);
  }
};

// NEW: Extending simulatedDataManager for memory posts, sample entries and albums (local mock for this component)
const memoryPostsKey = 'simulated_memory_posts';

const getSimulatedMemoryPosts = () => {
  try {
    return JSON.parse(localStorage.getItem(memoryPostsKey) || '{}');
  } catch (e) {
    console.error("Failed to parse simulated memory posts from localStorage", e);
    return {};
  }
};

const setSimulatedMemoryPosts = (posts) => {
  localStorage.setItem(memoryPostsKey, JSON.stringify(posts));
};

simulatedDataManager.getMemoryPosts = () => Object.values(getSimulatedMemoryPosts());

simulatedDataManager.saveMemoryPost = (post) => {
  const posts = getSimulatedMemoryPosts();
  posts[post.id] = post;
  setSimulatedMemoryPosts(posts);
};

simulatedDataManager.updateMemoryPost = (id, updates) => {
  const posts = getSimulatedMemoryPosts();
  if (posts[id]) {
    posts[id] = { ...posts[id], ...updates };
    setSimulatedMemoryPosts(posts);
  }
};

simulatedDataManager.deleteMemoryPost = (id) => {
  const posts = getSimulatedMemoryPosts();
  delete posts[id];
  setSimulatedMemoryPosts(posts);
};

// NEW: Simulated state for non-memory-post entries (e.g., default sample entries)
const simulatedEntriesStateKey = 'simulated_entries_state';

const getSimulatedEntriesState = () => {
  try {
    const state = JSON.parse(localStorage.getItem(simulatedEntriesStateKey) || '{}');
    return {
      deletedSampleEntryIds: state.deletedSampleEntryIds || []
    };
  } catch (e) {
    console.error("Failed to parse simulated entries state from localStorage", e);
    return { deletedSampleEntryIds: [] };
  }
};

const setSimulatedEntriesState = (state) => {
  localStorage.setItem(simulatedEntriesStateKey, JSON.stringify(state));
};

simulatedDataManager.deleteSampleEntry = (entryId) => {
  const state = getSimulatedEntriesState();
  if (!state.deletedSampleEntryIds.includes(entryId)) {
    state.deletedSampleEntryIds.push(entryId);
    setSimulatedEntriesState(state);
    console.log(`Sample entry ${entryId} marked as deleted in simulated storage.`);
  }
};

// --- Sample Entries Data ---
const defaultSampleEntries = [
  {
    id: 'sample_entry_1',
    title: 'Sunset Vibes in Brooklyn',
    description: 'Chasing the golden hour glow. ✨ The city painted in hues of orange and pink. Pure magic! Always a good time.',
    cover_image: 'https://images.unsplash.com/photo-1502680373032-cdba9783238a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'nature',
    scene_tags: ['sunset', 'cityscape', 'goldenhour', 'beautiful'],
    location: 'Brooklyn, NY',
    date: '2024-05-20T19:30:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_2',
    title: 'Art Walk Adventures in LA',
    description: 'Soaking in creativity at the local art walk. Always inspired by the vibrant talent in this community. 🎨 Definitely a must-see.',
    cover_image: 'https://images.unsplash.com/photo-1549887552-cb1071f4b010?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'art',
    scene_tags: ['artwalk', 'localart', 'inspiration', 'community'],
    location: 'Downtown LA',
    date: '2024-05-18T16:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_3',
    title: 'Coffee & Code Session SF',
    description: 'Fueling up with caffeine and crushing code. ☕️ Loving the energy of this co-working space today. Productive vibes only!',
    cover_image: 'https://images.unsplash.com/photo-1453928582045-af53efd0a517?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'work',
    scene_tags: ['coffee', 'coding', 'coworking', 'productivity'],
    location: 'San Francisco, CA',
    date: '2024-05-17T10:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_4',
    title: 'Late Night City Exploration',
    description: 'Just released a new album featuring photos from my late-night city explorations. Check it out! The city never sleeps, and neither do I.',
    cover_image: 'https://images.unsplash.com/photo-1517400508535-c322b70f089e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'photography',
    scene_tags: ['citylights', 'nightphotography', 'newrelease'],
    location: 'New York, NY',
    date: '2024-05-15T21:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_5',
    title: 'Morning Yoga Flow in Venice',
    description: 'Starting the day with some mindful movement. Feeling refreshed and ready for anything. 🧘‍♀️ Perfect way to reset.',
    cover_image: 'https://images.unsplash.com/photo-1534368940860-631d62c1d2e1?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'wellness',
    scene_tags: ['yoga', 'morningroutine', 'mindfulness', 'wellness'],
    location: 'Venice Beach, CA',
    date: '2024-05-14T07:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_6',
    title: 'Forest Bathing Bliss in Portland',
    description: 'Immersed in the tranquility of the forest. Nature therapy at its finest. 🌲💚 So peaceful and rejuvenating.',
    cover_image: 'https://images.unsplash.com/photo-1490750967868-a929591062ab?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'nature',
    scene_tags: ['forest', 'naturelover', 'peaceful', 'outdoors'],
    location: 'Portland, OR',
    date: '2024-05-12T13:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_7',
    title: 'Hidden Cafe Gem in Paris',
    description: 'Stumbled upon this charming little cafe today. Best pastries ever! 🥐😋 A true Parisian delight, highly recommend.',
    cover_image: 'https://images.unsplash.com/photo-1496096265110-f83ad7f96608?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'food',
    scene_tags: ['cafe', 'foodie', 'hiddenjem', 'travel'],
    location: 'Paris, France',
    date: '2024-05-10T11:00:00Z',
    status: 'published'
  },
  {
    id: 'sample_entry_8',
    title: 'Beach Day Relaxation in Maui',
    description: 'Sun, sand, and good vibes. Nothing beats a perfect beach day. ☀️🏖️ Absolute paradise!',
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    source: 'vibe-post-seed',
    category: 'travel',
    scene_tags: ['beach', 'summer', 'relax', 'vacation'],
    location: 'Maui, Hawaii',
    date: '2024-05-08T15:00:00Z',
    status: 'published'
  },
  { // New Draft Entry
    id: 'sample_entry_9_draft',
    title: 'New Idea Draft',
    description: 'Just sketching out some thoughts for a future post. This one is still a work in progress!',
    cover_image: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // A draft-like image
    source: 'vibe-post-seed',
    category: 'draft',
    scene_tags: ['ideas', 'wip', 'thoughts'],
    location: 'My Desk',
    date: '2024-05-22T10:00:00Z',
    status: 'draft'
  }];


simulatedDataManager.getSampleEntriesFor = (email, name, avatar) => {
  const allSampleEntries = defaultSampleEntries.map((entry) => ({
    ...entry,
    organizer_email: email,
    organizer_name: name,
    organizer_avatar: avatar,
    created_date: entry.date
  }));
  const deletedIds = getSimulatedEntriesState().deletedSampleEntryIds;
  return allSampleEntries.filter((entry) => !deletedIds.includes(entry.id));
};

// --- Sample Albums Data ---
const defaultSampleAlbums = [
  {
    id: 'sample_album_1',
    title: 'My Favorite Sunsets',
    description: 'A collection of breathtaking sunsets captured across different cities and landscapes. Each one tells a unique story of the day\'s end.',
    cover_image: 'https://images.unsplash.com/photo-1502680373032-cdba9783238a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    owner_email: '',
    owner_name: '',
    created_date: '2024-04-25T10:00:00Z',
    status: 'published',
    is_hidden: false,
    entries: [
      { id: 'sample_entry_1_album', cover_image: 'https://images.unsplash.com/photo-1502680373032-cdba9783238a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Brooklyn Glow', date: '2024-05-20T19:30:00Z' },
      { id: 'sample_entry_6_album', cover_image: 'https://images.unsplash.com/photo-1490750967868-a929591062ab?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Forest Edge Sunset', date: '2024-05-12T13:00:00Z' },
      { id: 'album_entry_1_1', cover_image: 'https://images.unsplash.com/photo-1481134267425-4b4703a110a3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Desert Sunset Hues', date: '2024-03-10T18:30:00Z' },
      { id: 'album_entry_1_2', cover_image: 'https://images.unsplash.com/photo-1476722050965-055c58bb0e0d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Coastal Dusk', date: '2024-02-15T17:45:00Z' },
      { id: 'album_entry_1_3', cover_image: 'https://images.unsplash.com/photo-1505325514681-3323089d81d4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Mountain Range Sunset', date: '2024-01-20T17:00:00Z' }]

  },
  {
    id: 'sample_album_2',
    title: 'Culinary Journeys',
    description: 'A visual diary of my food adventures, from street food to gourmet dining. Every bite is a memory.',
    cover_image: 'https://images.unsplash.com/photo-1496096265110-f83ad7f96608?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Unique image for this album
    owner_email: '',
    owner_name: '',
    created_date: '2024-03-18T14:30:00Z',
    status: 'published',
    is_hidden: false,
    entries: [
      { id: 'sample_entry_7_album', cover_image: 'https://images.unsplash.com/photo-1496096265110-f83ad7f96608?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Parisian Cafe Treats', date: '2024-05-10T11:00:00Z' },
      { id: 'album_entry_2_1', cover_image: 'https://images.unsplash.com/photo-1542444583-055627255152?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Vibrant Street Food', date: '2024-03-01T19:00:00Z' },
      { id: 'album_entry_2_2', cover_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Elegant Dining', date: '2024-02-20T20:00:00Z' },
      { id: 'album_entry_2_3', cover_image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Dessert Extravaganza', date: '2024-01-10T17:00:00Z' }]

  },
  {
    id: 'sample_album_3',
    title: 'Urban Vibes & Architecture',
    description: 'A curated collection showcasing the unique character of various cities and their architectural wonders. Hidden gems and iconic landmarks.',
    cover_image: 'https://images.unsplash.com/photo-1517400508535-c322b70f089e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Unique image for this album
    owner_email: '',
    owner_name: '',
    created_date: '2024-02-10T11:00:00Z',
    status: 'published',
    is_hidden: true,
    entries: [
      { id: 'sample_entry_4_album', cover_image: 'https://images.unsplash.com/photo-1517400508535-c322b70f089e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'NYC Nights', date: '2024-05-15T21:00:00Z' },
      { id: 'album_entry_3_1', cover_image: 'https://images.unsplash.com/photo-1517400508535-c322b70f089e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Skyscraper Symphony', date: '2024-01-28T22:00:00Z' },
      { id: 'album_entry_3_2', cover_image: 'https://images.unsplash.com/photo-1522276498395-f4f68677976e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Historic Alley', date: '2024-01-15T16:00:00Z' },
      { id: 'album_entry_3_3', cover_image: 'https://images.unsplash.com/photo-1502894541743-f1165a259c74?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', title: 'Modern Facades', date: '2023-12-05T14:00:00Z' }]

  }];


simulatedDataManager.getSampleAlbumsFor = (email, name) => {
  return defaultSampleAlbums.map((album) => ({
    ...album,
    owner_email: email,
    owner_name: name,
    entry_count: album.entries ? album.entries.length : 0
  }));
};


export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showAdminOverrideDialog, setShowAdminOverrideDialog] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [draftsCancelledEvents, setDraftsCancelledEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("upcoming");
  const [activeTab, setActiveTab] = useState("events");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedule, setSchedule] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [addExperienceOpen, setAddExperienceOpen] = useState(false);
  const [requestedGroups, setRequestedGroups] = useState(new Set([])); // Initialize as useState
  const [showAIDialog, setShowAIDialog] = useState(false);

  const [userReviews, setUserReviews] = useState([]); // Reviews WRITTEN BY this user
  const [reviewedEventsMap, setReviewedEventsMap] = useState({}); // Map of events reviewed by this user
  const [receivedReviews, setReceivedReviews] = useState([]); // Reviews ABOUT this user's events (when they are an organizer)
  const [reviewedEventsForCuratorMap, setReviewedEventsForCuratorMap] = useState({}); // Map of events for which this user received reviews

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [eventToDelete, setEventToDelete] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState(null);

  const [eventToCancel, setEventToCancel] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reelData, setReelData] = useState({ events: [], startIndex: 0, isOpen: false });

  const [userEvents, setUserEvents] = useState({ saved: [], attended: [] });
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);
  const [isGeneratingMemory, setIsGeneratingMemory] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);
  const [eventForMemoryPost, setEventForMemoryPost] = useState(null);

  const [userVibeEntries, setUserVibeEntries] = useState([]);
  const [entriesReloadTrigger, setEntriesReloadTrigger] = useState(0);
  const [entryToDeleteId, setEntryToDeleteId] = useState(null);
  const [showDeleteEntryDialog, setShowDeleteEntryDialog] = useState(false);
  const [showEditFeatureDialog, setShowEditFeatureDialog] = useState(false);
  const [showChooseAudienceDialog, setShowChooseAudienceDialog] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showingLoginBypass, setShowingLoginBypass] = useState(false);

  const [userAlbums, setUserAlbums] = useState([]);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showEditAlbumDialog, setShowEditAlbumDialog] = useState(false);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [showDeleteAlbumDialog, setShowDeleteAlbumDialog] = useState(false);
  const [showAudienceComingSoonDialog, setShowAudienceComingSoonDialog] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false); // New state for follow button
  const [groupChatStatus, setGroupChatStatus] = useState('none'); // 'none', 'available', 'pending', 'joined'
  const [showGroupChatPopup, setShowGroupChatPopup] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false); // New state for withdraw dialog

  const loadUserEvents = useCallback(async (user, authBypassedFlag) => {
    if (!user || authBypassedFlag) {
      setUserEvents({ saved: [], attended: [] });
      return;
    }

    try {
      const savedEventIds = user.saved_events || [];
      const attendedEventIds = user.attended_events || [];

      const validSavedIds = savedEventIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
      const validAttendedIds = attendedEventIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

      const allValidIds = [...new Set([...validSavedIds, ...validAttendedIds])];

      if (allValidIds.length === 0) {
        setUserEvents({ saved: [], attended: [] });
        return;
      }

      const events = await Event.filter({ id: { $in: allValidIds } });

      const saved = events.filter((event) => validSavedIds.includes(event.id));
      const attended = events.filter((event) => validAttendedIds.includes(event.id));

      setUserEvents({ saved, attended });
    } catch (error) {
      console.error("Error loading user events:", error);
      setUserEvents({ saved: [], attended: [] });
    }
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null);
      setShowingLoginBypass(false);

      try {
        const urlParams = new URLSearchParams(location.search);
        const profileEmailParam = urlParams.get('user');
        const tabFromUrl = urlParams.get('tab');
        const logoutParam = urlParams.get('logout');

        if (logoutParam) {
          console.log('🚪 Logout detected');
          setCurrentUser(null);
          setProfileUser(null);
          setIsOwnProfile(false);
          simulatedDataManager.clearSimulatedSession();
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.delete('logout');
          navigate(location.pathname + (newSearchParams.toString() ? '?' + newSearchParams.toString() : ''), { replace: true });
          setIsLoading(false);
          return;
        }

        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        let loggedInUser = null;

        if (authBypassed && (isAdmin || isDemo)) {
          const baseUser = simulatedDataManager.getBaseUser();

          if (isAdmin) {
            loggedInUser = { ...baseUser, _isAdminMode: true };
            const adminOverrides = simulatedDataManager.getAdminUserUpdates();
            loggedInUser = { ...loggedInUser, ...adminOverrides };
            console.log('✅ Profile: Admin mode with base user:', loggedInUser?.full_name);
          } else {
            loggedInUser = simulatedDataManager.applyDemoOverrides(baseUser);
            console.log('✅ Profile: Demo mode with overrides:', loggedInUser?.full_name);
          }
        }

        setCurrentUser(loggedInUser);

        let profileData = null;
        let viewingOwnProfile = false;

        if (profileEmailParam) {
          viewingOwnProfile = loggedInUser && profileEmailParam === loggedInUser.email;

          if (viewingOwnProfile) {
            profileData = loggedInUser;
            console.log('👤 Viewing own profile:', profileData.email);
          } else {
            try {
              console.log('🔍 Fetching events for OTHER user:', profileEmailParam);
              const theirEvents = await Event.filter({ organizer_email: profileEmailParam }, '-date');
              console.log('📅 Found', theirEvents.length, 'events for', profileEmailParam);

              // ISSUE 8 FIX: accountTypeMap is THE source of truth
              const definitiveAccountType = accountTypeMap[profileEmailParam];

              if (!definitiveAccountType) {
                console.warn('⚠️ No account type mapping for:', profileEmailParam, '- defaulting to personal');
              }

              const accountType = definitiveAccountType || (theirEvents.length > 0 ? 'business' : 'personal');

              if (theirEvents && theirEvents.length > 0) {
                profileData = {
                  email: profileEmailParam,
                  full_name: theirEvents[0].organizer_name || profileEmailParam.split('@')[0],
                  business_name: accountType === 'business' ? theirEvents[0].organizer_name || profileEmailParam.split('@')[0] : undefined,
                  avatar: theirEvents[0].organizer_avatar,
                  cover_image: theirEvents[0].cover_image || 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop',
                  account_type: accountType,
                  events_hosted: theirEvents.length,
                  followers: 0,
                  following: 0,
                  is_verified: false,
                  _isAdminMode: false
                };
                console.log('✅ Profile type for other user:', accountType);
              } else {
                profileData = {
                  email: profileEmailParam,
                  full_name: profileEmailParam.split('@')[0],
                  business_name: accountType === 'business' ? profileEmailParam.split('@')[0] : undefined,
                  avatar: 'https://via.placeholder.com/128',
                  cover_image: 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop',
                  account_type: accountType,
                  events_hosted: 0,
                  followers: 0,
                  following: 0,
                  is_verified: false,
                  _isAdminMode: false
                };
                console.log('✅ Profile (no events) for other user:', accountType);
              }
            } catch (err) {
              console.error("Error fetching profile for param:", err);
              setError("Profile not found.");
              setIsLoading(false);
              return;
            }
          }
        } else {
          if (loggedInUser) {
            profileData = loggedInUser;
            viewingOwnProfile = true;
            console.log('📋 Profile: Displaying own profile for:', profileData.full_name);
          } else {
            console.log('⚠️ Profile: No logged in user, showing login bypass');
            setShowingLoginBypass(true);
            setIsLoading(false);
            return;
          }
        }

        if (!profileData) {
          setError("Profile data could not be determined.");
          setIsLoading(false);
          return;
        }

        // ISSUE 5 FIX: Ensure privacy settings are properly loaded
        // AI settings are also included here for consistency.
        profileData = {
          ...profileData,
          events_hosted: profileData.events_hosted || 0,
          followers: profileData.followers || 0,
          following: profileData.following || 0,
          ai_scheduling: profileData.ai_scheduling ?? true, // Sync AI settings: ensure default is true if not set
          is_verified: profileData.is_verified ?? false,
          _isAdminMode: profileData._isAdminMode ?? false,
          avatar: profileData.avatar || 'https://via.placeholder.com/128',
          cover_image: profileData.cover_image || 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop',
          account_type: loggedInUser?.account_type || accountTypeMap[profileData.email] || profileData.account_type || 'personal',
          show_my_written_reviews: profileData.show_my_written_reviews ?? true,
          show_reviews_on_my_events: profileData.show_reviews_on_my_events ?? true
        };


        console.log('✅ Final profile data:', {
          name: profileData.full_name,
          email: profileData.email,
          accountType: profileData.account_type,
          viewingOwn: viewingOwnProfile,
          // ISSUE 5 FIX: Added visibility logs
          showWrittenReviews: profileData.show_my_written_reviews,
          showReceivedReviews: profileData.show_reviews_on_my_events
        });

        setProfileUser(profileData);
        setIsOwnProfile(viewingOwnProfile);

        // Initialize isFollowing state
        if (!viewingOwnProfile && loggedInUser && profileData.email) {
          const isCurrentlyFollowing = loggedInUser.followed_curator_ids && loggedInUser.followed_curator_ids.includes(profileData.email);
          console.log('👥 Following status for', profileData.email, ':', isCurrentlyFollowing, 'followed_curator_ids:', loggedInUser.followed_curator_ids);
          setIsFollowing(isCurrentlyFollowing);
        } else {
          setIsFollowing(false);
        }

        const allowedTabs = ['events', 'entries', 'albums', 'tagged', 'reviews', 'following'];
        if (tabFromUrl && allowedTabs.includes(tabFromUrl)) {
          setActiveTab(tabFromUrl);
        } else {
          setActiveTab("events");
        }

        // Define now once for consistent usage across all event categorization
        const now = new Date();

        // CRITICAL: Load ALL entries for THIS PROFILE USER (not just events)
        console.log('📅 Loading ALL entries for profile:', profileData.email);
        let allHostedItems = [];
        try {
          allHostedItems = await Event.filter({ organizer_email: profileData.email }, "-date");
          console.log('📅 Raw events loaded:', allHostedItems.length);
          console.log('📅 Event sources:', [...new Set(allHostedItems.map((e) => e.source))]);
        } catch (err) {
          console.warn("Could not fetch hosted items:", err);
          allHostedItems = [];
        }

        // Initialize actualEvents and vibeEntries as mutable arrays
        let actualEvents = allHostedItems.filter((e) =>
          !['vibe-post', 'vibe-post-seed', 'profile-entries-seed', 'memory-post'].includes(e.source)
        );

        // CRITICAL: Create a hardcoded past event for Saloni's reviews
        const salonisPastEvent = {
          id: 'saloni_past_pool_party',
          title: 'Pool Party',
          organizer_name: 'Saloni Bhatia',
          organizer_email: 'salonibhatia99@gmail.com',
          cover_image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&h=600&fit=crop',
          date: '2024-12-15T14:00:00Z',
          location: 'San Francisco, CA',
          status: 'active'
        };

        if (profileData.email === salonisPastEvent.organizer_email || profileData.full_name === salonisPastEvent.organizer_name) {
          console.log('Injecting Saloni\'s hardcoded past event:', salonisPastEvent.id);
          if (!actualEvents.some((e) => e.id === salonisPastEvent.id)) {
            actualEvents.push(salonisPastEvent);
          }
        }

        let vibeEntries = allHostedItems.filter((e) =>
          ['vibe-post', 'vibe-post-seed', 'profile-entries-seed', 'memory-post'].includes(e.source)
        );

        // CRITICAL: Only apply simulatedDataManager filters for events AND add simulated memory posts + sample data if viewing OWN profile
        if (viewingOwnProfile) {
          console.log('🔧 Applying simulatedDataManager filters (own profile)');
          const deletedEventIds = simulatedDataManager.getDeletedEventIds();
          const cancelledEvents = simulatedDataManager.getCancelledEvents();
          const savedMemoryPosts = simulatedDataManager.getMemoryPosts();

          // Apply deletion and cancellation filters/maps to actualEvents
          actualEvents = actualEvents.filter((event) => !deletedEventIds.includes(event.id));
          actualEvents = actualEvents.map((event) => {
            if (cancelledEvents[event.id]) {
              return {
                ...event,
                status: 'cancelled',
                cancellation_message: cancelledEvents[event.id].message
              };
            }
            return event;
          });

          // Add simulated memory posts to vibe entries if they don't already exist from database
          vibeEntries = [...savedMemoryPosts, ...vibeEntries.filter((dbEntry) => !savedMemoryPosts.some((memPost) => memPost.id === dbEntry.id))];

          // CRITICAL: Only add sample entries if in demo OR admin mode AND viewing own profile
          if (authBypassed && (isDemo || isAdmin)) {
            const sampleEntries = simulatedDataManager.getSampleEntriesFor(profileData.email, profileData.full_name, profileData.avatar);
            console.log('📦 Adding', sampleEntries.length, 'sample entries for', profileData.email);
            vibeEntries = [...vibeEntries, ...sampleEntries.filter((sample) => !vibeEntries.some((existing) => existing.id === sample.id))];
          }

          console.log('📚 Loaded total', vibeEntries.length, 'entries for', profileData.email, '(incl. simulated)');
        } else {
          console.log('✅ NOT applying simulatedDataManager filters (other user profile)');
          console.log('📚 Loaded total', vibeEntries.length, 'entries for', profileData.email, '(database only)');
        }

        // Categorize events using the now globally defined 'now'
        const upcoming = actualEvents.filter((event) => event.status === 'active' && new Date(event.date) >= now);
        const past = actualEvents.filter((event) => event.status === 'active' && new Date(event.date) < now);
        const draftsCancelled = actualEvents.filter((event) => event.status === 'cancelled' || event.status === 'draft');

        setUpcomingEvents(upcoming);
        setPastEvents(past);
        setDraftsCancelledEvents(draftsCancelled);
        setUserVibeEntries(vibeEntries);

        console.log('📊 Event counts:', {
          upcoming: upcoming.length,
          past: past.length,
          drafts: draftsCancelled.length
        });


        // CRITICAL FIX: Load reviews correctly
        console.log('⭐ Loading reviews for:', profileData.email, 'Account type:', profileData.account_type);

        let reviewsAboutTheirEvents = [];
        let eventsForReviewsMap = {};

        // Load reviews ABOUT this profile's events (for both business and personal with events)
        // CRITICAL: Condition for loading reviews for 'actualEvents.length > 0' should also include if profile is Saloni to ensure the hardcoded reviews appear.
        if (actualEvents.length > 0 || profileData.email === 'salonibhatia99@gmail.com' || profileData.full_name === 'Saloni Bhatia') {
          try {
            // Ensure salonisPastEvent is part of hostedEventIds if this is Saloni's profile
            let hostedEventIds = actualEvents.map((e) => e.id).filter((id) => id);
            if ((profileData.email === 'salonibhatia99@gmail.com' || profileData.full_name === 'Saloni Bhatia') && !hostedEventIds.includes(salonisPastEvent.id)) {
              hostedEventIds.push(salonisPastEvent.id);
            }

            if (hostedEventIds.length > 0) {
              // CRITICAL: Check if this is Saloni (logged in user, or demo user 'salonibhatia99@gmail.com')
              if (profileData.email === 'salonibhatia99@gmail.com' || profileData.full_name === 'Saloni Bhatia') {
                console.log('⭐ Loading custom reviews for Saloni\'s events.');
                reviewsAboutTheirEvents = reviewsAboutSalonisEvents.map((review) => ({
                  ...review,
                  id: `review_saloni_${review.user_email}_${Math.random().toString(36).substr(2, 9)}`,
                  event_id: salonisPastEvent.id, // Assign to the newly defined past event
                  event_title: salonisPastEvent.title,
                  organizer_name: salonisPastEvent.organizer_name
                }));
                // Map the specific event for these sample reviews
                eventsForReviewsMap[salonisPastEvent.id] = salonisPastEvent;
                // Also add other actual events to the map if they exist
                actualEvents.forEach((event) => {
                  if (!eventsForReviewsMap[event.id]) {
                    eventsForReviewsMap[event.id] = event;
                  }
                });

              } else if (businessReviewsMap[profileData.email]) {
                console.log('⭐ Using sample reviews for business profile:', profileData.email);
                const firstEvent = actualEvents[0];
                if (firstEvent) {// Ensure firstEvent exists
                  reviewsAboutTheirEvents = businessReviewsMap[profileData.email].map((review) => ({
                    ...review,
                    id: `review_${profileData.email}_${review.user_email}_${Math.random().toString(36).substr(2, 9)}`,
                    event_id: firstEvent.id,
                    created_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    event_title: firstEvent.title,
                    organizer_name: firstEvent.organizer_name
                  }));
                  eventsForReviewsMap[firstEvent.id] = firstEvent; // Map the first event for these sample reviews
                } else {
                  console.warn(`Business profile ${profileData.email} has sample reviews but no actual events to link them to.`);
                }
              } else {
                // Try to fetch real reviews
                reviewsAboutTheirEvents = await EventReview.filter({
                  event_id: { $in: hostedEventIds }
                }, '-created_date');

                // Create event map from all actual events
                eventsForReviewsMap = actualEvents.reduce((acc, event) => {
                  acc[event.id] = event;
                  return acc;
                }, {});
              }
              console.log('⭐ Reviews ABOUT their events:', reviewsAboutTheirEvents.length);
            }
          } catch (err) {
            console.error("Error loading reviews about events:", err);
          }
        }

        setReceivedReviews(reviewsAboutTheirEvents);
        setReviewedEventsForCuratorMap(eventsForReviewsMap);

        // Load reviews WRITTEN BY this user (for personal accounts Reviews tab)
        let reviewsTheyWrote = [];
        let eventsTheyReviewedMap = {};

        if (profileData.account_type === 'personal') {
          try {
            console.log('⭐ Loading reviews WRITTEN BY:', profileData.email);
            if (authBypassed && isDemo && sampleUserReviews[profileData.full_name]) {
              console.log('⭐ Using sample written reviews for:', profileData.full_name);
              reviewsTheyWrote = sampleUserReviews[profileData.full_name];
              eventsTheyReviewedMap = sampleEventsMap; // Build events map from sampleEventsMap for these sample reviews
            } else {
              reviewsTheyWrote = await EventReview.filter({
                user_email: profileData.email
              }, '-created_date');

              console.log('⭐ Reviews WRITTEN BY them:', reviewsTheyWrote.length);

              if (reviewsTheyWrote.length > 0) {
                const reviewedEventIds = reviewsTheyWrote.map((r) => r.event_id).filter((id) => id);
                if (reviewedEventIds.length > 0) {
                  const reviewedEvents = await Event.filter({ id: { $in: reviewedEventIds } });
                  eventsTheyReviewedMap = reviewedEvents.reduce((acc, event) => {
                    acc[event.id] = event;
                    return acc;
                  }, {});
                }
              }
            }
          } catch (err) {
            console.error("Error loading written reviews:", err);
          }
        }

        setUserReviews(reviewsTheyWrote);
        setReviewedEventsMap(eventsTheyReviewedMap);

        // Load saved/attended events for personal accounts
        if (profileData.account_type === 'personal') {
          await loadUserEvents(profileData, authBypassed && isDemo);
        }

        // Load albums for THIS profile
        try {
          let albums = await Album.filter({ owner_email: profileData.email }, '-created_date');
          console.log('📚 Loaded', albums.length, 'albums for', profileData.email, '(database only)');

          // CRITICAL: Add sample albums if in demo/admin mode and viewing own profile
          if (viewingOwnProfile && authBypassed && (isDemo || isAdmin)) {
            const sampleAlbums = simulatedDataManager.getSampleAlbumsFor(profileData.email, profileData.full_name);
            console.log('📦 Adding', sampleAlbums.length, 'sample albums for', profileData.email);
            albums = [...albums, ...sampleAlbums.filter((sample) => !albums.some((existing) => existing.id === sample.id))];
          }

          // FIX: Ensure entry_count is correctly set for all albums
          const albumsWithCorrectCounts = albums.map(album => ({
            ...album,
            entry_count: album.entries?.length || album.entry_count || 0
          }));

          setUserAlbums(albumsWithCorrectCounts || []);
        } catch (err) {
          console.warn('Could not fetch albums:', err);
          setUserAlbums([]);
        }

      } catch (error) {
        console.error("Error loading profile data:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [location.search, navigate, location.pathname, loadUserEvents, entriesReloadTrigger]);

  // ISSUE 4 FIX: Check group chat status for Thursday Dating and ArtHaus
  useEffect(() => {
    if (!profileUser || !profileUser.email) {
      setGroupChatStatus('none');
      return;
    }

    // Don't show group chat option on own profile
    if (isOwnProfile) {
      setGroupChatStatus('none');
      return;
    }

    // Show group chat option even when logged out
    if (!currentUser) {
      const groupId = profileGroupChatMap[profileUser.email];
      if (groupId) {
        setGroupChatStatus('available');
      } else {
        setGroupChatStatus('none');
      }
      return;
    }

    const groupId = profileGroupChatMap[profileUser.email];
    if (!groupId) {
      setGroupChatStatus('none');
      return;
    }

    // CRITICAL FIX: Default joined groups (Thursday Dating, ArtHaus)
    const defaultJoinedGroups = ['thursday_dating_group', 'group-art-house'];

    if (defaultJoinedGroups.includes(groupId)) {
      setGroupChatStatus('joined');
      console.log('✅ User is DEFAULT JOINED to group:', groupId);
      return;
    }

    // Check joined/pending status using simulatedDataManager for other groups
    const joined = simulatedDataManager.getJoinedGroups();
    const pending = simulatedDataManager.getPendingGroupRequests();

    console.log('🔍 Group Chat Status Check:', {
      profileEmail: profileUser.email,
      groupId,
      joined,
      pending,
      isJoined: joined.includes(groupId),
      isPending: pending.includes(groupId)
    });

    if (joined.includes(groupId)) {
      setGroupChatStatus('joined');
      console.log('✅ User is JOINED to group:', groupId);
    } else if (pending.includes(groupId)) {
      setGroupChatStatus('pending');
      console.log('⏳ User has PENDING request for group:', groupId);
    } else {
      setGroupChatStatus('available');
      console.log('📝 Group is AVAILABLE to join:', groupId);
    }
  }, [profileUser, currentUser, isOwnProfile]);

  // ISSUE 8 & 9 FIX: Hide Reviews tab for business profiles
  const profileTabs = useMemo(() => {
    const tabs = [
      { id: 'events', label: 'EVENTS', icon: tabIcons.events },
      { id: 'entries', label: 'ENTRIES', icon: tabIcons.entries },
      { id: 'albums', label: 'ALBUMS', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'tagged', label: 'TAGGED', icon: tabIcons.tagged }];


    // ISSUE 9 FIX: Only personal accounts have Reviews tab
    if (profileUser && profileUser.account_type === 'personal') {
      tabs.push({ id: 'reviews', label: 'REVIEWS', icon: tabIcons.reviews });
    }

    return tabs;
  }, [profileUser]);

  const handleMainTabChange = (tabName) => {
    setActiveTab(tabName);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('tab', tabName);
    navigate(`?${urlParams.toString()}`, { replace: true });
  };

  const generateSchedule = useCallback(() => {
    if (!upcomingEvents.length) {
      setIsGenerating(false);
      setSchedule("No events to generate a schedule for.");
      return;
    }

    setIsGenerating(true);
    setSchedule("");

    const eventsToUse = upcomingEvents;

    const eventDetails = eventsToUse.map((e) => `- ${e.title} on ${new Date(e.date).toDateString()} at ${new Date(e.date).toLocaleTimeString()} in ${e.location}`).join('\n');
    const prompt = `
      As an expert schedule assistant, create a simple, elegant, and practical schedule for a user based on the following list of events they are attending.
      Keep it concise and easy to read. Use markdown for formatting, like lists and bold words.
      If events are in different locations, mention considering travel time.

      Here are the events:
      ${eventDetails}

      Provide a friendly and encouraging tone. Start with a positive opening.
    `;

    try {
      InvokeLLM({ prompt }).then((result) => {
        setSchedule(result);
      }).catch((err) => {
        console.error("Error generating schedule:", err);
        setSchedule("Sorry, I couldn't generate a schedule at this time. Please try again later.");
      }).finally(() => {
        setIsGenerating(false);
      });
    } catch (err) {
      console.error("Error invoking LLM:", err);
      setSchedule("Sorry, an unexpected error occurred. Please try again.");
      setIsGenerating(false);
    }
  }, [upcomingEvents]);

  // ISSUE #6 FIX: Fixed following tab to reload when follow status changes
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState("continue");

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setLoginPromptAction("follow users");
      setShowLoginPrompt(true);
      return;
    }

    if (!profileUser) return;

    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    try {
      const currentFollowedIds = currentUser.followed_curator_ids || [];
      let updatedFollowedIds;

      if (newFollowingState) {
        updatedFollowedIds = [...currentFollowedIds, profileUser.email];
      } else {
        updatedFollowedIds = currentFollowedIds.filter((id) => id !== profileUser.email);
      }

      console.log('🔄 Updating follow state:', {
        action: newFollowingState ? 'Following' : 'Unfollowing',
        profileEmail: profileUser.email,
        before: currentFollowedIds,
        after: updatedFollowedIds
      });

      const isAdmin = simulatedDataManager.isAdminMode();
      const isDemo = simulatedDataManager.isDemoMode();

      // Update database for both admin and regular users
      if (isAdmin || (!isAdmin && !isDemo)) {
        await base44.auth.updateMe({ followed_curator_ids: updatedFollowedIds });
        const updatedUser = await base44.auth.me();
        if (isAdmin) {
          setCurrentUser({ ...updatedUser, _isAdminMode: true });
          console.log('✅ Admin: Updated real user followed_curator_ids:', updatedUser.followed_curator_ids);
        } else {
          setCurrentUser(updatedUser);
          console.log('✅ Updated real user followed_curator_ids:', updatedUser.followed_curator_ids);
        }
      } else if (isDemo) {
        // Demo mode: Update temp overrides in sessionStorage only
        await simulatedDataManager.updateSimulatedUser({ followed_curator_ids: updatedFollowedIds });
        const baseUser = await base44.auth.me();
        const demoUser = simulatedDataManager.applyDemoOverrides(baseUser);
        setCurrentUser(demoUser);
        console.log('✅ Demo: Updated temp followed_curator_ids (session only):', demoUser.followed_curator_ids);
      }

      // ISSUE 6 FIX: Dispatch event to reload following tab in Feed
      console.log('📢 Profile: Dispatching followStatusChanged event:', {
        curatorEmail: profileUser.email,
        isFollowing: newFollowingState
      });
      window.dispatchEvent(new CustomEvent('followStatusChanged', {
        detail: {
          curatorEmail: profileUser.email,
          isFollowing: newFollowingState
        }
      }));

      apiCache.invalidate('currentUser');
      apiCache.invalidate('feed_events_following');
      apiCache.invalidate('feed_events_forYou');

    } catch (error) {
      console.error('Error updating follow state:', error);
      setIsFollowing(!newFollowingState);
    }
  };

  const handleJoinGroupChat = () => {
    if (!currentUser) {
      setLoginPromptAction("join group chats");
      setShowLoginPrompt(true);
      return;
    }

    const groupId = profileGroupChatMap[profileUser.email];
    if (!groupId) return;

    setShowGroupChatPopup(true);
    simulatedDataManager.addPendingGroupRequest(groupId);
    setGroupChatStatus('pending');

    setTimeout(() => {
      setShowGroupChatPopup(false);
    }, 2000);
  };

  const handleWithdrawRequest = () => {
    const groupId = profileGroupChatMap[profileUser.email];
    if (!groupId) return;

    simulatedDataManager.removePendingGroupRequest(groupId);
    setGroupChatStatus('available');
    setShowWithdrawDialog(false);
  };

  const handleOpenGroupChat = () => {
    const groupId = profileGroupChatMap[profileUser.email];
    if (!groupId) return;

    navigate(createPageUrl(`ChatWindow?groupId=${groupId}`));
  };

  const handleChatClick = () => {
    if (!currentUser) {
      setLoginPromptAction("start a chat");
      setShowLoginPrompt(true);
      return;
    }
    navigate(createPageUrl(`ChatWindow?user=${encodeURIComponent(profileUser.email)}`));
  };


  const handleGenerateMemoryPost = async (event) => {
    if (isGeneratingMemory) return;

    let aborted = false;

    setIsGeneratingMemory(true);
    setShowMemoryDialog(true);
    setMemorySuccess(false);
    setEventForMemoryPost(event);

    const abort = () => {
      aborted = true;
      setIsGeneratingMemory(false);
      setShowMemoryDialog(false);
      setEventForMemoryPost(null);
    };

    window.__abortMemoryGeneration = abort;

    try {
      console.log('🎬 Starting memory post generation for event:', event.id);

      const prompt = `Create an engaging and nostalgic social media post about a past event.

Event Details:
- Title: ${event.title}
- Description: ${event.description || 'A memorable event'}
- Category: ${event.category || 'event'}
- Location: ${event.location || event.venue_name || 'an amazing venue'}
- Date: ${event.date ? format(new Date(event.date), 'MMMM d, yyyy') : 'recently'}

Write a personal, heartfelt reflection as if you're the organizer looking back fondly on this event. Keep it under 150 words.

Output as JSON:
{
  "title": "A catchy title (max 50 chars)",
  "description": "The nostalgic post content"
}`;

      const llmResponse = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" }
          },
          required: ["title", "description"]
        }
      });

      if (aborted) {
        console.log('⚠️ Generation was aborted, not saving');
        return;
      }

      console.log('✅ LLM Response:', llmResponse);

      const memoryPostData = {
        title: llmResponse.title || `Memories from ${event.title}`,
        description: llmResponse.description || `What an amazing time at ${event.title}!`,
        cover_image: event.cover_image,
        organizer_name: currentUser?.full_name || profileUser.full_name,
        organizer_email: currentUser?.email || profileUser.email,
        organizer_avatar: currentUser?.avatar || profileUser.avatar,
        source: "memory-post",
        category: event.category || 'other',
        scene_tags: event.scene_tags || [],
        location: event.location || event.venue_name || 'Location',
        date: new Date().toISOString(),
        status: 'draft',
        original_event_id: event.id
      };

      console.log('💾 Saving memory post...');

      const isAdminMode = simulatedDataManager.isAdminMode();
      const isDemoMode = simulatedDataManager.isDemoMode();

      if (isAdminMode || isDemoMode) {
        const postWithId = {
          ...memoryPostData,
          id: `memory_post_${Date.now()}`,
          created_date: new Date().toISOString()
        };

        simulatedDataManager.saveMemoryPost(postWithId);

        if (aborted) {
          console.log('⚠️ Generation was aborted after save, deleting...');
          simulatedDataManager.deleteMemoryPost(postWithId.id);
          return;
        }

        console.log('✨ Memory post saved to simulated storage:', postWithId.id);

        setUserVibeEntries((prev) => [postWithId, ...prev]);
      } else {
        const createdPost = await Event.create(memoryPostData);

        if (aborted) {
          console.log('⚠️ Generation was aborted after save, deleting...');
          await Event.delete(createdPost.id);
          return;
        }

        console.log('✨ Memory post saved to database:', createdPost.id);

        setUserVibeEntries((prev) => [createdPost, ...prev]);
      }

      apiCache.invalidate(new RegExp(`entries_${profileUser.email}`));

      setMemorySuccess(true);

      setTimeout(() => {
        setShowMemoryDialog(false);
        setActiveTab('entries');
        setEventForMemoryPost(null);
        setIsGeneratingMemory(false);
        window.__abortMemoryGeneration = null;
      }, 2000);

    } catch (error) {
      console.error('❌ Error generating memory post:', error);
      if (!aborted) {
        alert('Failed to generate memory post. Please try again.');
      }
      setIsGeneratingMemory(false);
      setShowMemoryDialog(false);
      setEventForMemoryPost(null);
      window.__abortMemoryGeneration = null;
    }
  };

  const handleAbortMemoryPost = () => {
    if (window.__abortMemoryGeneration) {
      window.__abortMemoryGeneration();
    }
  };

  const handleDeletePost = (entryId) => {
    setEntryToDeleteId(entryId);
    setShowDeleteEntryDialog(true);
  };

  const confirmDeletePost = async () => {
    if (!entryToDeleteId) return;

    try {
      const isAdminMode = simulatedDataManager.isAdminMode();
      const isDemoMode = simulatedDataManager.isDemoMode();

      // Check if this is a sample entry (includes OLD and NEW sample entry patterns)
      const isSampleEntry = entryToDeleteId.startsWith('sample_entry_') ||
        entryToDeleteId.startsWith('sample_album_') ||
        entryToDeleteId.includes('_entry_new_') ||
        entryToDeleteId.startsWith('saloni_entry') ||
        entryToDeleteId.startsWith('maya_entry') ||
        entryToDeleteId.startsWith('album_entry_');

      if (isSampleEntry) {
        // Sample entries - mark as deleted in simulated storage
        simulatedDataManager.deleteSampleEntry(entryToDeleteId);
        console.log(`Sample entry ${entryToDeleteId} marked as deleted in simulated storage.`);
        setUserVibeEntries((prev) => prev.filter((e) => e.id !== entryToDeleteId));
      } else if ((isAdminMode || isDemoMode) && entryToDeleteId.startsWith('memory_post_')) {
        // Memory posts in simulated storage
        simulatedDataManager.deleteMemoryPost(entryToDeleteId);
        console.log(`Memory post ${entryToDeleteId} deleted from simulated storage.`);
        setUserVibeEntries((prev) => prev.filter((e) => e.id !== entryToDeleteId));
      } else {
        // Real database entries - only try to delete if it's a valid MongoDB ID format
        const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(entryToDeleteId);

        if (isValidMongoId) {
          await Event.delete(entryToDeleteId);
          console.log(`Entry ${entryToDeleteId} deleted from database.`);
          setUserVibeEntries((prev) => prev.filter((e) => e.id !== entryToDeleteId));
        } else {
          // Unknown format, just remove from state
          console.warn(`Unknown entry format ${entryToDeleteId}, removing from display only.`);
          setUserVibeEntries((prev) => prev.filter((e) => e.id !== entryToDeleteId));
        }
      }

    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setShowDeleteEntryDialog(false);
      setEntryToDeleteId(null);
    }
  };

  const handlePublishEntry = async (entryId) => {
    setOpenDropdownId(null);

    // Check if this is a sample entry (based on IDs used in defaultSampleEntries)
    const isSampleEntry = entryId.startsWith('sample_entry_');

    if (isSampleEntry) {
      alert('Sample entries cannot be published. Create a real entry to publish.');
      return;
    }

    try {
      const isAdminMode = simulatedDataManager.isAdminMode();
      const isDemoMode = simulatedDataManager.isDemoMode();

      if ((isAdminMode || isDemoMode) && entryId.startsWith('memory_post_')) {
        simulatedDataManager.updateMemoryPost(entryId, { status: 'published' });
        console.log(`Memory post ${entryId} published in simulated storage.`);
      } else {
        await Event.update(entryId, { status: 'published' });
        console.log(`Entry ${entryId} published in database.`);
      }

      setUserVibeEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, status: 'published' } : e));

      const toastEl = document.createElement('div');
      toastEl.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 z-[100] opacity-0 transition-opacity duration-300 min-w-[320px] max-w-[90vw]';

      toastEl.innerHTML = `
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div class="text-center">
          <p class="font-bold text-gray-900 text-xl mb-1">Post Published!</p>
          <p class="text-base text-gray-500">Your entry is now live</p>
        </div>
      `;

      document.body.appendChild(toastEl);

      setTimeout(() => {
        toastEl.style.opacity = '1';
      }, 10);

      setTimeout(() => {
        toastEl.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toastEl);
        }, 300);
      }, 3000);

      console.log(`Entry ${entryId} published successfully.`);
    } catch (error) {
      console.error('Error publishing entry:', error);

      const errorToastEl = document.createElement('div');
      errorToastEl.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 z-[100] opacity-0 transition-opacity duration-300 min-w-[320px] max-w-[90vw]';
      errorToastEl.innerHTML = `
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-9 h-9 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div class="text-center">
          <p class="font-bold text-gray-900 text-xl mb-1">Publishing Failed</p>
          <p class="text-base text-gray-500">Please try again</p>
        </div>
      `;

      document.body.appendChild(errorToastEl);

      setTimeout(() => {
        errorToastEl.style.opacity = '1';
      }, 10);

      setTimeout(() => {
        errorToastEl.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(errorToastEl); // Changed from toastEl to errorToastEl
        }, 300);
      }, 3000);
    }
  };

  const confirmCancel = (event) => {
    setEventToCancel(event.id);
    setShowCancelDialog(true);
  };

  const handleCancel = async (cancelMessage) => {
    if (!eventToCancel) return;

    // Save the cancellation
    simulatedDataManager.cancelEvent(eventToCancel, cancelMessage);

    setShowCancelDialog(false);

    // Update local state
    setUpcomingEvents((prev) => prev.filter((event) => event.id !== eventToCancel));
    setPastEvents((prev) => prev.filter((event) => event.id !== eventToCancel));
    setDraftsCancelledEvents((prev) => {
      const existing = prev.find((event) => event.id === eventToCancel);
      const eventToMove = upcomingEvents.find((e) => e.id === eventToCancel) ||
        pastEvents.find((e) => e.id === eventToCancel);
      if (existing) {
        return prev.map((event) =>
          event.id === eventToCancel ?
          { ...event, status: 'cancelled', cancellation_message: cancelMessage } :
          event
        );
      } else {
        return eventToMove ?
          [{ ...eventToMove, status: 'cancelled', cancellation_message: cancelMessage }, ...prev] :
          prev;
      }
    });

    console.log(`Event ${eventToCancel} cancelled with message: ${cancelMessage}`);
    setEventToCancel(null);
  };

  const confirmDelete = (eventId) => {
    setEventToDelete(eventId);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    const deletedEventId = eventToDelete;

    // Save the deletion
    simulatedDataManager.deleteEvent(deletedEventId);

    setShowConfirmDialog(false);
    setEventToDelete(null);

    // Update local state
    setUpcomingEvents((prev) => prev.filter((e) => e.id !== deletedEventId));
    setPastEvents((prev) => prev.filter((e) => e.id !== deletedEventId));
    setDraftsCancelledEvents((prev) => prev.filter((e) => e.id !== deletedEventId));

    console.log(`Event ${deletedEventId} deleted`);
  };

  const handleEditReview = (review) => {
    if (!isOwnProfile) return;

    setEditingReview({
      ...review,
      vibe_tags: Array.isArray(review.vibe_tags) ? review.vibe_tags : []
    });
    setReviewDialogOpen(true);
  };

  const handleDeleteReviewRequest = (reviewId) => {
    if (!isOwnProfile) return;
    setReviewToDeleteId(reviewId);
  };

  const handleConfirmDeleteReview = async () => {
    if (!reviewToDeleteId) return;

    setUserReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewToDeleteId));

    try {
      await EventReview.delete(reviewToDeleteId);
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete the review. Please refresh and try again.");
      window.location.reload();
    } finally {
      setReviewToDeleteId(null);
    }
  };

  const handleSubmitReview = async (formData) => {
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        ...formData,
        vibe_tags: Array.isArray(formData.vibe_tags) ? formData.vibe_tags : []
      };

      if (editingReview) {
        await EventReview.update(editingReview.id, reviewData);
        setUserReviews((prevReviews) =>
          prevReviews.map((review) => {
            if (review.id === editingReview.id) {
              return { ...review, ...reviewData };
            }
            return review;
          })
        );
      }

      setReviewDialogOpen(false);
      setEditingReview(null);

    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBlockUser = () => {
    alert('Block User: This feature is coming soon!');
  };

  const handleReportUser = () => {
    alert('Report User: This feature is coming soon!');
  };

  const handleSeeLess = () => {
    alert('See Less: This feature is coming soon!');
  };

  const handleDataChange = useCallback(() => {
    console.log("PoppinEventCard data change detected.");
  }, []);

  const openReel = (events, startIndex) => {
    setReelData({ events, startIndex, isOpen: true });
  };

  const closeReel = () => {
    setReelData({ events: [], startIndex: 0, isOpen: false });
  };

  const handleWriteMoreReviews = () => {
    navigate(createPageUrl("ReviewEvents"));
  };

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setShowEditAlbumDialog(true);
  };

  const handleSaveAlbum = async (updatedAlbum) => {
    setIsSavingAlbum(true);
    try {
      await Album.update(updatedAlbum.id, {
        title: updatedAlbum.title,
        description: updatedAlbum.description
      });

      setUserAlbums((prev) =>
        prev.map((album) => album.id === updatedAlbum.id ? updatedAlbum : album)
      );

      setShowEditAlbumDialog(false);
      setEditingAlbum(null);
    } catch (error) {
      console.error('Error updating album:', error);
      alert('Failed to update album. Please try again.');
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleToggleHiddenAlbum = async (album) => {
    try {
      // Check if this is a sample album (old or new pattern)
      const isSampleAlbum = album.id.startsWith('sample_album');

      if (isSampleAlbum) {
        alert('Sample albums cannot be modified. Create a real album to change visibility.');
        return;
      }

      const newHiddenState = !album.is_hidden;
      await Album.update(album.id, { is_hidden: newHiddenState });

      setUserAlbums((prev) =>
        prev.map((a) => a.id === album.id ? { ...a, is_hidden: newHiddenState } : a)
      );
    } catch (error) {
      console.error('Error toggling album visibility:', error);
      alert('Failed to update album visibility. Please try again.');
    }
  };

  const handleChooseAudience = () => {
    setShowAudienceComingSoonDialog(true);
  };

  const handleDeleteAlbumRequest = (album) => {
    setAlbumToDelete(album);
    setShowDeleteAlbumDialog(true);
  };

  const handleConfirmDeleteAlbum = async () => {
    if (!albumToDelete) return;

    try {
      // Check if this is a sample album (IDs start with 'sample_album_')
      const isSampleAlbum = albumToDelete.id.startsWith('sample_album_');

      if (isSampleAlbum) {
        // Sample albums are only in memory, just remove from state
        console.log(`Sample album ${albumToDelete.id} removed from display (not in database).`);
        setUserAlbums((prev) => prev.filter((a) => a.id !== albumToDelete.id));
      } else {
        // Real database albums - only try to delete if it's a valid MongoDB ID format
        const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(albumToDelete.id);

        if (isValidMongoId) {
          await Album.delete(albumToDelete.id);
          console.log(`Album ${albumToDelete.id} deleted from database.`);
          setUserAlbums((prev) => prev.filter((a) => a.id !== albumToDelete.id));
        } else {
          // Unknown format, just remove from state
          console.warn(`Unknown album format ${albumToDelete.id}, removing from display only.`);
          setUserAlbums((prev) => prev.filter((a) => a.id !== albumToDelete.id));
        }
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Failed to delete album. Please try again.');
    } finally {
      setShowDeleteAlbumDialog(false);
      setAlbumToDelete(null);
    }
  };

  const handleAdminOverride = async () => {
    if (!simulatedDataManager.isAdminMode() && !simulatedDataManager.isDemoMode()) {
      return;
    }

    const newAccountType = profileUser.account_type === 'business' ? 'personal' : 'business';

    simulatedDataManager.updateSimulatedUser({ account_type: newAccountType });

    // Reload the page to reflect changes
    window.location.reload();
  };

  const renderEventGrid = (events, eventType) => {
    if (!events) {
      return (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-blue-500/10">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-gray-500 mb-4">
              {eventType === 'upcoming' ? `Create a new event to get started` :
                eventType === 'past' ? isOwnProfile ? "You haven't had any events yet." : "This user hasn't had any events yet." :
                  "You haven't saved any drafts or cancelled any events."}
            </p>
            {eventType === 'upcoming' && isOwnProfile &&
              <Link to={createPageUrl("CreateEvent")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700">Create New Event</Button>
              </Link>
            }
          </div>
        </div>);

    }

    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedEvents.length === 0) {
      return (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 text-center mt-3 py-12 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-blue-500/10">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {eventType === 'upcoming' && 'No upcoming events'}
              {eventType === 'past' && 'No past events'}
              {eventType === 'drafts' && 'No drafts or cancelled events'}
            </h3>
            <p className="text-gray-500 mb-4">
              {eventType === 'upcoming' ? `Create a new event to get started` :
                eventType === 'past' ? isOwnProfile ? "You haven't had any events yet." : "This user hasn't had any events yet." :
                  "You haven't saved any drafts or cancelled any events."}
            </p>
            {eventType === 'upcoming' && isOwnProfile &&
              <Link to={createPageUrl("CreateEvent")}>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Create New Event</Button>
              </Link>
            }
          </div>
        </div>);

    }

    return (
      <div className="mt-4 mb-2 px-4 grid grid-cols-2 md:grid-cols-3 gap-4 sm:px-6 lg:px-8">
        {sortedEvents.map((event, index) =>
          <ProfileEventCard
            key={event.id}
            event={event}
            eventType={eventType}
            onCancel={confirmCancel}
            onDelete={confirmDelete}
            onGenerateMemoryPost={handleGenerateMemoryPost}
            isOwnProfile={isOwnProfile}
            onClick={() => openReel(sortedEvents, index)} />

        )}
      </div>);

  };

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="mb-12">
            {isOwnProfile && profileUser?.account_type === 'business' && receivedReviews.length > 0 &&
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <PerformanceOverview profileUser={profileUser} reviews={receivedReviews} />
              </div>
            }

            {receivedReviews && receivedReviews.length > 0 &&
              <>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                  <h3 className="mb-4 text-base font-semibold text-center">
                    Reviews for {profileUser.full_name}'s Events
                  </h3>
                  <BusinessReviewsTab
                    profileUser={profileUser}
                    reviews={receivedReviews}
                    eventsMap={reviewedEventsForCuratorMap}
                    isOwnProfile={isOwnProfile}
                    limitTo3={true} />

                </div>

                <div className="border-t border-gray-200 mt-4 mb-8"></div>
              </>
            }

            <div className="text-center mt-4 md:mt-6">
              <div className="inline-flex items-center bg-gray-100 rounded-full p-1 font-medium md:max-w-screen-md">
                <button onClick={() => setEventFilter('upcoming')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm md:px-5 md:py-2 ${eventFilter === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                  Upcoming ({upcomingEvents.length})
                </button>
                <button onClick={() => setEventFilter('past')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm md:px-5 md:py-2 ${eventFilter === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                  Past ({pastEvents.length})
                </button>
                {isOwnProfile &&
                  <button onClick={() => setEventFilter('drafts')} className={`px-4 py-1.5 rounded-full text-xs md:text-sm md:px-5 md:py-2 ${eventFilter === 'drafts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}>
                    Drafts/Cancelled ({draftsCancelledEvents.length})
                  </button>
                }
              </div>
            </div>

            <div>
              {eventFilter === 'upcoming' && renderEventGrid(upcomingEvents, 'upcoming')}
              {eventFilter === 'past' && renderEventGrid(pastEvents, 'past')}
              {isOwnProfile && eventFilter === 'drafts' && renderEventGrid(draftsCancelledEvents, 'drafts')}
              {eventFilter === 'drafts' && !isOwnProfile &&
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg shadow-blue-500/10">
                    <h3 className="text-xl font-semibold mb-2">Not available</h3>
                    <p className="text-gray-500">Drafts and cancelled events are private to the profile owner.</p>
                  </div>
                </div>
              }
            </div>
          </div>);


      case 'entries':
        const userEntries = userVibeEntries;

        const sortedEntries = [...userEntries].sort((a, b) => {
          const isDraftA = a.status === 'draft';
          const isDraftB = b.status === 'draft';

          if (isDraftA && !isDraftB) return -1;
          if (!isDraftA && isDraftB) return 1;

          const dateA = new Date(a.date || a.created_date || a.timestamp || 0);
          const dateB = new Date(b.date || b.created_date || b.timestamp || 0);
          return dateB.getTime() - dateA.getTime();
        });

        return (
          <div className="space-y-6">
            {sortedEntries.length > 0 ?
              <div className="pr-2 pl-2 grid grid-cols-3 gap-1">
                {sortedEntries.map((post, index) => {
                  const isDraft = post.status === 'draft';

                  return (
                    <div key={post.id || index} className="aspect-[3/4] relative group bg-gray-200 rounded-xl overflow-hidden">
                      <div
                        onClick={() => openReel(sortedEntries, index)}
                        className="block w-full h-full cursor-pointer">

                        <img
                          src={post.cover_image || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=800&fit=crop'}
                          alt={post.title || 'Entry'}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=800&fit=crop"; }} />


                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                      </div>

                      {isDraft &&
                        <div className="absolute top-2 left-2">
                          <Badge variant="outline" className="bg-yellow-500 text-white border-yellow-500 text-xs">
                            Draft
                          </Badge>
                        </div>
                      }

                      {isOwnProfile &&
                        <div className="absolute bottom-2 left-2 z-10">
                          <DropdownMenu open={openDropdownId === post.id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? post.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 rounded-full bg-black/50 text-white hover:bg-black/60"
                                onClick={(e) => e.preventDefault()}>

                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              side="top"
                              className="mb-16"
                              onClick={(e) => e.stopPropagation()}>

                              {isDraft &&
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishEntry(post.id);
                                  }}
                                  className="text-green-700">

                                  <Check className="mr-2 h-4 w-4" />
                                  <span>Publish Post</span>
                                </DropdownMenuItem>
                              }
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setShowEditFeatureDialog(true);
                                }}>

                                <BookOpen className="mr-2 h-4 w-4" />
                                <span>Add to Album</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setShowEditFeatureDialog(true);
                                }}>

                                <Edit3 className="mr-2 h-4 w-4" />
                                <span>Edit Post</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  setShowChooseAudienceDialog(true);
                                }}>

                                <Users className="mr-2 h-4 w-4" />
                                <span>Choose Audience</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                  handleDeletePost(post.id);
                                }}
                                className="text-red-600">

                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Post</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      }
                    </div>);

                })}
              </div> :

              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">📝</p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "Create your first entry to share your vibes!" : "This user hasn't posted any entries yet."}
                  </p>
                  {isOwnProfile &&
                    <Button
                      onClick={() => navigate(createPageUrl('CreateEvent?type=entry'))}
                      className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700">

                      Create Entry
                    </Button>
                  }
                </div>
              </div>
            }
          </div>);


      case 'albums':
        const displayAlbums = isOwnProfile ? userAlbums : userAlbums.filter((album) => !album.is_hidden);

        return (
          <div className="mx-auto pr-4 pl-4 max-w-4xl sm:px-6 lg:px-8">
            {displayAlbums.length > 0 ?
              <div className="space-y-4">
                {displayAlbums.map((album) =>
                  <AlbumCard
                    key={album.id}
                    album={album}
                    isOwnProfile={isOwnProfile}
                    onEdit={handleEditAlbum}
                    onToggleHidden={handleToggleHiddenAlbum}
                    onChooseAudience={handleChooseAudience}
                    onDelete={handleDeleteAlbumRequest} />

                )}
              </div> :

              <div className="text-center py-16">
                <p className="text-5xl mb-4">📚</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No albums yet</h3>
                <p className="text-gray-500">
                  {isOwnProfile ? "Create your first album to organize your entries!" : "This user hasn't created any albums yet."}
                </p>
              </div>
            }
          </div>);


      case 'tagged':
        return (
          <div className="pt-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tagged posts yet</h3>
                <p className="text-gray-500">When someone tags you in their posts, they'll appear here.</p>
              </div>
            </div>
          </div>);


      case 'reviews':
        return (
          <ReviewsTab
            reviews={userReviews}
            eventsMap={reviewedEventsMap}
            isOwnProfile={isOwnProfile}
            onEdit={handleEditReview}
            onDelete={handleDeleteReviewRequest}
            onWriteMore={handleWriteMoreReviews}
            availableReviewCount={pastEvents.length}
            profileUser={profileUser}
          />
        );



      case 'following':
        return (
          <div className="pt-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Following Feature Coming Soon!</h3>
                <p className="text-gray-500">This section will show who {profileUser.full_name} is following.</p>
              </div>
            </div>
          </div>);


      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  if (showingLoginBypass) {
    return <LoginBypass onClose={() => setShowingLoginBypass(false)} />;
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <Button onClick={() => navigate(createPageUrl("Feed"))} className="bg-blue-600 text-white hover:bg-blue-700">
            Go to Feed
          </Button>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="relative h-48 md:h-48 overflow-hidden">
        <img
          src={profileUser.cover_image || 'https://images.unsplash.com/photo-1529333166437-77501bd399d1?w=800&h=400&fit=crop'}
          alt="Profile Cover"
          className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute top-4 left-4">
          {!isOwnProfile &&
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/40 hover:bg-black/60 text-white rounded-full"
              onClick={() => navigate(createPageUrl("Feed"))}>

              <ArrowLeft className="w-5 h-5" />
            </Button>
          }
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          {isOwnProfile ?
            <Link to={createPageUrl("Chat")}>
              <Button variant="ghost" size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full">
                <MessageCircle className="w-5 h-5" />
              </Button>
            </Link> :

            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-black/40 hover:bg-black/60 text-white rounded-full">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={handleSeeLess}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    See Less
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBlockUser}>
                    <Ban className="w-4 h-4 mr-2" />
                    Block User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReportUser} className="text-red-600">
                    <Flag className="w-4 h-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative -mt-12 md:-mt-16 px-4 sm:px-6 lg:px-8">
            <img
              src={profileUser.avatar || 'https://via.placeholder.com/128'}
              alt="Profile Avatar"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white mx-auto" />

          </div>

          <div className="mt-2 md:mt-4 text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              {isOwnProfile ? profileUser.full_name : profileUser.account_type === "business" ? profileUser.business_name || profileUser.full_name : profileUser.full_name}
              {profileUser.is_verified && (
                <button
                  onClick={() => {
                    const dialog = document.createElement('div');
                    dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999999]';
                    dialog.innerHTML = `
                      <div class="bg-white rounded-2xl p-6 max-w-sm shadow-2xl">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Coming Soon</h3>
                        <p class="text-gray-600 mb-5">Profile verification is coming soon! We're working on a process to verify authentic accounts.</p>
                        <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Got it</button>
                      </div>
                    `;
                    document.body.appendChild(dialog);
                    dialog.querySelector('button').onclick = () => document.body.removeChild(dialog);
                    dialog.onclick = (e) => { if (e.target === dialog) document.body.removeChild(dialog); };
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                </button>
              )}
            </h1>

            {/* Badges below name */}
            <div className="flex items-center justify-center gap-2 mt-1">
              {profileUser?._isAdminMode &&
                <Badge className="bg-blue-600 text-white px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80">
                  ADMIN
                </Badge>
              }
              {profileUser?.account_type === 'business' &&
                <Badge className="bg-cyan-500 text-white px-2 py-0.5 text-xs font-semibold rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex items-center border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-transparent hover:bg-cyan-500">
                  BUSINESS
                </Badge>
              }
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto mt-2 md:mt-4">
              <p className="text-gray-600 text-sm md:text-base leading-relaxed text-center">
                {profileUser.bio || 'This user has not set a bio yet.'}
              </p>
            </motion.div>

            {isOwnProfile &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-2 md:mt-4">
                {(profileUser.ai_scheduling ?? true) && // Sync AI settings: Use the ai_scheduling property with fallback
                  <Button
                    variant="outline"
                    className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 px-3 py-1.5 text-xs h-8 md:h-10 md:text-sm md:px-4"
                    onClick={() => setShowAIDialog(true)}
                    disabled={isGenerating || !upcomingEvents.length}>
                    <Sparkles className="w-3 h-3 mr-1 md:w-4 md:h-4 md:mr-2" />
                    AI Schedule Assistant
                  </Button>
                }
              </motion.div>
            }

            {isOwnProfile ?
              <div className="mt-2 md:mt-6 flex justify-center gap-2 sm:gap-4">
                <Link to={createPageUrl("EditProfile")}>
                  <Button variant="outline" className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4">
                    <Pencil className="w-3 h-3 mr-1.5" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to={createPageUrl("SettingsIndex")}>
                  <Button variant="outline" className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4">
                    <Settings className="w-3 h-3 mr-1.5" />
                    Settings
                  </Button>
                </Link>
              </div> :
              <div className="mt-4 md:mt-6 flex justify-center gap-2 sm:gap-4">
                {/* FOLLOW BUTTON */}
                <Button
                  onClick={handleFollowToggle}
                  className="inline-flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow hover:bg-primary/90 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white h-8 text-xs px-3 md:h-10 md:text-sm md:px-4">

                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {isFollowing ? (
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 absolute -bottom-1 -right-1 text-white" strokeWidth={3} />
                    ) : (
                      <Plus className="w-2.5 h-2.5 md:w-3 md:h-3 absolute -bottom-1 -right-1 text-white" strokeWidth={3} />
                    )}
                  </div>
                  {isFollowing ? "Following" : "Follow"}
                </Button>

                {/* CHAT BUTTON */}
                <Button
                  onClick={handleChatClick}
                  variant="outline" className="inline-flex items-center justify-center gap-0 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground py-2 bg-white text-blue-600 border-blue-600 hover:bg-white-50 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4">

                  <MessageCircle className="w-3 h-3 mr-1.5 md:w-4 md:h-4 md:mr-2" />
                  Chat
                </Button>

                {/* GROUP CHAT BUTTON - Dynamic based on status */}
                {profileGroupChatMap[profileUser.email] &&
                  <>
                    {groupChatStatus === 'available' &&
                      <Button
                        onClick={handleJoinGroupChat}
                        variant="outline" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm hover:text-accent-foreground py-2 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4 border-cyan-500 text-cyan-600 hover:bg-white-50">

                        <Users className="w-3 h-3 mr-1.5 md:w-4 md:h-4 md:mr-2" />
                        Join Group Chat
                      </Button>
                    }

                    {groupChatStatus === 'pending' &&
                      <Button
                        onClick={() => setShowWithdrawDialog(true)}
                        variant="outline"
                        className="border-gray-700 text-gray-500 bg-white hover:bg-gray-200 h-8 text-xs px-3 md:h-10 md:text-sm md:px-4">
                        <Users className="w-3 h-3 mr-1.5 md:w-4 md:h-4 md:mr-2" />
                        Waitlist
                      </Button>
                    }

                    {groupChatStatus === 'joined' &&
                      <Button
                        onClick={handleOpenGroupChat}
                        variant="outline"
                        className="h-8 text-xs px-3 md:h-10 md:text-sm md:px-4 border-blue-500 text-blue-600 hover:bg-blue-50">
                        <Users className="w-3 h-3 mr-1.5 md:w-4 md:h-4 md:mr-2" />
                        Group Chat
                      </Button>
                    }
                  </>
                }
              </div>
            }
          </div>

          <div className="border-b border-gray-200 mt-4 md:mt-8 mb-4 md:mb-6">
            <div className="flex justify-center -mb-px space-x-4 md:space-x-8">
              {profileTabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleMainTabChange(tab.id)}
                    className={`flex flex-col items-center gap-1.5 pb-2 text-xs font-semibold tracking-wider ${activeTab === tab.id ?
                      'text-gray-900 border-b-2 border-gray-900' :
                      'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'} md:text-sm md:gap-2 md:pb-3`
                    }>
                    {tab.icon}
                    {tab.label.toUpperCase()}
                  </button>);

              })}
            </div>
          </div>
        </motion.div>

        {renderContent()}
      </div>

      {isOwnProfile &&
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>AI Schedule Assistant</DialogTitle>
              <DialogDescription>
                Let me help you plan your schedule based on your upcoming events.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isGenerating ?
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div> :
                schedule ?
                  <div className="prose prose-sm max-h-64 overflow-y-auto">
                    <ReactMarkdown>{schedule}</ReactMarkdown>
                  </div> :
                  <div>
                    <h4 className="font-semibold mb-2">Your Upcoming Events:</h4>
                    {upcomingEvents.length > 0 ?
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {upcomingEvents.map((e) => <li key={e.id}>{e.title}</li>)}
                      </ul> :
                      <p className="text-sm text-gray-500">You have no upcoming events to schedule. Try creating one!</p>
                    }
                  </div>
              }
            </div>
            <DialogFooter>
              <Button onClick={generateSchedule} disabled={isGenerating || !upcomingEvents.length}>
                {isGenerating ? 'Generate...' : 'Generate My Schedule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }

      <MemoryPostDialog
        isOpen={showMemoryDialog}
        onOpenChange={(open) => {
          if (!open && isGeneratingMemory) {
            handleAbortMemoryPost();
          } else {
            setShowMemoryDialog(open);
          }
        }}
        isGenerating={isGeneratingMemory}
        isSuccess={memorySuccess}
        eventTitle={eventForMemoryPost?.title}
        onAbort={handleAbortMemoryPost} />


      {editingReview &&
        <ReviewDialog
          isOpen={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          eventTitle={reviewedEventsMap[editingReview.event_id]?.title || 'this event'}
          initialReviewData={{
            rating: editingReview.rating,
            review_text: editingReview.review_text,
            liked: editingReview.liked,
            vibe_tags: editingReview.vibe_tags,
            would_recommend: editingReview.would_recommend,
            share_with_host: editingReview.share_with_host,
            attended: editingReview.attended,
            post_to_events_page: editingReview.post_to_events_page
          }}
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmittingReview} />

      }

      <ConfirmDialog
        isOpen={!!reviewToDeleteId}
        onOpenChange={() => setReviewToDeleteId(null)}
        onConfirm={handleConfirmDeleteReview}
        title="Delete Review?"
        description="This will permanently delete your review. This action cannot be undone." />


      <Dialog open={showDeleteEntryDialog} onOpenChange={setShowDeleteEntryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Entry?</DialogTitle>
            <DialogDescription>
              This will permanently delete your entry. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteEntryDialog(false)} className="bg-background mt-2 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description="This will permanently delete your event. This action cannot be undone." />


      <CancelMessageDialog
        isOpen={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel} />


      <EventReelModal
        events={reelData.events}
        startIndex={reelData.startIndex}
        isOpen={reelData.isOpen}
        onClose={closeReel}
        currentUser={currentUser}
        onGenerateMemoryPost={handleGenerateMemoryPost} />


      <Dialog open={showEditFeatureDialog} onOpenChange={setShowEditFeatureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              This feature is currently under development and will be available soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowEditFeatureDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChooseAudienceDialog} onOpenChange={setShowChooseAudienceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              Choosing an audience for your posts is coming soon!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowChooseAudienceDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingAlbum &&
        <EditAlbumDialog
          isOpen={showEditAlbumDialog}
          onOpenChange={setShowEditAlbumDialog}
          album={editingAlbum}
          onSave={handleSaveAlbum}
          isSaving={isSavingAlbum} />

      }

      {/* Delete Album Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteAlbumDialog}
        onOpenChange={setShowDeleteAlbumDialog}
        onConfirm={handleConfirmDeleteAlbum}
        title="Delete Album?"
        description="This will permanently delete this album. This action cannot be undone." />


      {/* Choose Audience Coming Soon Dialog */}
      <Dialog open={showAudienceComingSoonDialog} onOpenChange={setShowAudienceComingSoonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feature Coming Soon</DialogTitle>
            <DialogDescription>
              Choosing an audience for your albums is coming soon!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowAudienceComingSoonDialog(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Override Dialog */}
      <Dialog open={showAdminOverrideDialog} onOpenChange={setShowAdminOverrideDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Override</DialogTitle>
            <DialogDescription>
              Switch your account type between Personal and Business for testing purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Current account type: <span className="font-semibold">{profileUser.account_type === 'business' ? 'Business' : 'Personal'}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This will switch your account to {profileUser.account_type === 'business' ? 'Personal' : 'Business'} mode.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminOverrideDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdminOverride} className="bg-orange-600 hover:bg-orange-700">
              Switch to {profileUser.account_type === 'business' ? 'Personal' : 'Business'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Group Chat Request Popup */}
      {showGroupChatPopup &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-600 mb-4">
                Your request to join the group chat has been sent. You'll be notified once approved!
              </p>
            </div>
          </motion.div>
        </div>
      }

      <LoginPromptDialog
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction} />


      {/* Withdraw Request Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your request to join this group chat?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)} className="bg-background mt-2 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
              Cancel
            </Button>
            <Button onClick={handleWithdrawRequest} className="bg-red-600 hover:bg-red-700 text-white">
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}