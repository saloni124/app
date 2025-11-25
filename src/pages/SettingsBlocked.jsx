
import React, { useEffect } from 'react';
import { ArrowLeft, Ban, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SettingsBlocked() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
                    <button
            onClick={() => navigate(createPageUrl("SettingsIndex"))}
            className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900">

                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Blocked Users
                    </h1>
                </div>

                <div className="bg-white mt-12 mb-1 p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="text-center py-12">
                        <Ban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No blocked users</h3>
                        <p className="text-gray-500">Users you block will appear here</p>
                    </div>
                </div>
            </div>
        </div>);

}