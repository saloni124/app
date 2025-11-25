
import React, { useEffect } from 'react';
import { ArrowLeft, HelpCircle, Mail, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SettingsSupport() {
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
                        className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
                        <HelpCircle className="w-6 h-6" />
                        Help & Support
                    </h1>
                </div>

                <div className="px-4 py-8"> {/* Added padding for content below sticky header */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
                        <div className="grid gap-4">
                            <a href="mailto:support@whatspoppin.app" className="block">
                                <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <h3 className="font-medium">Email Support</h3>
                                            <p className="text-sm text-gray-500">Get help via email</p>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-medium">FAQ</h3>
                                        <p className="text-sm text-gray-500">Coming soon - Frequently asked questions</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-medium">Community Guidelines</h3>
                                        <p className="text-sm text-gray-500">Learn about our community standards</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
