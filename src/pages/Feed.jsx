import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from '@/api/base44Client';
import PoppinEventCard from "../components/feed/PoppinEventCard";
import LocationFilter from "../components/feed/LocationFilter";
import GenreFilter from "../components/feed/GenreFilter";
import DateFilter from "../components/feed/DateFilter";
import { Loader, Filter, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { apiCache } from "../components/apiCache";
import { Button } from "@/components/ui/button";
import FriendsGoingModal from "../components/event/FriendsGoingModal";
import SaveCollectionsBottomSheet from "../components/collections/SaveCollectionsBottomSheet";
import { motion } from 'framer-motion';
import LoginPromptDialog from "../components/shared/LoginPromptDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { simulatedDataManager } from '@/components/simulatedDataManager';

const shouldSkipSeeding = (seedKey, hoursToWait = 1) => {
  const lastSeedTime = sessionStorage.getItem(`last_seed_time_${seedKey}`);
  if (lastSeedTime) {
    const timeSinceLastSeed = Date.now() - parseInt(lastSeedTime);
    const hoursInMs = hoursToWait * 60 * 60 * 1000;
    if (timeSinceLastSeed < hoursInMs) {
      console.log(`⏭️ Skipping ${seedKey} seed - completed ${Math.round(timeSinceLastSeed / 60000)} minutes ago`);
      return true;
    }
  }
  return false;
};

const markSeedingComplete = (seedKey) => {
  sessionStorage.setItem(`last_seed_time_${seedKey}`, Date.now().toString());
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const seedOneSocialEvents = async () => {
  try {
    if (shouldSkipSeeding('onesocial', 2)) return;

    const onesocialSeedEvents = [
      {
        title: "Underground Art Gallery Opening",
        description: "Step into the unknown at this exclusive underground art showcase. Featured artists from around the world will unveil their latest works in an intimate warehouse setting.",
        cover_image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1501426026826-31c667b2d6b4?w=800&h=600&fit=crop"
        ],
        date: "2027-08-12T19:00:00.000Z",
        location: "Brooklyn, NY",
        venue_name: "The Underground Gallery",
        latitude: 40.6782,
        longitude: -73.9442,
        category: "art",
        price: 15,
        source_url: "https://www.example.com/tickets",
        age_requirement: "21+",
        scene_tags: ["underground", "warehouse", "dancing", "nightlife"],
        organizer_name: "ArtHaus Collective",
        organizer_email: "arthaus@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'onesocial-seed',
        friends_going: [
          { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop" },
          { name: "Marcus T.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
          { name: "Jamie L.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop" }
        ]
      },
      {
        title: "Thursday Dating Night: Singles Mixer",
        description: "Skip the apps and meet in real life! Join us for drinks, games, and authentic connections with other quality singles in the city.",
        cover_image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
        ],
        date: "2027-08-28T18:00:00.000Z",
        location: "London, UK",
        venue_name: "The Social Club",
        latitude: 51.5074,
        longitude: -0.1278,
        category: "social",
        price: 25,
        source_url: "https://www.example.com/tickets",
        age_requirement: "21+",
        scene_tags: ["singles", "dating", "social", "fun"],
        organizer_name: "Thursday Dating",
        organizer_email: "thursday@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'onesocial-seed',
        friends_going: [
          { name: "Jake M.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
          { name: "Sophie L.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop" }
        ]
      }
    ];

    console.log(`✨ Creating ${onesocialSeedEvents.length} new onesocial events`);
    await base44.entities.Event.bulkCreate(onesocialSeedEvents);
    markSeedingComplete('onesocial');
    await delay(3000);

  } catch (error) {
    console.error('Error seeding OneSocial events:', error);
  }
};

const seedReviewsForBusiness = async () => {
  try {
    if (shouldSkipSeeding('reviews', 24)) return;

    const businessReviews = [
      {
        organizerName: "ArtHaus Collective",
        organizerEmail: "arthaus@demo.com",
        reviews: [
          {
            user_email: 'reviewer1@demo.com',
            user_name: 'Sarah M.',
            user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop',
            rating: 5,
            review_text: "Amazing venue and incredible atmosphere! The staff was super friendly and the whole experience was perfect. Can't wait for the next event!",
            liked: true,
            scene_tags: ['artsy', 'great atmosphere'],
            would_recommend: true
          },
          {
            user_email: 'reviewer2@demo.com',
            user_name: 'Marcus T.',
            user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
            rating: 4,
            review_text: "Great concept and execution. The art was thought-provoking and the space was perfect for networking.",
            liked: true,
            scene_tags: ['networking', 'thought-provoking'],
            would_recommend: true
          }
        ]
      }
    ];

    const organizerEmails = businessReviews.map((br) => br.organizerEmail);
    
    await delay(3000);
    
    const allSeedEvents = await base44.entities.Event.filter({ 
      organizer_email: { $in: organizerEmails }, 
      source: { $in: ['onesocial-seed', 'additional-seed', 'vibe-post'] } 
    });
    
    const eventIds = allSeedEvents.map((e) => e.id).filter((id) => id);

    if (eventIds.length === 0) {
      markSeedingComplete('reviews');
      return;
    }

    await delay(3000);

    const chunkSize = 5;
    let allExistingReviews = [];
    
    for (let i = 0; i < eventIds.length; i += chunkSize) {
      const chunk = eventIds.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        try {
          await delay(3000);
          const reviewsInChunk = await base44.entities.EventReview.filter({ event_id: { $in: chunk } });
          allExistingReviews.push(...reviewsInChunk);
        } catch (e) {
          console.error(`Error fetching reviews chunk:`, e);
          await delay(5000);
        }
      }
    }

    const eventsByOrganizerEmail = allSeedEvents.reduce((acc, event) => {
      if (!acc[event.organizer_email]) {
        acc[event.organizer_email] = event;
      }
      return acc;
    }, {});

    const existingReviewsSet = new Set(allExistingReviews.map((r) => `${r.event_id}-${r.user_email}`));

    const reviewsToCreate = [];
    businessReviews.forEach((businessReview) => {
      const event = eventsByOrganizerEmail[businessReview.organizerEmail];
      if (!event) {
        console.warn(`No event found for organizer email: ${businessReview.organizerEmail}`);
        return;
      }

      businessReview.reviews.forEach((reviewData) => {
        const reviewKey = `${event.id}-${reviewData.user_email}`;
        if (!existingReviewsSet.has(reviewKey)) {
          reviewsToCreate.push({
            event_id: event.id,
            ...reviewData,
            organizer_name: businessReview.organizerName
          });
        }
      });
    });

    if (reviewsToCreate.length > 0) {
      console.log(`✨ Creating ${reviewsToCreate.length} new reviews`);
      await delay(3000);
      await base44.entities.EventReview.bulkCreate(reviewsToCreate);
      await delay(3000);
    }
    markSeedingComplete('reviews');
  } catch (error) {
    console.error("Error seeding business reviews:", error);
    markSeedingComplete('reviews');
  }
};

const seedPromotionalEvents = async () => {
  try {
    if (shouldSkipSeeding('promotional', 2)) return;

    const existingPromoEvents = await base44.entities.Event.filter({ source: 'promo-ad', is_promotional: true });
    if (existingPromoEvents.length > 0) {
      console.log('⏭️ Skipping PromotionalEvent seed - already exists');
      markSeedingComplete('promotional');
      return;
    }

    const promoEvents = [
      {
        title: "Rooftop Sunset Yoga",
        description: "Find your zen 20 floors above the city. Join us for a rejuvenating yoga session as the sun sets over the downtown skyline.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop"
        ],
        date: "2027-08-22T18:30:00.000Z",
        location: "Los Angeles, CA",
        venue_name: "Skyline Wellness Center",
        latitude: 34.0522,
        longitude: -118.2437,
        category: "wellness",
        price: 30,
        source_url: "https://www.example.com/tickets",
        age_requirement: "all_ages",
        organizer_name: "Wellness Studio Downtown",
        organizer_email: "wellness@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        is_promotional: true,
        scene_tags: ["peaceful", "rooftop", "sunset", "yoga"],
        privacy_level: "public",
        source: 'promo-ad',
        status: 'active'
      },
      {
        title: "Underground Techno Night",
        description: "Deep house and techno beats until sunrise. This warehouse party will push the boundaries of electronic music.",
        cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop"
        ],
        date: "2027-08-20T23:00:00.000Z",
        location: "Brooklyn, NY",
        venue_name: "Warehouse District",
        latitude: 40.6782,
        longitude: -73.9442,
        category: "nightlife",
        price: 25,
        age_requirement: "21+",
        organizer_name: "Underground Rave",
        organizer_email: "underground@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
        is_promotional: true,
        scene_tags: ["underground", "techno", "warehouse", "late-night"],
        privacy_level: "public",
        source: 'promo-ad',
        status: 'active'
      },
      {
        title: "Artisanal Food Market",
        description: "Discover local flavors and artisanal creations from the city's best food vendors and creators.",
        cover_image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=800&h=600&fit=crop"
        ],
        date: "2027-08-25T10:00:00.000Z",
        location: "Central Park, NYC",
        venue_name: "Great Lawn",
        latitude: 40.7829,
        longitude: -73.9654,
        category: "food",
        price: 0,
        organizer_name: "NYC Food Collective",
        organizer_email: "food@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        is_promotional: true,
        scene_tags: ["artisanal", "local", "outdoor", "family-friendly"],
        privacy_level: "public",
        source: 'promo-ad',
        status: 'active'
      }
    ];

    if (promoEvents.length > 0) {
      console.log(`✨ Seeding ${promoEvents.length} promotional events`);
      await base44.entities.Event.bulkCreate(promoEvents);
      await delay(3000);
    }
    markSeedingComplete('promotional');
  } catch (error) {
    console.error('Error seeding promotional events:', error);
  }
};

