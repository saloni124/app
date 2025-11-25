
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Calendar, ArrowLeft, Map } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SettingsCalendar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-introducing preference states and saving state as per outline
  const [calendarPreference, setCalendarPreference] = useState('google');
  const [mapPreference, setMapPreference] = useState('google');
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const fetchedUser = await User.me();
      setUser(fetchedUser); // Keep full user object
      setCalendarPreference(fetchedUser.calendar_preference || 'google');
      setMapPreference(fetchedUser.map_preference || 'google');
      setAutoAddToCalendar(fetchedUser.auto_add_to_calendar || false);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-introducing handleSave function as per outline
  const handleSave = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        calendar_preference: calendarPreference,
        map_preference: mapPreference,
        auto_add_to_calendar: autoAddToCalendar
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Removed individual handlers (handleCalendarChange, handleMapChange, handleAutoAddToggle) as per outline,
  // which implies direct state updates and a single save action.

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
          <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900">

            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Calendar & Map
          </h1>
        </div>

        <div className="space-y-6 px-4">
          {/* Calendar Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} className="bg-white mt-3 p-6 rounded-2xl shadow-sm border border-gray-200">


            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Preferred Calendar App
            </h2>
            <p className="text-gray-500 text-sm mb-4">
                Choose your preferred calendar for adding events.
            </p>
            <Select value={calendarPreference} onValueChange={setCalendarPreference}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a calendar..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="apple">Apple Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                </SelectContent>
            </Select>
          </motion.div>

          {/* Calendar Synchronization - NEW SECTION as per outline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> {/* Re-using calendar icon */}
                Calendar Synchronization
            </h2>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Auto-add to calendar</h3>
                    <p className="text-sm text-gray-500">
                        Automatically add events you RSVP "Going" to your preferred calendar.
                    </p>
                </div>
                <Switch
                checked={autoAddToCalendar}
                onCheckedChange={setAutoAddToCalendar} />

            </div>
          </motion.div>

          {/* Map Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-600" />
                Default Map App
            </h2>
            <p className="text-gray-500 mb-4">
                Choose your preferred app for opening event locations.
            </p>
            <Select value={mapPreference} onValueChange={setMapPreference}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a map app..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="google">Google Maps</SelectItem>
                    <SelectItem value="apple">Apple Maps</SelectItem>
                    <SelectItem value="waze">Waze</SelectItem>
                </SelectContent>
            </Select>
          </motion.div>
        </div>

        {/* Save Button - Re-added as per outline */}
        <div className="mt-8 px-4">
            <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </div>
    </div>);

}