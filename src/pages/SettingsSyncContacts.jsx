
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Instagram, Smartphone, Loader2, CheckCircle, Contact } from 'lucide-react';
import { motion } from 'framer-motion';

// This placeholder function is added to ensure the file is functional
// as `createPageUrl` was not defined in the original context or imports.
// In a real application, this would typically be imported from a routing utility.
const createPageUrl = (pageName) => {
  if (pageName === "SettingsIndex") {
    return "/settings"; // Assuming "/settings" is the path for the SettingsIndex page
  }
  // Fallback for other cases or to indicate an unhandled pageName
  console.warn(`createPageUrl received unknown pageName: ${pageName}. Returning root path.`);
  return "/";
};

const SyncOption = ({ icon: Icon, title, description, onSync, syncing, synced }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <Button onClick={onSync} disabled={syncing || synced} className="bg-blue-600 hover:bg-blue-700 text-white">
      {syncing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : synced ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Synced
        </>
      ) : (
        "Sync"
      )}
    </Button>
  </motion.div>
);

export default function SettingsSyncContacts() {
  const navigate = useNavigate();
  const [syncingInsta, setSyncingInsta] = useState(false);
  const [syncedInsta, setSyncedInsta] = useState(false);
  const [syncingPhone, setSyncingPhone] = useState(false);
  const [syncedPhone, setSyncedPhone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSync = (platform) => {
    if (platform === 'instagram') {
      setSyncingInsta(true);
      setTimeout(() => {
        setSyncingInsta(false);
        setSyncedInsta(true);
      }, 2500);
    } else if (platform === 'phone') {
      setSyncingPhone(true);
      setTimeout(() => {
        setSyncingPhone(false);
        setSyncedPhone(true);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
          <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
            <Contact className="w-6 h-6" />
            Sync Contacts
          </h1>
        </div>

        <div className="space-y-4 px-4">
          <SyncOption
            icon={Instagram}
            title="Instagram"
            description="Find friends who are also on the app."
            onSync={() => handleSync('instagram')}
            syncing={syncingInsta}
            synced={syncedInsta}
          />
          <SyncOption
            icon={Smartphone}
            title="Phone Contacts"
            description="Connect with people from your address book."
            onSync={() => handleSync('phone')}
            syncing={syncingPhone}
            synced={syncedPhone}
          />
        </div>
      </div>
    </div>
  );
}
