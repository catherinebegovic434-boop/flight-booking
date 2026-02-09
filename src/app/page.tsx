import NavigationHeader from "@/components/sections/navigation-header";
import FlightSearchHero from "@/components/sections/flight-search-hero";
import PopularDestinations from "@/components/sections/popular-destinations";
import WhyBookWithTicketShwari from "@/components/sections/why-book-with-ticketsasa";
import PopularAirlinesSection from "@/components/sections/popular-airlines";
import FAQSection from "@/components/sections/faq-section";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <NavigationHeader />
      <main className="flex-1">
        <FlightSearchHero />
        <PopularDestinations />
        <WhyBookWithTicketShwari />
        <PopularAirlinesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}