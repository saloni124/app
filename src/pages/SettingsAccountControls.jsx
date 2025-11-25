import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input }
 from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, ChevronRight, Mail, Shield, Trash2, LogOut, Briefcase, EyeOff, AlertTriangle, Lock, Settings, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { simulatedDataManager } from '@/components/simulatedDataManager';
import { base44 } from '@/api/base44Client';

const DeleteDialogDescription = () => (
    <div className="space-y-4 pt-2">
        <p className="text-sm text-gray-600 flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0" />
            <span>This will permanently delete all your data including:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 pl-7">
            <li>Your profile and posts</li>
            <li>Event history and reviews</li>
            <li>Saved events and collections</li>
            <li>All messages and connections</li>
        </ul>
        <p className="text-sm text-gray-600">
            Consider deactivating your account first if you just want to take a break.
        </p>
        <p className="text-sm text-gray-600">
            Deleted accounts can be recovered within 30 days. After that, all data is permanently lost.
        </p>
    </div>
);

export default function SettingsAccountControls() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    description: '',
    action: null,
    confirmText: 'Confirm',
    dangerLevel: 'normal',
  });
  const [showAdminOverrideDialog, setShowAdminOverrideDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Placeholder for future use
  const [isSaving, setIsSaving] = useState(false);     // Placeholder for future use

  useEffect(() => {
      window.scrollTo(0, 0);

      const fetchUser = async () => {
        try {
          const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
          const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
          const isDemo = localStorage.getItem('bypass_mode') === 'demo';

          if (authBypassed && (isAdmin || isDemo)) {
            const baseUser = simulatedDataManager.getBaseUser();
            let user = null;
            
            if (isAdmin) {
              const adminOverrides = simulatedDataManager.getAdminUserUpdates();
              user = { ...baseUser, ...adminOverrides, _isAdminMode: true };
            } else {
              user = simulatedDataManager.applyDemoOverrides(baseUser);
            }
            console.log('✅ SettingsAccountControls: Using bypass user:', user?.email);
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
  }, []);

  const handleLogout = async () => {
    console.log('🚪 LOGOUT: Starting logout process');
    
    simulatedDataManager.clearSimulatedSession();
    console.log('✅ Cleared simulated session flags');
    
    try {
      await base44.auth.logout(createPageUrl('Feed'));
      console.log('✅ base44.auth.logout() completed, redirecting to Feed');
    } catch (error) {
      console.error('❌ Error during base44.auth.logout():', error);
      window.location.href = createPageUrl('Feed');
    }
  };

  const handleDeactivateAccount = () => {
    alert("Account deactivated. Your profile will be hidden and you will be logged out. You can reactivate your account anytime by logging back in.");
  };

  const handleDeleteAccount = () => {
    alert("Account deletion initiated. You have 30 days to recover your account by logging back in. Check your email for further instructions.");
  };

  const openDialog = (content) => {
    setDialogContent(content);
    setDialogOpen(true);
  };

  const handleAdminOverride = () => {
    if (!simulatedDataManager.isAdminMode() && !simulatedDataManager.isDemoMode()) {
      console.warn("Admin override attempted without admin or demo mode.");
      return;
    }
    if (!currentUser) {
      console.warn("Cannot perform admin override, currentUser is not set.");
      return;
    }

    const newAccountType = currentUser.account_type === 'business' ? 'personal' : 'business';

    simulatedDataManager.updateSimulatedUser({ account_type: newAccountType });

    // Reload the page to reflect changes
    window.location.reload();
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Saving changes (placeholder function)");
    setHasChanges(false); // Reset changes after saving
    setIsSaving(false);
  };

  const controlItems = [
    {
      title: 'Account Type',
      icon: Briefcase,
      action: () => navigate(createPageUrl("SettingsAccountType")),
    },
    {
      title: 'Change Email',
      icon: Mail,
      action: () => openDialog({
        title: 'Change Email Address',
        description: 'This will require verification of your new email address. You will receive a confirmation link at your new email.',
        action: () => alert('Email change feature coming soon!'),
        confirmText: 'Send Verification Email',
        dangerLevel: 'normal',
      }),
    },
    {
      title: 'Change Password',
      icon: Shield,
      action: () => openDialog({
        title: 'Change Password',
        description: 'You will be sent a secure link to reset your password.',
        action: () => alert('Password reset feature coming soon!'),
        confirmText: 'Send Reset Link',
        dangerLevel: 'normal',
      }),
    },
    {
      title: 'Sign Out',
      icon: LogOut,
      action: () => openDialog({
        title: 'Sign Out',
        description: 'Are you sure you want to sign out of your account?',
        action: handleLogout,
        confirmText: 'Sign Out',
        dangerLevel: 'normal',
      }),
    },
    {
      title: 'Deactivate Account',
      icon: EyeOff,
      action: () => openDialog({
        title: 'Deactivate Your Account?',
        description: 'Deactivating is temporary. Your profile will be hidden and you will be logged out. You can reactivate your account anytime by logging back in.',
        action: handleDeactivateAccount,
        confirmText: 'Deactivate',
        dangerLevel: 'warning',
      }),
    },
    {
      title: 'Delete Account',
      icon: Trash2,
      action: () => openDialog({
        title: 'Delete Your Account?',
        description: <DeleteDialogDescription />,
        action: handleDeleteAccount,
        confirmText: 'Delete Account',
        dangerLevel: 'critical',
      }),
    },
  ];

  const getButtonClass = () => {
    switch (dialogContent.dangerLevel) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white mb-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white mb-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white mb-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10';
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
            <Lock className="w-6 h-6" />
            Account Controls
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
          <div className="space-y-1">
            {controlItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}>
                <button onClick={item.action} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Admin Override Button */}
        {(simulatedDataManager.isAdminMode() || simulatedDataManager.isDemoMode()) && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <button
              onClick={() => setShowAdminOverrideDialog(true)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Admin Override</p>
                  <p className="text-sm text-gray-500">Switch account type for testing</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </motion.div>
        )}

        {/* Disable Admin Override Button */}
        {currentUser?._isAdminMode && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                simulatedDataManager.setAdminMode(false);
                window.location.reload();
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Disable Admin Override
            </Button>
          </div>
        )}

        {/* Save Button (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription asChild>
              <div>{dialogContent.description}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (dialogContent.action) {
                  dialogContent.action();
                }
                setDialogOpen(false);
              }}
              className={getButtonClass()}
            >
              {dialogContent.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Override Dialog */}
      <Dialog open={showAdminOverrideDialog} onOpenChange={setShowAdminOverrideDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Override</DialogTitle>
            <DialogDescription>
              Switch your account type between Personal and Business for testing purposes.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="py-4">
              <p className="text-sm text-gray-700">
                Current account type: <span className="font-semibold">{currentUser.account_type === 'business' ? 'Business' : 'Personal'}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will switch your account to {currentUser.account_type === 'business' ? 'Personal' : 'Business'} mode.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminOverrideDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdminOverride} className="bg-orange-600 hover:bg-orange-700" disabled={!currentUser}>
              Switch to {currentUser?.account_type === 'business' ? 'Personal' : 'Business'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}