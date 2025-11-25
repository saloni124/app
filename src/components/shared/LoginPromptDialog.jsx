import React from 'react';
import { X } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function LoginPromptDialog({ isOpen, onClose, action }) {
  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    window.location.href = createPageUrl("Profile") + "?logout=true";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Login Required</h3>
        <p className="text-gray-700 mb-5">
          You need to be logged in to {action}. Please log in or create an account to continue.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Login / Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}