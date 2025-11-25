
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Image, Link as LinkIcon, Calendar, MessageSquare, X, MapPin, Pin, Heart, Bookmark, ChevronLeft, ChevronRight, Grip, MessageCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { sampleChats, sampleGroupChats } from '../components/chat/ChatData'; // Make sure this path is correct

// Global CSS for the scroll container
const style = document.createElement('style');
style.innerHTML = `
  .scroll-container {
    height: 100vh;
    overflow-y: scroll;
    scroll-snap-type: y mandatory;
  }
  .scroll-item {
    height: 100vh;
    width: 100vw;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);

export default function ChatMedia() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState([]); // This will hold all media from messages for the current chat
  const [pinnedMedia, setPinnedMedia] = useState([]); // This will hold pinned media for the current chat
  const [activeTab, setActiveTab] = useState("photos"); // Changed default activeTab
  const [searchQuery, setSearchQuery] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [error, setError] = useState(null);
  const [isGroupChatFlag, setIsGroupChatFlag] = useState(false); // To manage pinned media visibility

  const [loading, setLoading] = useState(true); // Initialize loading as true
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPinned, setShowPinned] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const postScrollContainerRef = useRef(null);

  useEffect(() => {
    const groupId = searchParams.get('groupId');
    const userIdentifier = searchParams.get('user');
    
    setLoading(true);
    setError(null);
    setMedia([]); // Clear previous media
    setPinnedMedia([]); // Clear previous pinned media
    setChatTitle(""); // Clear previous title
    setShowPinned(false); // Reset pinned view on chat change
    setIsGroupChatFlag(false); // Reset group chat flag

    const allChats = [...sampleChats, ...sampleGroupChats];
    let currentChat = null;

    if (groupId) {
      currentChat = allChats.find(c => c.id === groupId);
      if (currentChat && (currentChat.type === 'group' || currentChat.type === 'community' || currentChat.type === 'regular')) {
        setIsGroupChatFlag(true);
      }
    } else if (userIdentifier) {
      currentChat = allChats.find(c => 
        (c.type === 'curator' || c.type === 'individual' || c.type === 'direct' || !c.type) && (
          c.id === userIdentifier || 
          c.title === userIdentifier || 
          (c.userEmail && c.userEmail.toLowerCase() === userIdentifier.toLowerCase())
        )
      );
      setIsGroupChatFlag(false);
    }

    if (currentChat) {
      setChatTitle(currentChat.title || "Chat");
      // Extract all media from messages - this should work for both group and individual chats
      const allMessagesMedia = currentChat.messages?.flatMap(m => m.media || []) || [];
      setMedia(allMessagesMedia);
      // Extract pinned media directly from the chat object, if it exists
      setPinnedMedia(currentChat.pinnedMedia || []);
      setError(null);
    } else {
      setError(`Chat not found. Please provide a valid groupId or user parameter.`);
      setMedia([]);
      setPinnedMedia([]);
      setChatTitle("Unknown Chat");
    }
    
    setLoading(false);
  }, [searchParams, setLoading, setError, setMedia, setPinnedMedia, setChatTitle, setShowPinned, setIsGroupChatFlag]);

  // Helper to extract specific media types from the current media
  const getCategorizedMedia = (sourceData = media) => {
    const photos = sourceData.filter(item => item.type === 'photo');
    const events = sourceData.filter(item => item.type === 'event');
    const posts = sourceData.filter(item => item.type === 'post');
    const links = sourceData.filter(item => item.type === 'link');
    
    // Pinned data now comes from the pinnedMedia state for the current chat
    const currentChatPinned = pinnedMedia; 

    return { photos, events, posts, links, pinned: currentChatPinned };
  };

  const { photos, events, posts, links, pinned } = getCategorizedMedia(); // Initialize once based on media and pinnedMedia

  const openImageModal = (item) => {
    // When opening an image modal, 'index' should be the index within the currently displayed 'photos' array.
    setSelectedImage(item);
    if (item.type === 'photo') {
      const currentPhotos = photos; // This is already the filtered list
      setCurrentImageIndex(currentPhotos.findIndex(p => p.id === item.id)); // Find index in the current photos list
    }
  };

  const goToNextImage = useCallback(() => {
    const currentPhotos = photos; // Use categorized photos
    if (currentPhotos.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % currentPhotos.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(currentPhotos[nextIndex]);
  }, [photos, currentImageIndex, setCurrentImageIndex, setSelectedImage]);

  const goToPrevImage = useCallback(() => {
    const currentPhotos = photos; // Use categorized photos
    if (currentPhotos.length === 0) return;
    const prevIndex = (currentImageIndex - 1 + currentPhotos.length) % currentPhotos.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(currentPhotos[prevIndex]);
  }, [photos, currentImageIndex, setCurrentImageIndex, setSelectedImage]);

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage || selectedImage.type !== 'photo') return;

      if (e.key === 'Escape') {
        setSelectedImage(null);
        return;
      }
      if (e.key === 'ArrowRight') goToNextImage();
      if (e.key === 'ArrowLeft') goToPrevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, goToNextImage, goToPrevImage]);

  // Effect to scroll to the correct post when modal opens
  useEffect(() => {
      if (selectedImage && selectedImage.type === 'post' && postScrollContainerRef.current) {
          setTimeout(() => {
              if(postScrollContainerRef.current) {
                 // Ensure the scroll position is correct for the initial post
                 postScrollContainerRef.current.scrollTop = currentPostIndex * postScrollContainerRef.current.clientHeight;
              }
          }, 100);
      }
  }, [selectedImage, currentPostIndex, posts]); 
  
  // Effect to update currentPostIndex on scroll
  useEffect(() => {
    const container = postScrollContainerRef.current;
    if (!container || (selectedImage && selectedImage.type !== 'post')) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const newIndex = Math.round(container.scrollTop / container.clientHeight);
        // Only update if the index actually changed
        if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
          setCurrentPostIndex(newIndex);
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentPostIndex, selectedImage, posts]);

  const openPostModal = (post) => {
    // When opening a post modal, 'index' should be the index within the currently displayed 'posts' array.
    setCurrentPostIndex(posts.findIndex(p => p.id === post.id)); // Find index in the current posts list
    setSelectedImage({ ...post, type: 'post' });
  };

  const tabs = [
    { id: "all", name: "All", icon: Grip, count: photos.length + events.length + posts.length + links.length },
    { id: "photos", name: "Photos", icon: Image, count: photos.length },
    { id: "events", name: "Events", icon: Calendar, count: events.length },
    { id: "posts", name: "Posts", icon: MessageSquare, count: posts.length },
    { id: "links", name: "Links", icon: LinkIcon, count: links.length },
  ];

  const filterData = (data) => {
    if (!searchQuery) return data;
    const searchText = searchQuery.toLowerCase();
    return data.filter(item =>
      // Check common fields like title, content, name, location, sharedBy, url
      (item.title && String(item.title).toLowerCase().includes(searchText)) ||
      (item.content && String(item.content).toLowerCase().includes(searchText)) ||
      (item.author_name && String(item.author_name).toLowerCase().includes(searchText)) ||
      (item.location && String(item.location).toLowerCase().includes(searchText)) ||
      (item.sharedBy && String(item.sharedBy).toLowerCase().includes(searchText)) ||
      (item.url && String(item.url).toLowerCase().includes(searchText)) ||
      (item.venue_name && String(item.venue_name).toLowerCase().includes(searchText))
    );
  };

  const getCurrentData = () => { 
    let sourceData = [];
    if (showPinned) {
      sourceData = pinned; 
    } else {
        // If not showing pinned, filter from the main media based on activeTab
        const { photos, events, posts, links } = getCategorizedMedia(media); // Re-categorize for current view
        switch (activeTab) {
            case 'all':
                sourceData = [...photos, ...events, ...posts, ...links].sort((a,b) => new Date(b.sharedAt || b.date) - new Date(a.sharedAt || a.date));
                break;
            case 'photos':
                sourceData = photos;
                break;
            case 'events':
                sourceData = events;
                break;
            case 'posts':
                sourceData = posts;
                break;
            case 'links':
                sourceData = links;
                break;
            default:
                sourceData = [];
        }
    }
    return filterData(sourceData);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4">Error: {error}</h2><Button onClick={() => navigate(-1)}>Go Back</Button></div></div>;
  }

  // If chatTitle is empty, but no explicit error, means chat params were not provided or invalid
  if (!chatTitle) { 
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold mb-4">No Chat Selected</h2><p className="text-gray-500 mb-4">Please select a chat to view its media (e.g., ?groupId=... or ?user=...).</p><Button onClick={() => navigate(-1)}>Go Back</Button></div></div>;
  }

  const currentData = getCurrentData();

  const renderItem = (item) => {
    switch (item.type) {
      case 'event':
        return (
          <div key={`${item.id}-${item.title}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3">
              <img src={item.cover_image} alt={item.title} className="w-16 h-16 rounded-lg object-cover"/>
              <div>
                <Link to={createPageUrl(`EventDetails?id=${item.id}`)} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors no-underline">{item.title}</Link>
                <p className="text-sm text-gray-500">{item.venue_name}</p>
                <p className="text-sm text-gray-500">{format(new Date(item.date), "MMM d, yyyy")}</p>
                {item.sharedBy && <p className="text-xs text-gray-400">Shared by {item.sharedBy}</p>}
              </div>
            </div>
          </div>
        );
      case 'link':
        return (
          <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group">
            <LinkIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
            <div>
              <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
              <p className="text-sm text-gray-500 truncate">{item.url}</p>
              {item.sharedBy && <p className="text-xs text-gray-400">Shared by {item.sharedBy}</p>}
            </div>
          </a>
        );
      case 'photo':
        return (
          <div key={item.id} className="relative cursor-pointer" onClick={() => openImageModal(item)}>
             <img src={item.url} alt="Shared photo" className="w-full h-auto max-h-60 object-cover rounded-lg"/>
             <p className="text-xs text-gray-500 mt-1">Shared by {item.sharedBy} on {item.sharedAt ? format(new Date(item.sharedAt), "MMM d, yyyy") : 'a while ago'}</p>
          </div>
        );
      case 'post':
        return (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer" onClick={() => openPostModal(item)}>
            <div className="flex items-start gap-3">
                <img src={item.author_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop"} alt={item.author_name} className="w-10 h-10 rounded-full object-cover"/>
                <div>
                    <p className="font-semibold text-gray-800">{item.author_name}</p>
                    <p className="text-gray-600">{item.content}</p>
                    {item.image_url && <img src={item.image_url} alt="post content" className="mt-2 rounded-lg max-h-60 object-cover"/>}
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Media</h1>
            <p className="text-gray-500">Shared photos, links, and content for {chatTitle}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input placeholder="Search media..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
        </div>

        {/* Pinned Media Checkbox */}
        {isGroupChatFlag && pinned.length > 0 && ( // Use the new flag and check if there's any pinned media
          <div className="mb-4 flex items-center">
            <label htmlFor="pinned-media" className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="pinned-media"
                checked={showPinned} 
                onChange={(e) => {
                  setShowPinned(e.target.checked);
                  if (!e.target.checked) setActiveTab('photos'); // Reset to photos tab if unchecking pinned
                }} 
                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
              />
              <Pin className="w-3 h-3 text-gray-400"/>
              <span className="text-xs">Pinned Media</span>
            </label>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide flex-nowrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowPinned(false);
                }}
                className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id && !showPinned
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name} ({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="p-6" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {showPinned ? (
              <div className="space-y-4">
                {currentData.length > 0 ? (
                  currentData.map(renderItem)
                ) : (
                  <div className="text-center py-12">
                     <Pin className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pinned Media</h3>
                     <p className="text-gray-500">Group admins can pin important media.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Adjustments for content display based on activeTab */}
                {activeTab === "all" && <div className="space-y-4">{currentData.length > 0 ? currentData.map(renderItem) : <div className="text-center py-12"><h3 className="text-lg font-semibold text-gray-900 mb-2">No media shared yet</h3></div>}</div>}
                {activeTab === "photos" && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{currentData.length > 0 ? currentData.map((photo) => <div key={photo.id} className="group relative cursor-pointer" onClick={() => openImageModal(photo)}><img src={photo.url} alt="Shared photo" className="w-full aspect-square object-cover rounded-lg"/></div>) : <div className="text-center py-12 col-span-full"><h3 className="text-lg font-semibold text-gray-900 mb-2">No photos shared yet</h3></div>}</div>}
                {activeTab === "links" && <div className="space-y-3">{currentData.length > 0 ? currentData.map(renderItem) : <div className="text-center py-12"><h3 className="text-lg font-semibold text-gray-900 mb-2">No links shared yet</h3></div>}</div>}
                {activeTab === "events" && <div className="space-y-4">{currentData.length > 0 ? currentData.map(renderItem) : <div className="text-center py-12"><h3 className="text-lg font-semibold text-gray-900 mb-2">No events shared yet</h3></div>}</div>}
                {activeTab === "posts" && <div className="space-y-4"><div className="grid grid-cols-2 sm:grid-cols-3 gap-1">{currentData.length > 0 ? currentData.map((post) => (<div key={post.id} className="group relative cursor-pointer aspect-square" onClick={() => openPostModal(post)}><img src={post.image_url} alt={post.content} className="w-full h-full object-cover rounded-lg"/></div>)) : <div className="text-center py-12 col-span-full"><h3 className="text-lg font-semibold text-gray-900 mb-2">No posts shared yet</h3></div>}</div></div>}
              </>
            )}
          </div>
        </div>

        {/* Regular Image Modal for Photos */}
        {selectedImage && selectedImage.type === 'photo' && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button onClick={(e) => { e.stopPropagation(); goToPrevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); goToNextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"><ChevronRight className="w-6 h-6" /></button>
            <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"><X className="w-6 h-6" /></button>
              <img src={selectedImage.url} alt="Shared photo" className="w-full h-auto max-h-[90vh] object-contain rounded-lg"/>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg"><div className="text-white"><p className="font-medium">{selectedImage.sharedBy}</p><p className="text-sm text-gray-300">{selectedImage.sharedAt ? format(new Date(selectedImage.sharedAt), "MMM d, yyyy") : 'a while ago'}</p></div></div>
            </div>
          </div>
        )}

        {/* Post Modal - Vertical Scroller like VibeReel */}
        {selectedImage && selectedImage.type === 'post' && (
          <div 
            ref={postScrollContainerRef}
            className="fixed inset-0 bg-black z-50 scroll-container scrollbar-hide"
          >
            {posts.length > 0 ? posts.map((post, index) => ( 
              <div key={`${post.id}-${index}`} className="scroll-item relative">
                {/* Background Image */}
                <img src={post.image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover"/>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)' }}/>
                
                {/* Top header with close button */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
                    <button onClick={() => setSelectedImage(null)} className="text-white bg-black/50 rounded-full p-2" aria-label="Close post viewer"><X className="w-5 h-5" /></button>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-16 left-0 right-0 p-4 text-white z-30">
                  <div className="flex justify-between items-end gap-3">
                    {/* Left Side: Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <Link to={createPageUrl(`CuratorProfile?curator=${encodeURIComponent(post.author_name)}`)} className="relative flex items-center gap-2 group hover:bg-black/30 rounded-full px-2 py-1 -mx-2 -my-1 transition-all duration-200 w-fit" onClick={(e) => e.stopPropagation()}>
                        <img src={post.author_avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop"} className="w-5 h-5 rounded-full object-cover drop-shadow-sm" alt={post.author_name}/>
                        <span className="font-semibold text-xs text-white drop-shadow-md group-hover:underline decoration-white/50 decoration-1 underline-offset-2 group-hover:text-blue-200 transition-all duration-200">{post.author_name}</span>
                      </Link>
                      <h3 className="font-bold text-lg drop-shadow leading-tight">{post.title || post.author_name + " Post"}</h3>
                      <p className="font-sans text-sm text-white/90 leading-relaxed drop-shadow">{post.content}</p>
                      {post.location && (
                        <div className="font-mono text-xs flex items-center gap-2 mt-1.5 text-gray-300">
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{post.location}</span></div>
                          <span className="text-gray-500">•</span>
                          <span>{post.sharedAt ? format(new Date(post.sharedAt), "MMM d, yyyy") : 'Just now'}</span>
                        </div>
                      )}
                    </div>
                    {/* Right Side: Action Buttons */}
                    <div className="flex flex-col bg-black/50 backdrop-blur-sm p-1.5 rounded-xl gap-1">
                      <button className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300"><Heart className="w-5 h-5 drop-shadow" /><span className="text-[10px] font-semibold tracking-wide">{post.likes || 247}</span></button>
                      <button className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300"><MessageCircle className="w-5 h-5 drop-shadow" /><span className="text-[10px] font-semibold tracking-wide">{post.comments?.length || 12}</span></button>
                      <button className="flex flex-col items-center gap-0.5 text-center text-white w-full transition-colors hover:text-gray-300"><Bookmark className="w-5 h-5 drop-shadow" /><span className="text-[10px] font-semibold tracking-wide">Save</span></button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
                <div className="scroll-item flex items-center justify-center text-white text-center">
                    No posts available for this chat.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
