
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserPlus, UserCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AttendeesModal({ isOpen, onClose, attendees = [], eventName }) {
    const [localAttendees, setLocalAttendees] = useState([]);

    useEffect(() => {
        // Set an initial follow status for each attendee
        setLocalAttendees(attendees.map(att => ({ ...att, isFollowing: att.isFollowing || false })));
    }, [attendees]);

    const handleFollowToggle = (attendeeId) => {
        setLocalAttendees(prevAttendees =>
            prevAttendees.map(att =>
                (att.id === attendeeId || att.name === attendeeId) ? { ...att, isFollowing: !att.isFollowing } : att
            )
        );
        // In a real app, you would also call an API to update the follow status on the server.
    };
    
    if (!attendees || attendees.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle>People You Know Going</DialogTitle>
                    <DialogDescription>
                        These are the people from your network also attending "{eventName}".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {localAttendees.length > 0 ? (
                        localAttendees.map((attendee) => (
                            <div key={attendee.id || attendee.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={attendee.avatar}
                                        alt={attendee.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span className="font-semibold text-gray-800 truncate">{attendee.name}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <Link to={createPageUrl(`ChatWindow?user=${encodeURIComponent(attendee.email || attendee.name)}`)} onClick={onClose}>
                                        <Button variant="ghost" size="icon" className="w-9 h-9">
                                            <MessageSquare className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant={attendee.isFollowing ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleFollowToggle(attendee.id || attendee.name)}
                                        className="w-[110px] transition-all"
                                    >
                                        {attendee.isFollowing ? (
                                            <>
                                                <UserCheck className="w-4 h-4 mr-2" />
                                                Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">
                            No one from your network is marked as going yet. Be the first!
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