const seedNonPromotionalEvents = async () => {
  try {
    if (shouldSkipSeeding('non_promotional', 2)) return;

    const existingNonPromoEvents = await base44.entities.Event.filter({ source: 'manual-seed', is_promotional: false });
    if (existingNonPromoEvents.length > 0) {
      console.log('⏭️ Skipping non-promotional events seed - already exists');
      markSeedingComplete('non_promotional');
      return;
    }

    const nonPromoEvents = [
      {
        title: "Thursday Dating Singles Mixer",
        description: "Meet new people in a relaxed, fun environment. Our weekly singles mixer brings together professionals aged 25-40 for meaningful connections.",
        cover_image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
        ],
        date: "2027-08-28T19:00:00.000Z",
        location: "London, UK",
        venue_name: "The Social Club",
        latitude: 51.5074,
        longitude: -0.1278,
        category: "nightlife",
        price: 15,
        age_requirement: "25+",
        organizer_name: "Thursday Dating",
        organizer_email: "thursday@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        scene_tags: ["social", "dating", "networking", "drinks"],
        privacy_level: "public",
        source: 'manual-seed',
        status: 'active'
      },
      {
        title: "Central Park Picnic Meetup",
        description: "Join us for a relaxing afternoon picnic in one of NYC's most beautiful spots. Bring your favorite dish to share!",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"
        ],
        date: "2027-08-30T14:00:00.000Z",
        location: "Central Park, NYC",
        venue_name: "Great Lawn Area",
        latitude: 40.7829,
        longitude: -73.9654,
        category: "outdoor",
        price: 0,
        organizer_name: "NYC Outdoor Adventures",
        organizer_email: "outdoor@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        scene_tags: ["outdoor", "picnic", "nature", "group"],
        privacy_level: "public",
        source: 'manual-seed',
        status: 'active'
      }
    ];

    if (nonPromoEvents.length > 0) {
      console.log(`✨ Seeding ${nonPromoEvents.length} non-promotional events`);
      await base44.entities.Event.bulkCreate(nonPromoEvents);
      await delay(3000);
    }
    markSeedingComplete('non_promotional');
  } catch (error) {
    console.error('Error seeding non-promotional events:', error);
  }
};

const seedSponsoredPosts = async () => {
  try {
    if (shouldSkipSeeding('sponsored', 2)) return;

    const existingSponsoredPosts = await base44.entities.Event.filter({ source: 'sponsored-seed' });
    if (existingSponsoredPosts.length > 0) {
      console.log('⏭️ Skipping sponsored posts seed - already exists');
      markSeedingComplete('sponsored');
      return;
    }

    const sponsoredPosts = [
      {
        title: "Discover Premium Coffee Blends",
        description: "Experience our artisanal coffee collection from around the world. Use code MORNING20 for 20% off your first order.",
        cover_image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop",
        date: "2027-09-15T10:00:00.000Z",
        location: "Online",
        venue_name: "Blue Bottle Coffee",
        category: "food",
        price: 0,
        scene_tags: ["coffee", "premium", "artisanal"],
        organizer_name: "Blue Bottle Coffee",
        organizer_email: "bluebottle@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'sponsored-seed',
        is_promotional: true,
        source_url: "https://bluebottlecoffee.com"
      },
      {
        title: "Tech Startup Showcase 2027",
        description: "Join us for an exclusive evening showcasing the most innovative startups in AI, blockchain, and sustainable technology. Networking, demos, and investor meetings.",
        cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop",
        date: "2027-09-20T18:00:00.000Z",
        location: "San Francisco, CA",
        venue_name: "Innovation Hub SF",
        latitude: 37.7749,
        longitude: -122.4194,
        category: "tech",
        price: 45,
        scene_tags: ["startup", "innovation", "networking", "AI"],
        organizer_name: "Future Forward Network",
        organizer_email: "future.forward@example.com",
        organizer_avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'sponsored-seed',
        is_promotional: true,
        source_url: "https://techventure.com/showcase"
      },
      {
        title: "Premium Wellness Retreat",
        description: "Discover inner peace at our exclusive mountain retreat. Three days of meditation, yoga, and organic cuisine in a stunning natural setting.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        date: "2027-10-05T09:00:00.000Z",
        location: "Big Sur, CA",
        venue_name: "Serenity Mountain Spa",
        category: "wellness",
        price: 350,
        scene_tags: ["wellness", "meditation", "retreat", "premium"],
        organizer_name: "Serenity Wellness",
        organizer_email: "wellness@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'sponsored-seed',
        is_promotional: true,
        source_url: "https://serenitywellness.com/retreat"
      }
    ];

    if (sponsoredPosts.length > 0) {
      console.log(`✨ Creating ${sponsoredPosts.length} sponsored posts`);
      await base44.entities.Event.bulkCreate(sponsoredPosts);
      await delay(3000);
    }
    markSeedingComplete('sponsored');
  } catch (error) {
    console.error('Error seeding sponsored posts:', error);
  }
};

