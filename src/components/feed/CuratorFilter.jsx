import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";

export default function CuratorFilter({ curators, selected, onSelect }) {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-full p-1.5">
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="w-36 border-0 bg-transparent text-white">
          <Users className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Curator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Curators</SelectItem>
          {curators.map(curator => (
            <SelectItem key={curator} value={curator}>
              {curator}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}