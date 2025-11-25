import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { simulatedDataManager } from "@/components/simulatedDataManager";
import { base44 } from "@/api/base44Client";
import { CheckCircle } from "lucide-react";

export default function EditProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    instagram_handle: "",
    phone_number: "",
    website: "",
    location: "",
    is_verified: false
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(avatarPreviewUrl);
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [avatarPreviewUrl, coverPreviewUrl]);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        // Check if authentication is bypassed and if it's an admin or demo session
        if (!authBypassed || (!isAdmin && !isDemo)) {
          navigate(createPageUrl("Profile") + "?logout=true");
          return;
        }

        const baseUser = simulatedDataManager.getBaseUser();
        let user = null;
        
        if (isAdmin) {
          user = { ...baseUser, _isAdminMode: true };
        } else {
          user = simulatedDataManager.applyDemoOverrides(baseUser);
          user._isDemoMode = true;
        }
        
        if (!user) {
          navigate(createPageUrl("Profile") + "?logout=true");
          return;
        }
        
        console.log('✅ EditProfile: Loaded user:', user.full_name, isAdmin ? '(ADMIN)' : '(DEMO)');
        
        setCurrentUser(user);
        setFormData({
          full_name: user.full_name || '',
          bio: user.bio || '',
          instagram_handle: user.instagram_handle || '',
          phone_number: user.phone_number || '',
          website: user.website || '',
          location: user.location || '',
          is_verified: user.is_verified || false
        });
        setAvatarPreviewUrl(user.avatar || null);
        setCoverPreviewUrl(user.cover_image || null);
        setAvatarFile(null);
        setCoverFile(null);

      } catch (error) {
        console.error("EditProfile: Error in loadUser:", error);
        navigate(createPageUrl("Profile") + "?logout=true");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const newUrl = URL.createObjectURL(file);

    if (type === 'avatar') {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarFile(file);
      setAvatarPreviewUrl(newUrl);
    } else if (type === 'cover') {
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl);
      setCoverFile(file);
      setCoverPreviewUrl(newUrl);
    }
  };

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const isAdmin = currentUser?._isAdminMode;
      const isDemo = currentUser?._isDemoMode;

      console.log('💾 Saving profile:', { isAdmin, isDemo, formData });

      const updateData = { ...formData };

      // Handle avatar image updates
      if (avatarFile) {
        // New avatar file was uploaded
        updateData.avatar = await fileToDataUrl(avatarFile);
      } else if (avatarPreviewUrl) {
        // No new file, but there's a preview URL (either existing or a temporary blob from a previous selection)
        updateData.avatar = avatarPreviewUrl;
      } else {
        // No file and no preview URL means the avatar was removed
        updateData.avatar = null;
      }

      // Handle cover image updates
      if (coverFile) {
        // New cover file was uploaded
        updateData.cover_image = await fileToDataUrl(coverFile);
      } else if (coverPreviewUrl) {
        // No new file, but there's a preview URL
        updateData.cover_image = coverPreviewUrl;
      } else {
        // No file and no preview URL means the cover image was removed
        updateData.cover_image = null;
      }

      console.log('💾 Update data:', updateData);

      if (isAdmin) {
        // Admin mode: Update the real user data
        await base44.auth.updateMe(updateData);
        console.log('✅ Admin changes saved permanently to database.');
      } else if (isDemo) {
        // Demo mode: Only store temporary overrides in sessionStorage
        await simulatedDataManager.updateSimulatedUser(updateData);
        console.log('✅ Demo changes saved to sessionStorage (temporary).');
      }

      navigate(createPageUrl("Profile"));

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setError("Failed to save profile changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>);

  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}>

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(createPageUrl("Profile"))}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <div className="w-20"></div>
          </div>

          {error &&
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image with Overlaid Profile Picture */}
            <div className="relative">
              <div className="relative h-48 bg-gray-200 rounded-xl overflow-hidden">
                <img
                  src={coverPreviewUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=400&fit=crop'}
                  alt="Cover"
                  className="w-full h-full object-cover" />

                <label className="bg-black/60 text-white mb-32 px-4 py-2 rounded-lg absolute bottom-4 right-4 hover:bg-black/80 cursor-pointer flex items-center gap-2 transition-colors">
                  <Camera className="w-4 h-4" />
                  Change Cover
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    className="hidden" />

                </label>
              </div>

              {/* Profile Picture - Overlaid on Cover */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <img
                    src={avatarPreviewUrl || 'https://via.placeholder.com/128'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />

                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full cursor-pointer shadow-lg">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                      className="hidden" />

                  </label>
                </div>
              </div>
            </div>

            {/* Spacer for overlaid profile picture */}
            <div className="h-16"></div>

            {/* Form Fields */}
            <div className="bg-white rounded-xl p-6 space-y-4 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows={4} />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <Input
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleInputChange}
                  placeholder="@username" />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567" />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <Input
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com" />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State" />

              </div>

              <button
                type="button"
                onClick={() => {
                  const dialog = document.createElement('div');
                  dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999999]';
                  dialog.innerHTML = `
                    <div class="bg-white rounded-2xl p-6 max-w-sm shadow-2xl">
                      <h3 class="text-xl font-bold text-gray-900 mb-3">Coming Soon</h3>
                      <p class="text-gray-600 mb-5">Profile verification is coming soon! We're working on a process to verify authentic accounts.</p>
                      <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Got it</button>
                    </div>
                  `;
                  document.body.appendChild(dialog);
                  dialog.querySelector('button').onclick = () => document.body.removeChild(dialog);
                  dialog.onclick = (e) => { if (e.target === dialog) document.body.removeChild(dialog); };
                }}
                className="w-full p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Request Verified Checkmark</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl("Profile"))}
                className="flex-1">

                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">

                {isSubmitting ?
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </> :

                'Save Changes'
                }
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>);

}