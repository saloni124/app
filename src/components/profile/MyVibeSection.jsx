
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function MyVibeSection({ user, isOwnProfile }) {
  const navigate = useNavigate();
  const sceneTags = user?.scene_tags || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-500" />
          My Scene
        </h3>
        {isOwnProfile && (
            <Button variant="ghost" size="sm" onClick={() => navigate(createPageUrl('VibeSurvey'))}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Scene
            </Button>
        )}
      </div>

      {sceneTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sceneTags.map((tag) => (
            <div key={tag} className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full">
              {tag}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-3">Define your ideal experiences to get better recommendations.</p>
          <Button 
            onClick={() => navigate(createPageUrl('VibeSurvey'))} 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
          >
            Find My Scene
          </Button>
        </div>
      )}
       <p className="text-xs text-gray-400 mt-4">These tags help us recommend events tailored to your scene.</p>
    </motion.div>
  );
}
