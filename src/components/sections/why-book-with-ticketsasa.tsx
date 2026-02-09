export default function WhyBookWithTicketShwari() {
  const leftBenefits = [
    {
      title: "Competitive Fares",
      description:
        "Enjoy exclusive flight deals and seasonal discounts tailored for local and international travellers.",
    },
    {
      title: "Flexible Payment Options",
      description:
        "Choose how you pay, with full flexibility and secure transactions.",
    },
    {
      title: "Wide Airline Coverage",
      description:
        "Access flights from top international carriers and regional airlines like Kenya Airways, RwandAir, and South African Airways.",
    },
  ];

  const rightBenefits = [
    {
      title: "Instant Booking Confirmation",
      description:
        "Get instant booking confirmation and e-tickets delivered directly to your email.",
    },
    {
      title: "24/7 Customer Support",
      description:
        "Our dedicated support team is always ready to assist you with any booking queries or travel concerns.",
    },
  ];

  return (
    <section className="bg-[#f5f5f5] py-6 md:py-12 w-full">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-5 sm:px-12 xl:px-[100px] lg:flex-row lg:gap-20">
        {/* Left Content */}
        <div className="flex flex-col gap-5 lg:w-[40%] shrink-0">
          <h2 className="text-[28px] font-black leading-[1.2] text-foreground">
            Why book your flights with TicketShwari?
          </h2>
          <p className="text-[16px] leading-[1.6] text-[#666666]">
            As one of East Africa's most trusted online flight booking platforms,
            TicketShwari brings together the best of global and regional airlines
            on one easy-to-navigate website. No more long queues, confusing
            booking policies, or unexpected charges—we simplify the booking
            process, allowing you to compare prices, secure the best deals, and
            confirm your ticket, all from the comfort of your phone or laptop.
          </p>
        </div>

        {/* Right Content - Benefits Grid */}
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
          {/* Column 1 */}
          <div className="flex flex-col gap-8">
            {leftBenefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#0090da]" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-bold leading-tight text-foreground">
                    {benefit.title}:
                  </h3>
                  <p className="text-[16px] leading-[1.6] text-[#666666]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-8">
            {rightBenefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#0090da]" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-bold leading-tight text-foreground">
                    {benefit.title}:
                  </h3>
                  <p className="text-[16px] leading-[1.6] text-[#666666]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}