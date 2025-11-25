
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to create page URLs. In a real application, this would likely be imported from a centralized utility file.
const createPageUrl = (pageName) => {
  // This is a placeholder implementation. Adjust according to your routing setup.
  switch (pageName) {
    case "SettingsIndex":
    case "Settings": // Added case for "Settings" for broader navigation
      return "/settings";
    // Add other cases as needed
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

export default function SettingsArchive() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button and title, fixed at the top */}
        <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center">
          <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-gray-900 text-2xl font-bold">Archive</h1>
        </div>

        {/* Content archive section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6 bg-white rounded-2xl border border-gray-200 mx-4 mt-8" // Added mx-4 and mt-8 for spacing and alignment
        >
          <Archive className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Content Archive</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Your archived posts, stories, and past events will be stored here for you to look back on.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
