'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "How do I book a flight on TicketShwari?",
    answer: "Booking a flight on TicketShwari is simple. Enter your origin, destination, travel dates, and number of passengers in the search form. Click 'Find Your Flight' to see available options. Select your preferred flight, enter passenger details, and proceed to payment to confirm your booking."
  },
  {
    question: "What payment methods are available for flight bookings?",
    answer: "We accept various payment methods including M-Pesa, Visa, Mastercard, and American Express. You can choose your preferred payment option securely during the checkout process."
  },
  {
    question: "Can I modify or cancel my flight booking?",
    answer: "Yes, you can modify or cancel your booking depending on the airline's fare rules and policy. Some tickets are refundable with a fee, while others may be non-refundable. Please contact our support team for assistance with modifications."
  },
  {
    question: "Are there any discounts on flight bookings?",
    answer: "We regularly offer competitive fares and seasonal discounts. Subscribe to our newsletter or check our website frequently to stay updated on the latest flight deals and special offers."
  },
  {
    question: "Can I book flights for multiple passengers?",
    answer: "Yes, you can book flights for up to 9 passengers in a single transaction. For larger groups, please contact our customer support team for assistance with group bookings."
  },
  {
    question: "Can I book both one-way and round-trip flights?",
    answer: "Absolutely. You can select either 'Round Trip' or 'One Way' at the top of the search form before entering your travel details."
  },
  {
    question: "How do I receive my flight ticket after booking?",
    answer: "Once your payment is confirmed, your e-ticket will be sent instantly to the email address you provided during booking. You can print it out or show it on your mobile device at the airport."
  },
  {
    question: "Do I need to create an account to book a flight?",
    answer: "No, you can book a flight as a guest. However, creating an account allows you to manage your bookings more easily, view your history, and save your details for faster future bookings."
  },
  {
    question: "How early should I book my flight?",
    answer: "We recommend booking as early as possible to secure the best fares and availability. Flight prices often increase as the departure date approaches."
  },
  {
    question: "What should I do if I don't receive my flight confirmation email?",
    answer: "If you haven't received your confirmation email within a few minutes of booking, please check your spam or junk folder. If it's not there, kindly contact our customer support at travel@ticketshwari.com or call +254-709-816-000 for immediate assistance."
  }
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type AccordionItemProps = {
  item: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
};

const AccordionItem = ({ item, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left transition-all hover:text-muted-foreground"
      >
        <span className="text-[16px] font-normal text-foreground">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleToggle = (question: string) => {
    setOpenItems((prev) =>
      prev.includes(question)
        ? prev.filter((item) => item !== question)
        : [...prev, question]
    );
  };

  const leftColumnItems = faqData.slice(0, 5);
  const rightColumnItems = faqData.slice(5, 10);

  return (
    <section className="w-full bg-background py-6 md:py-12 px-[20px] xl:px-[100px]">
      <div className="mx-auto w-full max-w-[1440px]">
        <h2 className="mb-8 text-[28px] font-black leading-[1.2] text-foreground">
          Frequently asked questions
        </h2>
        
        <div className="grid grid-cols-1 gap-x-12 gap-y-0 md:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col">
            {leftColumnItems.map((item, index) => (
              <AccordionItem
                key={index}
                item={item}
                isOpen={openItems.includes(item.question)}
                onToggle={() => handleToggle(item.question)}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            {rightColumnItems.map((item, index) => (
              <AccordionItem
                key={index + 5}
                item={item}
                isOpen={openItems.includes(item.question)}
                onToggle={() => handleToggle(item.question)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}