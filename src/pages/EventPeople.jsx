import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Event } from '@/api/entities';
import { EventAttendance } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus, UserCheck, MessageSquare, ArrowLeft, Search } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';

const AttendeeCard = ({ attendee, onFollowToggle }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4 min-w-0">
            <img
                src={attendee.user_avatar}
                alt={attendee.user_name}
                className="w-12 h-12 rounded-full object-cover"
            />
            <div className='min-w-0'>
                <p className="font-semibold text-gray-900 truncate">{attendee.user_name}</p>
                <p className="text-sm text-gray-500 truncate">@{attendee.user_instagram || 'insta_handle'}</p>
            </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link to={createPageUrl(`ChatWindow?user=${encodeURIComponent(attendee.user_email)}`)}>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                </Button>
            </Link>
            <Button
                variant={attendee.isFollowing ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onFollowToggle(attendee.user_email)}
                className="w-[100px] transition-all text-xs"
            >
                {attendee.isFollowing ? (
                    <><UserCheck className="w-4 h-4 mr-1.5" /> Following</>
                ) : (
                    <><UserPlus className="w-4 h-4 mr-1.5" /> Follow</>
                )}
            </Button>
        </div>
    </div>
);

export default function EventPeople() {
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('going');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const eventId = params.get('id');

        if (eventId) {
            fetchData(eventId);
        } else {
            setError("No event ID provided.");
            setLoading(false);
        }
    }, [location.search]);

    useEffect(() => {
        let results = attendees.filter(a => a.status === activeTab);
        if (searchQuery) {
            results = results.filter(a => 
                a.user_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredAttendees(results);
    }, [searchQuery, activeTab, attendees]);

    const fetchData = async (eventId) => {
        try {
            setLoading(true);
            const eventData = await Event.get(eventId);
            setEvent(eventData);

            // Mocking attendees for now
            const mockAttendees = [
                { user_email: 'alex@demo.com', user_name: 'Alex Chen', user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', status: 'going', isFollowing: true },
                { user_email: 'diana@demo.com', user_name: 'Diana Kim', user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', status: 'going', isFollowing: false },
                { user_email: 'carlos@demo.com', user_name: 'Carlos Gomez', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', status: 'going', isFollowing: true },
                { user_email: 'sophie@demo.com', user_name: 'Sophie R.', user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=100&h=100&fit=crop', status: 'maybe', isFollowing: false },
                { user_email: 'jordan@demo.com', user_name: 'Jordan K.', user_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', status: 'maybe', isFollowing: true },
                { user_email: 'taylor@demo.com', user_name: 'Taylor M.', user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', status: 'invited', isFollowing: false },
            ];
            setAttendees(mockAttendees);

        } catch (err) {
            console.error("Failed to fetch event people:", err);
            setError("Could not load event details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = (email) => {
        setAttendees(prev => prev.map(a => a.user_email === email ? { ...a, isFollowing: !a.isFollowing } : a));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <header className="mb-6">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{event?.title}</h1>
                <p className="text-lg text-gray-600">People Attending</p>
            </header>

            <div className="sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10">
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search attendees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="going">Going ({attendees.filter(a => a.status === 'going').length})</TabsTrigger>
                        <TabsTrigger value="maybe">Maybe ({attendees.filter(a => a.status === 'maybe').length})</TabsTrigger>
                        <TabsTrigger value="invited">Invited ({attendees.filter(a => a.status === 'invited').length})</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="mt-4 space-y-2">
                {filteredAttendees.length > 0 ? (
                    filteredAttendees.map(attendee => (
                        <AttendeeCard key={attendee.user_email} attendee={attendee} onFollowToggle={handleFollowToggle} />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">No one found for this category.</p>
                )}
            </div>
        </div>
    );
}