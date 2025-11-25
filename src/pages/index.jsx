import Layout from "./Layout.jsx";

import Feed from "./Feed";

import EventDetails from "./EventDetails";

import CreateEvent from "./CreateEvent";

import MyTickets from "./MyTickets";

import MyList from "./MyList";

import Map from "./Map";

import Profile from "./Profile";

import Explore from "./Explore";

import CuratorProfile from "./CuratorProfile";

import MyFeed from "./MyFeed";

import EditProfile from "./EditProfile";

import SettingsIndex from "./SettingsIndex";

import SettingsNotifications from "./SettingsNotifications";

import SettingsPrivacy from "./SettingsPrivacy";

import SettingsBlocked from "./SettingsBlocked";

import SettingsSupport from "./SettingsSupport";

import Chat from "./Chat";

import EventAttendees from "./EventAttendees";

import PaymentSetup from "./PaymentSetup";

import SettingsCalendar from "./SettingsCalendar";

import ReviewEvents from "./ReviewEvents";

import SettingsConnectedAccounts from "./SettingsConnectedAccounts";

import SettingsRecommendations from "./SettingsRecommendations";

import VibeSurvey from "./VibeSurvey";

import Buddies from "./Buddies";

import ChatWindow from "./ChatWindow";

import AllReviews from "./AllReviews";

import profile from "./profile";

import VibeReel from "./VibeReel";

import SettingsActivity from "./SettingsActivity";

import Collection from "./Collection";

import EventPeople from "./EventPeople";

import ActivityDetails from "./ActivityDetails";

import SettingsAccountControls from "./SettingsAccountControls";

import GroupSettings from "./GroupSettings";

import ChatMedia from "./ChatMedia";

import SettingsAccountType from "./SettingsAccountType";

import ViewAllReviews from "./ViewAllReviews";

import SettingsSyncContacts from "./SettingsSyncContacts";

import SettingsArchive from "./SettingsArchive";

import InviteGuests from "./InviteGuests";

import SettingsAIControls from "./SettingsAIControls";

import NewChat from "./NewChat";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Feed: Feed,
    
    EventDetails: EventDetails,
    
    CreateEvent: CreateEvent,
    
    MyTickets: MyTickets,
    
    MyList: MyList,
    
    Map: Map,
    
    Profile: Profile,
    
    Explore: Explore,
    
    CuratorProfile: CuratorProfile,
    
    MyFeed: MyFeed,
    
    EditProfile: EditProfile,
    
    SettingsIndex: SettingsIndex,
    
    SettingsNotifications: SettingsNotifications,
    
    SettingsPrivacy: SettingsPrivacy,
    
    SettingsBlocked: SettingsBlocked,
    
    SettingsSupport: SettingsSupport,
    
    Chat: Chat,
    
    EventAttendees: EventAttendees,
    
    PaymentSetup: PaymentSetup,
    
    SettingsCalendar: SettingsCalendar,
    
    ReviewEvents: ReviewEvents,
    
    SettingsConnectedAccounts: SettingsConnectedAccounts,
    
    SettingsRecommendations: SettingsRecommendations,
    
    VibeSurvey: VibeSurvey,
    
    Buddies: Buddies,
    
    ChatWindow: ChatWindow,
    
    AllReviews: AllReviews,
    
    profile: profile,
    
    VibeReel: VibeReel,
    
    SettingsActivity: SettingsActivity,
    
    Collection: Collection,
    
    EventPeople: EventPeople,
    
    ActivityDetails: ActivityDetails,
    
    SettingsAccountControls: SettingsAccountControls,
    
    GroupSettings: GroupSettings,
    
    ChatMedia: ChatMedia,
    
    SettingsAccountType: SettingsAccountType,
    
    ViewAllReviews: ViewAllReviews,
    
    SettingsSyncContacts: SettingsSyncContacts,
    
    SettingsArchive: SettingsArchive,
    
    InviteGuests: InviteGuests,
    
    SettingsAIControls: SettingsAIControls,
    
    NewChat: NewChat,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Feed />} />
                
                
                <Route path="/Feed" element={<Feed />} />
                
                <Route path="/EventDetails" element={<EventDetails />} />
                
                <Route path="/CreateEvent" element={<CreateEvent />} />
                
                <Route path="/MyTickets" element={<MyTickets />} />
                
                <Route path="/MyList" element={<MyList />} />
                
                <Route path="/Map" element={<Map />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Explore" element={<Explore />} />
                
                <Route path="/CuratorProfile" element={<CuratorProfile />} />
                
                <Route path="/MyFeed" element={<MyFeed />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
                <Route path="/SettingsIndex" element={<SettingsIndex />} />
                
                <Route path="/SettingsNotifications" element={<SettingsNotifications />} />
                
                <Route path="/SettingsPrivacy" element={<SettingsPrivacy />} />
                
                <Route path="/SettingsBlocked" element={<SettingsBlocked />} />
                
                <Route path="/SettingsSupport" element={<SettingsSupport />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/EventAttendees" element={<EventAttendees />} />
                
                <Route path="/PaymentSetup" element={<PaymentSetup />} />
                
                <Route path="/SettingsCalendar" element={<SettingsCalendar />} />
                
                <Route path="/ReviewEvents" element={<ReviewEvents />} />
                
                <Route path="/SettingsConnectedAccounts" element={<SettingsConnectedAccounts />} />
                
                <Route path="/SettingsRecommendations" element={<SettingsRecommendations />} />
                
                <Route path="/VibeSurvey" element={<VibeSurvey />} />
                
                <Route path="/Buddies" element={<Buddies />} />
                
                <Route path="/ChatWindow" element={<ChatWindow />} />
                
                <Route path="/AllReviews" element={<AllReviews />} />
                
                <Route path="/profile" element={<profile />} />
                
                <Route path="/VibeReel" element={<VibeReel />} />
                
                <Route path="/SettingsActivity" element={<SettingsActivity />} />
                
                <Route path="/Collection" element={<Collection />} />
                
                <Route path="/EventPeople" element={<EventPeople />} />
                
                <Route path="/ActivityDetails" element={<ActivityDetails />} />
                
                <Route path="/SettingsAccountControls" element={<SettingsAccountControls />} />
                
                <Route path="/GroupSettings" element={<GroupSettings />} />
                
                <Route path="/ChatMedia" element={<ChatMedia />} />
                
                <Route path="/SettingsAccountType" element={<SettingsAccountType />} />
                
                <Route path="/ViewAllReviews" element={<ViewAllReviews />} />
                
                <Route path="/SettingsSyncContacts" element={<SettingsSyncContacts />} />
                
                <Route path="/SettingsArchive" element={<SettingsArchive />} />
                
                <Route path="/InviteGuests" element={<InviteGuests />} />
                
                <Route path="/SettingsAIControls" element={<SettingsAIControls />} />
                
                <Route path="/NewChat" element={<NewChat />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}