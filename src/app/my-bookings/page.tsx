'use client';

import { useState } from 'react';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { Search, Plane, Calendar, MapPin, User, Mail, Phone, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MyBookings() {
  const [searchType, setSearchType] = useState<'reference' | 'email'>('reference');
  const [searchValue, setSearchValue] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (searchType === 'reference') {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_reference', searchValue.toUpperCase());
        setBookings(data || []);
      } else {
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('*');
        
        const filtered = (allBookings || []).filter((booking: any) => 
          booking.passenger_details?.some((p: any) => 
            p.email?.toLowerCase() === searchValue.toLowerCase()
          )
        );
        
        setBookings(filtered);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const getPaymentStatusBadge = (booking: any) => {
    const paymentDetails = booking.payment_details;
    
    if (!paymentDetails || !paymentDetails.method) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
          <AlertCircle className="size-3" />
          No Payment
        </span>
      );
    }

    if (paymentDetails.verified_by_admin) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          Payment Verified
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1 animate-pulse">
        <Clock className="size-3" />
        Awaiting Verification
      </span>
    );
  };

  const getFlightStatus = (booking: any) => {
    if (booking.status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-700' };
    }

    const departureDateTime = new Date(`${booking.departure_date}T${booking.departure_time || '00:00'}`);
    const now = new Date();
    
    if (departureDateTime < now) {
      return { text: 'Departed', color: 'bg-gray-100 text-gray-700' };
    }
    
    const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeparture <= 2) {
      return { text: 'Boarding Soon', color: 'bg-orange-100 text-orange-700' };
    }
    
    return { text: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-black mb-2">My Bookings</h1>
        <p className="text-gray-600 mb-8">Search for your bookings using your booking reference or email</p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchType === 'reference'}
                onChange={() => setSearchType('reference')}
                className="w-4 h-4 text-[#cc2127]"
              />
              <span className="text-gray-700 font-medium">Booking Reference</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchType === 'email'}
                onChange={() => setSearchType('email')}
                className="w-4 h-4 text-[#cc2127]"
              />
              <span className="text-gray-700 font-medium">Email Address</span>
            </label>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'reference' ? 'Enter booking reference (e.g., TSABC123)' : 'Enter your email address'}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#cc2127] text-white font-bold rounded-lg hover:bg-[#cc2127]/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="size-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const flightStatus = getFlightStatus(booking);
              const isExpanded = selectedBooking?.id === booking.id;
              
              return (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                        <p className="text-2xl font-bold text-[#cc2127] font-mono">{booking.booking_reference}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                        {getPaymentStatusBadge(booking)}
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${flightStatus.color}`}>
                          {flightStatus.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Plane className="size-5 text-[#0090da] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Flight</p>
                          <p className="font-semibold text-black">{booking.airline}</p>
                          <p className="text-sm text-gray-600">{booking.flight_number}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="size-5 text-[#0090da] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Route</p>
                          <p className="font-semibold text-black">{booking.from_airport} → {booking.to_airport}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="size-5 text-[#0090da] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Departure</p>
                          <p className="font-semibold text-black">
                            {new Date(booking.departure_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          {booking.departure_time && (
                            <p className="text-sm text-gray-600 font-mono">{booking.departure_time}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-black">
                          {booking.currency} {booking.total_price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedBooking(isExpanded ? null : booking)}
                          className="px-6 py-2 border-2 border-[#cc2127] text-[#cc2127] font-semibold rounded-lg hover:bg-[#cc2127] hover:text-white transition-colors"
                        >
                          {isExpanded ? 'Hide Details' : 'View Ticket Summary'}
                        </button>
                        {booking.status === 'confirmed' ? (
                          <a
                            href={`/booking-ticket?ref=${booking.booking_reference}`}
                            className="px-6 py-2 bg-[#0090da] text-white font-semibold rounded-lg hover:bg-[#0090da]/90"
                          >
                            View Ticket
                          </a>
                        ) : (
                          <a
                            href={`/manage-booking?ref=${booking.booking_reference}`}
                            className="px-6 py-2 bg-[#0090da] text-white font-semibold rounded-lg hover:bg-[#0090da]/90"
                          >
                            Manage Booking
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-blue-50 p-6">
                      <h3 className="text-xl font-bold text-black mb-4">Ticket Summary</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                            <Plane className="size-5 text-[#0090da]" />
                            Flight Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Airline:</span>
                              <span className="font-semibold text-black">{booking.airline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Flight Number:</span>
                              <span className="font-semibold text-black">{booking.flight_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">From:</span>
                              <span className="font-semibold text-black">{booking.from_airport}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">To:</span>
                              <span className="font-semibold text-black">{booking.to_airport}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cabin Class:</span>
                              <span className="font-semibold text-black">{booking.cabin_class}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Travelers:</span>
                              <span className="font-semibold text-black">{booking.travelers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Departure Date:</span>
                              <span className="font-semibold text-black">
                                {new Date(booking.departure_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {booking.departure_time && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Departure Time:</span>
                                <span className="font-semibold text-black font-mono">{booking.departure_time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                            <User className="size-5 text-[#0090da]" />
                            Passenger Details
                          </h4>
                          <div className="space-y-3">
                            {booking.passenger_details?.map((passenger: any, idx: number) => (
                              <div key={idx} className="pb-3 border-b last:border-b-0">
                                <p className="font-semibold text-black mb-1">Passenger {idx + 1}</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="size-3 text-gray-500" />
                                    <span className="text-gray-700">{passenger.firstName} {passenger.lastName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="size-3 text-gray-500" />
                                    <span className="text-gray-700">{passenger.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="size-3 text-gray-500" />
                                    <span className="text-gray-700">{passenger.phone}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-bold text-black mb-3">Payment Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-semibold text-black uppercase">
                                {booking.payment_details?.method || 'Not Paid'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              {getPaymentStatusBadge(booking)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-bold text-[#cc2127] text-lg">
                                {booking.currency} {booking.total_price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {!booking.payment_details?.verified_by_admin && booking.payment_details?.method && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                <strong>Note:</strong> Your payment is being verified by our admin team. 
                                You'll be notified once it's confirmed.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-bold text-black mb-3">Booking Status</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Booking Status:</p>
                              <span className={`px-4 py-2 rounded-lg text-sm font-semibold inline-block ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {booking.status.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Flight Status:</p>
                              <span className={`px-4 py-2 rounded-lg text-sm font-semibold inline-block ${flightStatus.color}`}>
                                {flightStatus.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 pt-2 border-t">
                              <p>Booked on: {new Date(booking.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.status === 'pending' && !booking.payment_details?.method && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-red-900 mb-1">Payment Required</p>
                              <p className="text-sm text-red-800 mb-3">
                                Your booking will be cancelled if payment is not completed within 24 hours.
                              </p>
                              <a
                                href={`/manage-booking?ref=${booking.booking_reference}`}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold text-sm"
                              >
                                Complete Payment Now
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.status === 'pending' && booking.payment_details?.method && !booking.payment_details?.verified_by_admin && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Clock className="size-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div className="flex-1">
                              <p className="font-semibold text-yellow-900 mb-1">Payment Verification Pending</p>
                              <p className="text-sm text-yellow-800">
                                Your payment has been submitted and is awaiting admin verification. You'll be notified once confirmed.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && bookings.length === 0 && searchValue && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">No bookings found. Please check your booking reference or email and try again.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
