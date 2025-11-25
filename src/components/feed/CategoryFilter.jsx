import React from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const categories = [
  { id: "all", name: "All Events", emoji: "🎯" },
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "art", name: "Art", emoji: "🎨" },
  { id: "food", name: "Food", emoji: "🍽️" },
  { id: "tech", name: "Tech", emoji: "💻" },
  { id: "sports", name: "Sports", emoji: "⚽" },
  { id: "business", name: "Business", emoji: "💼" },
  { id: "wellness", name: "Wellness", emoji: "🧘" },
  { id: "nightlife", name: "Nightlife", emoji: "🌃" },
  { id: "culture", name: "Culture", emoji: "🏛️" },
  { id: "outdoor", name: "Outdoor", emoji: "🏕️" },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse by Category</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.id)}
            className={`flex-shrink-0 px-6 py-3 rounded-full border-2 transition-all duration-300 flex items-center gap-2 font-medium ${
              selectedCategory === category.id
                ? "bg-black text-white border-black shadow-lg transform scale-105"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <span className="text-lg">{category.emoji}</span>
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}