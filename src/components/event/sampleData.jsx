export const getSamplePeople = (eventId, organizerName) => {
  const basePeople = [
    {
      id: `person-1-${eventId}`,
      name: "Alex Chen",
      email: "alex.chen@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 2
    },
    {
      id: `person-2-${eventId}`,
      name: "Diana Kim",
      email: "diana.kim@example.com", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 0
    },
    {
      id: `person-3-${eventId}`,
      name: "Marcus Johnson",
      email: "marcus.j@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop",
      status: "maybe",
      mutual_friends: 1
    },
    {
      id: `person-4-${eventId}`,
      name: "Elena Rodriguez",
      email: "elena.r@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c2b2d6b4?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 3
    },
    {
      id: `person-5-${eventId}`,
      name: "James Wilson",
      email: "james.w@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 0
    }
  ];

  // Add specific people based on organizer
  if (organizerName === 'NYC Yoga Collective') {
    basePeople.push({
      id: `person-yoga-${eventId}`,
      name: "Sarah Wellness",
      email: "sarah.w@example.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 2
    });
  } else if (organizerName === 'LA Food Events') {
    basePeople.push({
      id: `person-food-${eventId}`,
      name: "Carlos Martinez",
      email: "carlos.m@example.com",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop",
      status: "going",
      mutual_friends: 1
    });
  }

  return basePeople;
};