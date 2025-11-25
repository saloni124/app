const simulatedDataManager = {
  isAuthBypassed: () => {
    return localStorage.getItem('auth_bypassed') === 'true';
  },
  
  isAdminMode: () => {
    return localStorage.getItem('bypass_mode') === 'admin';
  },
  
  isDemoMode: () => {
    return localStorage.getItem('bypass_mode') === 'demo';
  },
  
  isSimulatedMode: () => {
    return localStorage.getItem('auth_bypassed') === 'true';
  },
  
  getTemporaryUserUpdates: () => {
    const stored = sessionStorage.getItem('demo_user_updates');
    return stored ? JSON.parse(stored) : {};
  },
  
  setTemporaryUserUpdates: (updates) => {
    const existing = simulatedDataManager.getTemporaryUserUpdates();
    const merged = { ...existing, ...updates };
    sessionStorage.setItem('demo_user_updates', JSON.stringify(merged));
  },
  
  getAdminUserUpdates: () => {
    // Admin mode no longer uses localStorage overrides
    // All admin changes go directly to database
    return {};
  },
  
  getDeletedEventIds: () => {
    if (simulatedDataManager.isAdminMode()) {
      const stored = localStorage.getItem('admin_deleted_events');
      return stored ? JSON.parse(stored) : [];
    } else if (simulatedDataManager.isDemoMode()) {
      const adminDeleted = localStorage.getItem('admin_deleted_events');
      const adminIds = adminDeleted ? JSON.parse(adminDeleted) : [];
      const demoDeleted = sessionStorage.getItem('demo_deleted_events');
      const demoIds = demoDeleted ? JSON.parse(demoDeleted) : [];
      return [...new Set([...adminIds, ...demoIds])];
    }
    return [];
  },
  
  deleteEvent: (eventId) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_deleted_events');
      const deletedIds = existing ? JSON.parse(existing) : [];
      if (!deletedIds.includes(eventId)) {
        deletedIds.push(eventId);
        localStorage.setItem('admin_deleted_events', JSON.stringify(deletedIds));
        console.log('✅ Admin: Event deleted permanently:', eventId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_deleted_events');
      const deletedIds = existing ? JSON.parse(existing) : [];
      if (!deletedIds.includes(eventId)) {
        deletedIds.push(eventId);
        sessionStorage.setItem('demo_deleted_events', JSON.stringify(deletedIds));
        console.log('✅ Demo: Event deleted temporarily:', eventId);
      }
    }
  },
  
  getCancelledEvents: () => {
    if (simulatedDataManager.isAdminMode()) {
      const stored = localStorage.getItem('admin_cancelled_events');
      return stored ? JSON.parse(stored) : {};
    } else if (simulatedDataManager.isDemoMode()) {
      const adminCancelled = localStorage.getItem('admin_cancelled_events');
      const adminEvents = adminCancelled ? JSON.parse(adminCancelled) : {};
      const demoCancelled = sessionStorage.getItem('demo_cancelled_events');
      const demoEvents = demoCancelled ? JSON.parse(demoCancelled) : {};
      return { ...adminEvents, ...demoEvents };
    }
    return {};
  },
  
  cancelEvent: (eventId, message) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_cancelled_events');
      const cancelled = existing ? JSON.parse(existing) : {};
      cancelled[eventId] = { message, timestamp: new Date().toISOString() };
      localStorage.setItem('admin_cancelled_events', JSON.stringify(cancelled));
      console.log('✅ Admin: Event cancelled permanently:', eventId);
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_cancelled_events');
      const cancelled = existing ? JSON.parse(existing) : {};
      cancelled[eventId] = { message, timestamp: new Date().toISOString() };
      sessionStorage.setItem('demo_cancelled_events', JSON.stringify(cancelled));
      console.log('✅ Demo: Event cancelled temporarily:', eventId);
    }
  },
  
  getMemoryPosts: () => {
    if (simulatedDataManager.isAdminMode()) {
      const stored = localStorage.getItem('admin_memory_posts');
      return stored ? JSON.parse(stored) : [];
    } else if (simulatedDataManager.isDemoMode()) {
      const adminPosts = localStorage.getItem('admin_memory_posts');
      const adminPostsArray = adminPosts ? JSON.parse(adminPosts) : [];
      const demoPosts = sessionStorage.getItem('demo_memory_posts');
      const demoPostsArray = demoPosts ? JSON.parse(demoPosts) : [];
      
      const allPosts = [...adminPostsArray, ...demoPostsArray];
      const uniquePosts = allPosts.reduce((acc, post) => {
        if (!acc.find(p => p.id === post.id)) {
          acc.push(post);
        }
        return acc;
      }, []);
      return uniquePosts;
    }
    return [];
  },
  
  saveMemoryPost: (post) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_memory_posts');
      const posts = existing ? JSON.parse(existing) : [];
      posts.unshift(post);
      localStorage.setItem('admin_memory_posts', JSON.stringify(posts));
      console.log('✅ Admin: Memory post saved permanently:', post.id);
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_memory_posts');
      const posts = existing ? JSON.parse(existing) : [];
      posts.unshift(post);
      sessionStorage.setItem('demo_memory_posts', JSON.stringify(posts));
      console.log('✅ Demo: Memory post saved to session:', post.id);
    }
  },
  
  deleteMemoryPost: (postId) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_memory_posts');
      if (existing) {
        const posts = JSON.parse(existing);
        const filtered = posts.filter(p => p.id !== postId);
        localStorage.setItem('admin_memory_posts', JSON.stringify(filtered));
        console.log('✅ Admin: Memory post deleted permanently:', postId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_memory_posts');
      if (existing) {
        const posts = JSON.parse(existing);
        const filtered = posts.filter(p => p.id !== postId);
        sessionStorage.setItem('demo_memory_posts', JSON.stringify(filtered));
        console.log('✅ Demo: Memory post deleted from session:', postId);
      }
    }
  },
  
  updateMemoryPost: (postId, updates) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_memory_posts');
      if (existing) {
        const posts = JSON.parse(existing);
        const updated = posts.map(p => p.id === postId ? { ...p, ...updates } : p);
        localStorage.setItem('admin_memory_posts', JSON.stringify(updated));
        console.log('✅ Admin: Memory post updated permanently:', postId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_memory_posts');
      if (existing) {
        const posts = JSON.parse(existing);
        const updated = posts.map(p => p.id === postId ? { ...p, ...updates } : p);
        sessionStorage.setItem('demo_memory_posts', JSON.stringify(updated));
        console.log('✅ Demo: Memory post updated in session:', postId);
      }
    }
  },
  
  async updateSimulatedUser(updates) {
    console.log("🔄 simulatedDataManager: Updating user with:", updates);
    
    const isAdmin = this.isAdminMode();
    const isDemo = this.isDemoMode();

    if (isAdmin) {
      // Admin mode: update REAL database permanently
      try {
        await base44.auth.updateMe(updates);
        console.log("✅ Admin: User data updated permanently in database:", updates);
      } catch (err) {
        console.error("❌ Admin mode database update failed:", err);
      }
    } else if (isDemo) {
      // Demo mode: only update sessionStorage (temporary)
      const current = this.getTemporaryUserUpdates();
      const updated = { ...current, ...updates };
      sessionStorage.setItem('demo_user_updates', JSON.stringify(updated));
      console.log("✅ Demo: User updates saved to sessionStorage (temporary):", updated);
    }
  },
  
  getBaseUser: () => {
    return {
      id: '676e3f7d07e77d5ba5e6dc90',
      email: 'salonibhatia99@gmail.com',
      full_name: 'Saloni Bhatia',
      role: 'admin',
      created_date: '2024-12-26T21:31:25.206Z',
      bio: 'Exploring amazing events in SF 🌉',
      avatar: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop',
      cover_image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=400&fit=crop',
      instagram_handle: '@salonib',
      location: 'San Francisco, CA',
      events_hosted: 0,
      followers: 342,
      following: 125,
      is_verified: true,
      account_type: 'personal',
      saved_events: [],
      attended_events: [],
      followed_curator_ids: [],
      ai_scheduling: true
    };
  },
  
  getBypassUser: async () => {
    const isAdmin = simulatedDataManager.isAdminMode();
    const isDemo = simulatedDataManager.isDemoMode();
    
    if (!isAdmin && !isDemo) {
      return null;
    }
    
    console.warn('⚠️ getBypassUser is deprecated - use base44.auth.me() instead');
    return null;
  },
  
  applyDemoOverrides: (realUser) => {
    if (!simulatedDataManager.isDemoMode()) {
      return realUser;
    }
    
    if (!realUser) {
      return null;
    }
    
    const demoOverrides = simulatedDataManager.getTemporaryUserUpdates();
    return { ...realUser, ...demoOverrides };
  },

  getJoinedGroups: () => {
    if (simulatedDataManager.isAdminMode()) {
      const stored = localStorage.getItem('admin_joined_groups');
      return stored ? JSON.parse(stored) : ['group-thursday-dating', 'group-art-house', 'group-mindful-moments'];
    } else if (simulatedDataManager.isDemoMode()) {
      const adminGroups = localStorage.getItem('admin_joined_groups');
      const adminGroupsArray = adminGroups ? JSON.parse(adminGroups) : ['group-thursday-dating', 'group-art-house', 'group-mindful-moments'];
      const demoGroups = sessionStorage.getItem('demo_joined_groups');
      const demoGroupsArray = demoGroups ? JSON.parse(demoGroups) : [];
      return [...new Set([...adminGroupsArray, ...demoGroupsArray])];
    }
    return [];
  },
  
  joinGroup: (groupId) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_joined_groups');
      const groups = existing ? JSON.parse(existing) : ['group-thursday-dating', 'group-art-house', 'group-mindful-moments'];
      if (!groups.includes(groupId)) {
        groups.push(groupId);
        localStorage.setItem('admin_joined_groups', JSON.stringify(groups));
        console.log('✅ Admin: Joined group permanently:', groupId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_joined_groups');
      const groups = existing ? JSON.parse(existing) : [];
      if (!groups.includes(groupId)) {
        groups.push(groupId);
        sessionStorage.setItem('demo_joined_groups', JSON.stringify(groups));
        console.log('✅ Demo: Joined group temporarily:', groupId);
      }
    }
  },
  
  getPendingGroupRequests: () => {
    if (simulatedDataManager.isAdminMode()) {
      const stored = localStorage.getItem('admin_pending_groups');
      return stored ? JSON.parse(stored) : [];
    } else if (simulatedDataManager.isDemoMode()) {
      const adminPending = localStorage.getItem('admin_pending_groups');
      const adminArray = adminPending ? JSON.parse(adminPending) : [];
      const demoPending = sessionStorage.getItem('demo_pending_groups');
      const demoArray = demoPending ? JSON.parse(demoPending) : [];
      return [...new Set([...adminArray, ...demoArray])];
    }
    return [];
  },
  
  addPendingGroupRequest: (groupId) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_pending_groups');
      const pending = existing ? JSON.parse(existing) : [];
      if (!pending.includes(groupId)) {
        pending.push(groupId);
        localStorage.setItem('admin_pending_groups', JSON.stringify(pending));
        console.log('✅ Admin: Added pending group request:', groupId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_pending_groups');
      const pending = existing ? JSON.parse(existing) : [];
      if (!pending.includes(groupId)) {
        pending.push(groupId);
        sessionStorage.setItem('demo_pending_groups', JSON.stringify(pending));
        console.log('✅ Demo: Added pending group request:', groupId);
      }
    }
  },
  
  removePendingGroupRequest: (groupId) => {
    if (simulatedDataManager.isAdminMode()) {
      const existing = localStorage.getItem('admin_pending_groups');
      if (existing) {
        const pending = JSON.parse(existing);
        const filtered = pending.filter(id => id !== groupId);
        localStorage.setItem('admin_pending_groups', JSON.stringify(filtered));
        console.log('✅ Admin: Removed pending group request:', groupId);
      }
    } else if (simulatedDataManager.isDemoMode()) {
      const existing = sessionStorage.getItem('demo_pending_groups');
      if (existing) {
        const pending = JSON.parse(existing);
        const filtered = pending.filter(id => id !== groupId);
        sessionStorage.setItem('demo_pending_groups', JSON.stringify(filtered));
        console.log('✅ Demo: Removed pending group request:', groupId);
      }
    }
  },
  
  deleteSampleEntry: (entryId) => {
    const state = JSON.parse(localStorage.getItem('deleted_sample_entries') || '{}');
    if (!state.deletedSampleEntryIds) {
      state.deletedSampleEntryIds = [];
    }
    if (!state.deletedSampleEntryIds.includes(entryId)) {
      state.deletedSampleEntryIds.push(entryId);
      localStorage.setItem('deleted_sample_entries', JSON.stringify(state));
      console.log(`Sample entry ${entryId} marked as deleted in simulated storage.`);
    }
  },

  getSampleEntriesFor(profileEmail, userName, avatar) {
    const deletedIds = JSON.parse(localStorage.getItem('deleted_sample_entries') || '{}').deletedSampleEntryIds || [];
    
    const sampleEntriesData = {
      "salonibhatia99@gmail.com": [
        {
          id: 'saloni_entry_new_1',
          title: "Coffee shop vibes",
          description: "Found this amazing coffee spot in Mission District",
          cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "salonibhatia99@gmail.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Mission District, SF",
          status: 'published',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_entry_new_2',
          title: "Night market adventures",
          description: "Amazing street food and vibes",
          cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "salonibhatia99@gmail.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Chinatown, SF",
          status: 'published',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_entry_new_3',
          title: "Brunch discoveries",
          description: "Best avocado toast in the city!",
          cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "salonibhatia99@gmail.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Castro, SF",
          status: 'published',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_entry_new_4',
          title: "Sunset vibes",
          description: "Perfect evening at the beach",
          cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "salonibhatia99@gmail.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Ocean Beach, SF",
          status: 'published',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_entry_new_5',
          title: "Morning workout",
          description: "Early morning run through Golden Gate Park",
          cover_image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "salonibhatia99@gmail.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Golden Gate Park, SF",
          status: 'published',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      "saloni.bhatia@example.com": [
        {
          id: 'saloni_alt_entry_new_1',
          title: "Coffee shop vibes",
          description: "Found this amazing coffee spot in Mission District",
          cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "saloni.bhatia@example.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Mission District, SF",
          status: 'published',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_alt_entry_new_2',
          title: "Night market adventures",
          description: "Amazing street food and vibes",
          cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "saloni.bhatia@example.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Chinatown, SF",
          status: 'published',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_alt_entry_new_3',
          title: "Brunch discoveries",
          description: "Best avocado toast in the city!",
          cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "saloni.bhatia@example.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Castro, SF",
          status: 'published',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_alt_entry_new_4',
          title: "Sunset vibes",
          description: "Perfect evening at the beach",
          cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "saloni.bhatia@example.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Ocean Beach, SF",
          status: 'published',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'saloni_alt_entry_new_5',
          title: "Morning workout",
          description: "Early morning run through Golden Gate Park",
          cover_image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=1200&fit=crop",
          source: 'vibe-post-seed',
          organizer_name: "Saloni Bhatia",
          organizer_email: "saloni.bhatia@example.com",
          organizer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          location: "Golden Gate Park, SF",
          status: 'published',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    const entries = sampleEntriesData[profileEmail] || [];
    return entries.filter((entry) => !deletedIds.includes(entry.id));
  },

  getSampleAlbumsFor(profileEmail, userName) {
    const sampleAlbumsData = {
      "salonibhatia99@gmail.com": [
        {
          id: 'sample_album_new_1',
          title: 'Summer Adventures 2024',
          description: 'Best moments from this summer exploring SF',
          cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          owner_email: profileEmail,
          owner_name: userName,
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          is_hidden: false,
          entry_count: 4,
          entries: [
            { id: 'saloni_entry_new_1', cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop" },
            { id: 'saloni_entry_new_2', cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop" },
            { id: 'saloni_entry_new_3', cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop" },
            { id: 'saloni_entry_new_4', cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop" }
          ]
        },
        {
          id: 'sample_album_new_2',
          title: 'Food Journey NYC',
          description: 'Culinary adventures through New York City',
          cover_image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
          owner_email: profileEmail,
          owner_name: userName,
          created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          is_hidden: false,
          entry_count: 3,
          entries: [
            { id: 'saloni_alt_entry_new_1', cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop" },
            { id: 'saloni_alt_entry_new_2', cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop" },
            { id: 'saloni_alt_entry_new_3', cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop" }
          ]
        },
        {
          id: 'sample_album_new_3',
          title: 'Art & Culture',
          description: 'Museum visits and gallery openings',
          cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          owner_email: profileEmail,
          owner_name: userName,
          created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          is_hidden: false,
          entry_count: 5,
          entries: [
            { id: 'sample_entry_1', cover_image: "https://images.unsplash.com/photo-1502680373032-cdba9783238a?w=800&h=1200&fit=crop" },
            { id: 'sample_entry_2', cover_image: "https://images.unsplash.com/photo-1549887552-cb1071f4b010?w=800&h=1200&fit=crop" },
            { id: 'sample_entry_3', cover_image: "https://images.unsplash.com/photo-1453928582045-af53efd0a517?w=800&h=1200&fit=crop" },
            { id: 'sample_entry_4', cover_image: "https://images.unsplash.com/photo-1517400508535-c322b70f089e?w=800&h=1200&fit=crop" },
            { id: 'sample_entry_5', cover_image: "https://images.unsplash.com/photo-1534368940860-631d62c1d2e1?w=800&h=1200&fit=crop" }
          ]
        }
      ],
      "saloni.bhatia@example.com": [
        {
          id: 'sample_album_alt_new_1',
          title: 'Summer Adventures 2024',
          description: 'Best moments from this summer exploring SF',
          cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
          owner_email: profileEmail,
          owner_name: userName,
          created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          is_hidden: false,
          entry_count: 4,
          entries: [
            { id: 'saloni_alt_entry_new_1', cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop" },
            { id: 'saloni_alt_entry_new_2', cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop" },
            { id: 'saloni_alt_entry_new_3', cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop" },
            { id: 'saloni_alt_entry_new_4', cover_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop" }
          ]
        },
        {
          id: 'sample_album_alt_new_2',
          title: 'Food Journey NYC',
          description: 'Culinary adventures through New York City',
          cover_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
          owner_email: profileEmail,
          owner_name: userName,
          created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          is_hidden: false,
          entry_count: 3,
          entries: [
            { id: 'saloni_entry_new_1', cover_image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop" },
            { id: 'saloni_entry_new_2', cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1200&fit=crop" },
            { id: 'saloni_entry_new_3', cover_image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=1200&fit=crop" }
          ]
        }
      ]
    };

    return sampleAlbumsData[profileEmail] || [];
  },
  
  clearSimulatedSession: () => {
    console.log('🚪 Clearing auth flags and temporary demo data only');
    localStorage.removeItem('auth_bypassed');
    localStorage.removeItem('bypass_mode');
    sessionStorage.removeItem('demo_user_updates');
    sessionStorage.removeItem('demo_deleted_events');
    sessionStorage.removeItem('demo_cancelled_events');
    sessionStorage.removeItem('demo_memory_posts');
    sessionStorage.removeItem('demo_joined_groups');
    sessionStorage.removeItem('demo_pending_groups');
    console.log('✅ Demo session data cleared (admin data preserved in localStorage)');
  }
};

export { simulatedDataManager };