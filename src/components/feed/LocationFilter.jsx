import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const locationSuggestions = [
// California
{ name: "San Francisco", city: "California, USA" },
{ name: "Los Angeles", city: "California, USA" },
{ name: "San Diego", city: "California, USA" },
{ name: "Oakland", city: "California, USA" },
{ name: "Berkeley", city: "California, USA" },
{ name: "Sacramento", city: "California, USA" },
{ name: "Fresno", city: "California, USA" },
{ name: "Long Beach", city: "California, USA" },
{ name: "Anaheim", city: "California, USA" },
{ name: "Santa Ana", city: "California, USA" },
{ name: "Riverside", city: "California, USA" },
{ name: "Stockton", city: "California, USA" },
{ name: "Bakersfield", city: "California, USA" },
{ name: "Fremont", city: "California, USA" },
{ name: "San Jose", city: "California, USA" },

// New York
{ name: "New York City", city: "New York, USA" },
{ name: "Brooklyn", city: "New York, USA" },
{ name: "Queens", city: "New York, USA" },
{ name: "Manhattan", city: "New York, USA" },
{ name: "Bronx", city: "New York, USA" },
{ name: "Buffalo", city: "New York, USA" },
{ name: "Rochester", city: "New York, USA" },
{ name: "Yonkers", city: "New York, USA" },
{ name: "Syracuse", city: "New York, USA" },
{ name: "Albany", city: "New York, USA" },

// Texas
{ name: "Houston", city: "Texas, USA" },
{ name: "Dallas", city: "Texas, USA" },
{ name: "San Antonio", city: "Texas, USA" },
{ name: "Austin", city: "Texas, USA" },
{ name: "Fort Worth", city: "Texas, USA" },
{ name: "El Paso", city: "Texas, USA" },
{ name: "Arlington", city: "Texas, USA" },
{ name: "Corpus Christi", city: "Texas, USA" },
{ name: "Plano", city: "Texas, USA" },
{ name: "Lubbock", city: "Texas, USA" },

// Florida
{ name: "Miami", city: "Florida, USA" },
{ name: "Tampa", city: "Florida, USA" },
{ name: "Orlando", city: "Florida, USA" },
{ name: "Jacksonville", city: "Florida, USA" },
{ name: "St. Petersburg", city: "Florida, USA" },
{ name: "Hialeah", city: "Florida, USA" },
{ name: "Tallahassee", city: "Florida, USA" },
{ name: "Fort Lauderdale", city: "Florida, USA" },
{ name: "Port St. Lucie", city: "Florida, USA" },
{ name: "Cape Coral", city: "Florida, USA" },

// Illinois
{ name: "Chicago", city: "Illinois, USA" },
{ name: "Aurora", city: "Illinois, USA" },
{ name: "Rockford", city: "Illinois, USA" },
{ name: "Joliet", city: "Illinois, USA" },
{ name: "Naperville", city: "Illinois, USA" },
{ name: "Springfield", city: "Illinois, USA" },
{ name: "Peoria", city: "Illinois, USA" },
{ name: "Elgin", city: "Illinois, USA" },
{ name: "Waukegan", city: "Illinois, USA" },

// Pennsylvania
{ name: "Philadelphia", city: "Pennsylvania, USA" },
{ name: "Pittsburgh", city: "Pennsylvania, USA" },
{ name: "Allentown", city: "Pennsylvania, USA" },
{ name: "Erie", city: "Pennsylvania, USA" },
{ name: "Reading", city: "Pennsylvania, USA" },
{ name: "Scranton", city: "Pennsylvania, USA" },
{ name: "Bethlehem", city: "Pennsylvania, USA" },

// Ohio
{ name: "Columbus", city: "Ohio, USA" },
{ name: "Cleveland", city: "Ohio, USA" },
{ name: "Cincinnati", city: "Ohio, USA" },
{ name: "Toledo", city: "Ohio, USA" },
{ name: "Akron", city: "Ohio, USA" },
{ name: "Dayton", city: "Ohio, USA" },

// Georgia
{ name: "Atlanta", city: "Georgia, USA" },
{ name: "Augusta", city: "Georgia, USA" },
{ name: "Columbus", city: "Georgia, USA" },
{ name: "Savannah", city: "Georgia, USA" },
{ name: "Athens", city: "Georgia, USA" },

// North Carolina
{ name: "Charlotte", city: "North Carolina, USA" },
{ name: "Raleigh", city: "North Carolina, USA" },
{ name: "Greensboro", city: "North Carolina, USA" },
{ name: "Durham", city: "North Carolina, USA" },
{ name: "Winston-Salem", city: "North Carolina, USA" },
{ name: "Fayetteville", city: "North Carolina, USA" },
{ name: "Cary", city: "North Carolina, USA" },
{ name: "Wilmington", city: "North Carolina, USA" },
{ name: "High Point", city: "North Carolina, USA" },

// Michigan
{ name: "Detroit", city: "Michigan, USA" },
{ name: "Grand Rapids", city: "Michigan, USA" },
{ name: "Warren", city: "Michigan, USA" },
{ name: "Sterling Heights", city: "Michigan, USA" },
{ name: "Lansing", city: "Michigan, USA" },
{ name: "Ann Arbor", city: "Michigan, USA" },
{ name: "Flint", city: "Michigan, USA" },

// New Jersey
{ name: "Newark", city: "New Jersey, USA" },
{ name: "Jersey City", city: "New Jersey, USA" },
{ name: "Paterson", city: "New Jersey, USA" },
{ name: "Elizabeth", city: "New Jersey, USA" },
{ name: "Edison", city: "New Jersey, USA" },
{ name: "Woodbridge", city: "New Jersey, USA" },

// Washington
{ name: "Seattle", city: "Washington, USA" },
{ name: "Spokane", city: "Washington, USA" },
{ name: "Tacoma", city: "Washington, USA" },
{ name: "Vancouver", city: "Washington, USA" },
{ name: "Bellevue", city: "Washington, USA" },
{ name: "Kent", city: "Washington, USA" },

// Arizona
{ name: "Phoenix", city: "Arizona, USA" },
{ name: "Tucson", city: "Arizona, USA" },
{ name: "Mesa", city: "Arizona, USA" },
{ name: "Chandler", city: "Arizona, USA" },
{ name: "Glendale", city: "Arizona, USA" },
{ name: "Scottsdale", city: "Arizona, USA" },

// Massachusetts
{ name: "Boston", city: "Massachusetts, USA" },
{ name: "Worcester", city: "Massachusetts, USA" },
{ name: "Springfield", city: "Massachusetts, USA" },
{ name: "Lowell", city: "Massachusetts, USA" },
{ name: "Cambridge", city: "Massachusetts, USA" },

// Tennessee
{ name: "Nashville", city: "Tennessee, USA" },
{ name: "Memphis", city: "Tennessee, USA" },
{ name: "Knoxville", city: "Tennessee, USA" },
{ name: "Chattanooga", city: "Tennessee, USA" },
{ name: "Clarksville", city: "Tennessee, USA" },

// Indiana
{ name: "Indianapolis", city: "Indiana, USA" },
{ name: "Fort Wayne", city: "Indiana, USA" },
{ name: "Evansville", city: "Indiana, USA" },
{ name: "South Bend", city: "Indiana, USA" },

// Missouri
{ name: "Kansas City", city: "Missouri, USA" },
{ name: "St. Louis", city: "Missouri, USA" },
{ name: "Springfield", city: "Missouri, USA" },
{ name: "Independence", city: "Missouri, USA" },

// Maryland
{ name: "Baltimore", city: "Maryland, USA" },
{ name: "Frederick", city: "Maryland, USA" },
{ name: "Rockville", city: "Maryland, USA" },
{ name: "Gaithersburg", city: "Maryland, USA" },

// Wisconsin
{ name: "Milwaukee", city: "Wisconsin, USA" },
{ name: "Madison", city: "Wisconsin, USA" },
{ name: "Green Bay", city: "Wisconsin, USA" },
{ name: "Kenosha", city: "Wisconsin, USA" },

// Colorado
{ name: "Denver", city: "Colorado, USA" },
{ name: "Colorado Springs", city: "Colorado, USA" },
{ name: "Aurora", city: "Colorado, USA" },
{ name: "Fort Collins", city: "Colorado, USA" },

// Minnesota
{ name: "Minneapolis", city: "Minnesota, USA" },
{ name: "Saint Paul", city: "Minnesota, USA" },
{ name: "Rochester", city: "Minnesota, USA" },
{ name: "Duluth", city: "Minnesota, USA" },

// South Carolina
{ name: "Charleston", city: "South Carolina, USA" },
{ name: "Columbia", city: "South Carolina, USA" },
{ name: "North Charleston", city: "South Carolina, USA" },

// Alabama
{ name: "Birmingham", city: "Alabama, USA" },
{ name: "Montgomery", city: "Alabama, USA" },
{ name: "Mobile", city: "Alabama, USA" },
{ name: "Huntsville", city: "Alabama, USA" },

// Louisiana
{ name: "New Orleans", city: "Louisiana, USA" },
{ name: "Baton Rouge", city: "Louisiana, USA" },
{ name: "Shreveport", city: "Louisiana, USA" },

// Kentucky
{ name: "Louisville", city: "Kentucky, USA" },
{ name: "Lexington", city: "Kentucky, USA" },
{ name: "Bowling Green", city: "Kentucky, USA" },

// Oregon
{ name: "Portland", city: "Oregon, USA" },
{ name: "Salem", city: "Oregon, USA" },
{ name: "Eugene", city: "Oregon, USA" },

// Oklahoma
{ name: "Oklahoma City", city: "Oklahoma, USA" },
{ name: "Tulsa", city: "Oklahoma, USA" },
{ name: "Norman", city: "Oklahoma, USA" },

{ name: "Las Vegas", city: "Nevada, USA" },
{ name: "Reno", city: "Nevada, USA" },

// Connecticut
{ name: "Bridgeport", city: "Connecticut, USA" },
{ name: "New Haven", city: "Connecticut, USA" },
{ name: "Hartford", city: "Connecticut, USA" },

// Iowa
{ name: "Des Moines", city: "Iowa, USA" },
{ name: "Cedar Rapids", city: "Iowa, USA" },

// Arkansas
{ name: "Little Rock", city: "Arkansas, USA" },
{ name: "Fort Smith", city: "Arkansas, USA" },

// Mississippi
{ name: "Jackson", city: "Mississippi, USA" },

// Kansas
{ name: "Wichita", city: "Kansas, USA" },
{ name: "Overland Park", city: "Kansas, USA" },

// Utah
{ name: "Salt Lake City", city: "Utah, USA" },
{ name: "West Valley City", city: "Utah, USA" },

// New Mexico
{ name: "Albuquerque", city: "New Mexico, USA" },

// West Virginia
{ name: "Charleston", city: "West Virginia, USA" },

// Hawaii
{ name: "Honolulu", city: "Hawaii, USA" },

// New Hampshire
{ name: "Manchester", city: "New Hampshire, USA" },

// Maine
{ name: "Portland", city: "Maine, USA" },

// Rhode Island
{ name: "Providence", city: "Rhode Island, USA" },

// Montana
{ name: "Billings", city: "Montana, USA" },

// Delaware
{ name: "Wilmington", city: "Delaware, USA" },

// South Dakota
{ name: "Sioux Falls", city: "South Dakota, USA" },

// North Dakota
{ name: "Fargo", city: "North Dakota, USA" },

// Alaska
{ name: "Anchorage", city: "Alaska, USA" },

// Vermont
{ name: "Burlington", city: "Vermont, USA" },

// Wyoming
{ name: "Cheyenne", city: "Wyoming, USA" },

// SF Neighborhoods
{ name: "Japantown", city: "San Francisco, CA, USA" },
{ name: "Jackson Square", city: "San Francisco, CA, USA" },
{ name: "Mission District", city: "San Francisco, CA, USA" },
{ name: "Castro District", city: "San Francisco, CA, USA" },
{ name: "Haight-Ashbury", city: "San Francisco, CA, USA" },
{ name: "Nob Hill", city: "San Francisco, CA, USA" },
{ name: "North Beach", city: "San Francisco, CA, USA" },
{ name: "Union Square", city: "San Francisco, CA, USA" },
{ name: "Chinatown", city: "San Francisco, CA, USA" },
{ name: "Marina District", city: "San Francisco, CA, USA" },
{ name: "Financial District", city: "San Francisco, CA, USA" },
{ name: "Presidio", city: "San Francisco, CA, USA" },
{ name: "Golden Gate Park", city: "San Francisco, CA, USA" },
{ name: "SOMA", city: "San Francisco, CA, USA" },
{ name: "Hayes Valley", city: "San Francisco, CA, USA" },
{ name: "Tenderloin", city: "San Francisco, CA, USA" },
{ name: "Lower Haight", city: "San Francisco, CA, USA" },
{ name: "Bernal Heights", city: "San Francisco, CA, USA" },
{ name: "Glen Park", city: "San Francisco, CA, USA" },
{ name: "Noe Valley", city: "San Francisco, CA, USA" },
{ name: "Cole Valley", city: "San Francisco, CA, USA" },
{ name: "Inner Sunset", city: "San Francisco, CA, USA" },
{ name: "Outer Sunset", city: "San Francisco, CA, USA" },
{ name: "Inner Richmond", city: "San Francisco, CA, USA" },
{ name: "Outer Richmond", city: "San Francisco, CA, USA" },
{ name: "Fillmore", city: "San Francisco, CA, USA" },
{ name: "Western Addition", city: "San Francisco, CA, USA" },
{ name: "Pacific Heights", city: "San Francisco, CA, USA" },
{ name: "Russian Hill", city: "San Francisco, CA, USA" },
{ name: "Telegraph Hill", city: "San Francisco, CA, USA" },
{ name: "Embarcadero", city: "San Francisco, CA, USA" },
{ name: "Potrero Hill", city: "San Francisco, CA, USA" },
{ name: "Dogpatch", city: "San Francisco, CA, USA" },

// International
{ name: "London", city: "United Kingdom" },
{ name: "Paris", city: "France" },
{ name: "Tokyo", city: "Japan" },
{ name: "Berlin", city: "Germany" },
{ name: "Amsterdam", city: "Netherlands" },
{ name: "Barcelona", city: "Spain" },
{ name: "Rome", city: "Italy" },
{ name: "Toronto", city: "Canada" },
{ name: "Vancouver", city: "Canada" },
{ name: "Montreal", city: "Canada" },
{ name: "Sydney", city: "Australia" },
{ name: "Melbourne", city: "Australia" }];


