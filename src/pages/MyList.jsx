import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Event } from "@/api/entities"; // This will be replaced by base44.entities.Event
import { EventAttendance } from "@/api/entities"; // This will be replaced by base44.entities.EventAttendance
import { User } from "@/api/entities"; // This will be replaced by base44.auth.me/updateMe
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Sparkles, TicketIcon, Bookmark, Clock, Search, MapPin, Check, Star, Loader2, Megaphone, Heart, Plus, RefreshCw, ChevronDown, MoreVertical, LogIn, Lock, X } from "lucide-react";
import FeedEventListItem from "../components/feed/FeedEventListItem";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EventReview } from "@/api/entities"; // This will be replaced by base44.entities.EventReview
import { format, parseISO, isToday, isTomorrow, startOfDay, addDays, startOfWeek, endOfWeek, nextSaturday, nextSunday, isWeekend, startOfMonth, endOfMonth, isSameDay, isValid } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import FriendsGoingModal from "../components/event/FriendsGoingModal";
import EventReelModal from "../components/event/EventReelModal";
import { groupBy } from "lodash";
import { apiCache } from '../components/apiCache';
import { simulatedDataManager } from '../components/simulatedDataManager';
import { base44 } from '@/api/base44Client';


// Helper function for vibe tag colors
const getVibeTagColor = (tag) => {
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-800" },
    { bg: "bg-green-100", text: "text-green-800" },
    { bg: "bg-yellow-100", text: "text-yellow-800" },
    { bg: "bg-red-100", text: "text-red-800" },
    { bg: "bg-purple-100", text: "text-purple-800" },
    { bg: "bg-pink-100", text: "text-pink-800" }
  ];

  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return `${colors[index].bg} ${colors[index].text}`;
};

// Helper function to validate MongoDB ObjectId format
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sample categories for the Feed filter
const categories = [
  { value: "all", label: "All Categories" },
  { value: "music", label: "🎵 Music" },
  { value: "art", label: "🎨 Art" },
  { value: "food", label: "🍽️ Food" },
  { value: "tech", label: "💻 Tech" },
  { value: "sports", "label": "⚽ Sports" },
  { value: "business", label: "💼 Business" },
  { value: "wellness", label: "🧘 Wellness" },
  { value: "nightlife", label: "🌃 Nightlife" },
  { value: "happy-hour", label: "🍻 Happy Hour" },
  { value: "rooftop", label: "🏙️ Rooftop" },
  { value: "bar", label: "🍸 Bar" },
  { value: "park", label: "🌳 Park" },
  { value: "co-working", label: "🧑‍💻 Co-working" },
  { value: "culture", label: "🏛️ Culture" },
  { value: "outdoor", label: "🏕️ Outdoor" },
  { value: "market", label: "🛍️ Market" },
  { value: "talk", label: "🎤 Talk" },
  { value: "rave", label: "⚡ Rave" },
  { value: "popup", label: "✨ Pop-up" },
  { value: "party", "label": "🎉 Party" },
  { value: "picnic", label: "🧺 Picnic" },
  { value: "other", label: "🤔 Other" }
];

