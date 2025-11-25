
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';

export default function SettingsNotifications() {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const navigate = useNavigate(); // Initialized useNavigate

  const [settings, setSettings] = useState({
    new_events: true,
    event_updates: true,
    event_reminders: true,
    follows: true,
    messages: true,
    event_rsvps: true,
    push_enabled: true,
    email_enabled: true,
    weekly_digest: false,
    promotional_emails: false
  });

  useEffect(() => {
    window.scrollTo(0, 0); // Added this line
    const loadPreferences = async () => {
      try {
        const user = await User.me();
        if (user.notification_preferences) {
          setSettings((prev) => ({ ...prev, ...user.notification_preferences }));
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({
        notification_preferences: settings
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const notificationSections = [
  {
    title: 'Event Notifications',
    settings: [
    { key: 'new_events', label: 'New Events', description: 'Get notified about new events in your area and interests' },
    { key: 'event_updates', label: 'Event Updates', description: 'Changes to events you\'re attending or interested in' },
    { key: 'event_reminders', label: 'Event Reminders', description: 'Reminders before events you\'re attending' }]

  },
  {
    title: 'Social Notifications',
    settings: [
    { key: 'follows', label: 'New Followers', description: 'When someone follows you' },
    { key: 'messages', label: 'Messages', description: 'New messages and chat notifications' },
    { key: 'event_rsvps', label: 'Event RSVPs', description: 'When people RSVP to your events' }]

  },
  {
    title: 'Delivery Preferences',
    settings: [
    { key: 'push_enabled', label: 'Push Notifications', description: 'Receive notifications on your device' },
    { key: 'email_enabled', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'weekly_digest', label: 'Weekly Digest', description: 'Summary of events and activity in your area' }]

  },
  {
    title: 'Marketing',
    settings: [
    { key: 'promotional_emails', label: 'Promotional Content', description: 'Special offers and featured events' }]

  }];


  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8"> {/* Modified padding */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative"> {/* Updated header structure and styling */}
                    <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900">

                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2"> {/* Added text-gray-900 */}
                        <Bell className="w-6 h-6" /> {/* Removed text-gray-900, inherits from h1 */}
                        Notifications
                    </h1>
                </div>

                {/* Expandable Notification Tips at the top */}
                <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
                    <div className="bg-blue-50 mt-4 mr-4 mb-6 ml-4 rounded-2xl border border-blue-200 transition-all">
                        <CollapsibleTrigger asChild>
                            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 cursor-pointer hover:bg-blue-100 transition-colors rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-blue-800">💡 Notification Tips</h3>
                                    <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${tipsOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </motion.button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4">
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Turn on push notifications to never miss last-minute events</li>
                                    <li>• Weekly digest helps you discover events you might have missed</li>
                                    <li>• Event reminders ensure you don't forget about upcoming plans</li>
                                </ul>
                            </motion.div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mx-4"> {/* Added mx-4 */}
                    {notificationSections.map((section, sectionIndex) =>
          <React.Fragment key={section.title}>
                            <div className="px-6 pt-5 pb-2">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {section.title}
                                </h2>
                            </div>
                            
                            <div className="py-2">
                                {section.settings.map((setting) =>
              <motion.div
                key={setting.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 mx-2 hover:bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{setting.label}</h3>
                                            <p className="text-sm text-gray-500">{setting.description}</p>
                                        </div>
                                        <Switch
                  checked={settings[setting.key]}
                  onCheckedChange={() => handleToggle(setting.key)}
                  className="ml-4" />
                                    </motion.div>
              )}
                            </div>

                            {sectionIndex < notificationSections.length - 1 &&
            <div className="px-6">
                                    <div className="border-t border-gray-200"></div>
                                </div>
            }
                        </React.Fragment>
          )}
                </div>

                {saveSuccess &&
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm text-center mx-4"> {/* Added mx-4 */}
                        Settings saved successfully!
                    </motion.div>
        }

                <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-8 py-3 rounded-xl mx-4 max-w-[calc(100%-2rem)] block"> {/* Added mx-4 and max-w */}
                    {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
            </div>
        </div>);

}