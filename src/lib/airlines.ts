export interface Airline {
  code: string;
  name: string;
  logo?: string;
  operatesInKenya?: boolean;
  operatesInternational?: boolean;
}

export const airlines: Airline[] = [
  // Kenyan Airlines (Domestic & Regional)
  { code: "KQ", name: "Kenya Airways", operatesInKenya: true, operatesInternational: true },
  { code: "JM", name: "Jambojet", operatesInKenya: true, operatesInternational: false },
  { code: "P2", name: "Fly540", operatesInKenya: true, operatesInternational: false },
  { code: "Z8", name: "Safarilink Aviation", operatesInKenya: true, operatesInternational: false },
  { code: "5Z", name: "Silverstone Air Services", operatesInKenya: true, operatesInternational: false },
  { code: "P5", name: "African Express Airways", operatesInKenya: true, operatesInternational: false },
  
  // East African Regional Airlines
  { code: "RW", name: "RwandAir", operatesInKenya: false, operatesInternational: true },
  { code: "PW", name: "Precision Air", operatesInKenya: false, operatesInternational: true },
  { code: "QU", name: "East African Safari Air", operatesInKenya: false, operatesInternational: true },
  { code: "8U", name: "Fastjet", operatesInKenya: false, operatesInternational: true },
  { code: "ET", name: "Ethiopian Airlines", operatesInKenya: false, operatesInternational: true },
  
  // Other African Airlines (International routes to/from Kenya)
  { code: "SA", name: "South African Airways", operatesInKenya: false, operatesInternational: true },
  { code: "MS", name: "EgyptAir", operatesInKenya: false, operatesInternational: true },
  { code: "AT", name: "Royal Air Maroc", operatesInKenya: false, operatesInternational: true },
  
  // Major International Airlines (International routes only)
  { code: "EK", name: "Emirates", operatesInKenya: false, operatesInternational: true },
  { code: "QR", name: "Qatar Airways", operatesInKenya: false, operatesInternational: true },
  { code: "TK", name: "Turkish Airlines", operatesInKenya: false, operatesInternational: true },
  { code: "BA", name: "British Airways", operatesInKenya: false, operatesInternational: true },
  { code: "AF", name: "Air France", operatesInKenya: false, operatesInternational: true },
  { code: "LH", name: "Lufthansa", operatesInKenya: false, operatesInternational: true },
  { code: "EY", name: "Etihad Airways", operatesInKenya: false, operatesInternational: true },
  { code: "KL", name: "KLM Royal Dutch Airlines", operatesInKenya: false, operatesInternational: true },
  { code: "SN", name: "Brussels Airlines", operatesInKenya: false, operatesInternational: true },
  { code: "LX", name: "Swiss International Air Lines", operatesInKenya: false, operatesInternational: true },
];

export interface FlightOption {
  id: string;
  airline: Airline;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabinClass: string;
  seatsAvailable: number;
}

const routeDistances: { [key: string]: { [key: string]: number } } = {
  'NBO': { 'MBA': 450, 'KIS': 350, 'LAU': 500, 'MYD': 520, 'UKA': 280, 'WIL': 15, 'NYK': 580, 'LOK': 650, 'EYS': 300,
           'JRO': 280, 'DAR': 650, 'EBB': 550, 'KGL': 750, 'ADD': 1150, 'JNB': 3050, 'CPT': 3800, 'CAI': 3500,
           'DXB': 3300, 'DOH': 3600, 'AUH': 3450, 'IST': 4800, 'LHR': 6850, 'CDG': 6650, 'AMS': 6800, 'FRA': 6400,
           'BRU': 6700, 'ZRH': 6300, 'JFK': 11800, 'LAX': 14500, 'SIN': 7200, 'BKK': 6500, 'HKG': 8100, 'DEL': 4500,
           'BOM': 4000, 'CMB': 3700, 'MRU': 2900, 'GRU': 8500, 'SYD': 11500 },
  'MBA': { 'NBO': 450, 'KIS': 800, 'LAU': 100, 'MYD': 80, 'DAR': 250, 'ZNZ': 150, 'JRO': 320 },
  'KIS': { 'NBO': 350, 'MBA': 800, 'EBB': 450, 'KGL': 500 },
  'LHR': { 'NBO': 6850, 'JNB': 9000, 'CPT': 9600, 'CAI': 3500, 'DXB': 5500, 'JFK': 5500, 'LAX': 8800 },
  'DXB': { 'NBO': 3300, 'LHR': 5500, 'JFK': 11000, 'SIN': 5800, 'BKK': 4800, 'HKG': 5900 },
  'JNB': { 'NBO': 3050, 'CPT': 1250, 'LHR': 9000, 'DXB': 6300, 'JFK': 12800 },
  'ADD': { 'NBO': 1150, 'JNB': 4000, 'LHR': 5900, 'DXB': 2300, 'CAI': 2600 },
};