// ISSUE 2 & 3 FIX: Seed both PENDING (private) and PAST events
const seedMyListData = async (user) => {
  const userEmail = user.email;
  const userName = user.full_name;
  const userAvatar = user.avatar;

  console.log('🌱 Starting MyList data seeding for:', userEmail);
  
  // Check if already seeded to avoid duplicates - use localStorage instead of database check
  const seededFlag = localStorage.getItem('mylist_data_seeded_v3');
  if (seededFlag) {
    console.log('⏭️ MyList data already seeded, skipping...');
    return;
  }
  
  try {
    // Create PRIVATE events for pending status (only private events have pending requests)
    const pendingEvent1 = await base44.entities.Event.create({
      title: "Tech Innovators Networking",
      description: "Exclusive networking event for tech professionals. Application required.",
      cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: "SF TechHub, San Francisco",
      venue_name: "SF TechHub",
      organizer_name: "Tech Innovators Network",
      organizer_email: "tech@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      category: "tech",
      price: 0,
      privacy_level: "private",
      has_guest_list: true, // ISSUE 2 FIX
      rsvp_required: true,
      source: "mylist-seed-pending"
    });

    const pendingEvent2 = await base44.entities.Event.create({
      title: "Rooftop Sunset Social",
      description: "Private rooftop gathering for select members. RSVP required for approval.",
      cover_image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Sky Lounge, Downtown SF",
      venue_name: "Sky Lounge",
      organizer_name: "SF Social Club",
      organizer_email: "social@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop",
      category: "social",
      price: 0,
      privacy_level: "private",
      has_guest_list: true, // ISSUE 2 FIX
      rsvp_required: true,
      source: "mylist-seed-pending"
    });

    const pendingEvent3 = await base44.entities.Event.create({
      title: "Premium Wellness Retreat",
      description: "Exclusive wellness retreat in the mountains. Limited spots, approval required.",
      cover_image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Serenity Mountain Spa",
      venue_name: "Serenity Mountain Spa",
      organizer_name: "Serenity Wellness",
      organizer_email: "wellness@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop",
      category: "wellness",
      price: 350,
      privacy_level: "private",
      has_guest_list: true, // ISSUE 2 FIX
      rsvp_required: true,
      source: "mylist-seed-pending"
    });

    // Create PAST events for "attended" status
    const pastEvent1 = await base44.entities.Event.create({
      title: "Summer Jazz Night",
      description: "An evening of smooth jazz under the stars.",
      cover_image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&h=700&fit=crop",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Golden Gate Park, SF",
      venue_name: "Golden Gate Park",
      organizer_name: "SF Jazz Collective",
      organizer_email: "jazz@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      category: "music",
      price: 25,
      privacy_level: "public",
      source: "mylist-seed-past",
      status: "active"
    });

    const pastEvent2 = await base44.entities.Event.create({
      title: "Art Gallery Opening",
      description: "Contemporary art showcase featuring local artists.",
      cover_image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=700&fit=crop",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Chelsea Galleries, NYC",
      venue_name: "Chelsea Galleries",
      organizer_name: "ArtHaus Collective",
      organizer_email: "arthaus@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop",
      category: "art",
      price: 0,
      privacy_level: "public",
      source: "mylist-seed-past",
      status: "active"
    });

    const pastEvent3 = await base44.entities.Event.create({
      title: "Food Truck Festival",
      description: "A delicious day of food trucks and live music.",
      cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=700&fit=crop",
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Dolores Park, SF",
      venue_name: "Dolores Park",
      organizer_name: "SF Food Events",
      organizer_email: "food@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
      category: "food",
      price: 0,
      privacy_level: "public",
      source: "mylist-seed-past",
      status: "active"
    });

    // Create INVITED events
    const invitedEvent1 = await base44.entities.Event.create({
      title: "Exclusive Art Exhibit",
      description: "Private viewing of contemporary art collection. You're invited!",
      cover_image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Modern Art Museum, NYC",
      venue_name: "Modern Art Museum",
      organizer_name: "ArtHaus Collective",
      organizer_email: "arthaus@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop",
      category: "art",
      price: 0,
      privacy_level: "semi-public",
      source: "mylist-seed-invited"
    });

    // Create MAYBE events
    const maybeEvent1 = await base44.entities.Event.create({
      title: "Rooftop Networking Happy Hour",
      description: "Casual networking with drinks and city views.",
      cover_image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Downtown SF",
      venue_name: "Sky Bar",
      organizer_name: "Professional Network SF",
      organizer_email: "network@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      category: "business",
      price: 10,
      privacy_level: "public",
      source: "mylist-seed-maybe"
    });

    // Create CANT GO events
    const cantGoEvent1 = await base44.entities.Event.create({
      title: "Music Festival Weekend",
      description: "Three days of live music and camping.",
      cover_image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Golden Gate Park, SF",
      venue_name: "Golden Gate Park",
      organizer_name: "SF Music Collective",
      organizer_email: "music@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      category: "music",
      price: 150,
      privacy_level: "public",
      source: "mylist-seed-cant-go"
    });

    // Create pending attendance records for PRIVATE events
    await base44.entities.EventAttendance.create({
      event_id: pendingEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "pending",
      requested_at: new Date().toISOString()
    });

    await base44.entities.EventAttendance.create({
      event_id: pendingEvent2.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "pending",
      requested_at: new Date().toISOString()
    });

    await base44.entities.EventAttendance.create({
      event_id: pendingEvent3.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "pending",
      requested_at: new Date().toISOString()
    });

    // Create GOING attendance records for FUTURE events with mutuals
    const futureEvent1 = await base44.entities.Event.create({
      title: "Tech Innovators Meetup",
      description: "Monthly networking event for tech professionals",
      cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Innovation Hub, SF",
      venue_name: "Innovation Hub",
      organizer_name: "Tech Innovators Network",
      organizer_email: "tech@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      category: "tech",
      price: 0,
      privacy_level: "public",
      source: "mylist-seed-going",
      friends_going: [
        { name: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
        { name: "Diana Kim", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" }
      ]
    });

    const futureEvent2 = await base44.entities.Event.create({
      title: "Art Gallery After Party",
      description: "Exclusive after-party following the gallery opening",
      cover_image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      location: "ArtHaus Studio, Brooklyn",
      venue_name: "ArtHaus Studio",
      organizer_name: "ArtHaus Collective",
      organizer_email: "arthaus@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop",
      category: "art",
      price: 20,
      privacy_level: "public",
      source: "mylist-seed-going",
      friends_going: [
        { name: "Jordan Lee", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop" }
      ]
    });

    // Create NO RSVP events (events in feed but user hasn't responded)
    const noRsvpEvent1 = await base44.entities.Event.create({
      title: "Weekend Brunch Social",
      description: "Casual brunch meetup for new friends",
      cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Cafe Central, SF",
      venue_name: "Cafe Central",
      organizer_name: "SF Social Events",
      organizer_email: "social@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop",
      category: "food",
      price: 15,
      privacy_level: "public",
      source: "mylist-seed-no-rsvp"
    });

    const noRsvpEvent2 = await base44.entities.Event.create({
      title: "Yoga in the Park",
      description: "Free outdoor yoga session for all levels",
      cover_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Golden Gate Park, SF",
      venue_name: "Golden Gate Park",
      organizer_name: "Wellness Studio Downtown",
      organizer_email: "wellness@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      category: "wellness",
      price: 0,
      privacy_level: "public",
      source: "mylist-seed-no-rsvp"
    });

    const noRsvpEvent3 = await base44.entities.Event.create({
      title: "Live Jazz Night",
      description: "Smooth jazz and cocktails at our favorite venue",
      cover_image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Blue Note SF",
      venue_name: "Blue Note",
      organizer_name: "SF Jazz Collective",
      organizer_email: "jazz@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
      category: "music",
      price: 25,
      privacy_level: "public",
      source: "mylist-seed-no-rsvp"
    });

    const noRsvpEvent4 = await base44.entities.Event.create({
      title: "Rooftop Sunset Party",
      description: "End of summer celebration on the rooftop",
      cover_image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=700&fit=crop",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Sky Lounge, Downtown",
      venue_name: "Sky Lounge",
      organizer_name: "Rooftop Events SF",
      organizer_email: "rooftop@demo.com",
      organizer_avatar: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=200&h=200&fit=crop",
      category: "party",
      price: 30,
      privacy_level: "public",
      source: "mylist-seed-no-rsvp"
    });

    // Create "going" attendance records for PAST events
    await base44.entities.EventAttendance.create({
      event_id: pastEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "going",
      approved_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    });

    await base44.entities.EventAttendance.create({
      event_id: pastEvent2.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "going",
      approved_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    await base44.entities.EventAttendance.create({
      event_id: pastEvent3.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "going",
      approved_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Create attendance for GOING events (future events with mutuals)
    await base44.entities.EventAttendance.create({
      event_id: futureEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "going"
    });

    await base44.entities.EventAttendance.create({
      event_id: futureEvent2.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "going"
    });

    // Create INVITED attendance records
    await base44.entities.EventAttendance.create({
      event_id: invitedEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "invited"
    });

    // Create MAYBE attendance records
    await base44.entities.EventAttendance.create({
      event_id: maybeEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "maybe"
    });

    // Create CANT GO attendance records
    await base44.entities.EventAttendance.create({
      event_id: cantGoEvent1.id,
      user_email: userEmail,
      user_name: userName || "Current User",
      user_avatar: userAvatar,
      status: "cant_go"
    });

    console.log('✅ MyList sample data seeded: 3 pending + 3 past + 2 going + 4 no_rsvp + 1 invited + 1 maybe + 1 cant_go');
    localStorage.setItem('mylist_data_seeded_v3', 'true');
  } catch (error) {
    console.error('❌ Error seeding MyList data:', error);
  }
};


// New sample data seeding function for collections
const seedCollectionsData = async (user) => {
  const seedFlag = 'collectionsSeeded_v2';
  // The sessionStorage flag is now primarily to prevent repeated console logs for "seeding" ephemeral data
  if (!sessionStorage.getItem(seedFlag)) {
    console.log("Seeding sample collections data...");
    sessionStorage.setItem(seedFlag, 'true');
  }

  const sampleCollections = [
    {
      id: `collection-1-${user?.email || 'preview'}`, // Updated to use user.email or 'preview'
      name: 'Romantic Dinner Spots',
      description: 'Perfect places for date nights',
      items: [
        {
          id: 'item-1',
          author_name: 'Maya Patel',
          author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
          content: 'This candlelit Italian spot is pure magic ✨',
          image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
          location: 'North Beach, SF'
        },
        {
          id: 'item-2',
          author_name: 'Alex Chen',
          author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
          content: 'Rooftop dining with the best city views 🌃',
          image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop',
          location: 'SOMA, SF'
        }],

      created_at: new Date().toISOString()
    },
    {
      id: `collection-2-${user?.email || 'preview'}`, // Updated to use user.email or 'preview'
      name: 'Happy Hour Deals',
      description: 'Best after-work spots',
      items: [
        {
          id: 'item-3',
          author_name: 'Jordan Kim',
          author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop',
          content: '$5 cocktails and amazing vibes every Friday 🍸',
          image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a8e?w=400&h=400&fit=crop',
          location: 'Mission District'
        },
        {
          id: 'item-4',
          author_name: 'Sarah M.',
          author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop',
          content: 'Hidden speakeasy with half-price drinks until 7pm',
          image_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&h=400&fit=crop',
          location: 'Financial District'
        }],

      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `collection-3-${user?.email || 'preview'}`, // Updated to use user.email or 'preview'
      name: 'Weekend Vibes',
      description: 'Fun weekend activities',
      items: [
        {
          id: 'item-5',
          author_name: 'Elena K.',
          author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
          content: 'Best farmers market in the city! Fresh everything 🥕',
          image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
          location: 'Ferry Building'
        }],

      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `collection-4-${user?.email || 'preview'}`, // Updated to use user.email or 'preview'
      name: 'Empty Collection',
      description: 'A collection with no items',
      items: [],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Collections data is now returned, not directly setting state
  return sampleCollections;
};

// Helper function to get collection cover image
const getCollectionCoverImage = (collection, savedPostsMap, allVibePosts) => {
  let imageUrl = "https://images.unsplash.com/photo-1541701494587-f316279934cd?w=400&h=400&fit=crop&auto=format&q=80"; // A generic placeholder

  const findImage = (itemIds) => {
    if (!itemIds || itemIds.length === 0) return null;
    for (const itemId of itemIds) {
      // In this demo, allVibePosts are Event objects. So, we'll try to find an event with the itemId.
      // In a real app, you might have specific 'post' objects linked to collections.
      const foundItem = allVibePosts.find((post) => post.id === itemId && post.cover_image);
      if (foundItem) {
        return foundItem.cover_image;
      }
    }
    return null;
  };

  // If "All" collection, aggregate from all saved posts, including _general_saves
  if (collection.id === 'all') {
    const allSavedPostIds = new Set();
    if (savedPostsMap) {
      Object.values(savedPostsMap).forEach((ids) => {
        if (Array.isArray(ids)) {
          ids.forEach((id) => allSavedPostIds.add(id));
        }
      });
    }
    // allVibePosts needs to contain all events that could be saved
    const allEventsAsPosts = allVibePosts.filter((e) => allSavedPostIds.has(e.id));
    if (allEventsAsPosts.length > 0) {
      imageUrl = allEventsAsPosts[0].cover_image;
    }
  } else if (savedPostsMap && savedPostsMap[collection.id]) {
    // For specific collections, find the first image in that collection
    const collectionPostIds = savedPostsMap[collection.id];
    const firstImage = findImage(collectionPostIds);
    if (firstImage) imageUrl = firstImage;
  } else if (collection.items && collection.items.length > 0) {
    // If the collection object itself has items (from seededCollectionsData)
    const itemIds = collection.items.map((item) => item.id);
    const firstImage = findImage(itemIds);
    if (firstImage) imageUrl = firstImage;
  }

  return imageUrl;
};

// Placeholder for old seedSampleFeedEvents. The outline did not include changes to this,
// and the new `seedMyListData` function populates user lists using *existing* events,
// so this function might be adapted or simplified if it was only for generating feed events.
// For now, retaining its structure as it helps to ensure there are "feed" events in the system.
const seedSampleFeedEvents = async (currentUser) => {
  const seedFlag = 'plannerFeedSeeded_v17_CLEAN'; // Original flag
  if (sessionStorage.getItem(seedFlag)) {
    // console.log("Planner feed data already seeded for this session."); // Commented to reduce noise
    return currentUser ? sessionStorage.getItem(seedFlag) : "GENERIC_PREVIEW_SEED";
  }

  if (!currentUser) {
    // console.log("Skipping feed seed as user is not logged in."); // Commented to reduce noise
    return "GENERIC_PREVIEW_SEED";
  }

  try {
    console.log("Seeding fresh planner feed data for this session (v17)...");
    const timestamp = Date.now();
    const NEW_SOURCE_TAG = `feed-sample-v17-${timestamp}`;

    const createFutureDate = (days) => {
      const date = new Date('2027-01-01'); // Using a fixed future date for consistency
      date.setDate(date.getDate() + days);
      return date;
    };

    const mockFriends = [
      { name: 'Alex Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop', email: 'alex.chen@example.com' },
      { name: 'Diana Kim', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop', email: 'diana.kim@example.com' },
      { name: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop', email: 'jordan.lee@example.com' }
    ];

    const sampleEventDefinitions = [
      {
        title: "AI & The Future of Work",
        date: createFutureDate(39),
        category: "tech",
        cover_image: "https://images.unsplash.com/photo-1678483789004-a8e5a0357916?w=400&h=500&fit=crop",
        venue_name: "Metropolis Convention Center",
        price: 50,
        friends_going: [mockFriends[0], mockFriends[2]]
      },
      {
        title: "Indie Music Night at The Fillmore",
        date: createFutureDate(39),
        category: "music",
        cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=500&fit=crop",
        venue_name: "The Fillmore",
        price: 25,
        friends_going: []
      },
      {
        title: "VIP Gallery Preview",
        date: createFutureDate(24),
        category: "art",
        cover_image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop",
        venue_name: "The Modernist Gallery",
        price: 75,
        friends_going: [mockFriends[1]]
      },
      {
        title: "Oktoberfest Celebration",
        date: createFutureDate(45),
        category: "party",
        cover_image: "https://images.unsplash.com/photo-1633161331828-a98734273398?w=400&h=500&fit=crop",
        venue_name: "City Brewery",
        price: 15,
        friends_going: [mockFriends[0], mockFriends[1], mockFriends[2]]
      }
    ];

    const eventsToCreate = sampleEventDefinitions.map((def) => ({
      ...def,
      date: def.date.toISOString(),
      location: "New York, NY",
      organizer_name: "VibeMaster Events",
      organizer_email: "curators@vibespot.com",
      source: NEW_SOURCE_TAG,
      privacy_level: def.privacy_level || 'public'
    }));

    await base44.entities.Event.bulkCreate(eventsToCreate);
    sessionStorage.setItem(seedFlag, NEW_SOURCE_TAG);
    apiCache.invalidate('allEvents'); // Invalidate allEvents cache after creating new events
    return NEW_SOURCE_TAG;

  } catch (e) {
    console.error("Error in seeding sample feed events:", e);
    sessionStorage.setItem(seedFlag, "FAILED");
    return "FAILED";
  }
};


export default function MyList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Core data states
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]); // All events relevant to the user (saved, attended, feed)
  const [attendanceRecords, setAttendanceRecords] = useState([]); // User's attendance records
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState("feed");

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("Anytime");
  const [isDatePopoverOpen, setIsDatePopover] = useState(false); // For Date filter popover
  const [activeRsvpFilters, setActiveRsvpFilters] = useState(new Set(['all'])); // For Feed tab RSVP filters
  const [activePastFilter, setActivePastFilter] = useState("all"); // For Past Events filter

  // Shared UI/Action states
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [savingEventId, setSavingEventId] = useState(null);
  const [processingItems, setProcessingItems] = useState({}); // For mark attended/didn't go

  // Review states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingEvent, setReviewingEvent] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: "",
    liked: true,
    vibe_tags: "",
    would_recommend: true
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Blasts states
  const [showBlastsDialog, setShowBlastsDialog] = useState(false);
  const [selectedEventBlasts, setSelectedEventBlasts] = useState([]);

  // Collections states
  const [savedCollections, setSavedCollections] = useState([]);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  // Private event confirmation states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [eventToProcess, setEventToProcess] = useState(null);

  // Feed specific states
  const [feedError, setFeedError] = useState(null);
  const [feedRetryCount, setFeedRetryCount] = useState(0);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsGoingData, setFriendsGoingData] = useState({ friends: [], eventName: '' });
  const [showMutualsOnly, setShowMutualsOnly] = useState(false);

  // ISSUE 7 FIX: Vibe Reel states (Modified to outline's `reelData` structure)
  // Replaced reelData state with these three
  const [showVibeReel, setShowVibeReel] = useState(false);
  const [vibeReelItems, setVibeReelItems] = useState([]);
  const [vibeReelStartIndex, setVibeReelStartIndex] = useState(0);

  // Refs to store the currently displayed events for VibeReel access
  const finalFeedEventsRef = useRef([]);
  const finalSavedEventsRef = useRef([]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Main data loading effect
  const loadUserAndEvents = useCallback(async () => {
    setIsLoading(true);
    setFeedError(null); // Clear any feed errors on reload

    try {
      console.log('🔍 MyList: Starting auth check...');

      // Check bypass mode flags
      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      console.log('🔍 MyList: Auth flags:', { authBypassed, isAdmin, isDemo });

      let loggedInUser = null;

      if (authBypassed && (isAdmin || isDemo)) {
        const baseUser = simulatedDataManager.getBaseUser();
        if (isAdmin) {
          const adminOverrides = simulatedDataManager.getAdminUserUpdates();
          loggedInUser = { ...baseUser, ...adminOverrides, _isAdminMode: true };
        } else {
          loggedInUser = simulatedDataManager.applyDemoOverrides(baseUser);
        }

        // Check if seeding is needed
        const hasSeeded = localStorage.getItem('mylist_data_seeded_v3');
        if (!hasSeeded && loggedInUser) {
          console.log('🌱 MyList: Seeding initial MyList data in bypass mode...');
          await seedMyListData(loggedInUser); // Pass the full user object
        }
      } else {
        try {
          loggedInUser = await base44.auth.me();
          console.log('👤 MyList: Got authenticated user for initial fetch:', loggedInUser?.email);
        } catch (err) {
          if (err.response?.status === 401 || err.status === 401) {
            console.log('MyList: User not logged in (401)');
          } else {
            console.error('MyList: Error fetching user initially:', err);
          }
          loggedInUser = null;
          // setShowingLoginBypass(true); // This state variable does not exist in current code, omitting.
          setIsLoading(false);
          return;
        }
      }

      // If no user at all, set logged out state and exit
      if (!loggedInUser) {
        console.log('🚪 MyList: No user found after initial fetch, setting logged out state...');
        setIsLoggedOut(true);
        setCurrentUser(null);
        setEvents([]);
        setAttendanceRecords([]);
        setSavedCollections([]);
        setIsLoading(false);
        return;
      }

      // We have a user - set the state
      setIsLoggedOut(false);
      setCurrentUser(loggedInUser);
      console.log('✅ MyList: User authenticated/simulated successfully', loggedInUser.email);

      // Seed sample feed events (generates events for the feed)
      const feedSeedSourceTag = await seedSampleFeedEvents(loggedInUser);

      // Get all relevant event IDs from user's data and attendance
      const savedEventIds = loggedInUser.saved_events || [];
      const attendedEventIds = loggedInUser.attended_events || [];

      // ALWAYS fetch from real API, never from simulatedDataManager for general events/attendance
      console.log('🌐 MyList: Fetching events and attendance from actual API.');
      const allEventsFromSource = await apiCache.throttledRequest(
        'allEvents',
        async () => await base44.entities.Event.list() // Using the imported base44.entities.Event
      );
      const allAttendancesFromSource = await base44.entities.EventAttendance.filter({ user_email: loggedInUser.email }, '-created_date', 100); // Using imported base44.entities.EventAttendance

      const attendanceEventIds = new Set(allAttendancesFromSource.map(att => att.event_id));

      const eventIdsToFetch = new Set([
        ...savedEventIds,
        ...attendedEventIds,
        ...attendanceEventIds,
        // Include events from feed seed from the source (simulated or real)
        ...(allEventsFromSource.filter(e => e.source === feedSeedSourceTag).map(e => e.id))
      ].filter(isValidObjectId)); // Ensure only valid object IDs are considered

      let fetchedEvents = [];
      if (eventIdsToFetch.size > 0) {
        // Filter from the aggregated source of events
        fetchedEvents = allEventsFromSource.filter(e => eventIdsToFetch.has(e.id));
      }

      setEvents(fetchedEvents);
      setAttendanceRecords(allAttendancesFromSource);

      // Process collections
      const sampleCollectionsData = await seedCollectionsData(loggedInUser);
      const userCollections = Array.isArray(loggedInUser.collections) ? loggedInUser.collections : [];
      const savedPostsMap = loggedInUser.saved_posts || {};

      const combinedCollections = new Map();
      userCollections.forEach((c) => combinedCollections.set(c.id, c));
      sampleCollectionsData.forEach((c) => combinedCollections.set(c.id, c));
      let collectionsToDisplay = Array.from(combinedCollections.values());

      if (!collectionsToDisplay.some((c) => c.id === 'all')) {
        collectionsToDisplay.unshift({
          id: 'all',
          name: 'All',
          description: 'All your saved items',
          created_at: new Date(0).toISOString()
        });
      }

      const collectionsWithCovers = collectionsToDisplay.map((collection) => {
        let itemsInCollection = [];
        if (collection.id === 'all') {
          itemsInCollection = loggedInUser.saved_events || [];
        } else if (collection.items) {
          itemsInCollection = collection.items.map((item) => item.id);
        } else if (savedPostsMap[collection.id]) {
          itemsInCollection = savedPostsMap[collection.id];
        }

        return {
          ...collection,
          cover_image: getCollectionCoverImage(collection, savedPostsMap, fetchedEvents),
          items: itemsInCollection.map((id) => ({ id }))
        };
      });

      const sortedCollections = collectionsWithCovers.sort((a, b) => {
        if (a.id === 'all') return -1;
        if (b.id === 'all') return 1;
        return new Date(b.created_at).getTime() - new Date(b.created_at).getTime();
      });

      setSavedCollections(sortedCollections);

    } catch (error) {
      console.error('Error loading data for planner:', error);
      setFeedError("Failed to load your planner. Please try again.");
      setEvents([]);
      setAttendanceRecords([]);
      setSavedCollections([]);
      setIsLoggedOut(true); // Treat as logged out if API calls fail critically
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndEvents();

    // Listen for follow status changes
    const handleFollowChange = (event) => {
      const { curatorEmail, isFollowing } = event.detail;

      setCurrentUser((prevUser) => {
        if (!prevUser) return null;

        const followedIds = new Set(prevUser.followed_curator_ids || []);
        if (isFollowing) {
          followedIds.add(curatorEmail);
        } else {
          followedIds.delete(curatorEmail);
        }

        const updatedUser = { ...prevUser, followed_curator_ids: Array.from(followedIds) };
        apiCache.invalidate('currentUser');
        return updatedUser;
      });
      // A small delay and then reload events to reflect changes in feed filters
      setTimeout(() => loadUserAndEvents(), 500);
    };

    window.addEventListener('followStatusChanged', handleFollowChange);

    return () => {
      window.removeEventListener('followStatusChanged', handleFollowChange);
    };
  }, [loadUserAndEvents]);


  // Helper function to get combined event info including attendance status
  const getEventWithStatus = useCallback((event) => {
    const userAttendance = attendanceRecords.find(att => att.event_id === event.id && att.user_email === currentUser?.email);
    const now = new Date();
    const eventDate = new Date(event.date);
    const isPastEvent = eventDate < now;

    let rsvp_status = 'no_rsvp';
    let attendance_status = null;
    let attendance_id = null;

    if (userAttendance) {
      rsvp_status = userAttendance.status;
      attendance_status = userAttendance.status;
      attendance_id = userAttendance.id;
    } else if (isPastEvent && currentUser?.attended_events?.includes(event.id)) {
      rsvp_status = 'past';
      attendance_status = 'attended';
    } else if (isPastEvent) {
      rsvp_status = 'past';
      attendance_status = 'not_attended';
    }


    return {
      ...event,
      rsvp_status,
      attendance_status,
      attendance_id,
      attended: currentUser?.attended_events?.includes(event.id)
    };
  }, [attendanceRecords, currentUser]);

  // Unified filtering logic for both tabs
  const filteredEvents = useMemo(() => {
    let filtered = events.map(getEventWithStatus);

    // 1. Apply general search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm) ||
          event.organizer_name?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm) ||
          event.venue_name?.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          (event.scene_tags && Array.isArray(event.scene_tags) &&
            event.scene_tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // 2. Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    // 3. Apply date filter
    if (dateFilter !== "Anytime") {
      filtered = filtered.filter((event) => {
        if (!event.date || !isValid(parseISO(event.date))) return false;
        const eventDate = startOfDay(parseISO(event.date));
        const today = startOfDay(new Date());

        if (dateFilter === "Today") return isSameDay(eventDate, today);
        if (dateFilter === "Tomorrow") return isSameDay(eventDate, addDays(today, 1));
        if (dateFilter === "This Week") {
          const endOfThisWeek = endOfWeek(today, { weekStartsOn: 0 }); // Sunday
          return eventDate >= today && eventDate <= endOfThisWeek;
        }
        if (dateFilter === "This Month") {
          const endOfThisMonth = endOfMonth(today);
          return eventDate >= today && eventDate <= endOfThisMonth;
        }
        return true;
      });
    }

    return filtered;
  }, [events, attendanceRecords, currentUser, searchQuery, categoryFilter, dateFilter, getEventWithStatus]);


  // `filterOptions` for the RSVP sub-filter bar on the Feed tab
  const filterOptions = useMemo(() => {
    const counts = filteredEvents.reduce((acc, event) => {
      acc[event.rsvp_status] = (acc[event.rsvp_status] || 0) + 1;
      return acc;
    }, {});

    const futureEventsCount = filteredEvents.filter(e => new Date(e.date) >= new Date()).length;

    return [
      { value: 'all', label: 'All', count: futureEventsCount },
      { value: 'no_rsvp', label: 'No RSVP', count: counts['no_rsvp'] || 0 },
      { value: 'invited', label: 'Invites', count: counts['invited'] || 0 },
      { value: 'going', label: 'Going', count: counts['going'] || 0 },
      { value: 'maybe', label: 'Maybe', count: counts['maybe'] || 0 },
      { value: 'pending', label: 'Pending', count: counts['pending'] || 0 },
      { value: 'cant_go', label: "Can't Go", count: counts['cant_go'] || 0 },
      { value: 'past', label: 'Past Events', count: counts['past'] || 0 }
    ];
  }, [filteredEvents]);


  const handleRsvpFilterToggle = (key) => {
    setActiveRsvpFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      const isTabLike = key === 'all' || key === 'past';

      if (isTabLike) {
        // If a tab is clicked, it's the only selection
        return new Set([key]);
      } else {
        // It's a multi-select filter
        // First, ensure 'all' and 'past' are deselected if they exist
        newFilters.delete('all');
        newFilters.delete('past');

        // Toggle the clicked filter
        if (newFilters.has(key)) {
          newFilters.delete(key);
        } else {
          newFilters.add(key);
        }

        // If all multi-select filters are deselected, default back to 'all'
        if (newFilters.size === 0) {
          return new Set(['all']);
        }

        return newFilters;
      }
    });
  };

  const handleFeedShowFriends = useCallback((event) => {
    setFriendsGoingData({ friends: event.friends_going || [], eventName: event.title });
    setShowFriendsModal(true);
  }, []);

  // ISSUE 7 FIX: Handle event card clicks to open VibeReel
  const handleEventCardClick = (event, allEvents) => {
    const eventIndex = allEvents.findIndex(e => e.id === event.id);
    setVibeReelItems(allEvents);
    setVibeReelStartIndex(eventIndex !== -1 ? eventIndex : 0);
    setShowVibeReel(true);
  };


  const renderFeed = () => {
    if (!currentUser || isLoggedOut) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-2xl font-semibold mb-2">Sign in to see your feed</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your personalized event feed will appear here once you sign in.
          </p>
          <Button onClick={() => navigate(createPageUrl("Profile"))} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">
            <LogIn className="w-4 h-4 mr-2" /> Sign In
          </Button>
        </motion.div>
      );
    }

    if (isLoading) { // Use isLoading for the main component load, not a separate feedLoading
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      );
    }

    if (feedError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load feed</h2>
          <p className="text-gray-600 mb-4">{feedError}</p>
          <Button onClick={loadUserAndEvents} className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    let eventsToDisplay = filteredEvents;
    const now = new Date();

    // Apply the selected activeRsvpFilters set
    if (activeRsvpFilters.has('all')) {
      eventsToDisplay = eventsToDisplay.filter((e) => new Date(e.date) >= now); // 'all' means future events
    } else if (activeRsvpFilters.has('past')) {
      eventsToDisplay = eventsToDisplay.filter((e) => e.rsvp_status === 'past');
      if (activePastFilter === 'attended') {
        eventsToDisplay = eventsToDisplay.filter((event) => event.attended);
      } else if (activePastFilter === 'not_attended') {
        eventsToDisplay = eventsToDisplay.filter((event) => !event.attended);
      }
    } else {
      // Multi-filter logic
      if (activeRsvpFilters.size > 0) {
        eventsToDisplay = eventsToDisplay.filter((e) => activeRsvpFilters.has(e.rsvp_status));
      } else {
        // Fallback to 'all' if no specific filter is selected (should be prevented by handleRsvpFilterToggle)
        eventsToDisplay = eventsToDisplay.filter((e) => new Date(e.date) >= now);
      }
    }

    // Apply "Events with Mutuals Going" filter
    if (showMutualsOnly && !activeRsvpFilters.has('past') && currentUser) {
      eventsToDisplay = eventsToDisplay.filter((event) =>
        event.friends_going && event.friends_going.length > 0
      );
    }

    // Apply curator follow filter (only show events from followed curators, or all if none are followed)
    const followedEmails = new Set(currentUser?.followed_curator_ids || []);
    if (currentUser && followedEmails.size > 0) {
      eventsToDisplay = eventsToDisplay.filter((event) =>
        event.organizer_email && followedEmails.has(event.organizer_email) ||
        // Always show user's own RSVPs regardless of who they follow
        ['going', 'invited', 'pending', 'maybe', 'cant_go', 'past'].includes(event.rsvp_status)
      );
    }

    eventsToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Store the final list of events for the VibeReel
    finalFeedEventsRef.current = eventsToDisplay;

    const eventsByDay = groupBy(eventsToDisplay, (event) =>
      format(startOfDay(parseISO(event.date)), 'yyyy-MM-dd')
    );

    const formatFeedDateHeader = (dateStr) => {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, 'MMMM d');
    };

    const handleFriendsUpdate = () => {
      loadUserAndEvents(); // Reload all user data and events to ensure counts are updated
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        <div className="mb-6">
          <div className="flex items-center">
            <div className="w-full md:w-auto mx-auto bg-gray-100 rounded-full p-1 flex items-center justify-start md:justify-center">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {filterOptions.map((tab) => {
                  const isTabLike = tab.value === 'all' || tab.value === 'past';
                  const isActive = activeRsvpFilters.has(tab.value);

                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleRsvpFilterToggle(tab.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${isTabLike ?
                        isActive ?
                          'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                        isActive ?
                          'bg-gray-100 text-blue-600' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      disabled={isLoggedOut}>

                      <span className="flex items-center justify-center gap-2">
                        {!isTabLike &&
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isActive ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                            {isActive && <Check className="w-3 h-3 text-white" />}
                          </div>
                        }
                        {tab.label} {tab.count > 0 && `(${tab.count})`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {!isLoggedOut && !activeRsvpFilters.has('past') && !(activeRsvpFilters.size === 1 && activeRsvpFilters.has('pending')) &&
            <div className="mt-4 flex items-center justify-center space-x-2">
              <Checkbox
                id="mutuals-going"
                checked={showMutualsOnly}
                onCheckedChange={setShowMutualsOnly}
                className="rounded border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
              <label htmlFor="mutuals-going" className="text-sm font-medium text-gray-700 cursor-pointer">
                Events with Mutuals Going
              </label>
            </div>
          }
        </div>

        {activeRsvpFilters.has('past') &&
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActivePastFilter('all')}
                className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${activePastFilter === 'all' ?
                  'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' :
                  'text-gray-500 hover:bg-gray-200'}`}
                disabled={isLoggedOut}>
                Show All
              </button>
              <button
                onClick={() => setActivePastFilter('attended')}
                className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${activePastFilter === 'attended' ?
                  'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' :
                  'text-gray-500 hover:bg-gray-200'}`}
                disabled={isLoggedOut}>
                Only Attended
              </button>
              <button
                onClick={() => setActivePastFilter('not_attended')}
                className={`px-4 py-1 text-sm font-medium rounded-full transition-colors ${activePastFilter === 'not_attended' ?
                  'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm' :
                  'text-gray-500 hover:bg-gray-200'}`}
                disabled={isLoggedOut}>
                Didn't Go
              </button>
            </div>
          </div>
        }

        {Object.keys(eventsByDay).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12 bg-white border border-gray-200 rounded-2xl mb-12">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-2xl font-semibold mb-2">
              {activeRsvpFilters.has('past') ? 'No past events yet' : 'Welcome to Your Feed!'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {activeRsvpFilters.has('past') ?
                'Your attended and past events will appear here.' :
                isLoggedOut ?
                  'This is a preview of events. Sign in to see your personalized feed.' :
                  'This is where events from curators you follow and your RSVPs will appear.'
              }
            </p>
            {!activeRsvpFilters.has('past') &&
              <Link to={createPageUrl("Explore")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">
                  <Users className="w-4 h-4 mr-2" />
                  Discover Events
                </Button>
              </Link>
            }
          </motion.div>
        ) : (
          <div className="space-y-8 pb-8">
            {Object.keys(eventsByDay).sort().map((dateStr, dayIndex) =>
              <div key={dateStr} className="relative">
                {dayIndex < Object.keys(eventsByDay).length - 1 &&
                  <div className="absolute left-1.5 top-5 bottom-0 w-px bg-gray-200"></div>
                }

                <div className="mb-3 flex items-start gap-4">
                  <div className="bg-sky-500 mt-2 w-3 h-3 rounded-full flex-shrink-0"></div>
                  <div>
                    <h2 className="text-gray-900 text-lg font-bold leading-tight">
                      {formatFeedDateHeader(dateStr)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(dateStr), 'EEEE')}
                    </p>
                  </div>
                </div>

                <div className="ml-4 space-y-2">
                  {(eventsByDay[dateStr] || []).map((event) => {
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-1 relative"
                      >
                        <div className="relative cursor-pointer" onClick={() => handleEventCardClick(event, finalFeedEventsRef.current)}>
                          <FeedEventListItem
                            event={event}
                            isSaved={currentUser?.saved_events?.includes(event.id) || false}
                            onSaveToggle={handleToggleSaveEvent}
                            onShowFriends={handleFeedShowFriends}
                            showFriendsGoing={!activeRsvpFilters.has('past')}
                            isSaving={savingEventId === event.id}
                            isFeedView={true}
                            onStatusChange={event.rsvp_status && event.rsvp_status !== 'past' && !isLoggedOut ? handleChangeStatus : undefined}
                            onCancelRequest={event.rsvp_status === 'pending' && !isLoggedOut ? handleCancelRequest : undefined}
                            showRSVPActions={!!event.rsvp_status && event.rsvp_status !== 'past' && !isLoggedOut}
                            currentAttendanceStatus={event.attendance_status}
                            attendanceId={event.attendance_id}
                            eventPrice={event.price}
                            isProcessingPayment={isProcessingPayment}
                            onViewBlasts={handleViewBlasts}
                            onFriendsUpdate={handleFriendsUpdate}
                            showAttendanceButton={activeRsvpFilters.has('past') && !isLoggedOut}
                            onAttendanceChange={activeRsvpFilters.has('past') && !isLoggedOut ? () => handleToggleAttended(event.id) : undefined}
                            processingAttendance={processingItems[event.id]}
                            isLoggedOut={isLoggedOut}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };


  const renderSaved = () => {
    if (isLoggedOut) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="text-2xl font-semibold mb-2">Sign in to save events</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your saved events and collections will appear here once you sign in.
          </p>
          <Button onClick={() => navigate(createPageUrl("Profile"))} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">
            <LogIn className="w-4 h-4 mr-2" /> Sign In
          </Button>
        </motion.div>
      );
    }

    const savedEvents = filteredEvents.filter(event => currentUser?.saved_events?.includes(event.id));

    finalSavedEventsRef.current = savedEvents.slice(0, showAllSaved ? undefined : 2);


    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>

        {/* Events Section First */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Events
            </h3>
            <Link to={createPageUrl("Explore")}>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 hover:from-cyan-600 hover:to-blue-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover More
              </Button>
            </Link>
          </div>

          {savedEvents.length === 0 ?
            <div className="text-center py-8 bg-white border border-gray-200 rounded-2xl">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No saved events yet</h4>
              <p className="text-gray-500 mb-4">Start exploring to save events you're interested in</p>
              <Link to={createPageUrl("Feed")}>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">
                  Find Events
                </Button>
              </Link>
            </div> :

            <div className="space-y-4">
              {savedEvents.
                slice(0, showAllSaved ? undefined : 2).
                map((event) => {
                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventCardClick(event, finalSavedEventsRef.current)}
                      className="cursor-pointer"
                    >
                      <FeedEventListItem
                        event={event}
                        isSaved={true}
                        onSaveToggle={handleToggleSaveEvent}
                        isSaving={savingEventId === event.id}
                        onMarkGoingFromSaved={event.price && event.price > 0 && !isLoggedOut ? handleMarkGoingFromSaved : null}
                        isFeedView={false}
                        isLoggedOut={isLoggedOut}
                      />
                    </div>
                  );
                })}

              {savedEvents.length > 2 &&
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllSaved(!showAllSaved)}
                    className="text-blue-600 px-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-6 hover:text-blue-700 hover:bg-blue-50">
                    {showAllSaved ?
                      `Show fewer saved events` :
                      `View all ${savedEvents.length} saved events`
                    }
                  </Button>
                </div>
              }
            </div>
          }
        </div>

        {/* Collections Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Collections
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 hover:from-cyan-600 hover:to-blue-700"
              onClick={() => setIsCreateModal(true)}
              disabled={isLoggedOut}>

              <Plus className="w-4 h-4 mr-2" />
              Add Collection
            </Button>
          </div>

          {savedCollections.length > 0 ?
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedCollections.map((collection) =>
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative">

                  <Link to={createPageUrl(`Collection?id=${collection.id}`)}>
                    <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden group relative">
                      <img
                        src={collection.cover_image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="mt-2 px-1">
                      <h4 className="font-bold text-gray-900 break-words text-sm md:text-base leading-tight">{collection.name}</h4>
                      <p className="text-xs md:text-sm text-gray-500">{collection.items?.length || 0} items</p>
                    </div>
                  </Link>
                  {collection.id !== 'all' && !isLoggedOut &&
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                          Delete Collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                </motion.div>
              )}
            </div> :

            <div className="text-center py-8 bg-white border border-gray-200 rounded-2xl">
              <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No collections yet</h4>
              <p className="text-gray-500 mb-4">Start creating collections to organize your saved content</p>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium"
                onClick={() => {
                  setIsCreateModal(true);
                }}
                disabled={isLoggedOut}>

                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </div>
          }
        </div>

        {savedEvents.length === 0 && savedCollections.length === 0 &&
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl mt-8">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nothing saved yet</h3>
            <p className="text-gray-500 mb-4">Start exploring to save events and create collections</p>
            <Link to={createPageUrl("Feed")}>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">
                Discover Events
              </Button>
            </Link>
          </div>
        }
      </motion.div>
    );
  };

  const handleToggleSaveEvent = async (eventId) => {
    const now = Date.now();
    if (!currentUser || savingEventId || now - lastActionTime < 500) {
      return;
    }

    setSavingEventId(eventId);
    setLastActionTime(now);

    const currentSavedSet = new Set(Array.isArray(currentUser.saved_events) ? currentUser.saved_events : []);
    const isCurrentlySaved = currentSavedSet.has(eventId);

    // --- Optimistic UI Update ---
    if (isCurrentlySaved) {
      currentSavedSet.delete(eventId);
    } else {
      currentSavedSet.add(eventId);
    }
    setCurrentUser((prev) => ({ ...prev, saved_events: Array.from(currentSavedSet) }));
    // --- End Optimistic UI Update ---

    try {
      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      if (isAdmin) {
        await base44.auth.updateMe({ saved_events: Array.from(currentSavedSet) });
      } else if (isDemo) {
        await simulatedDataManager.updateSimulatedUser({ saved_events: Array.from(currentSavedSet) });
      } else {
        await base44.auth.updateMe({ saved_events: Array.from(currentSavedSet) });
      }
      console.log(`Successfully ${isCurrentlySaved ? 'removed from' : 'added to'} saved events:`, eventId);
      apiCache.invalidate('currentUser');
      // No need to invalidate 'allEvents' for a user's saved status, but a reload of user events might be good.
      // loadUserAndEvents(); // Potentially too aggressive for every save toggle
    } catch (error) {
      console.error("Error toggling save event:", error);
      // Revert optimistic update on error
      setCurrentUser((prev) => ({ ...prev, saved_events: Array.from(isCurrentlySaved ? (currentSavedSet.add(eventId), currentSavedSet) : (currentSavedSet.delete(eventId), currentSavedSet)) }));
      alert("Failed to update saved events. Please try again.");
    } finally {
      setSavingEventId(null);
    }
  };


  const handleChangeStatus = async (eventId, newStatus, attendanceId, eventPrice = 0) => {
    const now = Date.now();
    if (!currentUser || isProcessingPayment || requestInProgress || now - lastActionTime < 1500) {
      if (now - lastActionTime < 1500) {
        // Debounce / rate limit message if needed
      }
      return;
    }
    setLastActionTime(now);

    if (newStatus === 'going' && eventPrice > 0) {
      setIsProcessingPayment(true);
      console.log(`Simulating payment for event ${eventId} with price $${eventPrice}`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Payment successful!");
      setIsProcessingPayment(false);
      alert(`Successfully purchased ticket for $${eventPrice}. You are now going!`);
    }

    setRequestInProgress(true);

    try {
      if (attendanceId) {
        if (newStatus === null) {
          await base44.entities.EventAttendance.delete(attendanceId);
        } else {
          await base44.entities.EventAttendance.update(attendanceId, { status: newStatus });
        }
      } else if (newStatus !== null) {
        const eventToUpdate = events.find((e) => e.id === eventId);
        if (!eventToUpdate) {
          console.error("Event not found for status change:", eventId);
          throw new Error("Event details not found. Cannot create attendance.");
        }
        await base44.entities.EventAttendance.create({
          event_id: eventId,
          user_email: currentUser.email,
          user_name: currentUser.full_name,
          user_avatar: currentUser.avatar,
          status: newStatus,
          message: newStatus === 'pending' ? 'Looking forward to this exclusive event!' : undefined,
          user_instagram: newStatus === 'pending' ? '@' + currentUser.email.split('@')[0] : undefined
        });
      }

      apiCache.invalidate('allEvents');
      apiCache.invalidate('currentUser');
      loadUserAndEvents(); // Reload all data to reflect changes

    } catch (error) {
      console.error("Error updating status:", error);
      let userErrorMsg = "There was an error updating your status. Please try again.";
      if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        userErrorMsg = "Network connection issue. Please check your internet and try again.";
      }
      alert(userErrorMsg);
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleCancelRequest = async (attendanceId) => {
    const now = Date.now();
    if (!currentUser || requestInProgress || now - lastActionTime < 1500) {
      if (now - lastActionTime < 1500) {
        // Debounce / rate limit message if needed
      }
      return;
    }
    setLastActionTime(now);
    setRequestInProgress(true);

    try {
      await base44.entities.EventAttendance.delete(attendanceId);
      apiCache.invalidate('allEvents');
      apiCache.invalidate('currentUser');
      loadUserAndEvents(); // Reload all data

    } catch (error) {
      console.error("Error cancelling request:", error);
      let userErrorMsg = "Failed to cancel request. Please try again.";
      if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        userErrorMsg = "Network connection issue. Please check your internet and try again.";
      }
      alert(userErrorMsg);
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleDidntGo = async (eventId) => {
    if (!currentUser) return;

    setProcessingItems((prev) => ({ ...prev, [eventId]: true }));

    try {
      // Optimistic UI update: Mark as not attended in local state, but don't remove from pastEvents
      setCurrentUser((prev) => ({
        ...prev,
        attended_events: prev.attended_events?.filter(id => id !== eventId)
      }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, attended: false } : event
        )
      );

      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      // Remove event from user's attended_events list
      const attendedEvents = new Set(Array.isArray(currentUser.attended_events) ? currentUser.attended_events : []);
      attendedEvents.delete(eventId);

      if (isAdmin) {
        await base44.auth.updateMe({ attended_events: Array.from(attendedEvents) });
      } else if (isDemo) {
        await simulatedDataManager.updateSimulatedUser({ attended_events: Array.from(attendedEvents) });
      } else {
        await base44.auth.updateMe({ attended_events: Array.from(attendedEvents) });
      }
      apiCache.invalidate('currentUser'); // Invalidate currentUser cache

      // Handle attendance records (for private events specifically)
      const event = events.find((e) => e.id === eventId);
      if (event && event.privacy_level === 'private') {
        try {
          const attendance = attendanceRecords.find(att => att.event_id === event.id && att.user_email === currentUser.email);

          if (attendance) {
            await base44.entities.EventAttendance.update(attendance.id, {
              permanently_opted_out: true,
              status: 'cant_go'
            });
          } else {
            await base44.entities.EventAttendance.create({
              event_id: event.id,
              user_email: currentUser.email,
              user_name: currentUser.full_name,
              user_avatar: currentUser.avatar,
              status: 'cant_go',
              permanently_opted_out: true
            });
          }
          apiCache.invalidate('allEvents');
          apiCache.invalidate('currentUser');
        } catch (attendanceError) {
          console.warn("Error updating attendance record for private event:", attendanceError);
        }
      }

      // Remove any existing review for the event
      try {
        const existingReviews = await base44.entities.EventReview.filter({
          event_id: eventId,
          user_email: currentUser.email
        }).catch((err) => {
          console.warn("Failed to load existing reviews for deletion:", err);
          return [];
        });

        if (existingReviews.length > 0) {
          for (const review of existingReviews) {
            await base44.entities.EventReview.delete(review.id).catch((err) =>
              console.warn(`Failed to delete review ${review.id}:`, err)
            );
          }
          console.log(`Attempted to remove ${existingReviews.length} review(s) for event ${eventId} by user ${currentUser.email}`);
        }
      } catch (reviewError) {
        console.warn("Error handling review removal process:", reviewError);
      }

      console.log(`Marked event ${eventId} as not attended (robust sync completed)`);
      loadUserAndEvents(); // Full reload to ensure state consistency

    } catch (error) {
      console.error('Error updating attendance:', error);
      // Revert the optimistic UI update on error
      setCurrentUser((prev) => ({
        ...prev,
        attended_events: [...(prev.attended_events || []), eventId]
      }));
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, attended: true } : event
        )
      );
      let userErrorMsg = "Failed to update attended status. Please try again.";
      if (error.message?.includes('Network') || error.code === "NETWORK_ERROR" || error.message?.includes('Failed to fetch')) {
        userErrorMsg = "Network connection issue. Please check your internet and try again.";
      }
      alert(userErrorMsg);
    } finally {
      setProcessingItems((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const updateAttendedStatus = async (eventId, wasAttended) => {
    if (!currentUser) return;

    if (wasAttended) {
      await handleDidntGo(eventId);
    } else {
      setProcessingItems((prev) => ({ ...prev, [eventId]: true }));

      const attendedEvents = new Set(Array.isArray(currentUser.attended_events) ? currentUser.attended_events : []);
      attendedEvents.add(eventId);

      setCurrentUser((prev) => ({ ...prev, attended_events: Array.from(attendedEvents) }));
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === eventId ? { ...e, attended: true } : e
        )
      );

      try {
        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        if (isAdmin) {
          await base44.auth.updateMe({ attended_events: Array.from(attendedEvents) });
        } else if (isDemo) {
          await simulatedDataManager.updateSimulatedUser({ attended_events: Array.from(attendedEvents) });
        } else {
          await base44.auth.updateMe({ attended_events: Array.from(attendedEvents) });
        }
        apiCache.invalidate('currentUser'); // Invalidate currentUser cache
        console.log("Attendance status updated successfully (Marked as Went)");

        // Show review dialog
        const event = events.find((e) => e.id === eventId);
        if (event) {
          const existingReviews = await base44.entities.EventReview.filter({
            event_id: event.id,
            user_email: currentUser.email
          });

          if (existingReviews.length === 0) {
            setReviewingEvent(event);
            setReviewForm({
              rating: 5,
              review_text: "",
              liked: true,
              vibe_tags: "",
              would_recommend: true
            });
            setReviewDialogOpen(true);
          } else {
            console.log("Review already exists for this event, skipping review dialog.");
          }
        }
        loadUserAndEvents(); // Full reload to ensure state consistency
      } catch (error) {
        console.error("Failed to update attended status (Marked as Went):", error);
        setCurrentUser((prev) => ({
          ...prev,
          attended_events: prev.attended_events?.filter(id => id !== eventId)
        }));
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === eventId ? { ...e, attended: false } : e
          )
        );

        let userErrorMsg = "Network connection issue. Please check your internet and try again.";
        if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          userErrorMsg = "Network connection issue. Please check your internet and try again.";
        }
        alert(userErrorMsg);
      } finally {
        setProcessingItems((prev) => ({ ...prev, [eventId]: false }));
      }
    }
  };

  const handleToggleAttended = async (eventId) => {
    if (!currentUser) return;

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const wasAttended = currentUser?.attended_events?.includes(eventId);

    if (event.privacy_level === 'private' && wasAttended === true) {
      setEventToProcess({ eventId, wasAttended });
      setConfirmDialogOpen(true);
      return;
    }

    await updateAttendedStatus(eventId, wasAttended);
  };

  const handleConfirmAttendanceChange = async () => {
    if (!eventToProcess) return;

    await updateAttendedStatus(eventToProcess.eventId, eventToProcess.wasAttended);
    setConfirmDialogOpen(false);
    setEventToProcess(null);
  };

  const handleSubmitReview = async () => {
    if (!reviewingEvent || !currentUser) return;

    setIsSubmittingReview(true);
    try {
      const vibeTagsArray = reviewForm.vibe_tags ?
        reviewForm.vibe_tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) :
        [];

      await base44.entities.EventReview.create({
        event_id: reviewingEvent.id,
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

      setReviewDialogOpen(false);
      setReviewingEvent(null);
      loadUserAndEvents(); // Reload events to update review status if displayed
    } catch (error) {
      console.error("Error submitting review:", error);
      let userErrorMsg = "Failed to submit review. Please try again.";
      if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        userErrorMsg = "Network connection issue. Please check your internet and try again.";
      }
      alert(userErrorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMarkGoingFromSaved = async (eventId, price) => {
    const now = Date.now();
    if (!currentUser || isProcessingPayment || requestInProgress || now - lastActionTime < 1500) {
      if (now - lastActionTime < 1500) {
        // Debounce / rate limit message
      }
      return;
    }
    setLastActionTime(now);
    setRequestInProgress(true);
    try {
      const newSaved = new Set(Array.isArray(currentUser.saved_events) ? currentUser.saved_events : []);
      newSaved.delete(eventId);

      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      if (isAdmin) {
        await base44.auth.updateMe({ saved_events: Array.from(newSaved) });
      } else if (isDemo) {
        await simulatedDataManager.updateSimulatedUser({ saved_events: Array.from(newSaved) });
      } else {
        await base44.auth.updateMe({ saved_events: Array.from(newSaved) });
      }
      setCurrentUser((prev) => ({ ...prev, saved_events: Array.from(newSaved) }));
      apiCache.invalidate('currentUser');


      if (price > 0) {
        setIsProcessingPayment(true);
        console.log(`Simulating payment for event ${eventId} with price $${price}`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Payment successful!");
        setIsProcessingPayment(false);
        alert(`Successfully purchased ticket for $${price}. You are now going!`);
      }

      await base44.entities.EventAttendance.create({
        event_id: eventId,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        user_avatar: currentUser.avatar,
        status: 'going'
      });
      apiCache.invalidate('allEvents');
      apiCache.invalidate('currentUser');
      loadUserAndEvents(); // Reload all data to reflect changes

    } catch (error) {
      console.error("Error marking saved event as going:", error);
      let userErrorMsg = "Failed to update event status. Please try again.";
      if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
        userErrorMsg = "Network connection issue. Please check your internet and try again.";
      }
      alert(userErrorMsg);
    } finally {
      setRequestInProgress(false);
    }
  };


  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || requestInProgress) return;

    setRequestInProgress(true);
    try {
      const newCollection = {
        id: `collection-${Date.now()}-${currentUser.email}`,
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        items: [],
        created_at: new Date().toISOString()
      };

      // Optimistic UI update
      setSavedCollections((prev) => [newCollection, ...prev]);

      // Update currentUser state. For persistence, this would ideally also update the backend.
      setCurrentUser((prevUser) => {
        const updatedCollections = [...(prevUser.collections || []), newCollection];
        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        if (authBypassed && (isAdmin || isDemo)) {
          simulatedDataManager.updateSimulatedUser({ collections: updatedCollections });
        } else {
          // If a real API call is needed for collections:
          // base44.auth.updateMe({ collections: updatedCollections });
          // For now, collections are treated as largely client-side/seeded in this demo's context
          // so no explicit base44.auth.updateMe call here to match existing behavior.
        }
        return { ...prevUser, collections: updatedCollections };
      });
      apiCache.invalidate('currentUser');

      console.log("Created collection:", newCollection);

      setNewCollectionName("");
      setNewCollectionDescription("");
      setIsCreateModal(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleDeleteCollection = (collectionId) => {
    setCollectionToDelete(collectionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete || requestInProgress) return;

    setRequestInProgress(true);
    try {
      setSavedCollections((prev) => prev.filter((c) => c.id !== collectionToDelete));

      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';
      
      setCurrentUser((prevUser) => {
        const updatedCollections = (prevUser.collections || []).filter((c) => c.id !== collectionToDelete);
        return { ...prevUser, collections: updatedCollections };
      });

      const updatedCollections = (currentUser.collections || []).filter((c) => c.id !== collectionToDelete);
      if (isAdmin) {
        await base44.auth.updateMe({ collections: updatedCollections });
      } else if (isDemo) {
        await simulatedDataManager.updateSimulatedUser({ collections: updatedCollections });
      } else {
        await base44.auth.updateMe({ collections: updatedCollections });
      }
      apiCache.invalidate('currentUser');

      console.log("Deleted collection:", collectionToDelete);

      setShowDeleteConfirm(false);
      setCollectionToDelete(null);
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection. Please try again.");
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleViewBlasts = useCallback((event) => {
    console.log("Viewing blasts for event:", event.title);
    setShowBlastsDialog(true);
    setSelectedEventBlasts([
      { id: 'blast1', message: `Quick update: The ${event.title} venue has changed to 'The New Spot' due to unforeseen circumstances!'`, sent_by: event.organizer_name || 'Organizer', sent_at: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString() },
      { id: 'blast2', message: `Reminder for ${event.title}: Doors open at 7 PM! Arrive early to grab the best spot.`, sent_by: event.organizer_name || 'Organizer', sent_at: new Date(new Date().setHours(new Date().getHours() - 10)).toISOString() }
    ]);
  }, []);


  return (
    <> {/* Wrap the entire component in a fragment */}
      <div className="bg-gray-50 text-gray-900 pt-4 pb-24 min-h-screen md:pb-8 md:pt-0 overflow-x-hidden">
        <div className="mt-6 mb-1 px-4 py-8 max-w-4xl sm:px-6 lg:px-8 md:pt-16">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 relative">

            <h1 className="text-3xl font-semibold md:text-4xl gradient-text" style={{ marginBottom: '1px' }}>
              Planner
            </h1>

            <Link
              to={createPageUrl("MyTickets")}
              className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="My Tickets">

              <TicketIcon className="w-6 h-6" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 md:mb-6">

            <div className="max-w-4xl mx-auto">
              <div className="flex flex-row items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoggedOut || isLoading}
                    className="flex h-8 border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-full" />
                </div>

                <div className="w-auto">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoggedOut || isLoading}>
                    <SelectTrigger
                      className="border hover:bg-accent hover:text-accent-foreground bg-white text-left px-3 py-2 text-sm font-normal inline-flex items-center gap-0 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-32 border-gray-300 justify-between rounded-full">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-auto">
                  <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="inline-flex items-center justify-center gap-0 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-8 w-32 border-gray-300 justify-between rounded-full"
                        disabled={isLoggedOut || isLoading}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {dateFilter === 'Anytime' ? 'Anytime' :
                          dateFilter === 'Today' ? 'Today' :
                            dateFilter === 'Tomorrow' ? 'Tomorrow' :
                              dateFilter === 'This Week' ? 'This Week' :
                                dateFilter === 'Next Weekend' ? 'Next Weekend' :
                                  dateFilter === 'This Month' ? 'This Month' :
                                    dateFilter}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-white border-gray-200 text-gray-900">
                      <div className="space-y-1">
                        {['Anytime', 'Today', 'Tomorrow', 'This Week', 'This Month'].map((option) =>
                          <button
                            key={option}
                            onClick={() => {
                              setDateFilter(option);
                              setIsDatePopover(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                            disabled={isLoggedOut}>
                            {option}
                          </button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mb-6 border-b border-gray-200">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab('feed')}
                className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeTab === 'feed' ?
                  'text-blue-600' :
                  'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`
                }>
                Feed
                {activeTab === 'feed' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${activeTab === 'saved' ?
                  'text-blue-600' :
                  'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`
                }>
                Saved
                {activeTab === 'saved' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {renderFeed()}
                </motion.div>
              )}
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {renderSaved()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <FriendsGoingModal
            isOpen={showFriendsModal}
            onClose={() => setShowFriendsModal(false)}
            friends={friendsGoingData.friends}
            eventName={friendsGoingData.eventName}
            currentUser={currentUser}
            onFriendsUpdate={loadUserAndEvents} />


          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Collection?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to delete this collection?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmDeleteCollection} className="bg-red-600 hover:bg-red-700 text-white" disabled={isLoggedOut}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>


          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription className="py-2">
                  You are about to mark that you didn't attend a private event. For your privacy and security, this action is permanent and you will not be able to mark your attendance again for this event.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="bg-background mt-2 pt-2 pr-4 pb-2 pl-4 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10">Cancel</Button>
                <Button onClick={handleConfirmAttendanceChange} className="bg-red-600 hover:bg-red-700 text-white" disabled={isLoggedOut}>
                  Yes, change to "Didn't Go"
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showBlastsDialog} onOpenChange={setShowBlastsDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Event Updates
                </DialogTitle>
                <DialogDescription>
                  Messages from the event organizer
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedEventBlasts.length > 0 ?
                  selectedEventBlasts.map((blast) =>
                    <div key={blast.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 mb-2 break-words leading-relaxed">
                            {blast.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="font-medium">{blast.sent_by}</span>
                            <span>
                              {format(parseISO(blast.sent_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) :

                  <div className="text-center py-8 text-gray-500">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No updates yet</p>
                    <p className="text-sm">Event updates will appear here</p>
                  </div>
                }
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBlastsDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>How was {reviewingEvent?.title}?</DialogTitle>
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
                        className="focus:outline-none"
                        disabled={isLoggedOut}>
                        <Star
                          className={`w-6 h-6 transition-colors ${star <= reviewForm.rating ?
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
                    <button
                      onClick={() => setReviewForm((prev) => ({ ...prev, liked: true }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${reviewForm.liked ?
                        "bg-green-100 border-green-300 text-green-800" :
                        "bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-50"}`
                      }
                      disabled={isLoggedOut}>
                      👍 Loved it
                    </button>
                    <button
                      onClick={() => setReviewForm((prev) => ({ ...prev, liked: false }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${!reviewForm.liked ?
                        "bg-red-100 border-red-300 text-red-800" :
                        "bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-50"}`
                      }
                      disabled={isLoggedOut}>
                      👎 Not my vibe
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tell us more (optional)</label>
                  <Textarea
                    placeholder="What did you love or what could be improved?"
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, review_text: e.target.value }))}
                    className="resize-none"
                    rows={3}
                    disabled={isLoggedOut} />

                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vibe tags (optional)</label>
                  <Input
                    placeholder="e.g. energetic, crowded, great music (separate with commas)"
                    value={reviewForm.vibe_tags}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, vibe_tags: e.target.value }))}
                    disabled={isLoggedOut} />

                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="recommend"
                    checked={reviewForm.would_recommend}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, would_recommend: e.target.checked }))}
                    className="rounded"
                    disabled={isLoggedOut} />

                  <label htmlFor="recommend" className="text-sm font-medium">
                    I would recommend this event to friends
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="bg-background mt-2 pt-2 pr-4 pb-2 pl-4 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10"
                  disabled={isLoggedOut}>
                  Skip Review
                </Button>
                <Button onClick={handleSubmitReview} disabled={isSubmittingReview || isLoggedOut}>
                  {isSubmittingReview ?
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </> :

                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModal} onOpenChange={setIsCreateModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>
                  Give your new collection a name. You can add posts to it later.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <Input
                  placeholder="e.g., Weekend Trips, Best Eats"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  autoFocus
                  disabled={isLoggedOut} />

                <Input
                  placeholder="Description (optional)"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  disabled={isLoggedOut} />

              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModal(false)} className="bg-background mt-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10"
                  disabled={isLoggedOut}>Cancel</Button>
                <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || requestInProgress || isLoggedOut} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {requestInProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ISSUE 7 FIX: Vibe Reel Modal */}
      {showVibeReel && (
        <EventReelModal
          events={vibeReelItems}
          startIndex={vibeReelStartIndex}
          isOpen={showVibeReel}
          onClose={() => setShowVibeReel(false)}
          currentUser={currentUser}
        />
      )}
    </> // End of fragment
  );
}