'use client';

import { useState } from 'react';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { Search, Plane, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function FlightStatus() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await fetch(
        `/api/flight-status?flightNumber=${encodeURIComponent(flightNumber)}&date=${encodeURIComponent(date)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to fetch flight status');
        setLoading(false);
        return;
      }

      setStatus(result.data);
    } catch (err) {
      setError('Failed to fetch flight status. Please try again.');
      console.error('Flight status error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-black mb-2">Flight Status</h1>
        <p className="text-gray-600 mb-8">Check real-time status of your flight</p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flight Number *
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g., KQ100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-3 bg-[#cc2127] text-white font-bold rounded-lg hover:bg-[#cc2127]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="size-5" />
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {status && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-600">Flight Number</p>
                <p className="text-3xl font-bold text-black">{status.flightNumber}</p>
                <p className="text-gray-600">{status.airline}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                status.statusType === 'success' ? 'bg-green-100 text-green-700' :
                status.statusType === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <CheckCircle className="size-4 inline mr-1" />
                {status.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border-l-4 border-[#cc2127] pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="size-5 text-[#cc2127]" />
                  <p className="font-bold text-black">Departure</p>
                </div>
                <p className="text-lg font-semibold text-black">{status.from}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-600">Scheduled: <span className="font-medium text-black">{status.departure.scheduled}</span></p>
                  <p className="text-gray-600">Actual: <span className="font-medium text-black">{status.departure.actual}</span></p>
                  <p className="text-gray-600">Terminal: <span className="font-medium text-black">{status.departure.terminal}</span></p>
                  <p className="text-gray-600">Gate: <span className="font-medium text-black">{status.departure.gate}</span></p>
                </div>
              </div>

              <div className="border-l-4 border-[#0090da] pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="size-5 text-[#0090da]" />
                  <p className="font-bold text-black">Arrival</p>
                </div>
                <p className="text-lg font-semibold text-black">{status.to}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-600">Scheduled: <span className="font-medium text-black">{status.arrival.scheduled}</span></p>
                  <p className="text-gray-600">Estimated: <span className="font-medium text-black">{status.arrival.estimated}</span></p>
                  <p className="text-gray-600">Terminal: <span className="font-medium text-black">{status.arrival.terminal}</span></p>
                  <p className="text-gray-600">Gate: <span className="font-medium text-black">{status.arrival.gate}</span></p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <Clock className="size-4 inline mr-1" />
                Flight information is updated every few minutes. For the most accurate information, please check with your airline directly.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}