function getRouteDistance(from: string, to: string): number {
  if (routeDistances[from]?.[to]) return routeDistances[from][to];
  if (routeDistances[to]?.[from]) return routeDistances[to][from];
  
  const kenyanAirports = ['NBO', 'MBA', 'KIS', 'UKA', 'MYD', 'LAU', 'NYK', 'LOK', 'EYS', 'WIL'];
  const regionalAirports = ['JRO', 'DAR', 'ZNZ', 'EBB', 'KGL', 'ADD', 'JNB', 'CPT', 'CAI'];
  const middleEastAirports = ['DXB', 'DOH', 'AUH', 'JED', 'RUH'];
  const europeanAirports = ['LHR', 'CDG', 'AMS', 'FRA', 'BRU', 'ZRH', 'FCO', 'MAD', 'BCN', 'MUC', 'IST'];
  const americanAirports = ['JFK', 'LAX', 'ORD', 'MIA', 'ATL', 'DFW', 'SFO', 'YYZ', 'GRU', 'EZE'];
  const asianAirports = ['SIN', 'BKK', 'HKG', 'DEL', 'BOM', 'CMB', 'PEK', 'PVG', 'NRT', 'ICN', 'SYD', 'MEL'];
  
  if (kenyanAirports.includes(from) && kenyanAirports.includes(to)) return 400;
  if ((kenyanAirports.includes(from) && regionalAirports.includes(to)) || (regionalAirports.includes(from) && kenyanAirports.includes(to))) return 800;
  if ((kenyanAirports.includes(from) && middleEastAirports.includes(to)) || (middleEastAirports.includes(from) && kenyanAirports.includes(to))) return 3400;
  if ((kenyanAirports.includes(from) && europeanAirports.includes(to)) || (europeanAirports.includes(from) && kenyanAirports.includes(to))) return 6500;
  if ((kenyanAirports.includes(from) && americanAirports.includes(to)) || (americanAirports.includes(from) && kenyanAirports.includes(to))) return 12000;
  if ((kenyanAirports.includes(from) && asianAirports.includes(to)) || (asianAirports.includes(from) && kenyanAirports.includes(to))) return 6000;
  
  return 5000;
}

function calculateBasePrice(distance: number, cabinClass: string): number {
  const pricePerKm = cabinClass === "Economy" ? 18 : 
                     cabinClass === "Premium Economy" ? 32 :
                     cabinClass === "Business" ? 75 : 140;
  
  let price = distance * pricePerKm;
  
  if (distance < 500) {
    price = Math.max(price, 6500);
  } else if (distance < 1500) {
    price = Math.max(price, 15000);
  } else if (distance < 4000) {
    price = Math.max(price, 45000);
  } else if (distance < 7000) {
    price = Math.max(price, 75000);
  } else {
    price = Math.max(price, 120000);
  }
  
  return price;
}

