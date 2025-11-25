
import React from 'react';
import {
  Calendar,
  Clock, // Added
  MapPin,
  Users,
  Info, // Added
  ChevronRight, // Added
  MessageSquare, // Added
  DollarSign // Kept, as it's used in the Price section
} from "lucide-react";
import { format } from 'date-fns';
import { motion } from "framer-motion"; // Added
import { Link } from "react-router-dom"; // Added
import { createPageUrl } from "@/utils"; // Added
import { Button } from "@/components/ui/button"; // Assumed path for Button component

export default function EventInfo({ event, userStatus, onPurchase, onRequestToJoin, onShowChat }) {
  if (!event) return null;

  // New variables based on outline
  const canSeePrivateDetails = userStatus === 'approved' || event.privacy_level === 'public';
  const requiresAction = event.privacy_level === 'private' && userStatus === 'none';

  // Removed handleViewClick as the old Attendees section is replaced

  return (
    <div className="space-y-4">
      {/* Combined Details and Location Section */}
      <div className="bg-white/30 backdrop-blur-md p-6 rounded-xl border border-white/20">
        <div className="space-y-6">
          {/* Date & Price */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-md">Date and Time</p>
                <p className="text-md text-gray-600">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                  <br />
                  {format(new Date(event.date), "h:mm a")}
                  {event.end_date && ` - ${format(new Date(event.end_date), "h:mm a")}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <DollarSign className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-md">Price</p>
                <p className="text-md font-semibold text-gray-800">
                  {event.price > 0 ? `$${event.price}` : "Free"}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold">Location</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {event.venue_name || "Event Venue"}
              </h4>
              <p className="text-gray-600">
                {event.location}
              </p>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-100/60 backdrop-blur-sm rounded-xl p-8 text-center">
              <div className="mb-4">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                Interactive map coming soon
              </h4>
              <p className="text-sm text-gray-500">
                Add your Mapbox token to enable maps
              </p>
            </div>
          </div>
        </div>

        {/* Attendee Info */}
        {(event.attendees && event.attendees.length > 0) && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
                <div className='flex items-center'>
                    <div className="flex -space-x-2 mr-3">
                        {event.attendees.slice(0, 5).map((attendee, index) => (
                        <img
                            key={index}
                            src={attendee.avatar}
                            alt={attendee.name}
                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        />
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold">{event.attendees.length}</span> people going
                    </p>
                </div>
                <Link to={createPageUrl(`EventPeople?id=${event.id}`)}>
                    <Button variant="outline" size="sm" className="bg-white">
                        See all
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>
          </div>
        )}
      </div>

      {/* Age Requirements */}
      {(event.age_requirement && event.age_requirement !== 'all_ages') && (
        <div className="bg-white/30 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Users className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-md">Age Requirement</p>
                <p className="text-2xl font-bold text-gray-900">{event.age_requirement}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-md">Typical Age Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  {event.age_requirement === '18+' ? '18-35' : 
                   event.age_requirement === '21+' ? '21-35' : 
                   event.age_requirement === '25+' ? '25-40' : 
                   event.age_requirement === '30+' ? '30-50' : 
                   event.age_requirement}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Removed the old Attendees Section, as it's replaced by the new Attendee Info within the main details section */}
      
      {/* Action Buttons - placeholder for future additions if any */}
    </div>
  );
}
