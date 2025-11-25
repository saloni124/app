import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Event } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function PaymentSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const [eventId, setEventId] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [paymentRequired, setPaymentRequired] = useState(false);
    const [price, setPrice] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [refundPolicy, setRefundPolicy] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('eventId');
        if (id) {
            setEventId(id);
            fetchEvent(id);
        } else {
            setLoading(false);
        }
    }, [location]);

    const fetchEvent = async (id) => {
        try {
            const events = await Event.filter({ id });
            if (events.length > 0) {
                const fetchedEvent = events[0];
                setEvent(fetchedEvent);
                setPaymentRequired(fetchedEvent.payment_required || false);
                setPrice(fetchedEvent.price || 0);
                setPaymentMethods(fetchedEvent.payment_methods || []);
                setRefundPolicy(fetchedEvent.refund_policy || '');
            }
        } catch (error) {
            console.error("Failed to fetch event:", error);
        } finally {
            setLoading(false);
        }
    };

    const addPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, { method: '', id: '', details: '' }]);
    };

    const removePaymentMethod = (index) => {
        const newMethods = [...paymentMethods];
        newMethods.splice(index, 1);
        setPaymentMethods(newMethods);
    };

    const handleMethodChange = (index, field, value) => {
        const newMethods = [...paymentMethods];
        newMethods[index][field] = value;
        setPaymentMethods(newMethods);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const finalPrice = paymentRequired ? price : 0;
            await Event.update(eventId, {
                payment_required: paymentRequired,
                price: finalPrice,
                payment_methods: paymentMethods,
                refund_policy: refundPolicy,
            });
            // Navigate back to the event creation page to show it's saved.
            navigate(createPageUrl(`CreateEvent?edit=${eventId}`));
        } catch (error) {
            console.error("Failed to save payment settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }
    
    if (!event) {
        return <div className="min-h-screen flex items-center justify-center text-center">Event not found. Please go back and try again.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate(createPageUrl(`CreateEvent?edit=${eventId}`))} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Event Editor
                    </Button>
                    <h1 className="text-3xl font-bold">Payment Setup</h1>
                    <p className="text-gray-500">Configure payment options for "{event.title}"</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
                    {/* Payment Required Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <Label htmlFor="payment-required" className="font-semibold text-lg">Require Payment?</Label>
                        <Switch
                            id="payment-required"
                            checked={paymentRequired}
                            onCheckedChange={setPaymentRequired}
                        />
                    </div>

                    {/* Price Input */}
                    {paymentRequired && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Label htmlFor="price" className="font-semibold">Price (USD)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                placeholder="e.g., 25"
                                className="mt-2"
                            />
                        </motion.div>
                    )}

                    {/* Payment Methods */}
                    <div>
                        <Label className="font-semibold">Accepted Payment Methods</Label>
                        <p className="text-sm text-gray-500 mb-4">How should guests pay you? Add one or more methods.</p>
                        <div className="space-y-4">
                            {paymentMethods.map((method, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-2 border p-4 rounded-lg bg-gray-50/50 relative">
                                    <div className="flex-1">
                                        <Label className="text-xs">Payment Service</Label>
                                        <Select value={method.method} onValueChange={(value) => handleMethodChange(index, 'method', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Venmo">Venmo</SelectItem>
                                                <SelectItem value="PayPal">PayPal</SelectItem>
                                                <SelectItem value="Zelle">Zelle</SelectItem>
                                                <SelectItem value="CashApp">Cash App</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Your ID or Link</Label>
                                        <Input
                                            value={method.id}
                                            onChange={(e) => handleMethodChange(index, 'id', e.target.value)}
                                            placeholder="e.g., @your-username or email"
                                        />
                                    </div>
                                     <Button variant="ghost" size="icon" onClick={() => removePaymentMethod(index)} className="absolute -top-2 -right-2 bg-white rounded-full">
                                        <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" onClick={addPaymentMethod} className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Method
                        </Button>
                    </div>

                    {/* Refund Policy */}
                    <div>
                        <Label htmlFor="refund-policy" className="font-semibold">Refund Policy</Label>
                        <Textarea
                            id="refund-policy"
                            value={refundPolicy}
                            onChange={(e) => setRefundPolicy(e.target.value)}
                            placeholder="e.g., 'No refunds after 24 hours before the event.'"
                            className="mt-2"
                        />
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Payment Settings
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}