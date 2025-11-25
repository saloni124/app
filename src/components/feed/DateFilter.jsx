import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const dateOptions = [
{ value: "all", label: "Anytime" },
{ value: "today", label: "Today" },
{ value: "tomorrow", label: "Tomorrow" },
{ value: "this week", label: "This Week" },
{ value: "this month", label: "This Month" },
{ value: "calendar", label: "Choose Date..." }];


export default function DateFilter({ selected, onSelect, theme = 'dark' }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const selectedOption = dateOptions.find((d) => d.value === selected);
  const isDateSelected = selected instanceof Date;

  const handleOptionSelect = (value) => {
    if (value === "calendar") {
      setIsCalendarOpen(true);
      setIsOpen(false);
    } else {
      onSelect(value);
      setIsOpen(false);
    }
  };

  const handleDateSelect = (date) => {
    onSelect(date);
    setIsCalendarOpen(false);
  };

  const themeClasses = theme === 'light' ?
  'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300' :
  'bg-black/60 backdrop-blur-sm text-white hover:bg-black/70 border border-white/30';

  return (
    <div className="relative flex-shrink-0">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="bg-transparent text-white px-3 font-bold text-left rounded-full flex items-center w-auto justify-start h-8 cursor-pointer backdrop-blur-sm hover:bg-white/70 border border-white/30">
            <Calendar className="mr-1 h-3 w-3 flex-shrink-0 font-bold" strokeWidth={2.5} />
            <span className="text-xs truncate max-w-16 font-bold">
              {isDateSelected ?
              selected.toLocaleDateString([], { month: 'short', day: 'numeric' }) :
              selectedOption?.label || 'Anytime'
              }
            </span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-gray-200 text-gray-900 z-[2000]">
          <div className="p-2 space-y-1">
            {dateOptions.map((option) =>
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-100 ${
              selected === option.value ?
              'bg-blue-100 text-blue-800 font-medium' :
              'text-gray-700'}`
              }>

                {option.label}
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <div style={{ display: 'none' }}></div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-gray-200 text-gray-900 z-[2000]">
          <CalendarComponent
            mode="single"
            selected={isDateSelected ? selected : undefined}
            onSelect={handleDateSelect}
            className="rounded-md border-0" />

        </PopoverContent>
      </Popover>
    </div>);

}