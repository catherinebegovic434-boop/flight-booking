'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { generateFlightOptions, FlightOption } from '@/lib/airlines';
import { airports } from '@/lib/airports';
import { Plane, Clock, Calendar, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FlightSearchResults() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate');
  const travelers = parseInt(searchParams.get('travelers') || '1');
  const cabinClass = searchParams.get('cabinClass') || 'Economy';
  const tripType = searchParams.get('tripType') || 'round-trip';

  const fromAirport = airports.find(a => a.code === from);
  const toAirport = airports.find(a => a.code === to);

  useEffect(() => {
    if (from && to && departureDate) {
      setLoading(true);
      
      const fetchFlights = async () => {
        const { data: pricingData } = await supabase
          .from('pricing_settings')
          .select('current_pricing_level')
          .single();
        
        const currentPricingLevel = pricingData?.current_pricing_level || 3;
        
        const flightOptions = generateFlightOptions(
          from,
          to,
          departureDate,
          returnDate,
          cabinClass,
          travelers,
          currentPricingLevel
        );
        const validFlights = flightOptions.filter(flight => flight.seatsAvailable >= travelers);
        setFlights(validFlights);
        setLoading(false);
      };
      
      fetchFlights();
    }
  }, [from, to, departureDate, returnDate, cabinClass, travelers]);

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    return a.departure.time.localeCompare(b.departure.time);
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Plane className="size-5 text-[#0090da]" />
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-semibold text-black">
                    {fromAirport?.city || from} ({from})
                  </p>
                </div>
              </div>
              
              <ArrowRight className="size-5 text-gray-400" />
              
              <div className="flex items-center gap-2">
                <Plane className="size-5 text-[#0090da] rotate-90" />
                <div>
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-semibold text-black">
                    {toAirport?.city || to} ({to})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Calendar className="size-5 text-[#0090da]" />
                <div>
                  <p className="text-sm text-gray-600">Dates</p>
                  <p className="font-semibold text-black">
                    {new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {returnDate && ` - ${new Date(returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="size-5 text-[#0090da]" />
                <div>
                  <p className="text-sm text-gray-600">Travelers</p>
                  <p className="font-semibold text-black">{travelers} • {cabinClass}</p>
                </div>
              </div>
            </div>
            
            <Link
              href="/"
              className="px-4 py-2 bg-[#0090da] text-white rounded-md hover:bg-[#0090da]/90 transition-colors font-medium text-sm"
            >
              Modify Search
            </Link>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <button
              onClick={() => setSortBy('price')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'price'
                  ? 'bg-[#0090da] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lowest Price
            </button>
            <button
              onClick={() => setSortBy('duration')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'duration'
                  ? 'bg-[#0090da] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Shortest Duration
            </button>
            <button
              onClick={() => setSortBy('departure')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'departure'
                  ? 'bg-[#0090da] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Earliest Departure
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">
            {loading ? 'Searching flights...' : `${flights.length} flights found`}
          </h2>
        </div>

        {/* Flight Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="size-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No available flights</h3>
              <p className="text-gray-600 mb-6">
                No flights with sufficient seats for {travelers} traveler{travelers > 1 ? 's' : 's'}.
                Try reducing the number of travelers or selecting different dates.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#0090da] text-white rounded-md hover:bg-[#0090da]/90 transition-colors font-medium"
              >
                Modify Search
              </Link>
            </div>
          ) : (
            sortedFlights.map((flight) => (
              <div
                key={flight.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Airline Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-[#0090da]">
                        {flight.airline.code}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-black text-lg">{flight.airline.name}</p>
                      <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                      <p className="text-xs text-gray-500">{flight.cabinClass}</p>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                    {/* Departure */}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black">{flight.departure.time}</p>
                      <p className="text-sm text-gray-600">{flight.departure.airport}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(flight.departure.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Duration & Stops */}
                    <div className="text-center border-x border-gray-200 px-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="size-4 text-gray-400" />
                        <p className="text-sm font-medium text-black">{flight.duration}</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <Plane className="size-4 text-[#0090da]" />
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black">{flight.arrival.time}</p>
                      <p className="text-sm text-gray-600">{flight.arrival.airport}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(flight.arrival.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Price & Booking */}
                  <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#cc2127]">
                        KES {flight.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">
                        Total for {travelers} traveler{travelers > 1 ? 's' : ''}
                      </p>
                      <p className={`text-xs font-semibold mt-1 ${
                        flight.seatsAvailable <= 5 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {flight.seatsAvailable} seats left
                      </p>
                    </div>
                    {flight.seatsAvailable >= travelers ? (
                      <Link
                        href={`/flights/booking?flightId=${flight.id}&from=${from}&to=${to}&departureDate=${departureDate}&travelers=${travelers}&cabinClass=${cabinClass}&price=${flight.price}&airline=${flight.airline.name}&flightNumber=${flight.flightNumber}`}
                        className="w-full px-6 py-3 bg-[#cc2127] text-white rounded-md hover:bg-[#cc2127]/90 transition-colors font-bold text-sm text-center"
                      >
                        Select Flight
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-md font-bold text-sm text-center cursor-not-allowed"
                      >
                        Not Enough Seats
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}