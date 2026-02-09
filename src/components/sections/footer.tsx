import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Ticket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#d3d3d3] pt-12 pb-8 text-sm">
      <div className="mx-auto w-full max-w-[1440px] px-5 xl:px-[100px]">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Logo Column */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-1 group">
               <div className="flex items-center">
                  <Ticket className="w-8 h-8 text-[#cc2127] fill-current mr-1 transform -rotate-12" />
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-2xl tracking-tighter text-black">ticketshwari</span>
                    <span className="text-[10px] font-bold text-black self-end -mt-1 -mr-1">.com</span>
                  </div>
               </div>
            </Link>
          </div>

          {/* Flight Services Column */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-black mb-4 text-[16px]">Flight Services</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Search Flights</Link></li>
              <li><Link href="/my-bookings" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">My Bookings</Link></li>
              <li><Link href="/flight-status" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Flight Status</Link></li>
            </ul>
          </div>

          {/* Using TicketShwari Column */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-black mb-4 text-[16px]">Using TicketShwari</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Book a Flight</Link></li>
              <li><Link href="/manage-booking" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Manage Booking</Link></li>
              <li><Link href="/write-review" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Write a Review</Link></li>
              <li><Link href="#" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Quicklinks Column */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-black mb-4 text-[16px]">Quicklinks</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/support" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Support</Link></li>
              <li><Link href="#" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Privacy</Link></li>
              <li><Link href="#" className="text-[#666666] font-normal hover:text-[#cc2127] hover:underline transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             <div className="flex flex-col gap-3">
               <label htmlFor="newsletter-email" className="text-[#333333] text-[14px] font-semibold">
                 Subscribe to Flight Deals
               </label>
               <div className="flex w-full max-w-sm gap-2">
                 <input 
                   id="newsletter-email"
                   type="email" 
                   placeholder="Email" 
                   className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0090da] focus:border-[#0090da]"
                 />
                 <button className="h-10 rounded-md bg-[#cc2127] px-6 text-sm font-bold text-white shadow hover:bg-[#b01c21] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
                   Subscribe
                 </button>
               </div>
             </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-16 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-xs text-[#666666]">
          <p>© 2025 TicketShwari. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#cc2127] transition-colors" aria-label="Facebook">
              <Facebook className="fill-current w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#cc2127] transition-colors" aria-label="Twitter">
              <Twitter className="fill-current w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#cc2127] transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-[#cc2127] transition-colors" aria-label="YouTube">
              <Youtube className="fill-current w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}