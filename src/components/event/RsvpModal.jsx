
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, MessageSquare, Loader2, Check, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";

// Mock user data for @ mentions - in a real app this would come from an API
const mockUsers = [
{ username: 'alice_chen', name: 'Alice Chen' },
{ username: 'bob_johnson', name: 'Bob Johnson' },
{ username: 'charlie_brown', name: 'Charlie Brown' },
{ username: 'diana_ross', name: 'Diana Ross' },
{ username: 'emily_clark', name: 'Emily Clark' },
{ username: 'frank_wilson', name: 'Frank Wilson' }];


export default function RsvpModal({ isOpen, onClose, onSubmit, isSubmitting, event, selectedRsvpStatus }) {
  const [plusOnesCount, setPlusOnesCount] = useState(0);
  const [guestInput, setGuestInput] = useState('');
  const [confirmedGuests, setConfirmedGuests] = useState([]);
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // A simple max for +1s, can be made dynamic from event props later
  const maxPlusOnes = event?.max_plus_ones || 4;

  const handleGuestCountChange = (count) => {
    const newCount = parseInt(count);
    setPlusOnesCount(newCount);

    // If reducing count below current confirmed guests, trim the confirmed list
    if (newCount < confirmedGuests.length) {
      setConfirmedGuests((prev) => prev.slice(0, newCount));
    }
  };

  const handleGuestInputChange = (value) => {
    setGuestInput(value);

    // Handle @ mentions
    if (value.includes('@')) {
      const lastAtIndex = value.lastIndexOf('@');
      const searchTerm = value.substring(lastAtIndex + 1);

      if (searchTerm.length > 0) {
        const filteredUsers = mockUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSuggestions(filteredUsers);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user) => {
    const lastAtIndex = guestInput.lastIndexOf('@');
    const beforeAt = guestInput.substring(0, lastAtIndex);
    const newValue = beforeAt + '@' + user.username;

    setGuestInput(newValue);
    setShowSuggestions(false);
  };

  const handleConfirmGuest = () => {
    const trimmedInput = guestInput.trim();
    if (trimmedInput && confirmedGuests.length < plusOnesCount) {
      setConfirmedGuests((prev) => [...prev, trimmedInput]);
      setGuestInput('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveGuest = (indexToRemove) => {
    setConfirmedGuests((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      plus_ones_count: selectedRsvpStatus === 'cant_go' ? 0 : confirmedGuests.length,
      plus_ones_names: selectedRsvpStatus === 'cant_go' ? [] : confirmedGuests,
      message: message
    });
  };

  const handleClose = () => {
    // Reset state on close, but only if not submitting
    if (!isSubmitting) {
      setPlusOnesCount(0);
      setGuestInput('');
      setConfirmedGuests([]);
      setMessage('');
      setShowSuggestions(false);
      setSuggestions([]);
      onClose();
    }
  };

  const isCapReached = confirmedGuests.length >= plusOnesCount;
  const namesRequiredButNotMet = event?.organizer_name === 'Thursday Dating' && plusOnesCount > 0 && confirmedGuests.length !== plusOnesCount;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw] mx-auto max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Complete your RSVP</DialogTitle>
            <DialogDescription>
              You can optionally add details for the host.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedRsvpStatus !== 'cant_go' &&
            <>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Bringing any guests?
                  </label>
                  <Select value={plusOnesCount.toString()} onValueChange={handleGuestCountChange}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxPlusOnes + 1 }, (_, i) =>
                    <SelectItem key={i} value={i.toString()}>
                          {i === 0 ? 'No guests' : `${i} guest${i > 1 ? 's' : ''}`}
                        </SelectItem>
                    )}
                    </SelectContent>
                  </Select>
                </div>

                {plusOnesCount > 0 &&
              <div>
                    <label className="block text-sm font-medium mb-2">
                      Guest Names
                    </label>
                    
                    {/* Single Guest Input */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Input
                        placeholder="Guest name or @username"
                        value={guestInput}
                        onChange={(e) => handleGuestInputChange(e.target.value)}
                        className="rounded-lg"
                        onBlur={() => {
                          // Hide suggestions when input loses focus (with small delay for clicks)
                          setTimeout(() => setShowSuggestions(false), 150);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isCapReached && guestInput.trim()) {
                            e.preventDefault();
                            handleConfirmGuest();
                          }
                        }} />

                          
                          {/* Username suggestions dropdown */}
                          {showSuggestions && suggestions.length > 0 &&
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-32 overflow-y-auto">
                              {suggestions.map((user) =>
                        <button
                          key={user.username}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionClick(user)}>

                                  <div className="font-medium">@{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.name}</div>
                                </button>
                        )}
                            </div>
                      }
                        </div>
                        
                        {/* Confirm Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                          type="button"
                          onClick={handleConfirmGuest}
                          disabled={isCapReached || !guestInput.trim()}
                          className={`p-2 rounded-lg transition-colors ${
                          isCapReached ?
                          'text-gray-300 bg-gray-100 cursor-not-allowed' :
                          guestInput.trim() ?
                          'text-green-600 hover:bg-green-50 cursor-pointer' :
                          'text-gray-300 bg-gray-100 cursor-not-allowed'}`
                          }>

                              <Check className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          {isCapReached &&
                      <TooltipContent className="max-w-[200px] text-center">
                              <p>Cap reached, please remove a guest to add more</p>
                            </TooltipContent>
                      }
                        </Tooltip>
                      </div>
                    </div>

                    {/* Confirmed Guests Bubbles - only show when there are guests */}
                    {confirmedGuests.length > 0 ?
                <div className="flex flex-wrap gap-2 mt-2">
                        {confirmedGuests.map((guest, index) =>
                  <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            <span>{guest}</span>
                            <button
                      type="button"
                      onClick={() => handleRemoveGuest(index)}
                      className="p-0.5 text-blue-500 hover:bg-blue-200 rounded-full transition-colors"
                      title="Remove guest">

                              <X className="w-3 h-3" />
                            </button>
                          </div>
                  )}
                      </div> : (

                /* Instruction text - only show when no guests are confirmed */
                <p className="text-xs text-gray-500 mt-2">
                        Enter their name or @username if they have an account. Click the checkmark to confirm each guest.
                      </p>)
                }
                  </div>
              }
              </>
            }

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                Optional Message to Host
              </label>
              <Textarea
                placeholder="e.g., Looking forward to it!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="rounded-lg" />

            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="bg-background text-gray-900 mt-2 px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10 w-full">
              Cancel
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || namesRequiredButNotMet} className="bg-primary bg-gradient-to-r text-white px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 w-full from-cyan-400 to-blue-600  hover:opacity-90 rounded-lg disabled:opacity-50">


                    {isSubmitting ?
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </> :

                    'Confirm RSVP'
                    }
                  </Button>
                </div>
              </TooltipTrigger>
              {namesRequiredButNotMet &&
              <TooltipContent className="max-w-[200px] text-center">
                  <p>Please confirm all guest names before proceeding.</p>
                </TooltipContent>
              }
            </Tooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>);

}