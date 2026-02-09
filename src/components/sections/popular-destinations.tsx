'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'local', label: 'Local Destinations' },
  { id: 'north-america', label: 'North America Destinations' },
  { id: 'international', label: 'International Destinations' },
];

const LOCAL_DESTINATIONS = [
  {
    id: 1,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_2.png",
    origin: "Nairobi",
    destination: "Mombasa",
    destinationCode: "MBA",
    price: "5,800",
  },
  {
    id: 2,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_3.png",
    origin: "Nairobi",
    destination: "Kisumu",
    destinationCode: "KIS",
    price: "6,200",
  },
  {
    id: 3,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_4.png",
    origin: "Nairobi",
    destination: "Ukunda",
    destinationCode: "UKA",
    price: "7,500",
  },
  {
    id: 4,
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_5.png",
    origin: "Nairobi",
    destination: "Malindi",
    destinationCode: "MYD",
    price: "6,800",
  },
];

const NORTH_AMERICA_DESTINATIONS = [
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    origin: "Nairobi",
    destination: "New York",
    destinationCode: "JFK",
    price: "85,000",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1470282312847-28b943046dc1?w=800",
    origin: "Nairobi",
    destination: "Toronto",
    destinationCode: "YYZ",
    price: "95,000",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    origin: "Nairobi",
    destination: "Los Angeles",
    destinationCode: "LAX",
    price: "92,000",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    origin: "Nairobi",
    destination: "Dubai",
    destinationCode: "DXB",
    price: "45,000",
  },
];

const INTERNATIONAL_DESTINATIONS = [
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    origin: "Nairobi",
    destination: "London",
    destinationCode: "LHR",
    price: "75,000",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    origin: "Nairobi",
    destination: "Paris",
    destinationCode: "CDG",
    price: "78,000",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    origin: "Nairobi",
    destination: "Dubai",
    destinationCode: "DXB",
    price: "45,000",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    origin: "Nairobi",
    destination: "Istanbul",
    destinationCode: "IST",
    price: "52,000",
  },
];

export default function PopularDestinations() {
  const [activeTab, setActiveTab] = useState('local');

  const getDestinations = () => {
    switch (activeTab) {
      case 'local':
        return LOCAL_DESTINATIONS;
      case 'north-america':
        return NORTH_AMERICA_DESTINATIONS;
      case 'international':
        return INTERNATIONAL_DESTINATIONS;
      default:
        return LOCAL_DESTINATIONS;
    }
  };

  const destinations = getDestinations();

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 bg-white py-6 px-[20px] md:py-12 xl:px-[100px] mt-10 md:mt-0 shadow-none">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl md:text-[28px] font-black leading-[1.2] text-foreground">
          Popular Flight Destinations
        </h2>
        <Link
          href="#"
          className="hidden items-center justify-center gap-1 whitespace-nowrap rounded-md text-[16px] font-bold text-[#cc2127] underline-offset-4 transition-colors hover:underline md:flex"
        >
          View More
          <ChevronRight className="h-3 w-3 stroke-[3px]" />
        </Link>
      </div>

      <div
        role="radiogroup"
        className="flex items-center justify-start gap-0 overflow-x-auto pb-2 scrollbar-none md:gap-2.5 md:pb-0"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="radio"
            aria-checked={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-state={activeTab === tab.id ? 'checked' : 'unchecked'}
            className="whitespace-nowrap rounded-[5px] px-2 py-1 text-[14px] font-bold text-muted-foreground transition-colors hover:bg-[#f5f5f5] hover:text-foreground focus:bg-[#f5f5f5] focus:text-foreground data-[state=checked]:bg-[#f5f5f5] data-[state=checked]:text-foreground md:px-4 md:text-[16px]"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full flex gap-6 items-center overflow-x-auto whitespace-nowrap sm:whitespace-normal scrollbar-none pl-1 md:pl-0 pt-2 pb-8 md:pb-4 md:grid md:grid-cols-4 md:overflow-visible">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="flex min-w-[280px] w-full flex-col overflow-hidden rounded-[5px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] md:min-w-0"
          >
            <div className="relative aspect-[320/216] w-full bg-[#f5f5f5]">
              <Image
                src={destination.image}
                alt={`${destination.origin} to ${destination.destination}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 25vw"
              />
            </div>

            <div className="flex h-[7.5rem] flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-1">
                <h3 className="text-[18px] font-bold text-foreground">
                  {destination.origin} to {destination.destination}
                </h3>
              </div>

              <div className="flex flex-col items-start gap-0.5">
                <div className="text-[12px] text-[#999999]">
                 Return Fare from
                </div>
                <div className="text-[16px] font-bold text-foreground">
                  Running Daily
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <span className="text-[16px] font-black text-foreground">
                  KES {destination.price}
                </span>
                <Link 
                  href={`/flights/search?from=NBO&to=${destination.destinationCode}&departureDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&travelers=1&cabinClass=Economy&tripType=round-trip`}
                  className="flex items-center gap-1 text-[14px] font-bold text-[#cc2127] hover:underline"
                >
                  Book Now <ChevronRight className="h-3 w-3 stroke-[3px]" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full justify-center md:hidden">
        <Link
          href="#"
          className="flex items-center justify-center gap-1 text-[14px] font-bold text-[#cc2127] underline-offset-4 hover:underline"
        >
          View More
          <ChevronRight className="h-3 w-3 stroke-[3px]" />
        </Link>
      </div>
    </section>
  );
}