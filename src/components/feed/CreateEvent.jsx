import React, { useState } from "react";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { value: "music", label: "🎵 Music" },
  { value: "art", label: "🎨 Art" },
  { value: "food", label: "🍽️ Food" },
  { value: "tech", label: "💻 Tech" },
  { value: "sports", label: "⚽ Sports" },
  { value: "business", label: "💼 Business" },
  { value: "wellness", label: "🧘 Wellness" },
  { value: "nightlife", label: "🌃 Nightlife" },
  { value: "culture", label: "🏛️ Culture" },
  { value: "outdoor", label: "🏕️ Outdoor" },
  { value: "market", label: "🛍️ Market" },
  { value: "talk", label: "🎤 Talk" },
  { value: "rave", label: "⚡ Rave" },
  { value: "popup", label: "✨ Pop-up" },
  { value: "party", label: "🎉 Party" },
  { value: "picnic", label: "🧺 Picnic" },
  { value: "other", label: "🤔 Other" }
];

export default function CreateEvent({ onEventCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    venue_name: "",
    category: "other",
    price: 0,
    age_requirement: "all_ages",
    vibe_tags: [],
    organizer_name: "",
    cover_image: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setFormData(prev => ({
        ...prev,
        organizer_name: user.full_name || "",
        organizer_email: user.email
      }));
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        status: "active"
      };

      await Event.create(eventData);
      onEventCreated?.();
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Event title..."
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="text-lg"
          required
        />
        
        <Textarea
          placeholder="Event description..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="h-24"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Venue name..."
            value={formData.venue_name}
            onChange={(e) => handleInputChange("venue_name", e.target.value)}
          />
          
          <Input
            placeholder="Location/Address..."
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Price ($)"
            value={formData.price}
            onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />

          <Select
            value={formData.age_requirement}
            onValueChange={(value) => handleInputChange("age_requirement", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Age requirement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_ages">All Ages</SelectItem>
              <SelectItem value="18+">18+ Only</SelectItem>
              <SelectItem value="21+">21+ Only</SelectItem>
              <SelectItem value="25+">25+ Only</SelectItem>
              <SelectItem value="30+">30+ Only</SelectItem>
              <SelectItem value="16-25">Ages 16-25</SelectItem>
              <SelectItem value="21-35">Ages 21-35</SelectItem>
              <SelectItem value="30-45">Ages 30-45</SelectItem>
              <SelectItem value="35+">Ages 35+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            required
          />
          
          <Input
            placeholder="Cover image URL..."
            value={formData.cover_image}
            onChange={(e) => handleInputChange("cover_image", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}