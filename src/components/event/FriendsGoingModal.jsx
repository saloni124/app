
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

export default function FriendsGoingModal({ isOpen, onClose, friends = [], eventName }) {
    const [localFriends, setLocalFriends] = useState([]);

    useEffect(() => {
        // Assume friends from props are already followed by the user
        setLocalFriends(friends.map(friend => ({ ...friend, isFollowing: true })));
    }, [friends]);

    const handleFollowToggle = (friendName) => {
        setLocalFriends(prevFriends =>
            prevFriends.map(f =>
                f.name === friendName ? { ...f, isFollowing: !f.isFollowing } : f
            )
        );
        // In a real app, you would also call an API to update the follow status
    };

    if (!friends || friends.length === 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Friends Going</DialogTitle>
                    <DialogDescription>
                        People you follow who are also going to "{eventName}".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {localFriends.map((friend) => (
                        <div key={friend.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={friend.avatar}
                                    alt={friend.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-semibold text-gray-800 truncate">{friend.name}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Link to={createPageUrl(`ChatWindow?user=${encodeURIComponent(friend.name)}`)} onClick={onClose}>
                                    <Button variant="ghost" size="icon" className="w-9 h-9">
                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </Link>
                                <Button
                                    variant={friend.isFollowing ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFollowToggle(friend.name)}
                                    className="w-[110px] transition-all"
                                >
                                    {friend.isFollowing ? (
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
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
