import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, Loader2 } from 'lucide-react';

export default function ReviewDialog({
  isOpen,
  onOpenChange,
  eventTitle,
  initialReviewData = {},
  onSubmit,
  isSubmitting = false
}) {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review_text: '',
    liked: true,
    vibe_tags: [],
    would_recommend: true,
    share_with_host: false,
    attended: true,
    post_to_events_page: false,
    ...initialReviewData
  });

  useEffect(() => {
    if (initialReviewData) {
      setReviewData({
        rating: 5,
        review_text: '',
        liked: true,
        vibe_tags: [],
        would_recommend: true,
        share_with_host: false,
        attended: true,
        post_to_events_page: false,
        ...initialReviewData
      });
    }
  }, [initialReviewData]);

  const handleSubmit = () => {
    onSubmit(reviewData);
  };

  const handleVibeTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map((tag) => tag.trim()).filter(Boolean);
    setReviewData((prev) => ({ ...prev, vibe_tags: tagsArray }));
  };

  const vibeTagsString = Array.isArray(reviewData.vibe_tags) ?
  reviewData.vibe_tags.join(', ') :
  '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            How was {eventTitle}?
          </DialogTitle>
          <DialogDescription>
            Share your experience to help others discover great events
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Overall Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) =>
              <button
                key={star}
                onClick={() => setReviewData((prev) => ({ ...prev, rating: star }))}
                className="focus:outline-none"
                type="button">

                  <Star
                  className={`w-6 h-6 transition-colors ${
                  star <= reviewData.rating ?
                  "fill-yellow-400 text-yellow-400" :
                  "text-gray-300 hover:text-yellow-300"}`
                  } />

                </button>
              )}
            </div>
          </div>

          {/* Did you like it? */}
          <div>
            <label className="block text-sm font-medium mb-2">Did you enjoy it?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setReviewData((prev) => ({ ...prev, liked: true }))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                reviewData.liked ?
                "bg-green-100 border-green-300 text-green-800" :
                "bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-50"}`
                }
                type="button">

                👍 Loved it
              </button>
              <button
                onClick={() => setReviewData((prev) => ({ ...prev, liked: false }))}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                !reviewData.liked ?
                "bg-red-100 border-red-300 text-red-800" :
                "bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-50"}`
                }
                type="button">

                👎 Not my vibe
              </button>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Tell us more (optional)</label>
            <Textarea
              placeholder="What did you love or what could be improved?"
              value={reviewData.review_text}
              onChange={(e) => setReviewData((prev) => ({ ...prev, review_text: e.target.value }))}
              className="resize-none"
              rows={3} />

          </div>

          {/* Vibe Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Vibe tags (optional)</label>
            <Input
              placeholder="e.g. energetic, crowded, great music (separate with commas)"
              value={vibeTagsString}
              onChange={handleVibeTagsChange} />

          </div>

          {/* Share with host */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 border border-gray-200">
            <input
              type="checkbox"
              id="share_with_host"
              checked={reviewData.share_with_host}
              onChange={(e) => setReviewData((prev) => ({ ...prev, share_with_host: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />

            <div>
              <label htmlFor="share_with_host" className="text-sm font-medium">
                Send to host?
              </label>
              <p className="text-xs text-gray-500">
                Let the event organizer know about your experience
              </p>
            </div>
          </div>

          {/* Post to Events Page */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 border border-gray-200">
            <input
              type="checkbox"
              id="post_to_events_page"
              checked={reviewData.post_to_events_page || false}
              onChange={(e) => setReviewData((prev) => ({ ...prev, post_to_events_page: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />

            <div>
              <label htmlFor="post_to_events_page" className="text-sm font-medium text-gray-800">
                Post review publicly?
              </label>
              <p className="text-xs text-gray-600">
                Your review will be visible on the organizer's profile
              </p>
            </div>
          </div>

          {/* Would Recommend */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recommend"
              checked={reviewData.would_recommend}
              onChange={(e) => setReviewData((prev) => ({ ...prev, would_recommend: e.target.checked }))}
              className="rounded" />

            <label htmlFor="recommend" className="text-sm font-medium">
              I would recommend this event to friends
            </label>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button" className="bg-background px-4 py-2 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} type="button">
            {isSubmitting ?
            <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </> :

            <>
                <Check className="w-4 h-4 mr-2" />
                Submit Review
              </>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}