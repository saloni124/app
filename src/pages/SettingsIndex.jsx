
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { ChevronRight, User as UserIcon, Lock, Cpu, Bell, Shield, Activity, Calendar, Share2, Users, HelpCircle, Contact, Archive, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const settingGroups = [
  {
    title: 'My Account',
    settings: [
      { title: 'Account Controls', description: 'Manage account security and deletion.', icon: Lock, page: 'SettingsAccountControls' },
      { title: 'AI Controls', description: 'Manage AI-powered features and personalization.', icon: Cpu, page: 'SettingsAIControls' }
    ]
  },
  {
    title: 'Preferences & Privacy',
    settings: [
      { title: 'Notifications', description: 'Choose what alerts you receive from us.', icon: Bell, page: 'SettingsNotifications' },
      { title: 'Privacy & Audience', description: 'Control who can see your activity.', icon: Shield, page: 'SettingsPrivacy' },
      { title: 'Your Activity', description: 'View and manage your interaction history.', icon: Activity, page: 'SettingsActivity' },
      { title: 'Archive', description: 'View your archived content.', icon: Archive, page: 'SettingsArchive' }
    ]
  },
  {
    title: 'Connections',
    settings: [
      { title: 'Calendar & Map', description: 'Set your default app preferences.', icon: Calendar, page: 'SettingsCalendar' },
      { title: 'Connected Accounts', description: 'Link your social and event accounts.', icon: Share2, page: 'SettingsConnectedAccounts' },
      { title: 'Sync Contacts', description: 'Find friends from other platforms.', icon: Contact, page: 'SettingsSyncContacts' }
    ]
  },
  {
    title: 'Safety & Support',
    settings: [
      { title: 'Blocked Users', description: 'Manage accounts you have blocked.', icon: Users, page: 'SettingsBlocked' },
      { title: 'Help & Support', description: 'Find answers and get in touch.', icon: HelpCircle, page: 'SettingsSupport' }
    ]
  }
];

const SettingItem = ({ icon: Icon, title, description, page }) =>
  <Link to={createPageUrl(page)} className="block group">
    <div className="flex items-center p-4 mx-2 transition-colors group-hover:bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-grow">
        <h4 className="text-gray-800 text-base font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </Link>;

export default function SettingsIndex() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        if (authBypassed) {
          const user = simulatedDataManager.getBypassUser();
          setCurrentUser(user);
        } else {
          // If not auth bypassed, redirect to Profile with logout param
          navigate(createPageUrl("Profile") + "?logout=true");
        }
      } catch (error) {
        console.error('Settings: Error loading user:', error);
        // On error, also redirect to Profile with logout param
        navigate(createPageUrl("Profile") + "?logout=true");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center">
          <button
            onClick={() => navigate(createPageUrl("Profile"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-2xl font-bold">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-6 px-4"
        >
          {settingGroups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">{group.title}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {group.settings.map((setting, settingIdx) => (
                  <SettingItem key={settingIdx} {...setting} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
