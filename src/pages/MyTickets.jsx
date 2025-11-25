
import React, { useState, useEffect } from "react";
import { Ticket } from "@/api/entities";
import { Event } from "@/api/entities";
import { User } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Ticket as TicketIcon, Calendar, MapPin, QrCode, Download, ArrowLeft, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const userTickets = await Ticket.filter({ buyer_email: user.email });
      setTickets(userTickets);

      if (userTickets.length > 0) {
        const eventIds = [...new Set(userTickets.map((ticket) => ticket.event_id))];
        const eventRecords = await Event.filter({ id: { $in: eventIds } });

        const eventDetails = eventRecords.reduce((acc, event) => {
          acc[event.id] = event;
          return acc;
        }, {});

        setEvents(eventDetails);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      // It's better to show an error message or let them retry
      // await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTickets = tickets.filter((ticket) => {
    const event = events[ticket.event_id];
    return event && new Date(event.date) >= new Date();
  });

  const pastTickets = tickets.filter((ticket) => {
    const event = events[ticket.event_id];
    return event && new Date(event.date) < new Date();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 pt-20 md:pt-16 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-8 relative">
            <button
            onClick={() => navigate(-1)}
            className="mb-16 absolute left-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center">
                <h1 className="text-3xl font-semibold md:text-4xl gradient-text">My Tickets</h1>
                <p className="text-lg text-gray-500 mt-1">
                    Manage your event tickets and access codes
                </p>
            </motion.div>
        </div>

        {tickets.length === 0 && !loading ?
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-500 mb-6 ml-1">Start exploring events to get your first ticket!</p>
            <Link to={createPageUrl("Feed")}>
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                Discover Events
              </button>
            </Link>
          </motion.div> :

        <div className="space-y-8">
            {/* Upcoming Tickets */}
            {upcomingTickets.length > 0 &&
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <ChevronDown className="h-6 w-6 text-gray-500 data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
                <div className="grid gap-6">
                  {upcomingTickets.map((ticket, index) => {
                  const event = events[ticket.event_id];
                  if (!event) return (
                    <div key={ticket.id} className="bg-white border border-red-300 rounded-2xl p-4 text-center text-red-600">
                            Could not load event details for one of your tickets.
                        </div>);


                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                        <div className="md:flex">
                          {/* Event Image */}
                          <div className="md:w-1/3">
                            <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
                                <div className="aspect-video md:aspect-square relative overflow-hidden h-full">
                                  {event.cover_image ?
                              <img
                                src={event.cover_image}
                                alt={event.title}
                                className="w-full h-full object-cover" /> :


                              <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                      <span className="text-4xl">🎉</span>
                                    </div>
                              }
                                </div>
                            </Link>
                          </div>

                          {/* Event Details */}
                          <div className="md:w-2/3 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                                    <div className="space-y-2 text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{event.venue_name || event.location}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className="bg-teal-100 text-teal-800 border border-teal-200">
                                    Confirmed
                                  </Badge>
                                </div>

                                {/* Ticket Info */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Ticket Quantity</span>
                                    <span className="font-semibold text-gray-900">{ticket.quantity}</span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Total Paid</span>
                                    <span className="font-semibold text-gray-900">${ticket.total_amount}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">QR Code</span>
                                    <span className="font-mono text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">
                                      {ticket.qr_code}
                                    </span>
                                  </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-auto">
                              <Link to={createPageUrl(`EventDetails?id=${event.id}`)} className="flex-1">
                                <button className="w-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                  View Event
                                </button>
                              </Link>
                              <button className="flex items-center gap-2 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                <QrCode className="w-4 h-4" />
                                Show QR
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>);

                })}
                </div>
            </CollapsibleContent>
          </Collapsible>
          }

            {/* Past Tickets */}
            {pastTickets.length > 0 &&
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900">Past Events</h2>
              <ChevronDown className="h-6 w-6 text-gray-500 data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
                <div className="grid gap-4">
                  {pastTickets.map((ticket, index) => {
                  const event = events[ticket.event_id];
                  if (!event) return null;

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 border border-gray-200">

                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {event.cover_image ?
                          <img
                            src={event.cover_image}
                            alt={event.title}
                            className="w-full h-full object-cover opacity-60" /> :


                          <div className="w-full h-full bg-gray-100 flex items-center justify-center opacity-60">
                                <span className="text-lg">🎉</span>
                              </div>
                          }
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-600">{event.title}</h4>
                            <p className="text-sm text-gray-500">
                              {format(new Date(event.date), "MMM d, yyyy")} • {ticket.quantity} tickets
                            </p>
                          </div>

                          <Badge variant="outline" className="text-gray-500 border-gray-300">
                            Attended
                          </Badge>
                        </div>
                      </motion.div>);

                })}
                </div>
            </CollapsibleContent>
          </Collapsible>
          }
          </div>
        }
      </div>
    </div>);
}
