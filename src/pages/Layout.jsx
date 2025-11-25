
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, User as UserIcon, Search, Bookmark, Plus, Camera, Calendar as CalendarIcon, BookOpen, X, TicketIcon } from "lucide-react";
import { User } from "@/api/entities";
import { apiCache } from "./components/apiCache";
import { simulatedDataManager } from './components/simulatedDataManager';
import { base44 } from '@/api/base44Client';

const LoginPromptDialog = ({ isOpen, onClose, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Login Required</h3>
        <p className="text-gray-700 mb-5">
          You need to be logged in to {action}. Please log in or create an account to continue.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              window.location.href = createPageUrl("Profile") + "?logout=true";
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Login / Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState("create content");

  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const lastScrollY = useRef(0);

  const shouldUseDarkMobileNav = useMemo(() => {
    const darkPageNames = ['feed', 'map', 'vibereel', 'eventdetails'];
    return darkPageNames.some(name => currentPageName.toLowerCase() === name);
  }, [currentPageName]);

  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(location.search);
      const logoutParam = urlParams.get('logout');

      if (logoutParam) {
        console.log('🚪 Layout: Logout param detected - forcing logged out state');
        setCurrentUser(null);
        localStorage.removeItem('auth_bypassed');
        localStorage.removeItem('bypass_mode');
        simulatedDataManager.clearSimulatedSession();
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.delete('logout');
        navigate(location.pathname + (newSearchParams.toString() ? '?' + newSearchParams.toString() : ''), { replace: true });
        return;
      }

      const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
      const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
      const isDemo = localStorage.getItem('bypass_mode') === 'demo';

      console.log('🔍 Layout: Auth check:', { authBypassed, isAdmin, isDemo, pathname: location.pathname });

      if (authBypassed && (isAdmin || isDemo)) {
        const baseUser = simulatedDataManager.getBaseUser();

        if (isAdmin) {
          console.log('👑 Layout: Admin mode with base user');
          const adminOverrides = simulatedDataManager.getAdminUserUpdates();
          const adminUser = { ...baseUser, ...adminOverrides, _isAdminMode: true };
          setCurrentUser(adminUser);
        } else {
          console.log('🎭 Layout: Demo mode with overrides');
          const demoUser = simulatedDataManager.applyDemoOverrides(baseUser);
          setCurrentUser(demoUser);
        }
        return;
      }

      try {
        const user = await base44.auth.me();
        console.log('✅ Layout: Authenticated user:', user?.email);
        setCurrentUser(user);
      } catch (error) {
        console.log('❌ Layout: Auth failed, user logged out', error);
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, [location.pathname, location.search, navigate]);

  const createEventPageUrl = createPageUrl("CreateEvent");
  const isCreatePageActive = location.pathname === createEventPageUrl;

  if (location.pathname === '/') {
    return <Navigate to={createPageUrl("Feed")} replace />;
  }

  const isChatWindowPage = location.pathname.startsWith(createPageUrl("ChatWindow"));

  const urlParams = new URLSearchParams(location.search);
  const logoutParam = urlParams.get('logout');
  const profileEmailParam = urlParams.get('user');
  const isProfilePage = location.pathname === createPageUrl("Profile");

  const isViewingOwnProfile = isProfilePage && (!profileEmailParam || (currentUser && profileEmailParam === currentUser.email));

  const showingLoginBypass = isProfilePage && (!currentUser || logoutParam) && !profileEmailParam;

  const isLoginPage = currentPageName === 'Login' ||
    location.pathname.includes('/Login') ||
    location.pathname === createPageUrl('Login') ||
    location.pathname.includes('/login') ||
    (isProfilePage && !currentUser && !profileEmailParam && !logoutParam);

  const isFeedPage = location.pathname === createPageUrl("Feed");
  const isMapPage = location.pathname.startsWith(createPageUrl("Map"));
  const isEventDetailsPage = location.pathname.startsWith(createPageUrl("EventDetails"));

  const vibeReelPageUrl = createPageUrl("VibeReel");
  const isVibeReelPage = location.pathname === vibeReelPageUrl ||
    location.pathname.startsWith(vibeReelPageUrl + '?') ||
    location.pathname.includes('/VibeReel') ||
    currentPageName === 'VibeReel';

  const isExplorePage = currentPageName === 'Explore';

  const isFullScreenPage = isFeedPage || isMapPage || isVibeReelPage || isEventDetailsPage;

  console.log('🔍 Layout Debug:', {
    pathname: location.pathname,
    currentPageName,
    isVibeReelPage,
    shouldUseDarkMobileNav,
    vibeReelPageUrl,
    currentUser,
    isLoginPage,
    showingLoginBypass,
    isViewingOwnProfile
  });

  if (isChatWindowPage || isLoginPage) {
    return (
      <div className="overflow-x-hidden">
        <style>{`
          @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
          :root {
            --primary-bg: #F9FAFB;
            --primary-text: #111827;
            --secondary-text: #6B7280;
            --accent-turquoise: #2DD4BF;
            --accent-cobalt: #4F46E5;
            --accent-light-blue: #3B82F6;
            --border-color: #E5E7EB;
            --mobile-nav-height: 64px;
          }

          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Roboto+Mono:wght@400;700&display=swap');

          html, body {
            background-color: var(--primary-bg);
            overflow-x: hidden;
            width: 100vw;
            max-width: 100%;
          }

          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            box-sizing: border-box;
          }

          html {
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          .font-display {
            font-family: 'Inter', sans-serif;
            font-weight: 900;
          }

          .font-mono {
            font-family: 'Roboto Mono', monospace;
          }

          .glass-effect {
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            background: rgba(255, 255, 255, 0.75);
            border-color: rgba(229, 231, 235, 0.75);
          }

          .gradient-text {
            background: linear-gradient(90deg, var(--accent-turquoise), var(--accent-cobalt));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .scroll-container {
            scroll-snap-type: y mandatory;
            overflow-y: scroll;
            height: 100vh;
          }

          .scroll-item {
            scroll-snap-align: start;
            height: 100vh;
            width: 100vw;
            flex-shrink: 0;
          }

          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }

          .h-scroll-snap {
              scroll-snap-type: x mandatory;
              scroll-behavior: smooth;
          }
          .h-scroll-snap-center {
              scroll-snap-align: center;
          }
        `}</style>
        {children}
      </div>
    );
  }

  const desktopNavItems = [
    { title: "Explore", url: createPageUrl("Feed"), icon: Sparkles },
    { title: "Search", url: createPageUrl("Explore"), icon: Search },
    { title: "Planner", url: createPageUrl("MyList"), icon: Bookmark },
    { title: "Profile", url: createPageUrl("Profile"), icon: UserIcon }
  ];

  const desktopNavLeft = desktopNavItems.slice(0, 2);
  const desktopNavRight = desktopNavItems.slice(2);

  const mobileNavLeft = [
    { title: "Explore", url: createPageUrl("Feed"), icon: Sparkles },
    { title: "Search", url: createPageUrl("Explore"), icon: Search }
  ];

  const mobileNavRight = [
    { title: "Planner", url: createPageUrl("MyList"), icon: Bookmark },
    { title: "Profile", url: createPageUrl("Profile"), icon: UserIcon }
  ];

  const createOptions = [
    {
      id: 'moment',
      title: 'Moment',
      icon: Camera,
      action: () => {
        alert("Feature coming soon!");
      }
    },
    {
      id: 'entry',
      title: 'Entry',
      icon: BookOpen,
      action: () => {
        alert("Feature coming soon!");
      }
    },
    {
      id: 'event',
      title: 'Event',
      icon: CalendarIcon,
      action: () => {
        window.location.href = createPageUrl("CreateEvent");
      }
    }
  ];

  const handleLogout = async () => {
    console.log('🚪 User initiated logout. Clearing session and redirecting.');
    simulatedDataManager.clearSimulatedSession();
    localStorage.removeItem('auth_bypassed');
    localStorage.removeItem('bypass_mode');
    navigate(createPageUrl('Feed'));
  };

  const handleCreateClick = () => {
    if (!currentUser) {
      setLoginPromptAction("create content");
      setShowLoginPrompt(true);
    } else {
      setShowCreateOptions(true);
    }
  };

  const handleCreateOptionClick = (option) => {
    setShowCreateOptions(false);

    if (!currentUser) {
      setLoginPromptAction(`create a ${option.title.toLowerCase()}`);
      setShowLoginPrompt(true);
      return;
    }

    option.action();
  };

  const showMobileNav = !isLoginPage && currentPageName !== 'Chat';

  const mainPadding = isFullScreenPage ? 'p-0' : isExplorePage ? 'pb-20 md:pb-8' : 'pb-24 md:pb-8';

  return (
    <div className={shouldUseDarkMobileNav ? "min-h-screen bg-black text-white overflow-x-hidden" : "min-h-screen bg-gradient-to-br from-cyan-50 via-gray-50 to-blue-100 text-gray-900 overflow-x-hidden"}>
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        :root {
          --primary-bg: #F9FAFB;
          --primary-text: #111827;
          --secondary-text: #6B7280;
          --accent-turquoise: #2DD4BF;
          --accent-cobalt: #4F46E5;
          --accent-light-blue: #3B82F6;
          --border-color: #E5E7EB;
          --mobile-nav-height: 64px;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Roboto+Mono:wght@400;700&display=swap');

        html, body {
          background-color: ${shouldUseDarkMobileNav ? 'black' : 'var(--primary-bg)'};
          overflow-x: hidden;
          width: 100vw;
          max-width: 100%;
        }

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          box-sizing: border-box;
        }

        html {
          overflow-x: hidden;
          width: 100%;
          max-width: 100%;
        }

        .font-display {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
        }

        .font-mono {
            font-family: 'Roboto Mono', monospace;
        }

        .glass-effect {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.75);
          border-color: rgba(229, 231, 235, 0.75);
        }

        .gradient-text {
          background: linear-gradient(90deg, var(--accent-turquoise), var(--accent-cobalt));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .scroll-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          height: 100vh;
        }

        .scroll-item {
          scroll-snap-align: start;
          height: 100vh;
          width: 100vw;
          flex-shrink: 0;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .h-scroll-snap {
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
        }
        .h-scroll-snap-center {
            scroll-snap-align: center;
        }

        body.comments-modal-open nav#mobile-nav,
        body.comments-modal-open nav#event-reel-nav {
          display: none !important;
        }

        ${isFullScreenPage ? `
        html, body {
          background: black !important;
        }
        ` : ''}

        ${shouldUseDarkMobileNav ? `
        nav#mobile-nav {
          background: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(12px);
          border-top-color: rgba(255, 255, 255, 0.2) !important;
        }
        nav#mobile-nav a,
        nav#mobile-nav button {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        nav#mobile-nav a.active,
        nav#mobile-nav a[href="${location.pathname}"] {
          color: rgba(255, 255, 255, 1) !important;
        }
        ` : ''}
      `}</style>

      {!isLoginPage && (
        <header className="hidden md:block sticky top-0 z-50 glass-effect border-b border-gray-200">
          <div className="bg-slate-50 mx-auto px-4 max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Link to={createPageUrl("Feed")} className="text-2xl font-bold gradient-text">
                  OneSocial
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {desktopNavLeft.map((item) => {
                const isActive = item.title === "Profile" ? isViewingOwnProfile : location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`text-sm font-medium transition-colors rounded-full px-4 py-2 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}

              <div className="relative">
                <button
                  onClick={handleCreateClick}
                  className={`rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-200 text-sm font-medium ${
                    showCreateOptions || isCreatePageActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>

                {showCreateOptions && currentUser && (
                  <>
                    <div
                      className="fixed inset-0 bg-transparent z-40"
                      onClick={() => setShowCreateOptions(false)}
                    />

                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4 z-50 min-w-[300px]">
                      <div className="flex items-center gap-6">
                        {createOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleCreateOptionClick(option)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-200 group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow duration-200">
                              <option.icon className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{option.title}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-center mt-3">
                        <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {desktopNavRight.map((item) => {
                const isActive = item.title === "Profile" ? isViewingOwnProfile : location.pathname === item.url;
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      if (location.pathname === item.url) {
                        window.location.reload();
                      } else {
                        window.location.href = item.url;
                      }
                    }}
                    className={`text-sm font-medium transition-colors rounded-full px-4 py-2 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>
      )}

      <main className={mainPadding}>
        {children}
      </main>

      {showMobileNav && !isLoginPage && (
        <nav
            id="mobile-nav"
            className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${
              shouldUseDarkMobileNav
                ? "bg-black/90 backdrop-blur-md border-white/20"
                : "bg-white/90 backdrop-blur-md border-gray-200"
            }`}
            style={{ height: '72px', zIndex: 99999, paddingTop: '12px' }}
          >
          <div className="pt-2 pr-2 pb-10 pl-2 h-16 flex items-center">
          {mobileNavLeft.map((item) => {
            const isActive = item.title === "Profile" ? isViewingOwnProfile : location.pathname === item.url;
            return (
              <button
                key={item.title}
                onClick={() => {
                  if (location.pathname === item.url) {
                    window.location.reload();
                  } else {
                    window.location.href = item.url;
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 text-xs font-medium transition-colors ${
                  isActive
                    ? shouldUseDarkMobileNav ? "text-white" : "text-blue-600"
                    : shouldUseDarkMobileNav ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                {item.title}
              </button>
            );
          })}

          <div className="flex flex-col items-center justify-center flex-1 relative" style={{ zIndex: 10000 }}>
            <button
              onClick={handleCreateClick}
              className="w-10 h-9 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 mb-0.5"
              style={{ zIndex: 10001, pointerEvents: 'auto' }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>

            {showCreateOptions && currentUser && (
              <>
                <div
                  className="fixed inset-0 bg-black/20"
                  style={{ zIndex: 9998 }}
                  onClick={() => setShowCreateOptions(false)}
                />

                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-4" style={{ zIndex: 10002 }}>
                  <div className="flex items-center gap-6">
                    {createOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleCreateOptionClick(option)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50/80 transition-all duration-200 group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow duration-200">
                          <option.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{option.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center mt-3">
                    <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {mobileNavRight.map((item) => {
            const isActive = item.title === "Profile" ? isViewingOwnProfile : location.pathname === item.url;
            return (
              <button
                key={item.title}
                onClick={() => {
                  if (location.pathname === item.url) {
                    window.location.reload();
                  } else {
                    window.location.href = item.url;
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 text-xs font-medium transition-colors ${
                  isActive
                    ? shouldUseDarkMobileNav ? "text-white" : "text-blue-600"
                    : shouldUseDarkMobileNav ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                {item.title}
              </button>
            );
          })}
        </div>
      </nav>
      )}

      <LoginPromptDialog
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction}
      />
    </div>
  );
}
