import React, { useState, useEffect, useRef, useCallback } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM, simulatedDataManager } from "@/api/integrations";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, MapPin, DollarSign, Users, Camera, X, Plus, Link2, Sparkles, ChevronLeft, Image as ImageIcon, Settings, Clock, Tag, Lock, AlertTriangle, ChevronDown, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import LocationInput from "../components/event/LocationInput";
import UnsavedChangesDialog from "../components/shared/UnsavedChangesDialog";


// FormSection component for consistent section styling
const FormSection = ({ title, description, children }) =>
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-2xl p-6 shadow-subtle border border-gray-200/80">

    <div className="border-b border-gray-100 pb-4">
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.div>;

// Helper for deep equality comparison
const areObjectsEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    // Handles primitive types, null, and non-objects
    return obj1 === obj2;
  }

  // Handle Arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!areObjectsEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // If one is array and other is not (after checking for object type), they are not equal), they are not equal
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;


  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    // Ensure key exists in obj2 and their values are deeply equal
    if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

// Move defaultFormData outside component to avoid dependency issues
const defaultFormData = {
  title: "",
  description: "",
  date: "",
  end_date: "",
  rsvp_deadline: "",
  timezone: "America/New_York",
  location: "",
  venue_name: "",
  latitude: null,
  longitude: null,
  category: "",
  price: 0,
  age_requirement: "all_ages",
  age_range: "",
  media: [],
  scene_tags: [],
  source: "Manual",
  privacy_level: "public",
  show_attendee_list: true,
  has_guest_list: true,
  additional_questions: [],
  co_hosts: [],
  capacity: "",
  allow_guest_sharing: true,
  event_links: [],
  payment_required: false,
  payment_methods: [],
  payment_type: "required",
  status: 'draft',
  allow_plus_ones: "no",
  max_plus_ones: 1,
  require_plus_one_names: false,
  allow_maybe_rsvp: true,
  allow_guest_photos: false,
  event_board_mode: 'blasts_only',
  guest_anonymity_enabled: false,
  enable_calendar_sync: false,
  allow_reviews: true
};