const seedProfilePastEvents = async () => {
  try {
    if (shouldSkipSeeding('profile_past', 2)) return;

    const existingProfilePastEvents = await base44.entities.Event.filter({ source: 'profile-past-seed' });
    if (existingProfilePastEvents.length > 0) {
      console.log('⏭️ Skipping profile past events seed - already exists');
      markSeedingComplete('profile_past');
      return;
    }

    const pastEvents = [
      {
        title: "Speed Dating Success Stories",
        description: "An intimate evening celebrating the couples who found love at our previous events. Share your story and inspire others!",
        cover_image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=800&fit=crop",
        date: "2024-06-15T19:00:00.000Z",
        location: "London, UK",
        venue_name: "The Romance Lounge",
        latitude: 51.5074,
        longitude: -0.1278,
        category: "social",
        price: 30,
        scene_tags: ["dating", "success", "couples", "celebration"],
        organizer_name: "Thursday Dating",
        organizer_email: "thursday@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'profile-past-seed'
      },
      {
        title: "Mindfulness Retreat Weekend",
        description: "A transformative 3-day retreat focusing on meditation, yoga, and inner peace. Disconnect from the world and reconnect with yourself.",
        cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        date: "2024-05-20T09:00:00.000Z",
        location: "Big Sur, CA",
        venue_name: "Serenity Mountain Retreat",
        latitude: 36.2704,
        longitude: -121.8081,
        category: "wellness",
        price: 250,
        scene_tags: ["meditation", "yoga", "retreat", "mindfulness"],
        organizer_name: "Wellness Studio Downtown",
        organizer_email: "wellness@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'profile-past-seed'
      },
      {
        title: "Urban Hiking Adventure",
        description: "Explored the hidden trails and secret viewpoints of Central Park. A perfect blend of nature and city exploration.",
        cover_image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=800&fit=crop",
        date: "2024-04-10T08:00:00.000Z",
        location: "New York, NY",
        venue_name: "Central Park",
        latitude: 40.7829,
        longitude: -73.9654,
        category: "outdoor",
        price: 15,
        scene_tags: ["hiking", "urban", "nature", "exploration"],
        organizer_name: "NYC Outdoor Adventures",
        organizer_email: "outdoor@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'profile-past-seed'
      },
      {
        title: "Contemporary Art Workshop",
        description: "A hands-on workshop exploring mixed media techniques with local artists. Participants created their own unique pieces to take home.",
        cover_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        date: "2024-03-25T14:00:00.000Z",
        location: "Brooklyn, NY",
        venue_name: "ArtHaus Studio",
        latitude: 40.6782,
        longitude: -73.9442,
        category: "art",
        price: 45,
        scene_tags: ["workshop", "contemporary", "mixed-media", "creative"],
        organizer_name: "ArtHaus Collective",
        organizer_email: "arthaus@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'profile-past-seed'
      }
    ];

    console.log(`✨ Creating ${pastEvents.length} profile past events`);
    await base44.entities.Event.bulkCreate(pastEvents);
    await delay(3000);
    markSeedingComplete('profile_past');

  } catch (error) {
    console.error('Error seeding profile past events:', error);
  }
};

const seedProfileEntries = async () => {
  try {
    if (shouldSkipSeeding('profile_entries', 2)) return;

    const existingProfileEntries = await base44.entities.Event.filter({ source: 'profile-entries-seed' });
    if (existingProfileEntries.length > 0) {
      console.log('⏭️ Skipping profile entries seed - already exists');
      markSeedingComplete('profile_entries');
      return;
    }

    const now = Date.now();
    const profileEntries = [
      {
        title: "Underground warehouse scenes hit different 🔥",
        description: "When the bass drops and the crowd goes wild... this is why we do it! Nothing like dancing until sunrise in Brooklyn's warehouse district.",
        cover_image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=1200&fit=crop",
        source: 'profile-entries-seed',
        organizer_name: "ArtHaus Collective",
        organizer_email: "arthaus@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop",
        location: "Brooklyn, NY",
        timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["underground", "warehouse", "dancing", "nightlife"],
        status: 'active'
      },
      {
        title: "Sound Bath Preparation",
        description: "Setting up for tonight's healing sound bath session. The crystal bowls are tuned and ready to create magic.",
        cover_image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1200&fit=crop",
        source: 'profile-entries-seed',
        organizer_name: "Wellness Studio Downtown",
        organizer_email: "wellness@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        location: "Wellness Studio, LA",
        timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["wellness", "sound bath", "healing", "meditation"],
        status: 'active'
      },
      {
        title: "Coffee shop vibes in Mission District",
        description: "Found this cozy corner cafe with the best matcha latte and perfect lighting for getting work done.",
        cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=1200&fit=crop",
        source: 'profile-entries-seed',
        organizer_name: "Cucina Segreta",
        organizer_email: "food@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop",
        location: "Mission District, SF",
        timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["coffee", "cozy", "work", "vibes"],
        status: 'active'
      },
      {
        title: "Speed Dating Success",
        description: "Another amazing night of connections! So many sparks flying tonight at our weekly event.",
        cover_image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&h=1200&fit=crop",
        date: "2024-06-15T19:00:00.000Z",
        source: 'profile-entries-seed',
        organizer_name: "Thursday Dating",
        organizer_email: "thursday@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop",
        location: "London, UK",
        timestamp: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["dating", "success", "social", "connections"],
        status: 'active'
      },
      {
        title: "NYC Outdoor Adventures Hiking Trail",
        description: "Discovered this hidden trail in Central Park with the most incredible city views. Perfect for morning hikes!",
        cover_image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=1200&fit=crop",
        source: 'profile-entries-seed',
        organizer_name: "NYC Outdoor Adventures",
        organizer_email: "outdoor@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop",
        location: "Central Park, NYC",
        timestamp: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["hiking", "nature", "views", "morning"],
        status: 'active'
      },
      {
        title: "Pre-event setup vibes",
        description: "Getting the venue ready for tonight's singles mixer. The energy is going to be incredible!",
        cover_image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=1200&fit=crop",
        source: 'profile-entries-seed',
        organizer_name: "Thursday Dating",
        organizer_email: "thursday@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop",
        location: "Central London",
        timestamp: new Date(now - 2.5 * 60 * 60 * 1000).toISOString(),
        privacy_level: "public",
        scene_tags: ["setup", "events", "preparation", "energy"],
        status: 'active'
      }
    ];

    if (profileEntries.length > 0) {
      console.log(`✨ Seeding ${profileEntries.length} profile entries`);
      await base44.entities.Event.bulkCreate(profileEntries);
      await delay(3000);
    }
    markSeedingComplete('profile_entries');
  } catch (error) {
    console.error('Error seeding profile entries:', error);
  }
};

