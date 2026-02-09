'use client';

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plane, Calendar, User, ChevronDown, Circle, X, MapPin } from "lucide-react";
import { searchAirports, Airport } from "@/lib/airports";
import { format } from "date-fns";

export default function FlightSearchHero() {
  const router = useRouter();
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('round-trip');
  const [from, setFrom] = useState<Airport | null>(null);
  const [to, setTo] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [travelers, setTravelers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showTravelersPicker, setShowTravelersPicker] = useState(false);

  const fromResults = searchAirports(fromSearch);
  const toResults = searchAirports(toSearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !departureDate) {
      alert('Please fill in all required fields');
      return;
    }

    const params = new URLSearchParams({
      from: from.code,
      to: to.code,
      departureDate: format(departureDate, 'yyyy-MM-dd'),
      ...(tripType === 'round-trip' && returnDate ? { returnDate: format(returnDate, 'yyyy-MM-dd') } : {}),
      travelers: travelers.toString(),
      cabinClass,
      tripType,
    });

    router.push(`/flights/search?${params.toString()}`);
  };

  return (
    <section className="flex flex-col w-full font-sans antialiased relative">
      <div className="w-full relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 min-h-[600px] lg:min-h-[650px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 size-full overflow-hidden">
          <Image
            alt="Hero background image"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_1.png"
            fill
            className="object-cover object-center opacity-40 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900/70 to-blue-950/80"></div>
        </div>

        <div className="relative z-10 w-full mx-auto lg:max-w-[1440px] lg:px-[100px] px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
          {/* Hero Title Section */}
          <div className="mb-10 lg:mb-12 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white mb-4 lg:mb-6 tracking-tight leading-tight">
              Fly Across The World
              <span className="block bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent mt-2">
                With Confidence
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-50 font-light max-w-2xl leading-relaxed">
              Your trusted partner for seamless flight bookings across Kenya, Tanzania, Uganda, Rwanda and beyond. Best prices, instant confirmation, 24/7 support.
            </p>
          </div>

          {/* Search Form */}
          <div className="flex flex-col relative gap-4 rounded-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl p-6 xl:p-10 py-8 h-auto overflow-visible w-full lg:max-w-[900px]">
            <div className="flex h-full w-full grow relative flex-col gap-6">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                
                {/* Trip Type Radio Group */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                        Trip type
                      </label>
                      <div role="radiogroup" className="flex gap-6" id="tripType">
                        <div className="flex items-center gap-2 space-y-0 cursor-pointer" onClick={() => setTripType('round-trip')}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={tripType === 'round-trip'}
                            className={`aspect-square size-5 shrink-0 rounded-full border-2 shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[#cc2127]/30 relative transition-all ${
                              tripType === 'round-trip' ? 'text-[#cc2127] border-[#cc2127]' : 'border-gray-400'
                            }`}
                          >
                            {tripType === 'round-trip' && (
                              <span className="flex items-center justify-center absolute inset-0">
                                <Circle className="fill-[#cc2127] size-2.5" />
                              </span>
                            )}
                          </button>
                          <label className="text-gray-800 text-base leading-4 select-none font-medium cursor-pointer">
                            Round Trip
                          </label>
                        </div>

                        <div className="flex items-center gap-2 space-y-0 cursor-pointer" onClick={() => setTripType('one-way')}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={tripType === 'one-way'}
                            className={`aspect-square size-5 shrink-0 rounded-full border-2 shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[#cc2127]/30 relative transition-all ${
                              tripType === 'one-way' ? 'text-[#cc2127] border-[#cc2127]' : 'border-gray-400'
                            }`}
                          >
                            {tripType === 'one-way' && (
                              <span className="flex items-center justify-center absolute inset-0">
                                <Circle className="fill-[#cc2127] size-2.5" />
                              </span>
                            )}
                          </button>
                          <label className="text-gray-800 text-base leading-4 select-none font-medium cursor-pointer">
                            One Way
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Origin and Destination */}
                <div className="flex flex-col gap-3.5">
                  <div className="grid lg:grid-cols-2 gap-3.5">
                    {/* Departure Input */}
                    <div className="grid gap-2 relative">
                      <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                        Departing From
                      </label>
                      <div className="text-popover-foreground flex h-full flex-col rounded-md bg-transparent min-h-12 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="group flex text-left items-center rounded-md border bg-white text-sm ring-offset-background focus-within:ring-2 focus-within:ring-[#0090da] focus-within:ring-offset-0 h-12 border-[#d9d9d9] w-full">
                          <div className="flex items-center gap-3 px-4 w-full">
                            <Plane className="size-4 opacity-50 -ml-1 shrink-0" />
                            <input
                              className="flex-1 bg-transparent outline-none w-full placeholder:text-[#999999] text-black"
                              placeholder="Departing From"
                              autoComplete="off"
                              value={from ? `${from.city} (${from.code})` : fromSearch}
                              onChange={(e) => {
                                setFromSearch(e.target.value);
                                setFrom(null);
                                setShowFromDropdown(true);
                              }}
                              onFocus={() => setShowFromDropdown(true)}
                            />
                            {from && (
                              <button
                                type="button"
                                onClick={() => { setFrom(null); setFromSearch(''); }}
                                className="shrink-0"
                              >
                                <X className="size-4 opacity-50" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {showFromDropdown && fromResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                          {fromResults.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                              onClick={() => {
                                setFrom(airport);
                                setFromSearch('');
                                setShowFromDropdown(false);
                              }}
                            >
                              <span className="font-medium text-black">{airport.city} ({airport.code})</span>
                              <span className="text-sm text-gray-600">{airport.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Destination Input */}
                    <div className="grid gap-2 relative">
                      <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                        Going To
                      </label>
                      <div className="text-popover-foreground flex h-full flex-col rounded-md bg-transparent min-h-12 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                        <div className="group flex text-left items-center rounded-md border bg-white text-sm ring-offset-background focus-within:ring-2 focus-within:ring-[#0090da] focus-within:ring-offset-0 h-12 border-[#d9d9d9] w-full">
                          <div className="flex items-center gap-3 px-4 w-full">
                            <Plane className="size-4 opacity-50 -ml-1 shrink-0" />
                            <input
                              className="flex-1 bg-transparent outline-none w-full placeholder:text-[#999999] text-black"
                              placeholder="Going To"
                              autoComplete="off"
                              value={to ? `${to.city} (${to.code})` : toSearch}
                              onChange={(e) => {
                                setToSearch(e.target.value);
                                setTo(null);
                                setShowToDropdown(true);
                              }}
                              onFocus={() => setShowToDropdown(true)}
                            />
                            {to && (
                              <button
                                type="button"
                                onClick={() => { setTo(null); setToSearch(''); }}
                                className="shrink-0"
                              >
                                <X className="size-4 opacity-50" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {showToDropdown && toResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                          {toResults.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                              onClick={() => {
                                setTo(airport);
                                setToSearch('');
                                setShowToDropdown(false);
                              }}
                            >
                              <span className="font-medium text-black">{airport.city} ({airport.code})</span>
                              <span className="text-sm text-gray-600">{airport.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates, Travelers, Class */}
                  <div className="grid lg:grid-cols-4 gap-3.5">
                    {/* Departure Date */}
                    <div className="grid gap-2 relative">
                      <div className="flex flex-col gap-2">
                        <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                          Departure Date
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDeparturePicker(!showDeparturePicker)}
                          className="w-full flex items-center justify-start text-left font-normal border border-[#d9d9d9] bg-white rounded-md h-12 gap-3 pl-4 hover:bg-neutral-50 focus:ring-2 focus:ring-[#0090da] outline-none"
                        >
                          <Calendar className="mr-1 h-4 w-4 opacity-50 shrink-0" />
                          <span className={`text-sm ${departureDate ? 'text-black' : 'text-[#999999]'}`}>
                            {departureDate ? format(departureDate, 'MMM dd, yyyy') : 'Departure Date'}
                          </span>
                        </button>
                      </div>
                      {showDeparturePicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-50 p-4">
                          <input
                            type="date"
                            min={format(new Date(), 'yyyy-MM-dd')}
                            value={departureDate ? format(departureDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                              setDepartureDate(new Date(e.target.value));
                              setShowDeparturePicker(false);
                            }}
                            className="border border-[#d9d9d9] rounded px-3 py-2"
                          />
                        </div>
                      )}
                    </div>

                    {/* Return Date */}
                    <div className="grid gap-2 relative">
                      <div className="flex flex-col gap-2">
                        <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                          Return Date
                        </label>
                        <button
                          type="button"
                          onClick={() => tripType === 'round-trip' && setShowReturnPicker(!showReturnPicker)}
                          disabled={tripType === 'one-way'}
                          className={`w-full flex items-center justify-start text-left font-normal border border-[#d9d9d9] bg-white rounded-md h-12 gap-3 pl-4 hover:bg-neutral-50 focus:ring-2 focus:ring-[#0090da] outline-none ${
                            tripType === 'one-way' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Calendar className="mr-1 h-4 w-4 opacity-50 shrink-0" />
                          <span className={`text-sm ${returnDate ? 'text-black' : 'text-[#999999]'}`}>
                            {returnDate ? format(returnDate, 'MMM dd, yyyy') : 'Return Date'}
                          </span>
                        </button>
                      </div>
                      {showReturnPicker && tripType === 'round-trip' && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-50 p-4">
                          <input
                            type="date"
                            min={departureDate ? format(departureDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                            value={returnDate ? format(returnDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                              setReturnDate(new Date(e.target.value));
                              setShowReturnPicker(false);
                            }}
                            className="border border-[#d9d9d9] rounded px-3 py-2"
                          />
                        </div>
                      )}
                    </div>

                    {/* Travelers */}
                    <div className="grid gap-2 relative">
                      <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                        Travelers
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTravelersPicker(!showTravelersPicker)}
                        className="inline-flex items-center cursor-pointer gap-2 rounded-md text-sm transition-[color,box-shadow] border border-[#d9d9d9] bg-white shadow-xs hover:bg-[#f5f5f5] px-4 w-full h-12 justify-start text-left font-normal whitespace-normal break-words leading-tight py-2 text-black focus:ring-2 focus:ring-[#0090da] outline-none"
                      >
                        <User className="size-4 shrink-0 opacity-50" />
                        <span className="whitespace-normal break-words overflow-hidden">
                          {travelers} traveler{travelers > 1 ? 's' : ''}
                        </span>
                      </button>
                      {showTravelersPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-50 p-4 w-48">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setTravelers(Math.max(1, travelers - 1))}
                              className="w-8 h-8 rounded border border-[#d9d9d9] hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="text-black font-medium">{travelers}</span>
                            <button
                              type="button"
                              onClick={() => setTravelers(Math.min(9, travelers + 1))}
                              className="w-8 h-8 rounded border border-[#d9d9d9] hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowTravelersPicker(false)}
                            className="mt-2 w-full py-1 text-sm text-center bg-[#0090da] text-white rounded hover:bg-[#0090da]/90"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cabin Class */}
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-foreground text-sm leading-4 font-medium select-none sr-only">
                        Cabin Class
                      </label>
                      <div className="relative w-full">
                        <select
                          value={cabinClass}
                          onChange={(e) => setCabinClass(e.target.value)}
                          className="flex items-center cursor-pointer justify-between gap-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none border border-[#d9d9d9] rounded-md bg-white px-3 py-2 shadow-xs h-12 w-full text-black hover:bg-[#f5f5f5] focus:ring-2 focus:ring-[#0090da] appearance-none"
                        >
                          <option>Economy</option>
                          <option>Premium Economy</option>
                          <option>Business</option>
                          <option>First</option>
                        </select>
                        <ChevronDown className="size-4 opacity-50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA and Subtext */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl transition-all bg-gradient-to-r from-[#cc2127] to-[#e02a30] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] px-8 py-4 h-14 w-full lg:w-72 text-lg font-black focus:ring-4 focus:ring-[#cc2127]/30"
                  >
                    <Plane className="size-5" />
                    Find Your Flight
                  </button>
                  <span className="text-sm w-full lg:w-72 text-center font-normal text-gray-600">
                    ✓ Free cancellation within 24 hours • Best price guarantee
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}