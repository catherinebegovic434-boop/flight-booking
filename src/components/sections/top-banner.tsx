import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function TopBanner() {
  return (
    <div className="flex w-full flex-col sm:static sm:z-auto sticky top-0 z-40 font-sans">
      <div className="h-10 bg-[#cc2127] px-4 py-2 sm:px-12 flex w-full">
        <div className="mx-auto flex w-full max-w-[83.75rem] items-center justify-center md:justify-between">
          <div className="hidden md:inline-flex h-5 items-center justify-start gap-[5px] text-[12px]">
            <div className="font-bold text-[#fbefef]">TICKETSASA</div>
            <div className="font-light text-[#fbefef]">
              - Book events, flights, hotels and holidays across East Africa
            </div>
          </div>

          <div className="inline-flex h-6 items-center justify-start gap-12">
            <div className="hidden md:flex gap-4">
              <button
                className="inline-flex items-center cursor-pointer disabled:cursor-not-allowed justify-center gap-2 whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-center font-extrabold uppercase py-0 px-1.5 rounded-[5px] h-6 text-sm text-black"
                type="button"
              >
                KES
              </button>
            </div>
            
            <div className="flex gap-2 text-center font-bold text-white text-[12px] leading-tight items-center">
              <p className="flex items-center">
                Call
                <a href="tel:+254709816000" className="ml-1 hover:underline">
                   +254-709-816-000
                </a>
              </p>
              <p className="hidden md:flex"> | </p>
              <p className="hidden md:flex gap-2 items-center">
                Email
                <a href="mailto:travel@ticketsasa.com" className="hover:underline">
                   travel@ticketsasa.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}