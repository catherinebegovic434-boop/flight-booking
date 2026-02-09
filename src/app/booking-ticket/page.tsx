'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { Plane, Calendar, MapPin, User, Mail, Phone, CheckCircle2, Download, Printer, ArrowRight, Clock, Luggage } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

export default function BookingTicket() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingRef = searchParams.get('ref');
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingRef) {
        router.push('/my-bookings');
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_reference', bookingRef)
        .single();

      if (error || !data) {
        router.push('/my-bookings');
        return;
      }

      setBooking(data);
      setLoading(false);
    };

    fetchBooking();
  }, [bookingRef, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc2127]"></div>
          <p className="mt-4 text-gray-600">Loading your ticket...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const departureDate = new Date(booking.departure_date);
  const boardingTime = booking.departure_time 
    ? new Date(`${booking.departure_date}T${booking.departure_time}`)
    : new Date(departureDate.getTime() - 30 * 60000);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-red-50">
      <NavigationHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle2 className="size-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">Your flight is confirmed. Here's your boarding pass.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-[#0090da] print:border-2">
          <div className="bg-gradient-to-r from-[#cc2127] to-[#0090da] p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-1">BOARDING PASS</h2>
                <p className="text-white/90 text-sm">Electronic Ticket</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/90 mb-1">Booking Reference</p>
                <p className="text-3xl font-bold font-mono tracking-wider">{booking.booking_reference}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b-2 border-dashed border-gray-300">
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500 mb-2">FROM</p>
                    <p className="text-4xl font-bold text-[#cc2127] mb-1">{booking.from_airport}</p>
                    <p className="text-sm text-gray-600 font-medium">{booking.from_airport}</p>
                  </div>
                  
                  <div className="flex flex-col items-center mx-6">
                    <Plane className="size-8 text-[#0090da] mb-2 rotate-90" />
                    <div className="w-24 h-1 bg-gradient-to-r from-[#cc2127] via-[#0090da] to-[#cc2127] rounded-full"></div>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500 mb-2">TO</p>
                    <p className="text-4xl font-bold text-[#cc2127] mb-1">{booking.to_airport}</p>
                    <p className="text-sm text-gray-600 font-medium">{booking.to_airport}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="size-5 text-[#0090da]" />
                      <p className="text-xs text-gray-600 font-semibold uppercase">Departure Date</p>
                    </div>
                    <p className="text-xl font-bold text-black">
                      {departureDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="size-5 text-[#0090da]" />
                      <p className="text-xs text-gray-600 font-semibold uppercase">Departure Time</p>
                    </div>
                    <p className="text-xl font-bold text-black">
                      {booking.departure_time || 'TBA'}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="size-5 text-[#cc2127]" />
                      <p className="text-xs text-gray-600 font-semibold uppercase">Flight</p>
                    </div>
                    <p className="text-lg font-bold text-black">{booking.airline}</p>
                    <p className="text-sm text-gray-600 font-mono">{booking.flight_number}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="size-5 text-[#cc2127]" />
                      <p className="text-xs text-gray-600 font-semibold uppercase">Class</p>
                    </div>
                    <p className="text-lg font-bold text-black">{booking.cabin_class}</p>
                    <p className="text-sm text-gray-600">{booking.travelers} Traveler(s)</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex items-start gap-2">
                    <Clock className="size-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-900 mb-1">Important: Check-in Information</p>
                      <p className="text-xs text-yellow-800">
                        Please arrive at the airport at least 2 hours before departure for domestic flights 
                        and 3 hours for international flights. Boarding closes 30 minutes before departure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-[#0090da]">
                <p className="text-sm text-gray-600 font-semibold mb-3 uppercase">Scan for Details</p>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCodeSVG 
                    value={`BOOKING:${booking.booking_reference}|FROM:${booking.from_airport}|TO:${booking.to_airport}|DATE:${booking.departure_date}|FLIGHT:${booking.flight_number}|PAX:${booking.travelers}`}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">Present this QR code at check-in</p>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-6 mb-6">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <User className="size-6 text-[#0090da]" />
                Passenger Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.passenger_details?.map((passenger: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 font-semibold mb-2">PASSENGER {idx + 1}</p>
                    <p className="text-lg font-bold text-black mb-2">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="size-3" />
                        <span>{passenger.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-3" />
                        <span>{passenger.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">Booking Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-lg font-bold text-green-700">CONFIRMED</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">Total Paid</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {booking.currency} {booking.total_price.toLocaleString()}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">Payment Method</p>
                  <p className="text-lg font-bold text-orange-700 uppercase">
                    {booking.payment_details?.method || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-900 font-semibold mb-2">📧 CONFIRMATION EMAIL SENT</p>
              <p className="text-xs text-blue-700">
                A confirmation email with your booking details has been sent to the email address(es) provided. 
                Please check your inbox and spam folder.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-[#0090da] text-white rounded-lg hover:bg-[#0090da]/90 transition-colors font-bold shadow-lg"
              >
                <Printer className="size-5" />
                Print Boarding Pass
              </button>
              
              <button
                onClick={() => router.push('/my-bookings')}
                className="flex items-center gap-2 px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold shadow-lg"
              >
                View All Bookings
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#cc2127] to-[#0090da] p-4 text-center">
            <p className="text-white text-sm font-semibold">
              Thank you for choosing our airline. Have a safe flight!
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 print:hidden">
          <p>For any changes or cancellations, please visit the Manage Booking section or contact our support team.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}