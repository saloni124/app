import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    ArrowLeft,
    Shield,
    Eye,
    Mail,
    Calendar,
    Users,
    Loader2,
    Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function SettingsPrivacy() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // This state manages settings that were previously either nested under 'privacy_settings'
    // or direct user properties. Now, all these are grouped here for a single batched save.
    const [settings, setSettings] = useState({
        profile_visibility: 'public', // 'public' or 'private'
        show_email: false,
        show_phone: false,
        allow_event_invites: 'everyone', // 'everyone', 'followers', 'following', 'none'
        show_attending_events: true,
        show_saved_events: false,
        allow_tagging: true,
        show_follower_count: true,
        show_following_count: true,
        attendance_visibility: 'all_followers', // 'all_followers' or 'mutual_followers'
        // These two were previously direct user properties, now managed in 'settings' state
        show_my_written_reviews: true,
        show_reviews_on_my_events: true,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const fetchedUser = await User.me();
            setUser(fetchedUser);

            const privacySettings = fetchedUser.privacy_settings || {};
            setSettings(prev => ({
                ...prev, // Start with default settings defined above
                ...privacySettings, // Override with user's saved 'privacy_settings'
                // Explicitly set the two review-related settings, which might be direct user properties or part of privacy_settings
                show_my_written_reviews: fetchedUser.show_my_written_reviews ?? true,
                show_reviews_on_my_events: fetchedUser.show_reviews_on_my_events ?? true,
            }));
        } catch (error) {
            console.error("Error loading user data:", error);
            // In a real application, you might show a user-friendly error message here.
        } finally {
            setLoading(false);
        }
    };

    // Handler for changes to properties within the 'settings' state.
    // These changes are batched and saved when the "Save Privacy Settings" button is clicked.
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // REMOVED: handleToggle function is no longer needed as all toggles are now handled by handleSettingChange
    // and saved together via handleSave.

    const handleSave = async () => {
        if (!user) return; // Ensure user data is loaded

        setSaving(true); // Set saving state to true

        try {
            // Construct the payload by spreading all current 'settings' state
            // This assumes the backend's User.updateMyUserData can correctly
            // process a flat object containing both privacy_settings fields and direct user fields.
            const payload = {
                ...settings,
            };

            // Call the User API to update data.
            await User.updateMyUserData(payload);

            // Fetch the updated user data to ensure the frontend state is fully synchronized
            // with the backend after the save operation.
            const updatedUser = await User.me();
            setUser(updatedUser);

            console.log('✅ Privacy settings saved successfully');

        } catch (error) {
            console.error('Error saving privacy settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false); // Reset saving state
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isBusinessAccount = user?.account_type === 'business';

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
                    <button
                        onClick={() => navigate(createPageUrl("SettingsIndex"))}
                        className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Privacy & Audience
                    </h1>
                </div>

                <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                    {/* FIXED: Merged Reviews section into one box */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-white rounded-2xl p-0 shadow-sm border border-gray-200">
                            <CardHeader className="p-6 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">Reviews</CardTitle>
                                        <CardDescription className="text-sm text-gray-500">Control review visibility</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6 pt-0">
                                {/* Only show "Show reviews I've written" for personal accounts */}
                                {!isBusinessAccount && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Show reviews I've written</p>
                                            <p className="text-xs text-gray-500">Display reviews you've left on your profile</p>
                                        </div>
                                        <Switch
                                            checked={settings.show_my_written_reviews}
                                            onCheckedChange={(value) => handleSettingChange('show_my_written_reviews', value)}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Show reviews on my events</p>
                                        <p className="text-xs text-gray-500">Allow others to see reviews left on your hosted events</p>
                                    </div>
                                    <Switch
                                        checked={settings.show_reviews_on_my_events}
                                        onCheckedChange={(value) => handleSettingChange('show_reviews_on_my_events', value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Profile Visibility */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Profile Visibility</h2>
                                <p className="text-sm text-gray-500">Control who can see your profile</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Profile Type</span>
                                <Select
                                    value={settings.profile_visibility}
                                    onValueChange={(value) => handleSettingChange('profile_visibility', value)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {settings.profile_visibility === 'public' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-blue-50 rounded-lg p-4 border border-blue-200 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Event Attendance Visibility</p>
                                            <p className="text-xs text-blue-700">Control who can see events you're attending</p>
                                        </div>
                                    </div>
                                    <Select
                                        value={settings.attendance_visibility}
                                        onValueChange={(value) => handleSettingChange('attendance_visibility', value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_followers">All Followers</SelectItem>
                                            <SelectItem value="mutual_followers">Only Followers I Follow Back</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Contact Information</h2>
                                <p className="text-sm text-gray-500">Choose what contact info to display</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Show Email Address</span>
                                <Switch
                                    checked={settings.show_email}
                                    onCheckedChange={(value) => handleSettingChange('show_email', value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Show Phone Number</span>
                                <Switch
                                    checked={settings.show_phone}
                                    onCheckedChange={(value) => handleSettingChange('show_phone', value)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Event Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Event Privacy</h2>
                                <p className="text-sm text-gray-500">Control your event-related privacy</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">Who can invite me to events</span>
                                    <p className="text-xs text-gray-500">Control who can send you event invitations</p>
                                </div>
                                <Select
                                    value={settings.allow_event_invites}
                                    onValueChange={(value) => handleSettingChange('allow_event_invites', value)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everyone">Everyone</SelectItem>
                                        <SelectItem value="followers">Followers</SelectItem>
                                        <SelectItem value="following">Following</SelectItem>
                                        <SelectItem value="none">No One</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">Who can add me to group chats</span>
                                    <p className="text-xs text-gray-500">Control who can add you to group chats</p>
                                </div>
                                <Select
                                    value={settings.allow_group_chat_adds || 'everyone'}
                                    onValueChange={(value) => handleSettingChange('allow_group_chat_adds', value)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everyone">Everyone</SelectItem>
                                        <SelectItem value="followers">Followers</SelectItem>
                                        <SelectItem value="following">Following</SelectItem>
                                        <SelectItem value="none">No One</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">Show events I'm attending</span>
                                    <p className="text-xs text-gray-500">Let others see events you're going to</p>
                                </div>
                                <Switch
                                    checked={settings.show_attending_events}
                                    onCheckedChange={(value) => handleSettingChange('show_attending_events', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">Show saved events</span>
                                    <p className="text-xs text-gray-500">Let others see events you've saved</p>
                                </div>
                                <Switch
                                    checked={settings.show_saved_events}
                                    onCheckedChange={(value) => handleSettingChange('show_saved_events', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium">Allow tagging in events</span>
                                    <p className="text-xs text-gray-500">Let others tag you in event posts</p>
                                </div>
                                <Switch
                                    checked={settings.allow_tagging}
                                    onCheckedChange={(value) => handleSettingChange('allow_tagging', value)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Profile Stats</h2>
                                <p className="text-sm text-gray-500">Control what stats are visible on your profile</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Show follower count</span>
                                <Switch
                                    checked={settings.show_follower_count}
                                    onCheckedChange={(value) => handleSettingChange('show_follower_count', value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Show following count</span>
                                <Switch
                                    checked={settings.show_following_count}
                                    onCheckedChange={(value) => handleSettingChange('show_following_count', value)}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave} // Updated to call the new handleSave function
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Privacy Settings'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}