export default function CreateEvent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [categorySearch, setCategorySearch] = useState('');
  const [isGuestPermissionsOpen, setIsGuestPermissionsOpen] = useState(false);
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [isTicketingOpen, setIsTicketingOpen] = useState(false);
  const [isEngagementOpen, setIsEngagementOpen] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [currentMediaPreviewIndex, setCurrentMediaPreviewIndex] = useState(0);

  const [formData, setFormData] = useState(defaultFormData);
  const [originalFormData, setOriginalFormData] = useState(defaultFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState(null);

  const [newTag, setNewTag] = useState("");
  const [newQuestion, setNewQuestion] = useState({ question: "", required: false });
  const [newCoHost, setNewCoHost] = useState("");
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [eventId, setEventId] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ method: "", id: "" });
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

  // Ref to hold the latest `isDirty` value for the event listener
  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // First useEffect: Calculate `isDirty` state based on form data changes
  useEffect(() => {
    const dirty = !areObjectsEqual(formData, originalFormData);
    setIsDirty(dirty);
  }, [formData, originalFormData]); // Reruns when formData or originalFormData change

  // Second useEffect: Attach and clean up global click listener for unsaved changes
  const handleLinkClick = useCallback((e) => {
    const link = e.target.closest('a');
    // Use the ref to get the most current `isDirty` value
    if (isDirtyRef.current && link && link.getAttribute('href') && !link.getAttribute('target')) {
      const targetUrl = new URL(link.href);
      const currentUrl = new URL(window.location.href);
      if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
        e.preventDefault();
        setNavigationTarget(link.href);
        setShowUnsavedDialog(true);
      }
    }
  }, []); // Empty dependency array means this function is stable

  useEffect(() => {
    document.addEventListener('click', handleLinkClick, true); // Use capture phase
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [handleLinkClick]); // Reruns only if handleLinkClick changes (which it won't due to useCallback)


  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔍 CreateEvent: Starting initialization...');

        const authBypassed = localStorage.getItem('auth_bypassed') === 'true';
        const isAdmin = localStorage.getItem('bypass_mode') === 'admin';
        const isDemo = localStorage.getItem('bypass_mode') === 'demo';

        console.log('🔍 CreateEvent: Auth flags:', { authBypassed, isAdmin, isDemo });

        let user = null;

        // Get user based on mode
        if (authBypassed && (isAdmin || isDemo)) {
          user = simulatedDataManager.getBypassUser();
          console.log('👤 CreateEvent: Using bypass user:', user?.email);
        } else {
          try {
            user = await base44.auth.me();
            console.log('👤 CreateEvent: Got authenticated user:', user?.email);
          } catch (error) {
            console.log('❌ CreateEvent: Auth failed:', error.message);
            user = null;
          }
        }

        // If no user, redirect to login
        if (!user) {
          console.log('🚪 CreateEvent: No user, redirecting to login...');
          window.location.href = createPageUrl("Profile") + "?logout=true";
          return;
        }

        setCurrentUser(user);
        console.log('✅ CreateEvent: User set successfully');

        // Check if editing existing event
        const urlParams = new URLSearchParams(window.location.search);
        const eventIdToEdit = urlParams.get('edit');

        if (eventIdToEdit) {
          console.log('📝 CreateEvent: Loading event for editing:', eventIdToEdit);
          setEventId(eventIdToEdit);
          const events = await Event.filter({ id: eventIdToEdit });

          if (events.length > 0) {
            const eventToEdit = events[0];
            const mediaFromEdit = [];
            if (eventToEdit.cover_image) {
              mediaFromEdit.push({ url: eventToEdit.cover_image, type: eventToEdit.motion_background_url === eventToEdit.cover_image ? 'video' : 'image' });
            }
            if (eventToEdit.gallery_images && Array.isArray(eventToEdit.gallery_images)) {
              eventToEdit.gallery_images.forEach((imgUrl) => {
                mediaFromEdit.push({ url: imgUrl, type: 'image' });
              });
            }

            const loadedEventData = {
              ...eventToEdit,
              date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().slice(0, 16) : "",
              end_date: eventToEdit.end_date ? new Date(eventToEdit.end_date).toISOString().slice(0, 16) : "",
              rsvp_deadline: eventToEdit.rsvp_deadline ? new Date(eventToEdit.rsvp_deadline).toISOString().slice(0, 16) : "",
              age_requirement: eventToEdit.age_requirement || "all_ages",
              age_range: eventToEdit.age_range || "",
              additional_questions: eventToEdit.additional_questions || [],
              co_hosts: eventToEdit.co_hosts || [],
              capacity: eventToEdit.capacity || "",
              allow_guest_sharing: eventToEdit.allow_guest_sharing !== undefined ? eventToEdit.allow_guest_sharing : true,
              event_links: eventToEdit.event_links || [],
              payment_required: eventToEdit.payment_required || false,
              payment_methods: eventToEdit.payment_methods || [],
              payment_type: eventToEdit.payment_type || "required",
              status: eventToEdit.status || 'active',
              privacy_level: eventToEdit.privacy_level || 'public',
              has_guest_list: eventToEdit.has_guest_list !== undefined ? eventToEdit.has_guest_list : true,
              allow_plus_ones: eventToEdit.allow_plus_ones ? "yes" : "no",
              max_plus_ones: eventToEdit.max_plus_ones || 1,
              require_plus_one_names: eventToEdit.require_plus_one_names !== undefined ? eventToEdit.require_plus_one_names : false,
              allow_maybe_rsvp: eventToEdit.allow_maybe_rsvp !== undefined ? eventToEdit.allow_maybe_rsvp : true,
              allow_guest_photos: eventToEdit.allow_guest_photos !== undefined ? eventToEdit.allow_guest_photos : false,
              event_board_mode: eventToEdit.event_board_mode || 'blasts_only',
              latitude: eventToEdit.latitude || null,
              longitude: eventToEdit.longitude || null,
              timezone: eventToEdit.timezone || "America/New_York",
              scene_tags: eventToEdit.scene_tags || [],
              media: mediaFromEdit,
              guest_anonymity_enabled: eventToEdit.guest_anonymity_enabled !== undefined ? eventToEdit.guest_anonymity_enabled : false,
              enable_calendar_sync: eventToEdit.enable_calendar_sync !== undefined ? eventToEdit.enable_calendar_sync : false,
              allow_reviews: eventToEdit.allow_reviews !== undefined ? eventToEdit.allow_reviews : true
            };

            setFormData(loadedEventData);
            setOriginalFormData(loadedEventData);
            if (eventToEdit.category) {
              setSelectedCategories(new Set(eventToEdit.category.split(',')));
            }
          }
        } else {
          // For new events, set originalFormData to the current formData initial state
          setOriginalFormData({ ...defaultFormData });
        }
      } catch (error) {
        console.error('❌ CreateEvent: Initialization error:', error);
        // Redirect to login if 401
        if (error.response?.status === 401 || error.status === 401) {
          window.location.href = createPageUrl("Profile") + "?logout=true";
        }
      }
    };
    initialize();
  }, []);


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventBoardSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, event_board_mode: checked ? 'chat_and_blasts' : 'blasts_only' }));
  };

  const handleCancel = () => {
    if (isDirty) {
      setNavigationTarget(-1); // Special value to indicate navigate back
      setShowUnsavedDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingMedia(true);
    try {
      const newMediaItems = [];

      for (const file of files) {
        if (formData.media.length + newMediaItems.length >= 5) {
          console.warn("Maximum 5 media items allowed.");
          break;
        }

        const { file_url } = await UploadFile({ file });
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';

        newMediaItems.push({
          url: file_url,
          type: fileType,
          uploaded_by: currentUser?.email || 'organizer',
          uploaded_at: new Date().toISOString()
        });
      }

      setFormData((prev) => {
        const updatedMedia = [...prev.media, ...newMediaItems];
        if (newMediaItems.length > 0) {
          setCurrentMediaPreviewIndex(0); // Reset preview to the first image after upload
        }
        return { ...prev, media: updatedMedia };
      });
    } catch (error) {
      console.error("Error uploading media:", error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPromptInput.trim()) return;

    setIsGenerating(true);

    const fullPrompt = `Based on the following idea: "${aiPromptInput}", generate a detailed event. The event must be located in a real-world place. Provide a catchy title, a compelling description, a specific date and time in the future, a physical location and venue name, and determine an appropriate category, price, and age requirement. For the location provided, please also provide the precise latitude and longitude coordinates. If the idea implies a certain privacy level (e.g., 'secret rave' should be private), set it, otherwise default to public. Generate a few relevant scene tags. The response should be a JSON object.`;

    try {
      const response = await InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            end_date: { type: "string", format: "date-time" },
            location: { type: "string" },
            venue_name: { type: "string" },
            latitude: { type: "number" },
            longitude: { type: "number" },
            category: { type: "string", enum: ["music", "art", "food", "tech", "sports", "business", "wellness", "nightlife", "happy-hour", "rooftop", "bar", "park", "co-working", "culture", "outdoor", "market", "talk", "rave", "popup", "party", "picnic", "other"] },
            price: { type: "number" },
            age_requirement: { type: "string", enum: ["all_ages", "18+", "21+", "25+", "30+"] },
            age_range: { type: "string" },
            scene_tags: { type: "array", items: { type: "string" } },
            source: { type: "string" },
            privacy_level: { type: "string", enum: ["public", "semi-public", "private"] }
          },
          required: ["title", "description", "date", "location", "venue_name", "latitude", "longitude", "category", "price", "age_requirement"]
        }
      });

      if (response) {
        setFormData((prev) => ({
          ...prev,
          ...response,
          date: response.date ? new Date(response.date).toISOString().slice(0, 16) : "",
          end_date: response.end_date ? new Date(response.end_date).toISOString().slice(0, 16) : "",
          age_requirement: response.age_requirement || "all_ages",
          age_range: response.age_range || "",
          latitude: response.latitude || null,
          longitude: response.longitude || null,
          privacy_level: response.privacy_level || "public",
          source: response.source || "AI Generated"
        }));
        if (response.category) {
          setSelectedCategories(new Set(response.category.split(',')));
        }
        setAiPromptInput("");
      }
    } catch (error) {
      console.error("Error processing with AI:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeMedia = (index) => {
    setFormData((prev) => {
      const updatedMedia = prev.media.filter((_, i) => i !== index);
      if (currentMediaPreviewIndex >= updatedMedia.length && updatedMedia.length > 0) {
        setCurrentMediaPreviewIndex(updatedMedia.length - 1);
      } else if (updatedMedia.length === 0) {
        setCurrentMediaPreviewIndex(0);
      }
      return { ...prev, media: updatedMedia };
    });
  };

  const moveMedia = (dragIndex, hoverIndex) => {
    setFormData((prev) => {
      const newMedia = [...prev.media];
      const draggedItem = newMedia[dragIndex];
      newMedia.splice(dragIndex, 1);
      newMedia.splice(hoverIndex, 0, draggedItem);
      return { ...prev, media: newMedia };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.scene_tags.includes(newTag.trim()) && formData.scene_tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        scene_tags: [...prev.scene_tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      scene_tags: prev.scene_tags.filter((tag) => tag !== tagToRemove)
    }));
  };

  const addAdditionalQuestion = () => {
    if (newQuestion.question.trim()) {
      setFormData((prev) => ({
        ...prev,
        additional_questions: [...prev.additional_questions, { ...newQuestion, id: Date.now() }]
      }));
      setNewQuestion({ question: "", required: false });
    }
  };

  const removeAdditionalQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      additional_questions: prev.additional_questions.filter((q) => q.id !== questionId)
    }));
  };

  const addCoHost = () => {
    if (newCoHost.trim() && newCoHost.includes('@') && !formData.co_hosts.includes(newCoHost.trim())) {
      setFormData((prev) => ({
        ...prev,
        co_hosts: [...prev.co_hosts, newCoHost.trim()]
      }));
      setNewCoHost("");
    }
  };

  const removeCoHost = (coHostToRemove) => {
    setFormData((prev) => ({
      ...prev,
      co_hosts: prev.co_hosts.filter((coHost) => coHost !== coHostToRemove)
    }));
  };

  const addEventLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        event_links: [...prev.event_links, { ...newLink, id: Date.now() }]
      }));
      setNewLink({ title: "", url: "" });
    }
  };

  const removeEventLink = (linkId) => {
    setFormData((prev) => ({
      ...prev,
      event_links: prev.event_links.filter((link) => link.id !== linkId)
    }));
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod.method.trim() && newPaymentMethod.id.trim()) {
      setFormData((prev) => ({
        ...prev,
        payment_methods: [...prev.payment_methods, { ...newPaymentMethod }]
      }));
      setNewPaymentMethod({ method: "", id: "" });
    }
  };

  const removePaymentMethod = (index) => {
    setFormData((prev) => ({
      ...prev,
      payment_methods: prev.payment_methods.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    setHasAttemptedSubmit(true);

    if (!currentUser) {
      alert("You must be logged in to create an event.");
      return;
    }

    const requiredFields = ['title', 'description', 'date', 'location'];
    const isFormValid = requiredFields.every((field) => formData[field] && formData[field].toString().trim() !== '') && formData.media.length > 0;

    // Add payment method validation
    if (formData.payment_required && formData.payment_methods.length === 0 && !isDraft) {
      alert("Please add at least one payment method when accepting payments.");
      return;
    }

    if (!isFormValid && !isDraft) {
      return;
    }

    if (!isDraft && formData.date && new Date(formData.date) < new Date()) {
      alert("Event date cannot be in the past.");
      return;
    }

    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const eventIdToEdit = urlParams.get('edit');

      // Ensure media is an array of objects
      const mediaData = Array.isArray(formData.media) ? formData.media : [];

      const eventData = {
        ...formData,
        // Correctly map media to cover_image and gallery_images
        cover_image: mediaData.length > 0 ? mediaData[0].url : null,
        gallery_images: mediaData.slice(1).map((item) => item.url),
        motion_background_url: mediaData.length > 0 && mediaData[0].type === 'video' ? mediaData[0].url : null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : 100,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        rsvp_deadline: formData.rsvp_deadline ? new Date(formData.rsvp_deadline).toISOString() : null,
        allow_plus_ones: formData.allow_plus_ones === "yes",
        organizer_email: currentUser.email,
        organizer_name: currentUser.full_name,
        organizer_avatar: currentUser.avatar || "",
        status: isDraft ? 'draft' : 'active',
        guest_anonymity_enabled: formData.guest_anonymity_enabled,
        enable_calendar_sync: formData.enable_calendar_sync,
        allow_reviews: formData.allow_reviews,
        ...(!eventIdToEdit && { is_featured: false })
      };

      // Remove the temporary 'media' field before saving
      delete eventData.media;

      if (eventIdToEdit) {
        await Event.update(eventIdToEdit, eventData);
      } else {
        await Event.create(eventData);
      }

      setOriginalFormData(formData); // Update originalFormData to current saved state
      setIsDirty(false); // Form is now clean
      navigate(-1);

    } catch (error) {
      console.error("Error saving event:", error);
      alert("There was an error saving your event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
  { value: "music", label: "🎵 Music" },
  { value: "art", label: "🎨 Art" },
  { value: "food", label: "🍽️ Food" },
  { value: "tech", label: "💻 Tech" },
  { value: "sports", label: "⚽ Sports" },
  { value: "business", label: "💼 Business" },
  { value: "wellness", label: "🧘 Wellness" },
  { value: "nightlife", label: "🌃 Nightlife" },
  { value: "happy-hour", label: "🍻 Happy Hour" },
  { value: "rooftop", label: "🏙️ Rooftop" },
  { value: "bar", label: "🍸 Bar" },
  { value: "park", label: "🌳 Park" },
  { value: "co-working", label: "🧑‍💻 Co-working" },
  { value: "culture", label: "🏛️ Culture" },
  { value: "outdoor", label: "🏕️ Outdoor" },
  { value: "market", label: "🛍️ Market" },
  { value: "talk", label: "🎤 Talk" },
  { value: "rave", label: "⚡ Rave" },
  { value: "popup", label: "✨ Pop-up" },
  { value: "party", label: "🎉 Party" },
  { value: "picnic", label: "🧺 Picnic" },
  { value: "other", label: "🤔 Other" }];


  const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "UTC", label: "UTC" }];


  const handleCategoryToggle = (categoryValue) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryValue)) {
      newSelected.delete(categoryValue);
    } else if (newSelected.size < 5) {
      newSelected.add(categoryValue);
    }
    setSelectedCategories(newSelected);
    setFormData((prev) => ({ ...prev, category: Array.from(newSelected).join(',') }));
  };

  const ageRequirements = [
  { value: "all_ages", label: "All Ages" },
  { value: "18+", label: "18+" },
  { value: "21+", label: "21+" },
  { value: "25+", label: "25+" },
  { value: "30+", label: "30+" }];


  const privacyLevels = [
  { value: 'public', title: 'Public', description: 'All event details are visible to everyone.' },
  { value: 'semi-public', title: 'Semi-Public', description: "Location & guest list are private until a user RSVPs 'Going' or 'Maybe'." },
  { value: 'private', title: 'Private', description: 'Guests must be approved by the host to see details unless invited.' }];


  const getMinDateTime = () => {
    return new Date().toISOString().slice(0, 16);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isEditing = !!urlParams.get('edit');

  const requiredFormFieldsForPublish = ['title', 'description', 'date', 'location'];
  const isFormValidForPublish = requiredFormFieldsForPublish.every((field) => formData[field] && formData[field].toString().trim() !== '') && formData.media.length > 0;

  const showNextMedia = () => {
    setCurrentMediaPreviewIndex((prev) => (prev + 1) % formData.media.length);
  };

  const showPrevMedia = () => {
    setCurrentMediaPreviewIndex((prev) => (prev - 1 + formData.media.length) % formData.media.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mt-10 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-left">Create an event</h1>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="text-gray-800 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* MODIFIED: Only show if AI Event Help is enabled */}
        {currentUser?.ai_event_help === true &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 mb-6">


            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">AI Event Creator</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Describe your event idea or paste a link, and I'll fill out the form for you.
            </p>
            <div className="flex gap-3">
              <Input
              placeholder="Paste event URL or describe your event..."
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              className="flex-1 bg-white border-gray-300" />

              <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPromptInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white">

                {isGenerating ?
              <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Processing...
                  </> :

              <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
              }
              </Button>
            </div>
          </motion.div>
        }

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Section 1: Event Media */}
          <FormSection
            title="Event Media (Images & Videos) *"
            description="Upload up to 5 images or videos. Drag to reorder. First item is your cover.">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Media Previewer */}
              <div className="col-span-1 aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {formData.media.length > 0 ?
                <>
                    {formData.media[currentMediaPreviewIndex].type === 'video' ?
                  <video src={formData.media[currentMediaPreviewIndex].url} className="w-full h-full object-cover" autoPlay loop muted playsInline /> :

                  <img src={formData.media[currentMediaPreviewIndex].url} alt={`Preview ${currentMediaPreviewIndex + 1}`} className="w-full h-full object-cover" />
                  }
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{currentMediaPreviewIndex + 1} / {formData.media.length}</div>
                    {formData.media.length > 1 &&
                  <>
                        <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60" onClick={showPrevMedia}><ChevronLeft className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60" onClick={showNextMedia}><ChevronRight className="w-5 h-5" /></Button>
                      </>
                  }
                  </> :

                <div className="text-center text-gray-500">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                    <p>Your images will appear here</p>
                  </div>
                }
              </div>

              {/* Upload Grid */}
              <div className="col-span-1 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) =>
                <div key={index} className="aspect-[9/16] relative">
                    {index < formData.media.length ?
                  <div className="w-full h-full rounded-lg overflow-hidden relative group">
                        {formData.media[index].type === 'video' ?
                    <video src={formData.media[index].url} className="w-full h-full object-cover" autoPlay loop muted playsInline /> :

                    <img src={formData.media[index].url} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                    }
                        <button type="button" onClick={() => removeMedia(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && <Badge className="absolute top-1 left-1 bg-blue-600">Cover</Badge>}
                      </div> :
                  index === formData.media.length && formData.media.length < 5 ?
                  <label htmlFor="media-upload" className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                          <Plus className="w-6 h-6 mb-1" />
                          <span>Add more</span>
                        </label> :

                  <div className="w-full h-full bg-gray-100 rounded-lg"></div>
                  }
                  </div>
                )}
              </div>
            </div>
            <input id="media-upload" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} disabled={uploadingMedia || formData.media.length >= 5} />
            {hasAttemptedSubmit && formData.media.length === 0 && <p className="text-red-500 text-sm mt-2">At least one image or video is required.</p>}
            {uploadingMedia &&
            <div className="flex items-center mt-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
                <span>Uploading...</span>
              </div>
            }
          </FormSection>

          {/* Section 2: Basic Details */}
          <FormSection
            title="Basic Details"
            description="The core of your event">

            {/* Event Title */}
            <div>
              <label className="text-gray-800 mt-1 mb-2 text-sm font-bold block">Event Title *

              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Make it punchy and memorable"
                className="bg-white border-gray-300 text-gray-900"
                maxLength="70" />

              {hasAttemptedSubmit && !formData.title.trim() && <p className="text-red-500 text-xs mt-1">An event title is required.</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell the story of your event..."
                rows={6}
                className="bg-white border-gray-300 text-gray-900" />

              {hasAttemptedSubmit && !formData.description.trim() && <p className="text-red-500 text-xs mt-1">A description is required.</p>}
            </div>

            {/* Event Privacy */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Event Type
              </label>
              <Select
                value={formData.privacy_level}
                onValueChange={(value) => handleInputChange("privacy_level", value)}>

                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  {formData.privacy_level ? privacyLevels.find((p) => p.value === formData.privacy_level).title : "Select event privacy level"}
                </SelectTrigger>
                <SelectContent className="w-[320px] md:w-[480px]">
                  {privacyLevels.map(({ value, title, description }) =>
                  <SelectItem key={value} value={value} className="whitespace-normal">
                      <div className="flex flex-col items-start text-left py-2 md:py-3">
                        <p className="font-semibold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-500 md:pr-4">{description}</p>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Co-hosts */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Co-hosts
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add email addresses of people who will help host this event.
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newCoHost}
                  onChange={(e) => setNewCoHost(e.target.value)}
                  placeholder="Enter co-host email address..."
                  type="email"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCoHost();
                    }
                  }}
                  className="bg-white border-gray-300 text-gray-900 flex-1" />

                <Button type="button" onClick={addCoHost} variant="outline" className="border-gray-300 bg-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.co_hosts.length > 0 &&
              <div className="flex flex-wrap gap-2">
                  {formData.co_hosts.map((coHost, index) =>
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200">

                      {coHost}
                      <button
                    type="button"
                    onClick={() => removeCoHost(coHost)}
                    className="hover:text-blue-600">

                        <X className="w-3 h-3" />
                      </button>
                    </div>
                )}
                </div>
              }
            </div>

            {/* Category Section */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Category
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Select up to 5 categories that best describe your event.
              </p>
              <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between items-center text-left font-normal bg-white border-gray-300 text-gray-900">
                    <span>
                      {selectedCategories.size > 0 ?
                      `${selectedCategories.size} categor${selectedCategories.size === 1 ? 'y' : 'ies'} selected` :
                      "Select categories..."}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <div className="p-2 border-b border-gray-200">
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)} />

                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {categories.
                    filter((cat) => cat.label.toLowerCase().includes(categorySearch.toLowerCase())).
                    map((category) =>
                    <div key={category.value}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleCategoryToggle(category.value);
                    }}>

                          <Checkbox
                        id={`create-cat-${category.value}`}
                        checked={selectedCategories.has(category.value)}
                        onCheckedChange={() => {
                          handleCategoryToggle(category.value);
                        }}
                        disabled={!selectedCategories.has(category.value) && selectedCategories.size >= 5} />

                          <label htmlFor={`create-cat-${category.value}`} className="text-sm font-medium leading-none flex-1 cursor-pointer select-none">{category.label}</label>
                        </div>
                    )
                    }
                  </div>
                </PopoverContent>
              </Popover>
              {selectedCategories.size > 0 &&
              <div className="flex flex-wrap gap-2 pt-3">
                  {Array.from(selectedCategories).map((catValue) => {
                  const category = categories.find((c) => c.value === catValue);
                  return (
                    <Badge key={catValue} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        {category?.label}
                        <button type="button" onClick={() => handleCategoryToggle(catValue)} className="ml-2 rounded-full hover:bg-black/10 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>);

                })}
                </div>
              }
              {selectedCategories.size >= 5 &&
              <p className="text-sm text-red-500 pt-2">You can select a maximum of 5 categories.</p>
              }
            </div>

            {/* Scene Tags Section */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Scene Tags
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add tags that describe the vibe of your event.
              </p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{formData.scene_tags.length} / 5</span>
              </div>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder={formData.scene_tags.length >= 5 ? "Maximum 5 tags reached" : "Add a scene tag..."}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="bg-white border-gray-300 text-gray-900 flex-1"
                  disabled={formData.scene_tags.length >= 5} />

                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  className="border-gray-300 bg-white"
                  disabled={formData.scene_tags.length >= 5}>

                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.scene_tags.length > 0 &&
              <div className="flex flex-wrap gap-2">
                  {formData.scene_tags.map((tag, index) =>
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200">

                      {tag}
                      <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-600">

                        <X className="w-3 h-3" />
                      </button>
                    </div>
                )}
                </div>
              }
            </div>

            {/* Event Links */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Event Links
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add relevant links like websites, social media, or resources.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newLink.title}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Link title (e.g., Instagram, Website)"
                    className="bg-white border-gray-300 text-gray-900 flex-1" />

                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-white border-gray-300 text-gray-900 flex-1" />

                  <Button type="button" onClick={addEventLink} variant="outline" className="border-gray-300 bg-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.event_links.length > 0 &&
                <div className="space-y-2">
                    {formData.event_links.map((link) =>
                  <div
                    key={link.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">

                        <div>
                          <span className="font-medium text-sm text-gray-800">{link.title}</span>
                          <p className="text-xs text-gray-500 truncate">{link.url}</p>
                        </div>
                        <button
                      type="button"
                      onClick={() => removeEventLink(link.id)}
                      className="text-red-500 hover:text-red-700">

                          <X className="w-4 h-4" />
                        </button>
                      </div>
                  )}
                  </div>
                }
              </div>
            </div>

            {/* Plus One Options */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Plus One Options
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allow +1s?
                  </label>
                  <Select
                    value={formData.allow_plus_ones}
                    onValueChange={(value) => handleInputChange("allow_plus_ones", value)}>

                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.allow_plus_ones === "yes" &&
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 pt-4 mt-4 border-t border-gray-200">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Plus Ones per Guest
                      </label>
                      <Select
                      value={formData.max_plus_ones.toString()}
                      onValueChange={(value) => handleInputChange("max_plus_ones", parseInt(value))}>

                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="2">+2</SelectItem>
                          <SelectItem value="3">+3</SelectItem>
                          <SelectItem value="4">+4</SelectItem>
                          <SelectItem value="5">+5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                      id="require_plus_one_names"
                      checked={formData.require_plus_one_names}
                      onCheckedChange={(checked) => handleInputChange("require_plus_one_names", checked)}
                      className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" />

                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="require_plus_one_names" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Require names of plus ones
                        </label>
                        <p className="text-xs text-muted-foreground text-gray-500">
                          Guests must provide names for each person they bring. If unchecked, they can leave it empty.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                }
              </div>
            </div>
          </FormSection>

          {/* Section 3: Time & Location */}
          <FormSection
            title="When & Where"
            description="Date, time, and location details">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timezone (Moved to top) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Timezone</label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleInputChange("timezone", value)}>

                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) =>
                    <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Start Date & Time */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Start Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="bg-white"
                  min={getMinDateTime()} />

                {hasAttemptedSubmit && !formData.date.trim() && <p className="text-red-500 text-xs mt-1">A start date and time is required.</p>}
              </div>
              {/* End Date & Time */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">End Date & Time</label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                  className={formData.date ? "bg-white" : "bg-gray-100"}
                  disabled={!formData.date}
                  min={formData.date || getMinDateTime()} />

              </div>
              {/* RSVP Deadline */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">RSVP Deadline</label>
                <Input
                  type="datetime-local"
                  value={formData.rsvp_deadline}
                  onChange={(e) => handleInputChange("rsvp_deadline", e.target.value)}
                  className={formData.date ? "bg-white" : "bg-gray-100"}
                  disabled={!formData.date}
                  max={formData.date} />

              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">Location *</label>
              <LocationInput
                venueName={formData.venue_name}
                locationName={formData.location}
                onSelect={(venue, location) => {
                  setFormData((prev) => ({
                    ...prev,
                    venue_name: venue,
                    location: location || venue
                  }));
                }} />

              {hasAttemptedSubmit && !formData.location.trim() &&
              <p className="text-red-500 text-xs mt-1">A location is required.</p>
              }
            </div>
          </FormSection>

          {/* Section 4: Audience & Access - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-subtle border border-gray-200/80">

            <button
              type="button"
              onClick={() => setIsAudienceOpen(!isAudienceOpen)}
              className="w-full flex justify-between items-center text-left">

              <div>
                <h3 className="text-xl font-bold text-gray-900">Audience & Access</h3>
                <p className="text-gray-600 mt-1">Age rules & headcount</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isAudienceOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAudienceOpen &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-6 mt-6 border-t border-gray-100 space-y-6">

                {/* Age Requirement and Recommended Age Range */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Age Requirement
                    </label>
                    <Select
                    value={formData.age_requirement}
                    onValueChange={(value) => handleInputChange("age_requirement", value)}>

                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select minimum age" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRequirements.map((age) =>
                      <SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Age Range

                    </label>
                    <Input
                    value={formData.age_range}
                    onChange={(e) => handleInputChange("age_range", e.target.value)}
                    placeholder="e.g., 21-35"
                    className="bg-white border-gray-300 text-gray-900" />

                  </div>
                </div>

                {/* Guest Capacity */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Guest Capacity
                  </label>
                  <Input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  placeholder="Maximum number of guests (optional)"
                  className="bg-white border-gray-300 text-gray-900" />

                </div>
              </motion.div>
            }
          </motion.div>

          {/* Section 5: Ticketing & Payments - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-subtle border border-gray-200/80">

            <button
              type="button"
              onClick={() => setIsTicketingOpen(!isTicketingOpen)}
              className="w-full flex justify-between items-center text-left">

              <div>
                <h3 className="text-xl font-bold text-gray-900">Ticketing & Payments</h3>
                <p className="text-gray-600 mt-1">Monetization & entry</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isTicketingOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTicketingOpen &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-6 mt-6 border-t border-gray-100 space-y-6">

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">Accept Payments</h4>
                      <p className="text-sm text-gray-500">Toggle to enable payment options for this event</p>
                    </div>
                    <Switch
                    checked={formData.payment_required}
                    onCheckedChange={(checked) => handleInputChange("payment_required", checked)} />

                  </div>

                  {formData.payment_required &&
                <div className="space-y-4 border-t border-gray-200 pt-4">
                      {/* Payment Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Type *
                        </label>
                        <Select
                      value={formData.payment_type || "required"}
                      onValueChange={(value) => handleInputChange("payment_type", value)}>

                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required - Guests must pay to attend</SelectItem>
                            <SelectItem value="optional">Optional - Guests can choose to pay (donations)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.payment_type === "optional" ? "Suggested Amount ($)" : "Event Price ($)"} *
                        </label>
                        <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      placeholder={formData.payment_type === "optional" ? "Enter suggested donation amount" : "Enter ticket price"}
                      className="bg-white border-gray-300 text-gray-900"
                      required />

                      </div>

                      {/* Payment Methods */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Methods {formData.payment_required ? '*' : ''}
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                          Add the payment methods guests can use and your corresponding payment IDs
                        </p>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Select
                          value={newPaymentMethod.method}
                          onValueChange={(value) => setNewPaymentMethod((prev) => ({ ...prev, method: value }))}>

                              <SelectTrigger className="bg-white border-gray-300 text-gray-900 flex-1">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="venmo">Venmo</SelectItem>
                                <SelectItem value="zelle">Zelle</SelectItem>
                                <SelectItem value="cashapp">CashApp</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="apple_pay">Apple Pay</SelectItem>
                                <SelectItem value="google_pay">Google Pay</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                          value={newPaymentMethod.id}
                          onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, id: e.target.value }))}
                          placeholder="Your payment ID/username"
                          className="bg-white border-gray-300 text-gray-900 flex-1" />

                            <Button type="button" onClick={addPaymentMethod} variant="outline" className="border-gray-300 bg-white">
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>

                          {formData.payment_methods.length > 0 &&
                      <div className="space-y-2">
                              {formData.payment_methods.map((method, index) =>
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">

                                  <div>
                                    <span className="font-medium text-sm text-gray-800 capitalize">{method.method.replace('_', ' ')}</span>
                                    <p className="text-xs text-gray-500">{method.id}</p>
                                  </div>
                                  <button
                            type="button"
                            onClick={() => removePaymentMethod(index)}
                            className="text-red-500 hover:text-red-700">

                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                        )}
                            </div>
                      }
                        </div>
                        {formData.payment_required && formData.payment_methods.length === 0 && hasAttemptedSubmit &&
                    <p className="text-red-500 text-sm mt-2">At least one payment method is required when accepting payments.</p>
                    }
                      </div>
                    </div>
                }
                </div>
              </motion.div>
            }
          </motion.div>

          {/* Section 6: Engagement & Experience - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-subtle border border-gray-200/80">

            <button
              type="button"
              onClick={() => setIsEngagementOpen(!isEngagementOpen)}
              className="w-full flex justify-between items-center text-left">

              <div>
                <h3 className="text-xl font-bold text-gray-900">Engagement & Experience</h3>
                <p className="text-gray-600 mt-1">What to expect & how to participate</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isEngagementOpen ? 'rotate-180' : ''}`} />
            </button>
            {isEngagementOpen &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-6 mt-6 border-t border-gray-100 space-y-6">

                {/* Additional Questions */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">
                    Additional Questions for Guests
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Ask guests custom questions when they RSVP.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                        type="checkbox"
                        id="question-required"
                        checked={newQuestion.required}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, required: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />

                        <label htmlFor="question-required" className="text-sm font-medium text-gray-700">
                          Make this question required
                        </label>
                      </div>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Input
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                          placeholder="e.g., What brings you to this event?"
                          className="bg-white border-gray-300 text-gray-900" />

                        </div>
                        <Button type="button" onClick={addAdditionalQuestion} variant="outline" className="border-gray-300 bg-white">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {formData.additional_questions.length > 0 &&
                  <div className="space-y-2">
                        {formData.additional_questions.map((question) =>
                    <div
                      key={question.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">

                            <div>
                              <span className="text-sm text-gray-800">{question.question}</span>
                              {question.required &&
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Required
                                </span>
                        }
                            </div>
                            <button
                        type="button"
                        onClick={() => removeAdditionalQuestion(question.id)}
                        className="text-red-500 hover:text-red-700">

                              <X className="w-4 h-4" />
                            </button>
                          </div>
                    )}
                      </div>
                  }
                  </div>
                </div>

                {/* Guest Permissions */}
                <div>
                  <button
                  type="button"
                  onClick={() => setIsGuestPermissionsOpen(!isGuestPermissionsOpen)}
                  className="w-full flex justify-between items-center text-left py-2">

                    <h4 className="text-lg font-semibold text-gray-800">Guest Permissions</h4>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isGuestPermissionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <p className="text-gray-600 mb-4">Control what your guests can see and do.</p>

                  {isGuestPermissionsOpen &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-gray-200">

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="show_attendee_list" className="flex flex-col gap-1">
                          <span className="font-medium">Show Attendee List</span>
                          <span className="text-xs text-gray-500">Allow guests to see who else is going.</span>
                        </Label>
                        <Switch
                      id="show_attendee_list"
                      checked={formData.show_attendee_list}
                      onCheckedChange={(checked) => handleSwitchChange('show_attendee_list', checked)} />

                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="allow_guest_sharing" className="flex flex-col gap-1">
                          <span className="font-medium">Allow Guest Sharing</span>
                          <span className="text-xs text-gray-500">Let guests share the event link with others.</span>
                        </Label>
                        <Switch
                      id="allow_guest_sharing"
                      checked={formData.allow_guest_sharing}
                      onCheckedChange={(checked) => handleSwitchChange('allow_guest_sharing', checked)} />

                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="has_guest_list" className="flex flex-col gap-1">
                          <span className="font-medium">Maintain a guest list record?</span>
                          <span className="text-xs text-gray-500">Keep a record of RSVPs and attendees for this event.</span>
                        </Label>
                        <Switch
                      id="has_guest_list"
                      checked={formData.has_guest_list}
                      onCheckedChange={(checked) => handleSwitchChange("has_guest_list", checked)} />

                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="allow_guest_photos" className="flex flex-col gap-1">
                          <span className="font-medium">Allow Guest Photo Uploads</span>
                          <span className="text-xs text-gray-500">Let attendees add photos to the event gallery.</span>
                        </Label>
                        <Switch
                      id="allow_guest_photos"
                      checked={formData.allow_guest_photos}
                      onCheckedChange={(checked) => handleSwitchChange('allow_guest_photos', checked)} />

                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="allow_maybe_rsvp" className="flex flex-col gap-1">
                          <span className="font-medium">Allow 'Maybe' RSVPs</span>
                          <span className="text-xs text-gray-500">Guests can RSVP as 'Maybe' if they're unsure.</span>
                        </Label>
                        <Switch
                      id="allow_maybe_rsvp"
                      checked={formData.allow_maybe_rsvp}
                      onCheckedChange={(c) => handleSwitchChange('allow_maybe_rsvp', c)} />

                      </div>
                      {/* NEW: Guest Anonymity Toggle */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Label htmlFor="guest_anonymity_enabled" className="flex flex-col gap-1">
                          <span className="font-medium">Guest Anonymity</span>
                          <span className="text-xs text-gray-500">Hide attendee identities from other guests. Only you (the organizer) can see who's attending.</span>
                        </Label>
                        <Switch
                      id="guest_anonymity_enabled"
                      checked={formData.guest_anonymity_enabled}
                      onCheckedChange={(checked) => handleSwitchChange('guest_anonymity_enabled', checked)} />

                      </div>
                    </motion.div>
                }
                </div>

                {/* Event Board */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Event Board</h4>
                  <p className="text-gray-600 mb-4">Configure announcements and chat for your event.</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Label htmlFor="enable_guest_chat" className="flex flex-col gap-1">
                        <span className="font-medium">Enable Guest Chat</span>
                        <span className="text-xs text-gray-500">Allows guests to chat on the event board.</span>
                      </Label>
                      <Switch
                      id="enable_guest_chat"
                      checked={formData.event_board_mode === 'chat_and_blasts'}
                      onCheckedChange={handleEventBoardSwitchChange} />

                    </div>
                    <p className="text-xs text-gray-500 px-3">
                      If disabled, the board will only be for your text blasts (announcements).
                    </p>
                  </div>
                </div>
              </motion.div>
            }
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-6">

            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 border-gray-300 bg-white text-gray-800 hover:bg-gray-100">

              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 border-gray-300 bg-white text-gray-800 hover:bg-gray-100">

              {loading ?
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2" />
                  Saving...
                </> :

              "Save as Draft"
              }
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading || !isFormValidForPublish && hasAttemptedSubmit}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 px-8 py-3">

              {loading ?
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </> :
              eventId ?
              "Update Event" :

              "Create Event"
              }
            </Button>
          </motion.div>
        </form>
      </div>
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onConfirm={() => {
          setIsDirty(false);
          if (navigationTarget) {
            if (navigationTarget === -1) {
              navigate(-1);
            } else {
              window.location.href = navigationTarget;
            }
          }
          setShowUnsavedDialog(false);
        }}
        onCancel={() => setShowUnsavedDialog(false)} />

    </div>);

}