export const sampleChats = [
  {
    id: "curator-arthaus",
    userId: "user_arthaus",
    userEmail: "arthaus@demo.com",
    title: "ArtHaus Collective",
    type: "curator",
    participants: 1,
    lastMessage: "Thanks for your interest in our gallery events!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop",
    isFollowingBack: true,
    isFollowing: true
  },
  {
    id: "curator-thursday",
    userId: "user_thursday",
    userEmail: "thursday@demo.com",
    title: "Thursday Dating",
    type: "curator",
    participants: 1,
    lastMessage: "See you at the next singles mixer!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 1,
    avatar: "https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop",
    isFollowingBack: true,
    isFollowing: true
  },
  {
    id: "curator-underground",
    userId: "user_underground",
    userEmail: "underground@demo.com",
    title: "Underground Rave",
    type: "curator",
    participants: 1,
    lastMessage: "Secret location drops at midnight 🎧",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12),
    unreadCount: 2,
    avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
    isFollowingBack: true,
    isFollowing: true
  },
  {
    id: "curator-outdoor",
    userId: "user_outdoor",
    userEmail: "outdoor@demo.com",
    title: "NYC Outdoor Adventures",
    type: "curator",
    participants: 1,
    lastMessage: "Saturday's hike is still on! Meet at 9 AM 🥾",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 20),
    unreadCount: 0,
    avatar: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=100&h=100&fit=crop",
    isFollowingBack: true,
    isFollowing: true
  }
];

export const sampleGroups = [
  {
    id: "group-mindful-moments",
    title: "Saloni's community",
    description: "A space for mindfulness, meditation, and conscious living.",
    type: "community",
    participants: 67,
    lastMessage: "Tomorrow's meditation session starts at 7 AM. See you there!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 1,
    avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
    hostName: "Saloni Bhatia",
    hostEmail: "salonibhatia99@gmail.com",
    isApproved: true,
    canLeave: false
  },
  {
    id: "sarah-birthday-planning",
    title: "Sarah's Birthday Planning",
    description: "Planning Sarah's surprise birthday party next month!",
    type: "regular",
    participants: 8,
    lastMessage: "Let's meet this weekend to finalize the details!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unreadCount: 2,
    avatar: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=100&h=100&fit=crop",
    hostName: "Saloni Bhatia",
    hostEmail: "salonibhatia99@gmail.com",
    isApproved: true,
    canLeave: true
  },
  {
    id: "group-thursday-dating",
    title: "Thursday Dating Community",
    description: "Connect with singles and get ready for Thursday's events.",
    type: "community",
    participants: 156,
    lastMessage: "Looking forward to Thursday's event! Anyone else going?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 1),
    unreadCount: 3,
    avatar: "https://images.unsplash.com/photo-1522621032211-ac0031dfb928?w=100&h=100&fit=crop",
    hostName: "Thursday Dating",
    hostEmail: "thursday@demo.com",
    isApproved: true,
    canLeave: true
  },
  {
    id: "group-art-house",
    title: "ArtHaus Collective",
    description: "A community for lovers of contemporary art and culture.",
    type: "community",
    participants: 89,
    lastMessage: "New gallery opening next week - who's in?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4),
    unreadCount: 0,
    avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop",
    hostName: "ArtHaus Collective",
    hostEmail: "arthaus@demo.com",
    isApproved: true,
    canLeave: true
  }
];

export const sampleGroupChats = sampleGroups;

export const sampleBlasts = [
  {
    id: "blast-1",
    eventTitle: "Underground Art Gallery Opening",
    message: "🎨 Final reminder: Gallery opens at 7 PM sharp! Dress code: Creative casual. See you there!",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    sentBy: "Art House Collective"
  },
  {
    id: "blast-2",
    eventTitle: "Tech Innovation Summit",
    message: "📍 Venue update: We've moved to the main auditorium! Registration starts at 1:30 PM.",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    sentBy: "SF Tech Community"
  }
];

export const sampleOneOnOneMessages = [
  { id: 1, message: "Hey! What's up?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), isMe: false },
  { id: 2, message: "Not much, just checking out this app. Looks cool!", timestamp: new Date(Date.now() - 1000 * 60 * 59), isMe: true },
  { id: 3, message: "Yeah, found some interesting events for this weekend.", timestamp: new Date(Date.now() - 1000 * 60 * 58), isMe: false },
  { id: 4, message: "Oh nice! Which ones?", timestamp: new Date(Date.now() - 1000 * 60 * 57), isMe: true },
];