const seedMoreEvents = async () => {
  try {
    if (shouldSkipSeeding('additional_events', 2)) return;

    const existingMoreEvents = await base44.entities.Event.filter({ source: 'additional-seed' });
    if (existingMoreEvents.length > 0) {
      console.log('⏭️ Skipping additional event seed - already exists');
      markSeedingComplete('additional_events');
      return;
    }

    const additionalEvents = [
      {
        title: "LA Contemporary Art Showcase",
        description: "Featuring works from 15 emerging artists in downtown LA's newest gallery space. Opening night with wine and live music.",
        cover_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1501426026826-31c667b2d6b4?w=800&h=600&fit=crop"
        ],
        date: "2027-08-18T19:00:00.000Z",
        location: "Downtown LA",
        venue_name: "Gallery Moderne",
        latitude: 34.0522,
        longitude: -118.2437,
        category: "art",
        price: 20,
        source_url: "https://www.example.com/tickets",
        age_requirement: "all_ages",
        scene_tags: ["contemporary", "emerging artists", "wine"],
        organizer_name: "ArtHaus Collective",
        organizer_email: "arthaus@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop",
        privacy_level: "public",
        friends_going: [
          { name: "Alex R.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop" },
          { name: "Sophie M.", avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=50&h=50&fit=crop" }
        ],
        source: 'additional-seed'
      },
      {
        title: "Brooklyn Underground Party",
        description: "Deep house and techno beats in an intimate warehouse setting. Featuring local DJs and surprise guest performers.",
        cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop",
        gallery_images: [
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop"
        ],
        date: "2027-08-25T22:00:00.000Z",
        location: "Brooklyn, NY",
        venue_name: "The Warehouse",
        latitude: 40.6782,
        longitude: -73.9442,
        category: "nightlife",
        price: 35,
        source_url: "https://www.example.com/tickets",
        age_requirement: "21+",
        scene_tags: ["underground", "techno", "warehouse", "late night"],
        organizer_name: "Brooklyn Nightlife",
        organizer_email: "brooklyn.nightlife@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop",
        privacy_level: "semi-public",
        friends_going: [
          { name: "Mike T.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
          { name: "Dana K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=fit=crop" },
          { name: "Jordan P.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop" }
        ],
        source: 'additional-seed'
      },
      {
        title: "Gallery Setup in Progress",
        description: "Transforming this warehouse space into an immersive art experience. The installations are coming together beautifully.",
        cover_image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop",
        date: "2027-07-15T20:00:00.000Z",
        location: "Brooklyn Warehouse, NYC",
        venue_name: "Mercury Lounge",
        latitude: 40.6782,
        longitude: -73.9442,
        category: "art",
        price: 25,
        age_requirement: "21+",
        scene_tags: ["indie", "live music", "bands", "intimate"],
        organizer_name: "ArtHaus Collective",
        organizer_email: "arthaus@demo.com",
        organizer_avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop",
        privacy_level: "public",
        source: 'additional-seed'
      }
    ];

    const eventsToCreate = additionalEvents.filter((eventDef) => {
      return !existingMoreEvents.find((e) => e.title === eventDef.title);
    });

    if (eventsToCreate.length > 0) {
      console.log(`✨ Creating ${eventsToCreate.length} additional events`);
      await base44.entities.Event.bulkCreate(eventsToCreate);
      await delay(3000);
    }
    markSeedingComplete('additional_events');

  } catch (error) {
    console.error('Error seeding additional events:', error);
  }
};

const seedVibePosts = async () => {
  try {
    if (shouldSkipSeeding('vibe_posts', 2)) return;

    const now = Date.now();
    const vibePosts = [
      {
        source: 'vibe-post',
        title: 'Central Park Picnic Meetup',
        description: 'Beautiful day for a spontaneous picnic! Brought sandwiches and good scenes. Come through if you\'re in the area! 🧺☀️',
        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop',
        gallery_images: [
          'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
        ],
        organizer_name: 'NYC Outdoor Adventures',
        organizer_email: 'outdoor@demo.com',
        organizer_avatar: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop',
        location: 'Central Park',
        scene_tags: ['free', 'picnic', 'community', 'acoustic'],
        privacy_level: 'public',
        is_promotional: false,
        category: 'outdoor',
        timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        source: 'vibe-post',
        title: 'Underground warehouse scenes hit different 🔥',
        description: 'When the bass drops and the crowd goes wild... this is why we do it! Nothing like dancing until sunrise in Brooklyn.',
        cover_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
        gallery_images: [
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop'
        ],
        organizer_name: 'ArtHaus Collective',
        organizer_email: 'arthaus@demo.com',
        organizer_avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
        location: 'Brooklyn, NY',
        scene_tags: ['underground', 'warehouse', 'dancing', 'nightlife'],
        privacy_level: 'public',
        is_promotional: false,
        category: 'nightlife',
        timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        source: 'vibe-post',
        title: 'Sunrise yoga sessions are everything ✨',
        description: 'There\'s something magical about greeting the day with intention and movement. Weekly sessions starting this Friday!',
        cover_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
        gallery_images: [
          'https://images.unsplash.com/photo-1506126613408-4e756857542e?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1599901860904-16e6ed5b4a0a?w=800&h=600&fit=crop'
        ],
        organizer_name: 'Wellness Studio Downtown',
        organizer_email: 'wellness@demo.com',
        organizer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        location: 'Los Angeles, CA',
        scene_tags: ['yoga', 'sunrise', 'mindful', 'weekly'],
        privacy_level: 'public',
        is_promotional: false,
        category: 'wellness',
        timestamp: new Date(now - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        source: 'vibe-post',
        title: 'Warehouse party energy is UNREAL 🎧',
        description: 'Last night was pure magic. The underground scene in Brooklyn never disappoints!',
        cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop',
        gallery_images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop'
        ],
        organizer_name: 'Underground Rave',
        organizer_email: 'underground@demo.com',
        organizer_avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop',
        location: 'Brooklyn, NY',
        scene_tags: ['underground', 'techno', 'warehouse', 'nightlife'],
        privacy_level: 'public',
        is_promotional: false,
        category: 'nightlife',
        timestamp: new Date(now - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        source: 'vibe-post',
        title: 'Brooklyn nightlife at its finest 🌃',
        description: 'The energy tonight was insane! Best DJs, best crowd, best vibes. This is what it\'s all about!',
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=800&fit=crop',
        gallery_images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop'
        ],
        organizer_name: 'Brooklyn Nightlife',
        organizer_email: 'brooklyn.nightlife@demo.com',
        organizer_avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop',
        location: 'Brooklyn, NY',
        scene_tags: ['nightlife', 'dj', 'party', 'brooklyn'],
        privacy_level: 'public',
        is_promotional: false,
        category: 'nightlife',
        timestamp: new Date(now - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    console.log(`✨ Creating ${vibePosts.length} new scene posts`);
    await base44.entities.Event.bulkCreate(vibePosts);
    await delay(3000);
    markSeedingComplete('vibe_posts');

  } catch (error) {
    console.error('Error seeding scene posts:', error);
  }
};

const CURATOR_PROFILES = [
  {
    id: 'arthaus',
    name: 'ArtHaus Collective',
    email: 'arthaus@demo.com',
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    followers: 2847
  },
  {
    id: 'thursday',
    name: 'Thursday Dating',
    email: 'thursday@demo.com',
    avatar: 'https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop',
    followers: 1923
  },
  {
    id: 'underground',
    name: 'Underground Rave',
    email: 'underground@demo.com',
    avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop',
    followers: 1654
  },
  {
    id: 'food',
    name: 'Cucina Segreta',
    email: 'food@demo.com',
    avatar: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop',
    followers: 1432
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn Nightlife',
    email: 'brooklyn.nightlife@demo.com',
    avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop',
    followers: 1289
  },
  {
    id: '222events',
    name: '222 Events',
    email: '222events@demo.com',
    avatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop',
    followers: 1156
  },
  {
    id: 'vibemaster',
    name: 'Vibe Master Events',
    email: 'vibemaster@demo.com',
    avatar: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop',
    followers: 1089
  },
  {
    id: 'outdoor',
    name: 'NYC Outdoor Adventures',
    email: 'outdoor@demo.com',
    avatar: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop',
    followers: 987
  },
  {
    id: 'vibes',
    name: 'Wellness Studio Downtown',
    email: 'wellness@demo.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    followers: 843
  },
  {
    id: 'future',
    name: 'Future Forward Network',
    email: 'future.forward@example.com',
    avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop',
    followers: 756
  },
  {
    id: 'bluebottle',
    name: 'Blue Bottle Coffee',
    email: 'bluebottle@demo.com',
    avatar: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=100&h=100&fit=crop',
    followers: 2134
  },
  {
    id: 'napa',
    name: 'Napa Wine Tours',
    email: 'napa@demo.com',
    avatar: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=100&h=100&fit=crop',
    followers: 1678
  }
];

const deduplicateEvents = (items) => {
  const itemMap = new Map();

  items.forEach((item) => {
    if (item.status === 'cancelled' || item.status === 'draft') return;

    const key = `${item.title}-${item.organizer_name}-${item.source}`;

    if (!itemMap.has(key) || (item.source !== 'vibe-post' && itemMap.get(key).source === 'vibe-post')) {
      itemMap.set(key, item);
    }
  });

  return Array.from(itemMap.values());
};

const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) {
    console.warn('shuffleArray received non-array input:', array);
    return [];
  }

  if (array.length === 0) {
    return [];
  }

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const EVENTS_PER_PAGE = 20;

const GroupChatModal = ({ isOpen, onClose, event, currentUser }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Group Chat</DialogTitle>
          <DialogDescription>
            {event ? `Group chat for "${event.title}"` : "You need to be logged in to join group chats."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {currentUser ? (
            event ? (
              <p>Welcome to the chat for {event.title}! (Feature coming soon)</p>
            ) : (
              <p>No event selected for chat.</p>
            )
          ) : (
            <p>Please log in to join group chats.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {currentUser && event && (
            <Button onClick={() => alert("Joining chat...")}>Join Chat</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Feed() {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("Anytime");
  const [selectedTime, setSelectedTime] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forYou');
  const [savedEvents, setSavedEvents] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsGoingData, setFriendsGoingData] = useState({ friends: [], eventName: '' });
  const [showSaveBottomSheet, setShowSaveBottomSheet] = useState(false);
  const [selectedPostForSave, setSelectedPostForSave] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filtersOpacity, setFiltersOpacity] = useState(1);
  const [poppedEvent, setPoppedEvent] = useState(null);
  const [isPopped, setIsPopped] = useState(false);
  const [followedCurators, setFollowedCurators] = useState(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState("continue");
  const [showFilters, setShowFilters] = useState(true);

  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [currentEventForChat, setCurrentEventForChat] = useState(null);

  const scrollContainerRef = useRef(null);
  const containerRef = useRef(null);
  const currentTabRef = useRef(activeTab);

  useEffect(() => {
    currentTabRef.current = activeTab;
  }, [activeTab]);


  const createPageUrl = (pageName) => {
    return `/${pageName}`;
  };

  const loadFeedData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Loading feed data...');
      
      const cacheKey = `feed_events_${currentTabRef.current}`;
      
      if (!forceRefresh && apiCache.has(cacheKey)) {
        console.log('✅ Using cached feed data');
        const cached = apiCache.get(cacheKey);
        setAllEvents(cached);
        setIsLoading(false);
        return;
      }

      Promise.all([
        seedOneSocialEvents(),
        seedReviewsForBusiness(),
        seedPromotionalEvents(),
        seedNonPromotionalEvents(),
        seedSponsoredPosts(),
        seedProfilePastEvents(),
        seedProfileEntries(),
        seedMoreEvents(),
        seedVibePosts()
      ]).catch(err => console.error('Seeding error:', err));

      // CRITICAL FIX: Query all events first
      let loadedEvents = await base44.entities.Event.filter({ status: 'active' }, '-created_date', 1000);
      console.log('📅 Loaded', loadedEvents.length, 'active events');

      let allRawItems = [...loadedEvents];

      let preFilteredItems = allRawItems.filter((e) => {
        if (!e) return false;
        if (e.status === 'cancelled' || e.status === 'draft') return false;

        const organizerEmail = (e.organizer_email || '').toLowerCase().trim();
        const createdBy = (e.created_by || '').toLowerCase().trim();
        const organizerName = (e.organizer_name || '').toLowerCase().trim();

        if (organizerEmail === 'saloni.bhatia@example.com') return false;
        if (createdBy === 'saloni.bhatia@example.com') return false;
        if (organizerName === 'saloni bhatia') return false;

        return true;
      });

      if (currentUser && currentUser.email) {
        const initialCount = preFilteredItems.length;
        preFilteredItems = preFilteredItems.filter(
          (item) => item.organizer_email !== currentUser.email
        );
        if (initialCount - preFilteredItems.length > 0) {
          console.log(`📝 Filtered out ${initialCount - preFilteredItems.length} items created by current user`);
        }
      }

      apiCache.set(cacheKey, preFilteredItems);
      setAllEvents(preFilteredItems);

      if (currentUser?.saved_events) {
        setSavedEvents(new Set(currentUser.saved_events));
      } else {
        setSavedEvents(new Set());
      }

      if (currentUser?.followed_curator_ids) {
        setFollowedCurators(new Set(currentUser.followed_curator_ids));
      } else {
        setFollowedCurators(new Set());
      }

      if (preFilteredItems.length === 0) {
        setError("No events or profiles available at the moment");
      } else {
        setError(null);
      }

    } catch (err) {
      console.error('Error loading feed data:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, currentTabRef]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      let user = null;
      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      if (authBypassed && (isAdmin || isDemo)) {
        const baseUser = simulatedDataManager.getBaseUser();

        if (isAdmin) {
          const adminOverrides = simulatedDataManager.getAdminUserUpdates();
          user = { ...baseUser, ...adminOverrides, _isAdminMode: true };
          console.log('👑 Feed: Admin mode');
        } else {
          user = simulatedDataManager.applyDemoOverrides(baseUser);
          console.log('🎭 Feed: Demo mode with overrides');
        }
      } else {
        try {
          user = await base44.auth.me();
          console.log('✅ Feed: Regular auth');
        } catch (err) {
          console.log('User not authenticated:', err.message);
        }
      }
      setCurrentUser(user);
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser !== undefined) {
      loadFeedData();
    }

    const handleFollowChange = async (event) => {
      const { detail: { curatorEmail, isFollowing } } = event;
      
      console.log('🔄 Feed: Received followStatusChanged event:', { curatorEmail, isFollowing });
      
      // Update current user state immediately
      setCurrentUser((prevUser) => {
        if (!prevUser) return null;

        const followedIds = new Set(prevUser.followed_curator_ids || []);
        if (isFollowing) {
          followedIds.add(curatorEmail);
        } else {
          followedIds.delete(curatorEmail);
        }

        const updated = { ...prevUser, followed_curator_ids: Array.from(followedIds) };
        console.log('✅ Feed: Updated currentUser followed_curator_ids:', updated.followed_curator_ids);
        return updated;
      });
      
      // Invalidate cache and force reload with slight delay
      apiCache.clear();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force refresh from API
      console.log('🔄 Feed: Force reloading data after follow change');
      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';
      
      let refreshedUser = null;
      if (authBypassed && (isAdmin || isDemo)) {
        const baseUser = simulatedDataManager.getBaseUser();
        refreshedUser = isAdmin ? { ...baseUser, _isAdminMode: true } : simulatedDataManager.applyDemoOverrides(baseUser);
      } else {
        try {
          refreshedUser = await base44.auth.me();
        } catch (err) {
          console.error('Failed to refresh user:', err);
        }
      }
      
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
        console.log('✅ Feed: Refreshed user data:', refreshedUser.followed_curator_ids);
      }
      
      loadFeedData(true);
    };

    window.addEventListener('followStatusChanged', handleFollowChange);

    return () => {
      window.removeEventListener('followStatusChanged', handleFollowChange);
    };
  }, [loadFeedData]);

  const filterAndSortEvents = useCallback((itemsToFilter, tab, user) => {
    let globallyFilteredItems = [...(itemsToFilter || [])];

    globallyFilteredItems = globallyFilteredItems.filter((item) => item.organizer_email !== 'saloni.bhatia@example.com');

    globallyFilteredItems = globallyFilteredItems.filter((item) => {
      if (item.privacy_level === 'semi-public') {
        return user && item.organizer_email === user.email;
      }
      return true;
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    globallyFilteredItems = globallyFilteredItems.filter((item) => {
      if (['vibe-post', 'vibe-post-seed', 'profile-entries-seed', 'memory-post'].includes(item.source)) {
        return true;
      }

      if (item.date) {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        if (itemDate.getTime() < now.getTime()) {
          if (tab === 'following' && item.organizer_email && user?.followed_curator_ids?.includes(item.organizer_email) && !item.is_promotional) {
            return true;
          }
          return false;
        }
      }
      return true;
    });

    let finalItems = [];

    if (tab === 'following') {
    if (user && user.followed_curator_ids && user.followed_curator_ids.length > 0) {
      const followedIds = user.followed_curator_ids;
      console.log('🔍 Following tab - filtering by:', followedIds);
      console.log('🔍 Available organizer emails:', [...new Set(globallyFilteredItems.map(i => i.organizer_email))]);

      finalItems = globallyFilteredItems.filter((item) => {
        if (!item.organizer_email) return false;

        // Match by email directly
        const matches = followedIds.includes(item.organizer_email);

        if (matches) {
          console.log('✅ Match found:', item.title, 'from', item.organizer_email);
        }
        return matches;
      });

      console.log('📊 Following tab results:', finalItems.length, 'events');

      finalItems.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
    } else {
      console.log('⚠️ No followed curators or user not logged in');
      finalItems = [];
    }
    } else if (tab === 'forYou') {
      let refinedItems = globallyFilteredItems.filter(item => {
        const eventDate = item.date ? new Date(item.date) : null;
        const eventHour = eventDate ? eventDate.getHours() : -1;

        if (dateFilter instanceof Date) {
          if (!eventDate) return false;
          const selectedSpecificDate = new Date(dateFilter);
          selectedSpecificDate.setHours(0, 0, 0, 0);
          eventDate.setHours(0, 0, 0, 0);
          if (eventDate.getTime() !== selectedSpecificDate.getTime()) return false;
        } else if (dateFilter === 'Today') {
          if (!eventDate) return false;
          const today = new Date();
          today.setHours(0,0,0,0);
          eventDate.setHours(0,0,0,0);
          if (eventDate.getTime() !== today.getTime()) return false;
        } else if (dateFilter === 'Tomorrow') {
          if (!eventDate) return false;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0,0,0,0);
          eventDate.setHours(0,0,0,0);
          if (eventDate.getTime() !== tomorrow.getTime()) return false;
        } else if (dateFilter === 'This week') {
          if (!eventDate) return false;
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          startOfWeek.setHours(0,0,0,0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 6);
          endOfWeek.setHours(23,59,59,999);
          if (eventDate < startOfWeek || eventDate > endOfWeek) return false;
        }

        if (selectedTime === 'morning' && (eventHour < 6 || eventHour >= 12)) return false;
        if (selectedTime === 'afternoon' && (eventHour < 12 || eventHour >= 17)) return false;
        if (selectedTime === 'evening' && (eventHour < 17 || eventHour >= 22)) return false;
        if (selectedTime === 'night' && (eventHour < 22 || eventHour >= 6)) return false;

        if (selectedGenres.size > 0) {
          const itemCategoriesAndTags = [
            item.category?.toLowerCase(),
            ...(item.scene_tags || []).map(tag => tag.toLowerCase())
          ];
          const hasMatchingGenre = Array.from(selectedGenres).some(
            (g) => itemCategoriesAndTags.includes(g.toLowerCase())
          );
          if (!hasMatchingGenre) return false;
        }

        if (locationFilter.trim() !== "" && item.location && !item.location.toLowerCase().includes(locationFilter.toLowerCase()) && item.venue_name && !item.venue_name.toLowerCase().includes(locationFilter.toLowerCase())) {
          return false;
        }

        return true;
      });

      const vibePostSources = ['vibe-post', 'vibe-post-seed', 'profile-entries-seed', 'memory-post'];
      const vibePosts = refinedItems.filter((e) => vibePostSources.includes(e.source)) || [];
      const sponsoredItems = refinedItems.filter((e) => e.is_promotional) || [];
      const regularEvents = refinedItems.filter((e) =>
        !vibePostSources.includes(e.source) && !e.is_promotional
      ) || [];

      console.log(`📊 For You tab: ${vibePosts.length} vibe posts, ${regularEvents.length} regular events, ${sponsoredItems.length} sponsored`);

      const mainFeedContent = shuffleArray([...vibePosts, ...regularEvents]);

      finalItems = [];
      let sponsoredCounter = 0;
      const sponsoredInsertionRate = 6;

      for (let i = 0; i < mainFeedContent.length; i++) {
        finalItems.push(mainFeedContent[i]);
        if ((i + 1) % sponsoredInsertionRate === 0 && sponsoredCounter < sponsoredItems.length) {
          finalItems.push(sponsoredItems[sponsoredCounter]);
          sponsoredCounter++;
        }
      }
      while (sponsoredCounter < sponsoredItems.length) {
        finalItems.push(sponsoredItems[sponsoredCounter]);
        sponsoredCounter++;
      }
    } else if (tab === 'food') {
      const primaryFoodKeywords = ['restaurant', 'cafe', 'coffee', 'dining', 'brunch', 'dinner', 'lunch', 'breakfast', 'cuisine', 'chef', 'culinary', 'eatery', 'kitchen', 'dessert', 'bakery', 'tasting', 'bistro', 'diner', 'gastropub'];
      const secondaryFoodKeywords = ['food', 'meal', 'treats'];

      finalItems = globallyFilteredItems.filter((item) => {
        const itemCategory = item.category?.toLowerCase() || '';
        const itemDescription = item.description?.toLowerCase() || '';
        const itemTitle = item.title?.toLowerCase() || '';
        const itemTags = item.scene_tags?.map((tag) => tag.toLowerCase()).join(' ') || '';

        if (itemCategory === 'wellness' || itemCategory === 'nightlife' || itemCategory === 'social') return false;

        if (itemCategory === 'food') return true;

        const searchText = `${itemDescription} ${itemTitle} ${itemTags}`;

        const primaryMatches = primaryFoodKeywords.filter((keyword) => searchText.includes(keyword)).length;
        const secondaryMatches = secondaryFoodKeywords.filter((keyword) => searchText.includes(keyword)).length;

        return primaryMatches >= 1 || secondaryMatches >= 2;
      });

      finalItems.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      });
    }

    const processNow = new Date();
    processNow.setHours(0, 0, 0, 0);

    let dateFilteredFinalItems = finalItems.filter((item) => {
      const isVibePostOrAlbum = ['memory-post', 'vibe-post-seed', 'vibe-post', 'profile-entries-seed'].includes(item.source);

      if (isVibePostOrAlbum) {
        return item.status === 'active' || item.status === 'published';
      }

      if (!item.date) return false;
      const eventDate = new Date(item.date);
      eventDate.setHours(0, 0, 0, 0);

      return eventDate >= processNow;
    });

    const deduplicatedItems = deduplicateEvents(dateFilteredFinalItems);

    return deduplicatedItems;
  }, [selectedGenres, locationFilter, dateFilter, selectedTime, activeTab]);

  useEffect(() => {
    if (allEvents.length > 0) {
      console.log('🔍 Feed: Refiltering events for tab:', activeTab, 'with user followed_curator_ids:', currentUser?.followed_curator_ids);
      const result = filterAndSortEvents(allEvents, activeTab, currentUser);
      console.log('📊 Feed: Filtered results count:', result.length);
      setFilteredEvents(result);
    } else {
      setFilteredEvents([]);
    }
  }, [allEvents, activeTab, currentUser, filterAndSortEvents]);

  useEffect(() => {
    if (filteredEvents.length > 0 && containerRef.current) {
      setCurrentIndex(0);
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [filteredEvents]);

  const handleScroll = useCallback((event) => {
    const container = event.target;

    if (!container) return;

    let currentScrollPosition;
    let containerDimension;
    let isMobile = false;

    if (container === scrollContainerRef.current) {
      currentScrollPosition = container.scrollLeft;
      containerDimension = container.offsetWidth;
    } else if (container === containerRef.current) {
      currentScrollPosition = container.scrollTop;
      containerDimension = container.offsetHeight;
      isMobile = true;
    } else {
      return;
    }

    const viewportCenter = currentScrollPosition + containerDimension / 2;

    let minDistance = Infinity;
    let closestIndex = -1;

    Array.from(container.children).forEach((child, index) => {
      if (!isMobile && index === 0) return;

      if (child.nodeType === 1 && child.offsetWidth > 0) {
        let childCenter;
        if (isMobile) {
          childCenter = child.offsetTop + child.offsetHeight / 2;
        } else {
          childCenter = child.offsetLeft + child.offsetWidth / 2;
        }
        const distance = Math.abs(viewportCenter - childCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    if (closestIndex !== -1 && closestIndex !== (isMobile ? currentIndex : currentIndex + 1)) {
      setCurrentIndex(isMobile ? closestIndex : closestIndex - 1);
    }

    if (!isMobile) {
      const targetCardElement = scrollContainerRef.current.children[currentIndex + 1];

      if (targetCardElement) {
        const targetCenter = targetCardElement.offsetLeft + targetCardElement.offsetWidth / 2;
        const viewportCenter = currentScrollPosition + containerDimension / 2;
        const scrollDistance = Math.abs(viewportCenter - targetCenter);
        const fadeThreshold = 200;
        const rawOpacity = Math.max(0, 1 - scrollDistance / fadeThreshold);
        setFiltersOpacity(rawOpacity * rawOpacity);
      } else {
        setFiltersOpacity(1);
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    if (scrollContainerRef.current && filteredEvents.length > 0 && window.innerWidth >= 768) {
      const container = scrollContainerRef.current;
      const firstVisibleCard = container.children[1];

      if (firstVisibleCard) {
        requestAnimationFrame(() => {
          firstVisibleCard.scrollIntoView({
            behavior: 'auto',
            block: 'nearest',
            inline: 'center'
          });
          setTimeout(() => handleScroll({ target: container }), 0);
        });
      }
    }
  }, [filteredEvents, handleScroll, activeTab]);

  const toggleSaveEvent = async (eventId) => {
    if (!currentUser || requestInProgress) return;

    setRequestInProgress(true);

    const newSavedEvents = new Set(savedEvents);
    if (newSavedEvents.has(eventId)) {
      newSavedEvents.delete(eventId);
    } else {
      newSavedEvents.add(eventId);
    }
    setSavedEvents(newSavedEvents);

    try {
      await base44.auth.updateMe({ saved_events: Array.from(newSavedEvents) });
    } catch (error) {
      console.error("Error saving event:", error);
      setSavedEvents(savedEvents);
      alert("Failed to save event. Please try again.");
    } finally {
      setRequestInProgress(false);
    }
  };

  const handleSavePost = (event) => {
    if (event.source === 'vibe-post') {
      setSelectedPostForSave(event);
      setShowSaveBottomSheet(true);
    } else {
      toggleSaveEvent(event.id);
    }
  };

  const handleDataChange = async () => {
    await loadFeedData(true);
  };

  const handleLoginRequired = (action) => {
    setLoginPromptAction(action);
    setShowLoginPrompt(true);
  };

  const handleCommentClick = (event) => {
    if (!currentUser) {
      handleLoginRequired("add comments");
      return;
    }
    console.log(`User wants to comment on event: ${event.title} (ID: ${event.id})`);
  };

  const handleShowLess = (event) => {
    if (!currentUser) {
      handleLoginRequired("customize your feed");
      return;
    }
    console.log('Show less of:', event.organizer_email);
  };

  const getCardAnimationProps = (childIndex) => {
    const isCenter = (window.innerWidth >= 768 ? childIndex - 1 : childIndex) === currentIndex;
    const opacity = isCenter ? 1 : 0.4;
    const scale = isCenter ? 1 : 0.85;
    return { opacity, scale };
  };

  if (isLoading && allEvents.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 md:bg-gradient-to-br md:from-cyan-50 md:via-gray-50 md:to-blue-100 text-gray-800 gap-4">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <p className="font-mono">Finding the scene...</p>
      </div>
    );
  }

  if (error && allEvents.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 md:bg-gradient-to-br md:from-cyan-50 md::via-gray-50 md::to-blue-100 text-gray-800 gap-4">
        <p className="text-6xl mb-4">⚠️</p>
        <h2 className="text-2xl font-display mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-center max-w-md">{error}</p>
        <button
          onClick={() => {
            loadFeedData();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col" style={{ overflow: 'hidden' }}>
      <LoginPromptDialog
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction}
      />

      <FriendsGoingModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        friends={friendsGoingData.friends}
        eventName={friendsGoingData.eventName}
        currentUser={currentUser}
        onFriendsUpdate={handleDataChange}
      />

      <SaveCollectionsBottomSheet
        isOpen={showSaveBottomSheet}
        onClose={() => {
          setShowSaveBottomSheet(false);
          setSelectedPostForSave(null);
        }}
        postData={selectedPostForSave}
        currentUser={currentUser}
        onDataChange={handleDataChange}
      />

      <GroupChatModal
        isOpen={showGroupChatModal}
        onClose={() => setShowGroupChatModal(false)}
        event={currentEventForChat}
        currentUser={currentUser}
      />

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden h-full w-full" style={{ overflow: 'hidden', width: '100vw', maxWidth: '100vw' }}>
        <div className="mt-10 rounded absolute top-2 left-0 right-0 z-40 w-full sm:px-6 space-y-2" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
          <div className="mt-2 flex justify-center px-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (selectedGenres.size > 0) {
                    params.set('genres', Array.from(selectedGenres).join(','));
                  }
                  if (locationFilter) params.set('location', locationFilter);
                  if (dateFilter !== 'Anytime') {
                    if (typeof dateFilter === 'string') {
                      params.set('date', dateFilter);
                    } else if (dateFilter instanceof Date) {
                      params.set('date', dateFilter.toISOString());
                    }
                  }
                  const queryString = params.toString();
                  const mapUrl = queryString ? `Map?${queryString}` : 'Map';
                  window.location.href = createPageUrl(mapUrl);
                }}
                className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                  activeTab === 'map' ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
                variant="ghost"
              >
                Map
              </Button>
              <Button
                onClick={() => {
                  if (activeTab !== 'food') {
                    setActiveTab('food');
                  }
                  setTimeout(() => {
                    if (containerRef.current) {
                      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
                    }
                  }, 0);
                }}
                className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                  activeTab === 'food' ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
                variant="ghost"
              >
                Food
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === 'forYou') {
                    const shuffledEvents = shuffleArray([...allEvents]);
                    setFilteredEvents(shuffledEvents);
                  } else {
                    setActiveTab('forYou');
                  }
                  setTimeout(() => {
                    if (containerRef.current) {
                      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
                    }
                  }, 0);
                }}
                className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                  activeTab === 'forYou' ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
                variant="ghost"
              >
                For You
              </Button>
              <Button
                onClick={() => {
                  if (!currentUser) {
                    handleLoginRequired("view your following feed");
                    return;
                  }
                  if (activeTab !== 'following') {
                    setActiveTab('following');
                  }
                  setTimeout(() => {
                    if (containerRef.current) {
                      containerRef.current.scrollTo({ top: 0, behavior: 'auto' });
                    }
                  }, 0);
                }}
                className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                  activeTab === 'following' ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
                variant="ghost"
              >
                Following
              </Button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 bg-transparent border-none shadow-none px-0 py-0 h-auto text-white font-bold hover:text-white transition-all duration-200"
              >
                <Filter className="w-3.5 h-3.5 font-bold" />
                {showFilters ? <ChevronUp className="w-3.5 h-3.5 font-bold" /> : <ChevronDown className="w-3.5 h-3.5 font-bold" />}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="flex justify-center items-center gap-1 flex-wrap px-4" style={{ maxWidth: '100vw', overflow: 'hidden' }}>
              <div className="flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar">
                <LocationFilter value={locationFilter} onChange={setLocationFilter} />
                <GenreFilter selectedGenres={selectedGenres} onSelectionChange={setSelectedGenres} />
                <DateFilter selected={dateFilter} onSelect={setDateFilter} />
              </div>
            </div>
          )}
        </div>

        <div
          ref={containerRef}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory"
          style={{
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100vw',
            maxWidth: '100vw'
          }}
          onScroll={handleScroll}
        >
          {filteredEvents.length > 0 ? (
            <>
              {filteredEvents.map((item, index) => {
                return (
                  <div
                    key={item.id || `${item.title}-${item.source}-${index}`}
                    className="h-full w-full snap-start flex items-center justify-center flex-shrink-0"
                    style={{
                      minHeight: '100vh',
                      maxHeight: '100vh',
                      width: '100vw',
                      maxWidth: '100vw',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <div className="w-full h-full relative bg-black" style={{ overflow: 'hidden', width: '100vw', maxWidth: '100vw' }}>
                      <PoppinEventCard
                        event={item}
                        isSaved={savedEvents.has(item.id)}
                        onToggleSave={!currentUser ? () => handleLoginRequired("save events") : handleSavePost}
                        onShowFriends={(friends, eventName) => {
                          if (!currentUser) {
                            handleLoginRequired("view friends going");
                            return;
                          }
                          setFriendsGoingData({ friends, eventName });
                          setShowFriendsModal(true);
                        }}
                        isFromFollowingTab={activeTab === 'following'}
                        isSponsored={item.is_promotional || false}
                        isOrganizerFollowed={
                          currentUser &&
                          currentUser.followed_curator_ids &&
                          currentUser.followed_curator_ids.includes(item.organizer_email)
                        }
                        currentUser={currentUser}
                        isDesktopFrame={false}
                        onDataChange={handleDataChange}
                        savedEvents={savedEvents}
                        followedCurators={followedCurators}
                        hideEventSaveButton={currentUser?.email === item.organizer_email}
                        showTicketButton={true}
                        onLoginRequired={handleLoginRequired}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="h-screen w-full flex items-center justify-center bg-black snap-start" style={{ overflow: 'hidden', width: '100vw', maxWidth: '100vw' }}>
                <div className="text-center px-8" style={{ maxWidth: '100vw' }}>
                  <div className="text-6xl mb-6">🎉</div>
                  <h2 className="text-2xl font-bold text-white mb-4">You're all caught up!</h2>
                  <p className="text-gray-300 text-lg">Check back later for new events.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-8 text-gray-500 bg-black" style={{ scrollSnapAlign: 'start', overflow: 'hidden', width: '100vw', maxWidth: '100vw' }}>
              <p className="text-6xl mb-4">💨</p>
              <h2 className="text-3xl font-display mb-2 text-white">
                {activeTab === 'following' && !currentUser ? 'Sign in to see who you\'re following' : 'No events found'}
              </h2>
              <p className="text-gray-300">
                {activeTab === 'following' && !currentUser ? 'Follow curators to see their content here' : 'Try adjusting your filters!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:flex h-full w-full" style={{ overflow: 'hidden' }}>
        <div className="relative w-full max-w-5xl h-[calc(100vh-120px)] max-h-[850px] flex items-center justify-center">
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[375px] pointer-events-none"
            style={{ opacity: filtersOpacity, transition: 'opacity 0.2s ease-out' }}
          >
            <div className="px-4 w-full space-y-2 pointer-events-auto">
              <div className="mt-1 flex justify-center">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (selectedGenres.size > 0) {
                        params.set('genres', Array.from(selectedGenres).join(','));
                      }
                      if (locationFilter) params.set('location', locationFilter);
                      if (dateFilter !== 'Anytime') {
                        if (typeof dateFilter === 'string') {
                          params.set('date', dateFilter);
                        } else if (dateFilter instanceof Date) {
                          params.set('date', dateFilter.toISOString());
                        }
                      }
                      const queryString = params.toString();
                      const mapUrl = queryString ? `Map?${queryString}` : 'Map';
                      window.location.href = createPageUrl(mapUrl);
                    }}
                    className="bg-transparent border-none shadow-none px-0 py-0 h-auto text-white/50 hover:text-white/70"
                    variant="ghost"
                  >
                    Map
                  </Button>
                  <Button
                    onClick={() => {
                      if (activeTab !== 'food') {
                        setActiveTab('food');
                      }
                      if (scrollContainerRef.current && window.innerWidth >= 768) {
                        const firstCard = scrollContainerRef.current.children[1];
                        if (firstCard) {
                          firstCard.scrollIntoView({ behavior: 'auto', inline: 'center' });
                        }
                      }
                    }}
                    className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                      activeTab === 'food' ? 'text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                    variant="ghost"
                  >
                    Food
                  </Button>
                  <Button
                    onClick={() => {
                      if (scrollContainerRef.current && window.innerWidth >= 768) {
                        const firstCard = scrollContainerRef.current.children[1];
                        if (firstCard) {
                          firstCard.scrollIntoView({ behavior: 'auto', inline: 'center' });
                        }
                      }

                      if (activeTab === 'forYou') {
                        const shuffledEvents = shuffleArray([...allEvents]);
                        setFilteredEvents(shuffledEvents);
                      } else {
                        setActiveTab('forYou');
                      }
                    }}
                    className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                      activeTab === 'forYou' ? 'text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                    variant="ghost"
                  >
                    For You
                  </Button>
                  <Button
                    onClick={() => {
                      if (!currentUser) {
                        handleLoginRequired("view your following feed");
                        return;
                      }
                      if (activeTab !== 'following') {
                        setActiveTab('following');
                      }
                      if (scrollContainerRef.current && window.innerWidth >= 768) {
                        const firstCard = scrollContainerRef.current.children[1];
                        if (firstCard) {
                          firstCard.scrollIntoView({ behavior: 'auto', inline: 'center' });
                        }
                      }
                    }}
                    className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${
                      activeTab === 'following' ? 'text-white' : 'text-white/50 hover:text-white/70'
                    }`}
                    variant="ghost"
                  >
                    Following
                  </Button>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 bg-transparent border-none shadow-none px-0 py-0 h-auto text-white font-bold hover:text-white transition-all duration-200"
                  >
                    <Filter className="w-3.5 h-3.5 font-bold" strokeWidth={2.5} />
                    {showFilters ? <ChevronUp className="w-3.5 h-3.5 font-bold" strokeWidth={2.5} /> : <ChevronDown className="w-3.5 h-3.5 font-bold" strokeWidth={2.5} />}
                  </button>

                  {currentUser?._isAdminMode && (
                    <Button
                      onClick={() => {
                        simulatedDataManager.setAdminMode(false);
                        window.location.reload();
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs rounded-full"
                    >
                      Admin Off
                    </Button>
                  )}
                </div>
              </div>

              {showFilters && (
                <div className="flex justify-center items-center gap-1 flex-wrap">
                  <div className="flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar">
                    <LocationFilter value={locationFilter} onChange={setLocationFilter} />
                    <GenreFilter selectedGenres={selectedGenres} onSelectionChange={setSelectedGenres} />
                    <DateFilter selected={dateFilter} onSelect={setDateFilter} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollPadding: '0 calc(50% - 187.5px)' }}
          >
            <div className="hidden md:block flex-shrink-0 w-[375px] h-full snap-center" />

            {filteredEvents.length > 0 ? (
              filteredEvents.map((item, index) => {
                const { opacity, scale } = getCardAnimationProps(index + 1);

                return (
                  <motion.div
                    key={item.id || `${item.title}-${item.source}-${index}`}
                    className="mr-1 mb-6 px-4 flex-shrink-0 w-[375px] h-[95%] max-h-[800px] snap-center flex items-center justify-center"
                    animate={{ opacity, scale }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                      <PoppinEventCard
                        event={item}
                        isSaved={savedEvents.has(item.id)}
                        onToggleSave={!currentUser ? () => handleLoginRequired("save events") : handleSavePost}
                        onShowFriends={(friends, eventName) => {
                          if (!currentUser) {
                            handleLoginRequired("view friends going");
                            return;
                          }
                          setFriendsGoingData({ friends, eventName });
                          setShowFriendsModal(true);
                        }}
                        isFromFollowingTab={activeTab === 'following'}
                        isSponsored={item.is_promotional || false}
                        isOrganizerFollowed={currentUser?.followed_curator_ids?.includes(item.organizer_email)}
                        currentUser={currentUser}
                        isDesktopFrame={true}
                        onDataChange={handleDataChange}
                        savedEvents={savedEvents}
                        followedCurators={followedCurators}
                        hideEventSaveButton={currentUser?.email === item.organizer_email}
                        showTicketButton={true}
                        onLoginRequired={handleLoginRequired}
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                className="flex-shrink-0 w-[375px] h-full snap-center flex flex-col items-center justify-center text-center p-8 text-gray-500"
                animate={getCardAnimationProps(1)}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <p className="text-6xl mb-4">💨</p>
                <h2 className="text-3xl font-display mb-2 text-white">
                  {activeTab === 'following' && !currentUser ? 'Sign in to see who you\'re following' : 'No events found'}
                </h2>
                <p className="text-gray-300">
                  {activeTab === 'following' && !currentUser ? 'Follow curators to see their content here' : 'Try adjusting your filters!'}
                </p>
              </motion.div>
            )}

            {filteredEvents.length > 0 && (
              <motion.div
                className="flex-shrink-0 w-[375px] h-full snap-center flex flex-col items-center justify-center text-center p-8 text-gray-500"
                animate={getCardAnimationProps(filteredEvents.length + 1)}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <p className="text-6xl mb-4">🎉</p>
                <h2 className="text-3xl font-display mb-2 text-gray-800">You're all caught up!</h2>
                <p>Check back later for new events.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}