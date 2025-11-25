import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StartChatModal({ buddy, children }) {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate(createPageUrl(`ChatWindow?user=${encodeURIComponent(buddy.email)}`));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>
            Send a message to {buddy.name} to get the ball rolling.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           <div className="flex items-center gap-3 mb-4">
              <img src={buddy.avatar} alt={buddy.name} className="w-10 h-10 rounded-full" />
              <div className="font-semibold">{buddy.name}</div>
           </div>
           <div className="flex gap-2">
             <Input placeholder="Type your message..." className="flex-1" />
             <Button onClick={handleStartChat} className="bg-blue-600 hover:bg-blue-700 text-white px-4">
               <Send className="w-4 h-4" />
             </Button>
           </div>
        </div>
        <DialogFooter>
            <p className="text-xs text-gray-400">Click send to start chatting with {buddy.name}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}