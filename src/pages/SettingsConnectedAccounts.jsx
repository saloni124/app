
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react'; // Changed Link2 to Share2
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const availableConnections = [
  {
    id: 'eventbrite',
    name: 'Eventbrite',
    description: 'Connect to automatically track events you attend from Eventbrite',
    logo: '🎫',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'partiful',
    name: 'Partiful',
    description: 'Import your party RSVPs and attendance history',
    logo: '🎉',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'luma',
    name: 'Luma',
    description: 'Sync your Luma event attendance and RSVPs',
    logo: '🌙',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'facebook',
    name: 'Facebook Events',
    description: 'Import events you\'ve attended or shown interest in',
    logo: '📘',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'meetup',
    name: 'Meetup',
    description: 'Track your meetup attendance and group memberships',
    logo: '👥',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

export default function SettingsConnectedAccounts() {
    const [currentUser, setCurrentUser] = useState(null);
    const [connectedAccounts, setConnectedAccounts] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(null);
    const [trackingNoticeOpen, setTrackingNoticeOpen] = useState(false); // New state for Collapsible
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        window.scrollTo(0, 0);
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const user = await User.me();
            setCurrentUser(user);
            setConnectedAccounts(new Set(user.connected_accounts || []));
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (accountId) => {
        setConnecting(accountId);
        
        // Simulate connection process
        setTimeout(async () => {
            try {
                const newConnectedAccounts = new Set([...connectedAccounts, accountId]);
                await User.updateMyUserData({ 
                    connected_accounts: Array.from(newConnectedAccounts) 
                });
                setConnectedAccounts(newConnectedAccounts);
                alert(`Successfully connected to ${availableConnections.find(a => a.id === accountId)?.name}!`);
            } catch (error) {
                console.error(`Error connecting to ${accountId}:`, error);
                alert(`Failed to connect to ${availableConnections.find(a => a.id === accountId)?.name}. Please try again.`);
            } finally {
                setConnecting(null);
            }
        }, 2000);
    };

    const handleDisconnect = async (accountId) => {
        if (window.confirm(`Are you sure you want to disconnect from ${availableConnections.find(a => a.id === accountId)?.name}?`)) {
            try {
                const newConnectedAccounts = new Set(connectedAccounts);
                newConnectedAccounts.delete(accountId);
                await User.updateMyUserData({ 
                    connected_accounts: Array.from(newConnectedAccounts) 
                });
                setConnectedAccounts(newConnectedAccounts);
            } catch (error) {
                console.error(`Error disconnecting from ${accountId}:`, error);
                alert('Failed to disconnect. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8"> {/* Adjusted padding */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 px-4 py-4 pt-20 md:pt-16 sticky top-0 z-10 border-b border-gray-200 flex items-center justify-center relative">
                    <button
                        onClick={() => navigate(createPageUrl("SettingsIndex"))}
                        className="absolute left-4 flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
                        <Share2 className="w-6 h-6" /> {/* Changed icon to Share2 */}
                        Connected Accounts
                    </h1>
                </div>

                <div className="px-4 mt-6"> {/* Added px-4 here for content below header and some top margin */}
                    {/* Expandable Disclaimer */}
                    <Collapsible open={trackingNoticeOpen} onOpenChange={setTrackingNoticeOpen}> {/* Added open and onOpenChange props */}
                        <div className="bg-amber-50 border border-amber-200 mb-6 rounded-2xl">
                            <CollapsibleTrigger asChild>
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full p-4 cursor-pointer hover:bg-amber-100 transition-colors rounded-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <h3 className="font-semibold text-amber-800">Event Tracking Notice</h3>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${trackingNoticeOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </motion.button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 pb-4">
                                    <p className="text-sm text-amber-700">
                                        Without connecting these accounts, the app won't be able to automatically track which events you've attended. 
                                        You'll need to manually mark events as "attended" to leave reviews and build your event history.
                                    </p>
                                </motion.div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    <div className="space-y-4">
                        {availableConnections.map((connection, index) => (
                            <motion.div
                                key={connection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl">{connection.logo}</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {connection.name}
                                                {connectedAccounts.has(connection.id) && (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Connected
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-500">{connection.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {connectedAccounts.has(connection.id) ? (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDisconnect(connection.id)}
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                Disconnect
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleConnect(connection.id)}
                                                disabled={connecting === connection.id}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {connecting === connection.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 className="w-4 h-4 mr-2" /> {/* Changed icon to Share2 */}
                                                        Connect
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center text-sm text-gray-500"
                    >
                        <p>
                            We use secure OAuth connections and never store your passwords. 
                            You can disconnect any account at any time.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
