
import React, { useState, useEffect, useMemo } from "react";
import { Event } from "@/api/entities";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import { MapPin, Calendar, Sparkles, Plus, Building, Filter, ChevronDown, ChevronUp } from "lucide-react"; // Added Filter, ChevronDown, ChevronUp
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LocationFilter from "../components/feed/LocationFilter";
import GenreFilter from "../components/feed/GenreFilter";
import DateFilter from "../components/feed/DateFilter";
import GroupedEventPopup from "../components/event/GroupedEventPopup";

// Location coordinates mapping for common cities
const locationCoordinates = {
  // California
  'san francisco': [37.7749, -122.4194], 'san fran': [37.7749, -122.4194], 'sf': [37.7749, -122.4194],
  'los angeles': [34.0522, -118.2437], 'la': [34.0522, -118.2437],
  'san diego': [32.7157, -117.1611],
  'oakland': [37.8044, -122.2712],
  'berkeley': [37.8715, -122.2730],
  'sacramento': [38.5816, -121.4944],
  'fresno': [36.7378, -119.7871],
  'long beach': [33.7701, -118.1937],
  'anaheim': [33.8366, -117.9143],
  'santa ana': [33.7455, -117.8677],
  'riverside': [33.9806, -117.3755],
  'stockton': [37.9577, -121.2908],
  'bakersfield': [35.3733, -119.0187],
  'fremont': [37.5485, -121.9886],
  'san jose': [37.3382, -121.8863],

  // New York
  'new york city': [40.7128, -74.0060], 'new york': [40.7128, -74.0060], 'nyc': [40.7128, -74.0060],
  'brooklyn': [40.6782, -73.9442],
  'queens': [40.7282, -73.7949],
  'manhattan': [40.7831, -73.9712],
  'bronx': [40.8448, -73.8648],
  'buffalo': [42.8864, -78.8784],
  'rochester': [43.1566, -77.6088],
  'yonkers': [40.9312, -73.8988],
  'syracuse': [43.0481, -76.1474],
  'albany': [42.6526, -73.7562],

  // Texas
  'houston': [29.7604, -95.3698],
  'dallas': [32.7767, -96.7970],
  'san antonio': [29.4241, -98.4936],
  'austin': [30.2672, -97.7431],
  'fort worth': [32.7555, -97.3308],

  // Florida
  'miami': [25.7617, -80.1918],
  'tampa': [27.9506, -82.4572],
  'orlando': [28.5383, -81.3792],
  'jacksonville': [30.3322, -81.6557],

  // Other Major Cities
  'chicago': [41.8781, -87.6298],
  'seattle': [47.6062, -122.3321],
  'boston': [42.3601, -71.0589],
  'denver': [39.7392, -104.9903],
  'atlanta': [33.7490, -84.3880],
  'portland': [45.5152, -122.6784],
  'las vegas': [36.1699, -115.1398],

  // International
  'london': [51.5074, -0.1278],
  'paris': [48.8566, 2.3522],
  'tokyo': [35.6762, 139.6503],
  'berlin': [52.5200, 13.4050]
};

// Component to handle map updates
function MapUpdater({ locationFilter, filteredEvents }) {
  const map = useMap();

  useEffect(() => {
    if (locationFilter.trim() !== "" && locationFilter.length >= 3) {
      const searchTerm = locationFilter.toLowerCase().trim();

      let coords = null;
      if (locationCoordinates[searchTerm]) {
        coords = locationCoordinates[searchTerm];
      } else {
        for (const [key, coordinates] of Object.entries(locationCoordinates)) {
          if (key.startsWith(searchTerm) || searchTerm.startsWith(key)) {
            coords = coordinates;
            break;
          }
        }
      }

      if (coords) {
        map.flyTo(coords, 13, {
          animate: true,
          duration: 2.5
        });
      } else if (filteredEvents.length > 0) {
        const firstItem = filteredEvents[0];
        if (firstItem.latitude && firstItem.longitude) {
          map.flyTo([firstItem.latitude, firstItem.longitude], 13, {
            animate: true,
            duration: 2.5
          });
        }
      }
    }
  }, [map, locationFilter, filteredEvents]);

  return null;
}

