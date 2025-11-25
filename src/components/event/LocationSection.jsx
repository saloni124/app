
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Lock, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from "@/components/ui/button";

// Fix for default marker icon in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

export default function LocationSection({ event, canSeePrivateDetails }) {
  const position = event?.latitude && event?.longitude ? [event.latitude, event.longitude] : null;

  const handleOpenInMaps = () => {
    if (position) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`, '_blank');
    }
  };

  // Handle both function and boolean values for canSeePrivateDetails
  const canSeeDetails = typeof canSeePrivateDetails === 'function' ? canSeePrivateDetails() : canSeePrivateDetails;

  // Don't render the entire LocationSection if user can't see private details
  if (event.privacy_level === 'private' && !canSeeDetails) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Location</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <p className="text-sm font-medium">{event.venue_name || "Venue details unavailable"}</p>
          </div>
          <p className="text-sm text-gray-500 ml-6">{event.location}</p>
        </div>
        {position &&
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenInMaps} className="bg-background text-slate-950 px-3 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-9 rounded-md flex-shrink-0">


            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </Button>
        }
      </div>

      {position ?
      <div className="h-48 md:h-64 rounded-lg overflow-hidden border border-gray-200">
          <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            <Marker position={position}>
              <Popup>
                {event.title} at {event.venue_name}
              </Popup>
            </Marker>
          </MapContainer>
        </div> :

      <div className="h-48 md:h-64 rounded-lg bg-gray-100 flex items-center justify-center text-center text-gray-500">
            <div>
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>Map data not available.</p>
            </div>
          </div>

      }
    </div>);

}