export function generateFlightOptions(
  from: string,
  to: string,
  departureDate: string,
  returnDate: string | null,
  cabinClass: string,
  travelers: number,
  pricingLevel: number = 3
): FlightOption[] {
  const flights: FlightOption[] = [];
  
  const kenyanAirports = ['NBO', 'MBA', 'KIS', 'UKA', 'MYD', 'LAU', 'NYK', 'LOK', 'EYS', 'WIL'];
  const isDomestic = kenyanAirports.includes(from) && kenyanAirports.includes(to);
  
  const availableAirlines = isDomestic
    ? airlines.filter(a => a.operatesInKenya)
    : airlines.filter(a => a.operatesInternational);
  
  const selectedAirlines = availableAirlines.slice(0, Math.min(availableAirlines.length, 8 + Math.floor(Math.random() * 5)));
  
  const now = new Date();
  const selectedDate = new Date(departureDate);
  const isToday = selectedDate.toDateString() === now.toDateString();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const pricingMultiplier = 0.7 + (pricingLevel * 0.06);
  
  const routeDistance = getRouteDistance(from, to);
  
  selectedAirlines.forEach((airline, index) => {
    const basePrice = calculateBasePrice(routeDistance, cabinClass);
    
    const priceVariation = Math.floor(Math.random() * (basePrice * 0.15)) - (basePrice * 0.075);
    const adjustedPrice = (basePrice + priceVariation) * pricingMultiplier;
    const price = Math.max(adjustedPrice, isDomestic ? 6500 : 25000);
    
    const departureHour = 6 + Math.floor(Math.random() * 16);
    const departureMinute = Math.floor(Math.random() * 60);
    
    if (isToday && (departureHour < currentHour || (departureHour === currentHour && departureMinute <= currentMinute))) {
      return;
    }
    
    const flightDurationHours = isDomestic ? (1 + Math.random() * 1.5) : (3 + Math.random() * 6);
    const arrivalHour = departureHour + Math.floor(flightDurationHours);
    const arrivalMinute = departureMinute + Math.floor((flightDurationHours % 1) * 60);
    
    const stops = isDomestic ? 0 : (Math.random() > 0.6 ? 0 : 1);
    
    const departureDateTime = new Date(selectedDate);
    departureDateTime.setHours(departureHour, departureMinute);
    
    const hoursUntilDeparture = (departureDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let seatsAvailable: number;
    if (hoursUntilDeparture <= 2) {
      seatsAvailable = Math.floor(Math.random() * 2) + 1;
    } else if (hoursUntilDeparture <= 6) {
      seatsAvailable = Math.floor(Math.random() * 5) + 2;
    } else if (hoursUntilDeparture <= 24) {
      seatsAvailable = Math.floor(Math.random() * 10) + 5;
    } else {
      seatsAvailable = Math.floor(Math.random() * 20) + 10;
    }
    
    const actualArrivalHour = arrivalHour % 24;
    const actualArrivalMinute = arrivalMinute % 60;
    const arrivalDate = arrivalHour >= 24 ? 
      new Date(new Date(departureDate).setDate(new Date(departureDate).getDate() + 1)).toISOString().split('T')[0] 
      : departureDate;
    
    const durationHours = Math.floor(flightDurationHours);
    const durationMinutes = Math.floor((flightDurationHours % 1) * 60);
    
    flights.push({
      id: `${airline.code}-${index}-${Date.now()}`,
      airline,
      flightNumber: `${airline.code}${Math.floor(Math.random() * 9000) + 100}`,
      departure: {
        airport: from,
        time: `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`,
        date: departureDate,
      },
      arrival: {
        airport: to,
        time: `${actualArrivalHour.toString().padStart(2, '0')}:${actualArrivalMinute.toString().padStart(2, '0')}`,
        date: arrivalDate,
      },
      duration: `${durationHours}h ${durationMinutes}m`,
      stops,
      price: price * travelers,
      currency: "KES",
      cabinClass,
      seatsAvailable,
    });
  });
  
  return flights.sort((a, b) => a.price - b.price);
}