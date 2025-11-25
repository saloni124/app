import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CreditCard, Minus, Plus } from "lucide-react";

export default function TicketPurchase({ event, onPurchase, onClose, currentUser }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalAmount = quantity * (event.price || 0);
  const maxTickets = Math.min(10, (event.capacity || 100) - (event.tickets_sold || 0));

  const handlePurchase = async () => {
    if (!currentUser) {
      // Will trigger login redirect in parent component
      onPurchase({ quantity, total_amount: totalAmount });
      return;
    }

    setLoading(true);
    try {
      await onPurchase({ quantity, total_amount: totalAmount });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Purchase Tickets</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Event Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <div className="text-sm text-gray-600">
              <div>{event.venue_name || event.location}</div>
              <div>{new Date(event.date).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of tickets
            </label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center justify-center w-16 h-12 bg-gray-50 rounded-lg font-semibold text-lg">
                {quantity}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxTickets, quantity + 1))}
                disabled={quantity >= maxTickets}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              Maximum {maxTickets} tickets per order
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">
                {quantity} × ${event.price || 0}
              </span>
              <span className="font-medium">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-blue-800">
                <div className="font-medium">{currentUser.full_name}</div>
                <div>{currentUser.email}</div>
              </div>
            </div>
          )}

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={loading || maxTickets === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-xl text-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : !currentUser ? (
              "Sign in to Purchase"
            ) : event.price === 0 ? (
              "Get Free Tickets"
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Purchase ${totalAmount.toFixed(2)}
              </>
            )}
          </Button>

          {maxTickets === 0 && (
            <div className="mt-4 text-center text-red-600 font-medium">
              Sorry, this event is sold out!
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}