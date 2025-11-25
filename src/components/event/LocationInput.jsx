import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin, Edit3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Common location suggestions
const locationSuggestions = [
{ name: "Grand Central Terminal", address: "89 E 42nd St, New York, NY" },
{ name: "Central Park", address: "New York, NY" },
{ name: "Times Square", address: "New York, NY" },
{ name: "Brooklyn Bridge", address: "New York, NY" },
{ name: "Golden Gate Park", address: "San Francisco, CA" },
{ name: "Dolores Park", address: "San Francisco, CA" },
{ name: "Mission District", address: "San Francisco, CA" },
{ name: "Griffith Observatory", address: "Los Angeles, CA" },
{ name: "Venice Beach", address: "Los Angeles, CA" },
{ name: "Santa Monica Pier", address: "Santa Monica, CA" },
{ name: "Pike Place Market", address: "Seattle, WA" },
{ name: "Millennium Park", address: "Chicago, IL" },
{ name: "South Beach", address: "Miami, FL" },
{ name: "The Bean", address: "Chicago, IL" },
{ name: "Union Square", address: "San Francisco, CA" },
{ name: "Hollywood Walk of Fame", address: "Hollywood, CA" },
{ name: "Space Needle", address: "Seattle, WA" },
{ name: "Fenway Park", address: "Boston, MA" },
{ name: "Navy Pier", address: "Chicago, IL" },
{ name: "Austin Convention Center", address: "Austin, TX" }];


export default function LocationInput({ venueName, locationName, onSelect }) {
  const [venue, setVenue] = useState(venueName || '');
  const [location, setLocation] = useState(locationName || '');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const locationInputRef = useRef(null);

  const handleVenueChange = (e) => {
    const newVenue = e.target.value;
    setVenue(newVenue);
    onSelect(newVenue, location);
  };

  const handleLocationInputChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    setLocationSearchTerm(newLocation);
    onSelect(venue, newLocation);

    if (newLocation.length >= 1) {
      setShowLocationDropdown(true);
    } else {
      setShowLocationDropdown(false);
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    const fullAddress = selectedLocation.address;
    setLocation(fullAddress);
    setLocationSearchTerm(fullAddress);
    setShowLocationDropdown(false);
    onSelect(venue, fullAddress);
  };

  const handleUseCustomLocation = () => {
    setShowLocationDropdown(false);
    onSelect(venue, location);
  };

  // Filter suggestions based on search term
  const filteredSuggestions = locationSuggestions.filter((suggestion) =>
  suggestion.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
  suggestion.address.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  // Check if current input exactly matches any suggestion
  const hasExactMatch = filteredSuggestions.some((suggestion) =>
  suggestion.name.toLowerCase() === locationSearchTerm.toLowerCase() ||
  suggestion.address.toLowerCase() === locationSearchTerm.toLowerCase()
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Venue Name
        </label>
        <Input
          value={venue}
          onChange={handleVenueChange}
          placeholder="Enter venue name (e.g., The Coffee Shop, Central Park)"
          className="bg-white border-gray-300 text-gray-900" />

      </div>
      
      <div className="relative" ref={locationInputRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location/Address *

        </label>
        <Input
          value={location}
          onChange={handleLocationInputChange}
          onFocus={() => {
            if (location.length >= 1) {
              setShowLocationDropdown(true);
            }
          }}
          placeholder="Enter full address or location"
          className="bg-white border-gray-300 text-gray-900" />

        
        {/* Location Dropdown */}
        {showLocationDropdown &&
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSuggestions.length > 0 &&
          <>
                {filteredSuggestions.slice(0, 5).map((suggestion, index) =>
            <button
              key={index}
              onClick={() => handleLocationSelect(suggestion)}
              className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0">

                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-base">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {suggestion.address}
                      </div>
                    </div>
                  </button>
            )}
              </>
          }
            
            {/* Custom location option */}
            {locationSearchTerm.length > 0 && !hasExactMatch &&
          <button
            onClick={handleUseCustomLocation}
            className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-200">

                <Edit3 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Use "{locationSearchTerm}"</span>
              </button>
          }
            
            {filteredSuggestions.length === 0 && locationSearchTerm.length > 0 &&
          <div className="p-4 text-gray-500 text-center text-sm">
                No locations found. Your custom location will be used.
              </div>
          }
          </div>
        }
      </div>
    </div>);

}