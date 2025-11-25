import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PoppinEventCard from '../feed/PoppinEventCard';

export default function ExploreCard({ event: post, onSavePost, isSaved, currentUser }) {
    const [isPopped, setIsPopped] = useState(false);
    const navigate = useNavigate();

    if (!post) {
        return null;
    }

    const closePoppinCard = () => {
        setIsPopped(false);
    };

    // Transform the explore event data to match the Event entity structure
    const transformedEvent = {
        id: post.id,
        title: post.name,
        description: post.description,
        cover_image: post.coverImage,
        gallery_images: post.gallery_images || [],
        date: post.date,
        location: post.location,
        venue_name: post.venue_name || post.location,
        latitude: post.latitude,
        longitude: post.longitude,
        category: post.category,
        price: post.price,
        age_requirement: post.age_requirement,
        scene_tags: post.scene_tags || [],
        organizer_name: post.organizer_name || post.name,
        organizer_avatar: post.organizer_avatar,
        organizer_email: post.organizer_email,
        is_promotional: post.is_promotional || false,
        privacy_level: post.privacy_level || 'public',
        source: post.source || 'explore',
        friends_going: post.friends_going || [],
        // Add dummy comments for events to enable comment functionality
        comments: post.platform === 'event' ? [
            {
                id: 'c1',
                user: 'Sarah M.',
                user_email: 'sarahm@demo.com',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=40&h=40&fit=crop',
                text: 'This looks amazing! Can\'t wait to attend.',
                timestamp: '2h ago',
                likes: 5
            },
            {
                id: 'c2',
                user: 'Alex J.',
                user_email: 'alexj@demo.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
                text: 'See you there!',
                timestamp: '1h ago',
                likes: 3
            }
        ] : (post.comments || [])
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-subtle hover:shadow-lg transition-all duration-300 border border-gray-100 aspect-[4/3]"
                onClick={() => setIsPopped(true)}
                layoutId={`event-card-${post.id}`}
            >
                <img
                    src={post.coverImage}
                    alt={post.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="font-bold text-lg leading-tight">{post.name}</h3>
                    <p className="text-sm opacity-80">{post.location}</p>
                </div>
            </motion.div>

            {isPopped && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0"
                    onClick={closePoppinCard}
                >
                    <motion.div
                        layoutId={`event-card-${post.id}`}
                        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PoppinEventCard
                            event={transformedEvent}
                            onClose={closePoppinCard}
                            onToggleSave={onSavePost}
                            isSaved={isSaved}
                            currentUser={currentUser}
                        />
                    </motion.div>
                </div>
            )}
        </>
    );
}