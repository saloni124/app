import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import {
  Dialog, // Keeping Dialog imports in case they are needed for other features in the future, even if not used here
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { ArrowLeft, Loader2, User as UserIcon, Building, ShieldAlert, Users, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function SettingsAccountType() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileStructure, setProfileStructure] = useState('individual');
  const [isBusinessAccount, setIsBusinessAccount] = useState(false); // Renamed from isBusiness

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states are removed as per the new UI outline
  // const [isConfirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
  // const [isConfirmAdminOverrideOpen, setConfirmAdminOverrideOpen] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        // Set initial state from user data, with defaults
        setProfileStructure(user.profile_structure || 'individual');
        setIsBusinessAccount(user.account_type === 'business'); // Using new state name
      } catch (error) {
        // If user is not logged in, redirect
        navigate(createPageUrl('Login'));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Combined logic from handleSaveInitiation and handleConfirmSave
  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToUpdate = {
        profile_structure: profileStructure
      };

      // Only update account_type if it's changing TO business.
      // Changing FROM business is not allowed via UI as per "permanent" rule and original logic.
      if (currentUser.account_type !== 'business' && isBusinessAccount) {
        dataToUpdate.account_type = 'business';
      }

      await User.updateMyUserData(dataToUpdate);
      navigate(createPageUrl('Profile'));
    } catch (error) {
      console.error('Failed to update account type', error);
    } finally {
      setSaving(false);
    }
  };

  // handleAdminOverride and its dialog functionality are removed as they are not in the new UI outline
  // const handleAdminOverride = async () => {
  //   setConfirmAdminOverrideOpen(false);
  //   setSaving(true);
  //   try {
  //     await User.updateMyUserData({ account_type: 'personal' });
  //     window.location.reload(); // Reload to reflect changes
  //   } catch (error) {
  //     console.error('Failed to remove business status:', error);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  // Business status is locked if the account_type is 'business'
  const isLocked = currentUser?.account_type === 'business';

  // Check if there are changes to save
  const hasChanges = profileStructure !== (currentUser.profile_structure || 'individual') || isBusinessAccount !== isLocked;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-800 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="mt-12 text-2xl font-bold text-center flex items-center gap-2">Account Type


              </h1>
              <p className="text-sm text-gray-500 mt-1">Switch between personal and business features</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 space-y-6">
            {/* Profile Structure Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">1. Profile Structure</h3>
              <div className="space-y-3">
                <label
                  className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  style={{ borderColor: profileStructure === 'individual' ? '#3B82F6' : '#E5E7EB' }}>
                  <input
                    type="radio"
                    name="profileStructure"
                    value="individual"
                    checked={profileStructure === 'individual'}
                    onChange={(e) => setProfileStructure(e.target.value)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={saving} />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-blue-600" /> {/* Using UserIcon for consistency with original */}
                      <span className="font-medium">Individual Account</span>
                    </div>
                    <p className="text-sm text-gray-500">For a single person representing themselves.</p>
                  </div>
                </label>

                <label
                  className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  style={{ borderColor: profileStructure === 'community' ? '#3B82F6' : '#E5E7EB' }}>
                  <input
                    type="radio"
                    name="profileStructure"
                    value="community"
                    checked={profileStructure === 'community'}
                    onChange={(e) => setProfileStructure(e.target.value)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={saving} />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Community Account</span>
                    </div>
                    <p className="text-sm text-gray-500">For an organization, brand, or community.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Business Status Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">2. Business Status</h3>
              <label
                className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${isBusinessAccount ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} ${isLocked || saving ? 'cursor-not-allowed opacity-60' : ''}`}>
                <input
                  type="checkbox"
                  checked={isBusinessAccount}
                  onChange={(e) => !isLocked && setIsBusinessAccount(e.target.checked)} // Preserve 'isLocked' functionality
                  disabled={isLocked || saving} // Preserve 'isLocked' functionality
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                <div className="flex-1">
                  <span className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>This is a business account.</span>
                  <p className="text-sm text-gray-600 mt-1">Enable business features on your account.</p>
                </div>
              </label>

              {isBusinessAccount && !isLocked && // Show warning if enabling business account and not already one
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Warning:</p>
                      <p className="text-sm text-blue-700">
                        This change is permanent. To revert, you must contact support. Business accounts cannot leave reviews on events.
                      </p>
                    </div>
                  </div>
                </motion.div>
              }

              {isLocked && // Show locked message if already a business
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>Your account is a business account. To change this, please contact support at <a href="mailto:support@onesocial.co" className="font-medium text-blue-600 hover:underline">support@onesocial.co</a>.</span>
                </motion.div>
              }
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges} // Disable if saving or no changes
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
            {saving ?
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </> :

            'Save Changes'
            }
          </Button>
        </motion.div>
      </div>
    </div>);

}