export default function LocationFilter({ value, onChange, theme = 'dark' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const inputRef = useRef(null);

  // Debounce the filter update to the parent to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if the search term has actually changed
      if (value !== searchTerm) {
        onChange(searchTerm);
      }
    }, 300); // 300ms delay for smoother typing

    return () => clearTimeout(timer);
  }, [searchTerm, onChange, value]);

  const handleLocationSelect = (location) => {
    setSearchTerm(location.name); // Update local state immediately for responsiveness
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (searchTerm.length >= 2) {
        setIsOpen(true);
      }
    }
  };

  const filteredLocations = locationSuggestions.filter((location) =>
  location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const themeClasses = theme === 'light' ?
  'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300' :
  'bg-black/60 backdrop-blur-sm text-white hover:bg-black/70 border border-white/30';

  const inputThemeClasses = theme === 'light' ?
  'text-gray-900 placeholder:text-gray-500' :
  'text-white placeholder:text-gray-300';

  return (
    <div className="relative flex-shrink-0">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div onClick={handleContainerClick} className="bg-transparent text-white px-3 font-bold text-left rounded-full flex items-center w-auto justify-start h-8 cursor-text backdrop-blur-sm hover:bg-white/70 border border-white/30">
            <MapPin className="mr-1 h-3 w-3 flex-shrink-0 text-white font-bold" strokeWidth={2.5} />
            <Input
              ref={inputRef}
              placeholder="Location"
              value={searchTerm}
              onChange={handleInputChange} className="flex rounded-md border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-0 bg-transparent focus-visible:ring-0 text-xs p-0 h-auto w-20 min-w-0 text-white placeholder:text-white/70 font-bold " />


          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 p-0 bg-white border-gray-200 text-gray-900 max-h-80 overflow-y-auto shadow-lg z-[2000]"
          align="start"
          sideOffset={5}>

          <div className="p-2">
            {filteredLocations.slice(0, 20).map((location, index) =>
            <button
              key={index}
              onClick={() => handleLocationSelect(location)}
              className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3">

                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-base mb-1">
                    {location.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {location.city}
                  </div>
                </div>
              </button>
            )}
            {filteredLocations.length === 0 && searchTerm.length >= 2 &&
            <div className="p-4 text-gray-500 text-center text-sm">
                No locations found for "{searchTerm}"
              </div>
            }
            {searchTerm.length < 2 &&
            <div className="p-4 text-gray-500 text-center text-sm">
                Type at least 2 characters to search
              </div>
            }
          </div>
        </PopoverContent>
      </Popover>
    </div>);

}