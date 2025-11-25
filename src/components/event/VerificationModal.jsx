import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Phone, Instagram } from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationModal({ isOpen, onClose, onSubmit, eventTitle }) {
  const [formData, setFormData] = useState({
    message: "",
    phone: "",
    instagram: "",
    verification_method: "instagram" // Default to instagram as shown in image
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required field
    if (formData.verification_method === "phone" && !formData.phone.trim()) {
      alert("Phone number is required for verification.");
      return;
    }
    if (formData.verification_method === "instagram" && !formData.instagram.trim()) {
      alert("Instagram handle is required for verification.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        message: "",
        phone: "",
        instagram: "",
        verification_method: "instagram"
      });
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Request to Join Event</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
              Message to organizer (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Tell them why you'd like to join..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="border-2 border-cyan-400 focus:border-cyan-500 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Verification required *
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="phone-option"
                  name="verification_method"
                  value="phone"
                  checked={formData.verification_method === "phone"}
                  onChange={(e) => setFormData(prev => ({ ...prev, verification_method: e.target.value }))}
                  className="w-4 h-4 text-cyan-600"
                />
                <label htmlFor="phone-option" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>Phone Number</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="instagram-option"
                  name="verification_method"
                  value="instagram"
                  checked={formData.verification_method === "instagram"}
                  onChange={(e) => setFormData(prev => ({ ...prev, verification_method: e.target.value }))}
                  className="w-4 h-4 text-cyan-600"
                />
                <label htmlFor="instagram-option" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-gray-500" />
                  <span>Instagram Handle</span>
                </label>
              </div>
            </div>
          </div>

          {formData.verification_method === "phone" && (
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="border-2 border-gray-300 focus:border-cyan-500 rounded-lg"
                required
              />
            </div>
          )}

          {formData.verification_method === "instagram" && (
            <div>
              <Label htmlFor="instagram" className="text-sm font-medium text-gray-700 mb-2 block">
                Instagram Handle *
              </Label>
              <Input
                id="instagram"
                type="text"
                placeholder="@username"
                value={formData.instagram}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                className="border-2 border-gray-300 focus:border-cyan-500 rounded-lg"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}