export default function PopularAirlinesSection() {
  const airlines = [
    {
      name: "Kenya Airways",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_6.png",
      alt: "Kenya Airways Logo",
    },
    {
      name: "Jambojet",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_7.png",
      alt: "Jambojet Logo",
    },
    {
      name: "Ethiopian Airlines",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ethiopian_Airlines_Logo.svg/320px-Ethiopian_Airlines_Logo.svg.png",
      alt: "Ethiopian Airlines Logo",
    },
    {
      name: "KLM",
      src: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a0e37568-c1cb-4731-8db5-79e671e9ead8-ticketsasa-com/assets/images/images_8.png",
      alt: "KLM Logo",
    },
    {
      name: "RwandAir",
      src: "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/RwandAir_logo.svg/320px-RwandAir_logo.svg.png",
      alt: "RwandAir Logo",
    },
    {
      name: "Emirates",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/320px-Emirates_logo.svg.png",
      alt: "Emirates Logo",
    },
    {
      name: "Turkish Airlines",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Turkish_Airlines_logo_2019_compact.svg/320px-Turkish_Airlines_logo_2019_compact.svg.png",
      alt: "Turkish Airlines Logo",
    },
    {
      name: "Qatar Airways",
      src: "https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Qatar_Airways_Logo.svg/320px-Qatar_Airways_Logo.svg.png",
      alt: "Qatar Airways Logo",
    },
    {
      name: "South African Airways",
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/South_African_Airways_Logo.svg/320px-South_African_Airways_Logo.svg.png",
      alt: "South African Airways Logo",
    },
  ];

  return (
    <section className="bg-background py-6 md:py-12 w-full">
      <div className="mx-auto w-full max-w-[1440px] px-[20px] xl:px-[100px]">
        <h2 className="mb-6 md:mb-10 text-[28px] font-black leading-[1.2] text-foreground">
          Fly with Popular Airlines
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {airlines.map((airline, index) => (
            <div
              key={index}
              className="flex h-32 w-full items-center justify-center overflow-hidden rounded-[5px] border border-[#d9d9d9] bg-white p-6 relative"
            >
              {airline.src ? (
                <div className="relative h-full w-full">
                  <img
                    src={airline.src}
                    alt={airline.alt}
                    className="h-full w-full object-contain object-center"
                    loading="lazy"
                  />
                </div>
              ) : (
                // Placeholder empty box preserving layout
                <div className="h-full w-full" aria-hidden="true" />
              )}
            </div>
          ))}
          
          {/* Add extra placeholder boxes to complete a balanced grid look if necessary based on design instructions */}
           {/* Based on screenshot showing at least 6 items in first row, ensuring we have enough boxes to form a grid */}
        </div>
      </div>
    </section>
  );
}