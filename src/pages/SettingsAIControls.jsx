import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Cpu, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';

// Helper function to create page URLs based on names
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "SettingsIndex":
    case "Settings": // Added "Settings" case to correctly route to /settings
      return "/settings";
    // Add other cases for different page names if needed
    default:
      console.warn(`Unknown pageName for createPageUrl: ${pageName}`);
      return "/"; // Fallback to home or a default route
  }
};

export default function SettingsAIControls() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // 'saving' state is now used globally, reflecting pending API calls for any AI setting
  const [saving, setSaving] = useState(false);

  // Individual states for AI settings as per the new requirements
  const [aiEventHelp, setAiEventHelp] = useState(true);
  const [aiScheduling, setAiScheduling] = useState(true); // Renamed to AI Event Creator in UI
  const [aiRecommendationsEnabled, setAiRecommendationsEnabled] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadSettings = async () => {
      try {
        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        let user = null;

        if (authBypassed && (isAdmin || isDemo)) {
          user = await base44.auth.me();

          if (isDemo) {
            user = simulatedDataManager.applyDemoOverrides(user);
          }
        } else {
          user = await base44.auth.me();
        }

        if (user) {
          setAiEventHelp(user.ai_event_help ?? true);
          setAiScheduling(user.ai_scheduling ?? true);
          setAiRecommendationsEnabled(user.ai_recommendations_enabled ?? true);
        }
      } catch (error) {
        console.error('Error loading AI settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggleEventHelp = async (newValue) => {
    setAiEventHelp(newValue);
    setSaving(true);

    try {
      if (!simulatedDataManager.isDemoMode()) {
        await base44.auth.updateMe({ ai_event_help: newValue });
      } else {
        simulatedDataManager.updateSimulatedUser({ ai_event_help: newValue });
      }
    } catch (error) {
      console.error('Error updating AI Event Help:', error);
      setAiEventHelp(!newValue);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEventCreator = async (newValue) => {
    setAiScheduling(newValue);
    setSaving(true);

    try {
      if (!simulatedDataManager.isDemoMode()) {
        await base44.auth.updateMe({ ai_scheduling: newValue });
      } else {
        simulatedDataManager.updateSimulatedUser({ ai_scheduling: newValue });
      }
    } catch (error) {
      console.error('Error updating AI Event Creator:', error);
      setAiScheduling(!newValue);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRecommendations = async (newValue) => {
    // Optimistically update the UI
    setAiRecommendationsEnabled(newValue);
    setSaving(true); // Indicate that a save operation is in progress

    try {
      // Only persist to database if NOT in demo mode
      if (!simulatedDataManager.isDemoMode()) {
        await base44.auth.updateMe({ ai_recommendations_enabled: newValue });
      } else {
        // In demo mode, just update the simulated user data in session storage
        simulatedDataManager.updateSimulatedUser({ ai_recommendations_enabled: newValue });
      }
    } catch (error) {
      console.error('Error updating AI recommendations setting:', error);
      // Revert the UI state if the save fails
      setAiRecommendationsEnabled(!newValue);
      // Optionally show a toast notification for error
    } finally {
      setSaving(false); // End save indication
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center">
          <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900">

            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-2xl font-bold">AI Controls</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="bg-white mx-3 my-8 px-4 rounded-2xl sm:px-6 lg:px-8 border border-gray-200 shadow-sm">

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">AI Event Help</h3>
                <p className="text-sm text-gray-500 mt-1">Get AI assistance when creating events</p>
              </div>
              <Switch
                checked={aiEventHelp}
                onCheckedChange={handleToggleEventHelp}
                disabled={saving}
              />
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">AI Event Creator</h3>
                <p className="text-sm text-gray-500 mt-1">Let AI help you schedule and organize events</p>
              </div>
              <Switch
                checked={aiScheduling}
                onCheckedChange={handleToggleEventCreator}
                disabled={saving}
              />
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">AI-Powered Recommendations</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Get personalized event recommendations based on your preferences
                </p>
              </div>
              <Switch
                checked={aiRecommendationsEnabled}
                onCheckedChange={handleToggleRecommendations}
                disabled={saving}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            These settings control how AI features interact with your account. You can change them at any time.
          </p>
        </motion.div>
      </div>
    </div>);

}