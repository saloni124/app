import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

const timeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'tonight', label: 'Tonight' },
  { value: 'weekend', label: 'This Weekend' },
  { value: 'month', label: 'This Month' },
  { value: 'date', label: 'Specific Date' }
];

export default function TimeFilter({ selected, onSelect, dateValue, onDateChange }) {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-full p-1.5">
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="w-32 border-0 bg-transparent text-white">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selected === 'date' && (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onDateChange(e.target.value)}
          className="ml-2 bg-black/50 text-white border border-gray-600 rounded px-2 py-1 text-sm"
        />
      )}
    </div>
  );
}