// Create simple emoji icons (no pin shape, just circles)
const createEmojiIcon = (category, isGrouped = false, count = 0) => {
  const getCategoryEmoji = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'music': return '🎵';
      case 'art': return '🎨';
      case 'food': return '🍽️';
      case 'tech': return '💻';
      case 'sports': return '⚽';
      case 'business': return '💼';
      case 'wellness': return '🧘';
      case 'nightlife': return '🌃';
      case 'culture': return '🏛️';
      case 'outdoor': return '🏕️';
      case 'market': return '🛍️';
      case 'talk': return '🎤';
      case 'rave': return '⚡';
      case 'popup': return '✨';
      case 'party': return '🎉';
      case 'picnic': return '🧺';
      default: return '📍';
    }
  };

  const content = isGrouped ? `<span style="font-weight: bold; font-size: 12px;">${count}</span>` : getCategoryEmoji(category);

  const iconHtml = `
        <div style="
            width: 32px; 
            height: 32px; 
            background: white; 
            border-radius: 50%;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border: 2px solid ${isGrouped ? '#3b82f6' : '#e5e7eb'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-size: 14px;
            color: ${isGrouped ? '#3b82f6' : 'black'};
        ">
            ${content}
        </div>
    `;

  return new L.DivIcon({
    html: iconHtml,
    className: 'custom-emoji-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export default function Map() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const navigate = useNavigate();

  // State for filters
  const [locationFilter, setLocationFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState(new Set());
  const [dateFilter, setDateFilter] = useState("Anytime");
  const [contentType, setContentType] = useState("events");
  const [showFilters, setShowFilters] = useState(true); // New state for filter visibility

  useEffect(() => {
    loadAllItems();
    getUserLocation();

    const urlParams = new URLSearchParams(window.location.search);
    setLocationFilter(urlParams.get('location') || "");

    const genreParam = urlParams.get('genres');
    if (genreParam) {
      setGenreFilter(new Set(genreParam.split(',')));
    } else {
      const oldGenreParam = urlParams.get('genre');
      if (oldGenreParam && oldGenreParam !== 'all') {
        setGenreFilter(new Set([oldGenreParam]));
      } else {
        setGenreFilter(new Set());
      }
    }

    const dateParam = urlParams.get('date');
    if (dateParam) {
      const isDateString = !isNaN(Date.parse(dateParam));
      setDateFilter(isDateString ? new Date(dateParam) : dateParam);
    } else {
      setDateFilter("Anytime");
    }

    setContentType(urlParams.get('type') === 'moments' ? 'moments' : 'events');

  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log("Error getting location:", error);
        }
      );
    }
  };

  const loadAllItems = async () => {
    setLoading(true);
    try {
      const allEvents = await Event.list("-date", 200);
      const eventsWithCoords = allEvents.filter((event) =>
        event.latitude && event.longitude
      );

      // Enhanced sample events with proper coordinates
      const sampleEventsForMap = [
        {
          id: 'map-event-1',
          title: 'Underground Art Gallery Opening',
          location: 'SoHo, New York',
          venue_name: 'Gallery Underground',
          latitude: 40.7230,
          longitude: -74.0030,
          cover_image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=400&fit=crop',
          category: 'art',
          price: 15,
          date: '2025-02-20T18:30:00Z',
          organizer_email: 'arthaus@demo.com',
          organizer_name: 'ArtHaus Collective'
        },
        {
          id: 'map-event-2',
          title: 'Rooftop Sunset Yoga',
          location: 'Brooklyn, New York',
          venue_name: 'Sky Terrace',
          latitude: 40.6892,
          longitude: -73.9442,
          cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e1f?w=400&h=400&fit=crop',
          category: 'wellness',
          price: 0,
          date: '2025-02-25T17:00:00Z',
          organizer_email: 'maya@demo.com',
          organizer_name: 'Maya Patel'
        },
        {
          id: 'map-event-3',
          title: 'Tech Innovation Summit',
          location: 'San Francisco, CA',
          venue_name: 'Innovation Hub',
          latitude: 37.7749,
          longitude: -122.4194,
          cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=400&fit=crop',
          category: 'tech',
          price: 50,
          date: '2025-03-05T10:00:00Z',
          organizer_email: 'techinnovators@demo.com',
          organizer_name: 'Tech Innovators SF'
        },
        {
          id: 'map-event-4',
          title: 'Food Truck Festival',
          location: 'Los Angeles, CA',
          venue_name: 'Grand Park',
          latitude: 34.0522,
          longitude: -118.2437,
          cover_image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
          category: 'food',
          price: 0,
          date: '2025-02-28T12:00:00Z',
          organizer_email: 'foodexplorers@demo.com',
          organizer_name: 'Food Explorers'
        },
        {
          id: 'map-event-5',
          title: 'Jazz Night at The Blue Note',
          location: 'Chicago, IL',
          venue_name: 'The Blue Note',
          latitude: 41.8781,
          longitude: -87.6298,
          cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
          category: 'music',
          price: 25,
          date: '2025-03-01T20:00:00Z',
          organizer_email: 'jazzlovers@demo.com',
          organizer_name: 'Jazz Lovers Chicago'
        },
        {
          id: 'map-event-6',
          title: 'Startup Networking Happy Hour',
          location: 'Austin, TX',
          venue_name: 'The Rooftop Bar',
          latitude: 30.2672,
          longitude: -97.7431,
          cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
          category: 'business',
          price: 0,
          date: '2025-02-27T17:30:00Z',
          organizer_email: 'startupaustin@demo.com',
          organizer_name: 'Startup Austin'
        },
        {
          id: 'map-event-7',
          title: 'Beach Volleyball Tournament',
          location: 'Miami, FL',
          venue_name: 'South Beach Courts',
          latitude: 25.7617,
          longitude: -80.1918,
          cover_image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop',
          category: 'sports',
          price: 10,
          date: '2025-03-08T10:00:00Z',
          organizer_email: 'beachsports@demo.com',
          organizer_name: 'Beach Sports Miami'
        },
        {
          id: 'map-event-8',
          title: 'Comedy Night Open Mic',
          location: 'Seattle, WA',
          venue_name: 'The Laugh Track',
          latitude: 47.6062,
          longitude: -122.3321,
          cover_image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
          category: 'nightlife',
          price: 5,
          date: '2025-02-26T19:00:00Z',
          organizer_email: 'comedyseattle@demo.com',
          organizer_name: 'Seattle Comedy Club'
        }];


      const mockMoments = [
        {
          id: 'moment_1',
          title: 'Live Street Art Show',
          location: 'Mission District, San Francisco',
          latitude: 37.7593,
          longitude: -122.4190,
          cover_image: 'https://images.unsplash.com/photo-1549880155-d14d334570ff?w=400&h=400&fit=crop',
          source: 'vibe-post',
          category: 'art'
        },
        {
          id: 'moment_2',
          title: 'Jazz Session in Central Park',
          location: 'Central Park, New York',
          latitude: 40.7829,
          longitude: -73.9654,
          cover_image: 'https://images.unsplash.com/photo-1510915368940-b85e05c1979b?w=400&h=400&fit=crop',
          source: 'vibe-post',
          category: 'music'
        },
        {
          id: 'moment_3',
          title: 'Pop-Up Dance Battle',
          location: 'Venice Beach, Los Angeles',
          latitude: 33.9920,
          longitude: -118.4727,
          cover_image: 'https://images.unsplash.com/photo-1596761596954-4414f6b4d360?w=400&h=400&fit=crop',
          source: 'vibe-post',
          category: 'party'
        }];


      setEvents([...eventsWithCoords, ...sampleEventsForMap, ...mockMoments]);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let eventsToFilter = [...events];

    if (contentType === 'events') {
      eventsToFilter = eventsToFilter.filter((item) => item.source !== 'vibe-post' || !item.source);
    } else {
      eventsToFilter = eventsToFilter.filter((item) => item.source === 'vibe-post');
    }

    // Apply genre filter for both events and moments
    if (genreFilter.size > 0) {
      eventsToFilter = eventsToFilter.filter((e) => e.category && genreFilter.has(e.category));
    }

    if (locationFilter.trim() !== "") {
      const searchTerm = locationFilter.toLowerCase();
      eventsToFilter = eventsToFilter.filter((e) =>
        e.location?.toLowerCase().includes(searchTerm) ||
        e.venue_name?.toLowerCase().includes(searchTerm)
      );
    }

    if (contentType === 'events' && dateFilter && dateFilter !== "Anytime") {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      eventsToFilter = eventsToFilter.filter((e) => {
        if (!e.date) return false;
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate < now) return false; // Filter out past events

        if (typeof dateFilter === 'string') {
          switch (dateFilter) {
            case "Today":
              return eventDate.getTime() === now.getTime();
            case "Tomorrow":
              const tomorrow = new Date(now);
              tomorrow.setDate(now.getDate() + 1);
              return eventDate.getTime() === tomorrow.getTime();
            case "This Week":
              const endOfWeek = new Date(now);
              endOfWeek.setDate(now.getDate() + (7 - now.getDay())); // Set to Sunday of current week
              return eventDate >= now && eventDate <= endOfWeek;
            case "This Weekend":
              const todayDay = now.getDay(); // 0 for Sunday, 1 for Monday... 6 for Saturday
              let weekendStart = new Date(now);
              let weekendEnd = new Date(now);

              if (todayDay === 6) { // If today is Saturday
                weekendEnd.setDate(now.getDate() + 1); // Weekend ends Sunday
              } else if (todayDay !== 0) { // If today is Monday-Friday
                weekendStart.setDate(now.getDate() + (6 - todayDay)); // Start from Saturday
                weekendEnd.setDate(weekendStart.getDate() + 1); // Weekend ends Sunday
              } else { // If today is Sunday
                return false; // Weekend already passed or no weekend events for today
              }
              weekendStart.setHours(0, 0, 0, 0);
              weekendEnd.setHours(23, 59, 59, 999);
              return eventDate >= weekendStart && eventDate <= weekendEnd;
            case "Next Week":
              const nextWeekStart = new Date(now);
              nextWeekStart.setDate(now.getDate() + (8 - now.getDay())); // Set to next Monday
              const nextWeekEnd = new Date(nextWeekStart);
              nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Set to next Sunday
              nextWeekStart.setHours(0, 0, 0, 0);
              nextWeekEnd.setHours(23, 59, 59, 999);
              return eventDate >= nextWeekStart && eventDate <= nextWeekEnd;
            case "This Month":
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              return eventDate >= now && eventDate <= endOfMonth;
            default: return true;
          }
        } else if (dateFilter instanceof Date) {
          const selectedDate = new Date(dateFilter);
          selectedDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === selectedDate.getTime();
        }
        return true;
      });
    }

    setFilteredEvents(eventsToFilter);
  }, [events, locationFilter, genreFilter, dateFilter, contentType]);

  const groupedEvents = useMemo(() => {
    const groups = {};
    filteredEvents.forEach((event) => {
      if (event.latitude && event.longitude) {
        const key = `${event.latitude},${event.longitude}`;
        if (!groups[key]) {
          groups[key] = {
            latitude: event.latitude,
            longitude: event.longitude,
            events: []
          };
        }
        groups[key].events.push(event);
      }
    });
    return Object.values(groups);
  }, [filteredEvents]);

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>);

  }

  return (
    <div className="h-screen bg-gray-900 text-white relative pb-16 md:pb-0">
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper,
        .custom-popup .leaflet-popup-content {
          padding: 0;
          border-radius: 12px;
          background-color: transparent;
          box-shadow: none;
        }
        .leaflet-popup-close-button {
            color: #fff !important;
            padding: 8px 8px 0 0 !important;
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}>

        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />


        <MapUpdater locationFilter={locationFilter} filteredEvents={filteredEvents} />

        <div className="mt-10 px-4 absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setContentType('events')}
              className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${contentType === 'events' ? 'text-white' : 'text-white/50 hover:text-white/70'}`
              }>

              Events
            </button>
            <button
              onClick={() => setContentType('moments')}
              className={`bg-transparent border-none shadow-none px-0 py-0 h-auto text-sm font-bold transition-all duration-200 hover:bg-transparent ${contentType === 'moments' ? 'text-white' : 'text-white/50 hover:text-white/70'}`
              }>

              Moments
            </button>

            {/* Filter Toggle Icon */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 bg-transparent border-none shadow-none px-0 py-0 h-auto text-white/70 hover:text-white transition-all duration-200"
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showFilters && (
            <div className="flex justify-center items-center gap-2 w-full max-w-md">
              <div className="flex-1">
                <LocationFilter
                  value={locationFilter}
                  onChange={setLocationFilter}
                  theme="dark" />

              </div>
              <div className="flex-shrink-0">
                <GenreFilter
                  selectedGenres={genreFilter}
                  onSelectionChange={setGenreFilter}
                  theme="dark" />

              </div>
              {contentType === 'events' &&
                <div className="flex-shrink-0">
                  <DateFilter
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    theme="dark" />

                </div>
              }
            </div>
          )}
        </div>

        {contentType === 'events' ?
          groupedEvents.map((group, index) => {
            const position = [group.latitude, group.longitude];

            if (group.events.length > 1) {
              return (
                <Marker key={`group-${index}`} position={position} icon={createEmojiIcon('multiple', true, group.events.length)}>
                  <Popup className="custom-popup grouped-popup" minWidth={300}>
                    <GroupedEventPopup events={group.events} />
                  </Popup>
                </Marker>);

            } else {
              const event = group.events[0];
              if (!event || !event.id) {
                console.warn("Skipping marker for invalid event:", event);
                return null;
              }

              const emojiIcon = createEmojiIcon(event.category || 'other');

              return (
                <Marker key={event.id} position={position} icon={emojiIcon}>
                  <Popup className="custom-popup">
                    <div className="flex w-[300px] bg-white rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={event.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"}
                        alt={event.title}
                        className="w-24 object-cover flex-shrink-0" />

                      <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <h3 className="font-bold text-gray-900 truncate">{event.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Building className="w-3.5 h-3.5 mr-1.5" />
                            <span className="truncate">{event.venue_name || 'TBA'}</span>
                          </div>
                          {event.date &&
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
                            </div>
                          }
                          {event.price !== null && event.price !== undefined &&
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                            </div>
                          }
                        </div>
                        <button
                          onClick={() => navigate(createPageUrl(`EventDetails?id=${event.id}`))}
                          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-md text-xs transition-colors">

                          RSVP
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>);

            }
          }) :

          filteredEvents.map((moment) =>
            <Marker
              key={moment.id}
              position={[moment.latitude, moment.longitude]}
              icon={createEmojiIcon(moment.category || 'other')}>

              <Popup className="custom-popup">
                <div className="p-0 min-w-[250px] max-w-[250px]">
                  <img
                    src={moment.cover_image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"}
                    alt={moment.title}
                    className="w-full h-32 object-cover rounded-t-lg mb-2" />

                  <div className="px-3 pb-3">
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug break-words">{moment.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{moment.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Live moment</span>
                      </div>
                    </div>
                    <button className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors">
                      View Moment
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        }
      </MapContainer>
    </div>);

}
