import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Lock, Loader2 } from 'lucide-react';

export default function RequestToJoinModal({ isOpen, onClose, onSubmit, isSubmitting, eventTitle }) {
  const [requestData, setRequestData] = useState({
    message: '',
    contact_type: 'phone', // 'phone' or 'instagram'
    contact_info: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(''); // Clear previous errors

    // Basic validation
    if (!requestData.contact_info.trim()) {
      setValidationError('Please provide your contact information.');
      return;
    }
    if (requestData.contact_type === 'phone' && requestData.contact_info.replace(/\D/g, '').length < 9) {
      setValidationError('Please enter a valid phone number (at least 9 digits).');
      return;
    }

    onSubmit(requestData);
  };

  const handleClose = () => {
    setRequestData({
      message: '',
      contact_type: 'phone',
      contact_info: ''
    });
    setValidationError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Request to Join
          </DialogTitle>
          <DialogDescription>
            This is a private event. The host will review your request before you can attend "{eventTitle}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Message to host <span className="text-gray-500">(optional)</span>
            </label>
            <Textarea
              placeholder="Tell the host why you'd like to attend..."
              value={requestData.message}
              onChange={(e) => setRequestData((prev) => ({ ...prev, message: e.target.value }))}
              className="resize-none"
              rows={3} />
          </div>

          {/* Contact Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Method <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => {setRequestData((prev) => ({ ...prev, contact_type: 'phone', contact_info: '' }));setValidationError('');}}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                requestData.contact_type === 'phone' ?
                'bg-blue-100 border-blue-300 text-blue-800' :
                'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`
                }>
                📱 Phone Number
              </button>
              <button
                type="button"
                onClick={() => {setRequestData((prev) => ({ ...prev, contact_type: 'instagram', contact_info: '' }));setValidationError('');}}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                requestData.contact_type === 'instagram' ?
                'bg-blue-100 border-blue-300 text-blue-800' :
                'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`
                }>
                📷 Instagram
              </button>
            </div>

            {requestData.contact_type === 'phone' ?
            <Input
              type="tel"
              placeholder="XXX-XXX-XXXX"
              value={requestData.contact_info}
              onChange={(e) => setRequestData((prev) => ({ ...prev, contact_info: e.target.value }))}
              required
              className={validationError ? 'border-red-500' : ''} /> :

            <Input
              type="text"
              placeholder="@yourusername"
              value={requestData.contact_info}
              onChange={(e) => {
                let value = e.target.value;
                if (value && !value.startsWith('@')) {
                  value = '@' + value;
                }
                setRequestData((prev) => ({ ...prev, contact_info: value }));
              }}
              required
              className={validationError ? 'border-red-500' : ''} />
            }
             {validationError && <p className="text-red-500 text-sm mt-1">{validationError}</p>}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              The host will use this contact information to verify your identity and may reach out with event details.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="bg-background mt-2 pt-2 pr-4 pb-2 pl-4 text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:bg-accent hover:text-accent-foreground h-10">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ?
            <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending Request...
              </> :
            'Send Request'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}