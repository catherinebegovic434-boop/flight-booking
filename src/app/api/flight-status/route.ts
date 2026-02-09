import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flightNumber = searchParams.get('flightNumber');
    const date = searchParams.get('date');

    if (!flightNumber || !date) {
      return NextResponse.json(
        { error: 'Flight number and date are required' },
        { status: 400 }
      );
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('flight_number', flightNumber)
      .eq('departure_date', date)
      .limit(1)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Flight not found. Please check your flight number and date.' },
        { status: 404 }
      );
    }

    const departureTime = generateConsistentTime(booking.flight_number, 'departure');
    const arrivalTime = generateConsistentTime(booking.flight_number, 'arrival');
    
    const statusInfo = getFlightStatus(booking.status);
    const terminal = getConsistentTerminal(booking.from_airport);
    const gate = getConsistentGate(booking.flight_number);

    return NextResponse.json({
      data: {
        flightNumber: booking.flight_number,
        airline: booking.airline,
        from: `${booking.from_airport} - ${getAirportName(booking.from_airport)}`,
        to: `${booking.to_airport} - ${getAirportName(booking.to_airport)}`,
        departure: {
          scheduled: departureTime,
          actual: departureTime,
          terminal: terminal,
          gate: gate,
        },
        arrival: {
          scheduled: arrivalTime,
          estimated: arrivalTime,
          terminal: getConsistentTerminal(booking.to_airport),
          gate: getConsistentGate(booking.flight_number + 'arr'),
        },
        status: statusInfo.status,
        statusType: statusInfo.type,
        date: booking.departure_date,
      },
    });
  } catch (error) {
    console.error('Flight status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateConsistentTime(seed: string, type: 'departure' | 'arrival'): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  const baseHour = type === 'departure' ? 6 : 8;
  const hourRange = type === 'departure' ? 14 : 14;
  const hour = baseHour + Math.abs(hash % hourRange);
  const minute = Math.abs((hash >> 4) % 12) * 5;
  
  const hour12 = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
}

function getConsistentTerminal(airportCode: string): string {
  const terminals: Record<string, string> = {
    'NBO': '1A',
    'MBA': '1',
    'WIL': '1',
    'KIS': '1',
    'MYD': '1',
    'LAU': '1',
    'NYK': '1',
  };
  return terminals[airportCode] || '1';
}

function getConsistentGate(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const letter = String.fromCharCode(65 + Math.abs(hash % 5));
  const number = (Math.abs(hash >> 3) % 20) + 1;
  return `${letter}${number}`;
}

function getFlightStatus(bookingStatus: string): { status: string; type: 'success' | 'warning' | 'error' } {
  switch (bookingStatus) {
    case 'confirmed':
      return { status: 'On Time', type: 'success' };
    case 'pending':
      return { status: 'Scheduled', type: 'warning' };
    case 'cancelled':
      return { status: 'Cancelled', type: 'error' };
    default:
      return { status: 'Scheduled', type: 'warning' };
  }
}

function getAirportName(code: string): string {
  const airports: Record<string, string> = {
    'NBO': 'Jomo Kenyatta International Airport',
    'MBA': 'Moi International Airport',
    'WIL': 'Wilson Airport',
    'KIS': 'Kisumu International Airport',
    'MYD': 'Malindi Airport',
    'LAU': 'Manda Airport',
    'NYK': 'Nanyuki Airport',
  };
  return airports[code] || `${code} Airport`;
}
