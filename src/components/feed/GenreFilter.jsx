import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tag, ChevronDown } from "lucide-react";

const genres = [
// "All Genres" is handled by clearing selection
{ value: "music", label: "🎵 Music" },
{ value: "art", label: "🎨 Art" },
{ value: "museums", label: "🏛️ Museums" },
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
{ value: "dating", label: "❤️ Dating" }];


export default function GenreFilter({ selectedGenres, onSelectionChange, theme = 'dark' }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleToggle = (genreValue) => {
    const newSelected = new Set(selectedGenres);
    if (newSelected.has(genreValue)) {
      newSelected.delete(genreValue);
    } else {
      newSelected.add(genreValue);
    }
    onSelectionChange(newSelected);
  };

  const handleClearAll = () => {
    onSelectionChange(new Set());
  };

  const filteredGenres = genres.filter((genre) =>
  genre.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const themeClasses = theme === 'light' ?
  'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300' :
  'bg-black/60 backdrop-blur-sm text-white hover:bg-black/70 border border-white/30';

  const triggerText = selectedGenres.size > 0 ? `Category (${selectedGenres.size})` : 'Category';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="bg-transparent text-white px-3 font-bold text-left rounded-full flex items-center w-auto justify-start h-8 cursor-pointer backdrop-blur-sm hover:bg-white/70 border border-white/30">
          <Tag className="mr-1 h-3 w-3 flex-shrink-0 font-bold" strokeWidth={2.5} />
          <span className="text-xs truncate font-bold">{triggerText}</span>
          <ChevronDown className="ml-1 h-3 w-3 flex-shrink-0 font-bold" strokeWidth={2.5} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-2 bg-white border-gray-200 text-gray-900 max-h-80 overflow-y-auto z-[2000]">
        <div className="p-2 border-b border-gray-200 mb-2">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />

        </div>
        <div className="space-y-1">
          {selectedGenres.size > 0 &&
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-blue-600 hover:text-blue-700 w-full justify-start px-2 h-auto py-1.5">
              Clear all
            </Button>
          }
          {filteredGenres.map((genre) =>
          <div
            key={genre.value}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={() => handleToggle(genre.value)}>

              <Checkbox
              id={`feed-genre-${genre.value}`}
              checked={selectedGenres.has(genre.value)}
              onCheckedChange={() => handleToggle(genre.value)}
              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white" />

              <label
              htmlFor={`feed-genre-${genre.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer">

                {genre.label}
              </label>
            </div>
          )}
          {filteredGenres.length === 0 && searchTerm &&
          <div className="p-2 text-center text-gray-500 text-sm">
              No categories found for "{searchTerm}"
            </div>
          }
        </div>
      </PopoverContent>
    </Popover>);

}