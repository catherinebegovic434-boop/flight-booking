'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import PaymentMethodModal from '@/components/ui/payment-method-modal';
import { Plane, User, Mail, Phone, CreditCard, Calendar, MapPin, Luggage, Copy, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FlightBooking() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const flightId = searchParams.get('flightId') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const travelers = parseInt(searchParams.get('travelers') || '1');
  const cabinClass = searchParams.get('cabinClass') || 'Economy';
  const price = parseInt(searchParams.get('price') || '0');
  const airline = searchParams.get('airline') || '';
  const flightNumber = searchParams.get('flightNumber') || '';
  
  const [step, setStep] = useState(1);
  const [extraBaggage, setExtraBaggage] = useState(0);
  const [baggageRules, setBaggageRules] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'mpesa' | 'crypto' | null>(null);
  
  const [bookingReference, setBookingReference] = useState('');
  const [showBookingConfirmationModal, setShowBookingConfirmationModal] = useState(false);
  
  const [mpesaStep, setMpesaStep] = useState<'details' | 'validate'>('details');
  const [mpesaTransactionCode, setMpesaTransactionCode] = useState('');
  const [mpesaValidating, setMpesaValidating] = useState(false);
  const [mpesaValidated, setMpesaValidated] = useState(false);

  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardConfirmed, setCardConfirmed] = useState(false);

  const [cryptoStep, setCryptoStep] = useState<'select' | 'payment'>('select');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [cryptoValidating, setCryptoValidating] = useState(false);
  const [cryptoValidated, setCryptoValidated] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [refCopied, setRefCopied] = useState(false);
  const [paymentVerifiedByAdmin, setPaymentVerifiedByAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [passengerDetails, setPassengerDetails] = useState(
    Array.from({ length: travelers }, (_, i) => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      passportNumber: '',
    }))
  );
  
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    country: 'Kenya',
  });

  const [mpesaDetails, setMpesaDetails] = useState({
    phoneNumber: '',
    accountName: '',
  });

  const [cryptoDetails, setCryptoDetails] = useState({
    walletAddress: '',
    cryptocurrency: 'BTC',
  });

  const cryptoRates: { [key: string]: number } = {
    BTC: 0.000010,
    ETH: 0.00028,
    USDT: 1.0,
    USDC: 1.0,
  };

  useEffect(() => {
    const fetchBaggageRules = async () => {
      const { data } = await supabase
        .from('baggage_rules')
        .select('*')
        .eq('cabin_class', cabinClass)
        .single();
      
      if (data) setBaggageRules(data);
    };
    
    fetchBaggageRules();
  }, [cabinClass]);

  const extraBaggageCost = baggageRules ? extraBaggage * baggageRules.extra_baggage_price_per_kg : 0;
  const totalWithBaggage = Math.round((price + extraBaggageCost) * 1.15);

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengerDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerDetails(updated);
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentDetails({ ...paymentDetails, [field]: value });
  };

  const handleContinueToPayment = async () => {
    const allFieldsFilled = passengerDetails.every(
      (p) => p.firstName && p.lastName && p.email && p.phone
    );
    
    if (!allFieldsFilled) {
      alert('Please fill in all required passenger details');
      return;
    }

    const bookingRef = 'TS' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBookingReference(bookingRef);

    const { error } = await supabase.from('bookings').insert({
      booking_reference: bookingRef,
      flight_id: flightId,
      airline,
      flight_number: flightNumber,
      from_airport: from,
      to_airport: to,
      departure_date: departureDate,
      cabin_class: cabinClass,
      travelers,
      total_price: totalWithBaggage,
      currency: 'KES',
      status: 'pending',
      passenger_details: passengerDetails,
      payment_details: { 
        method: null,
        amount_kes: totalWithBaggage,
        verified_by_admin: false,
        payment_status: 'awaiting_payment'
      }
    });
    
    if (!error) {
      setShowBookingConfirmationModal(true);
    } else {
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleProceedToPayment = () => {
    setShowBookingConfirmationModal(false);
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method: 'card' | 'mpesa' | 'crypto') => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMpesaValidate = () => {
    if (mpesaDetails.phoneNumber && mpesaDetails.accountName) {
      setMpesaStep('validate');
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: 'https://www.safaricom.co.ke/personal/m-pesa' } }, "*");
    } else {
      alert('Please fill in phone number and account name');
    }
  };

  const handleMpesaVerifyCode = async () => {
    if (!mpesaTransactionCode) {
      alert('Please enter transaction code');
      return;
    }
    
    setMpesaValidating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMpesaValidating(false);
    setMpesaValidated(true);
    
    await supabase
      .from('bookings')
      .update({
        payment_details: { 
          method: 'mpesa',
          amount_kes: totalWithBaggage,
          verified_by_admin: false,
          payment_status: 'awaiting_verification',
          phoneNumber: mpesaDetails.phoneNumber,
          accountName: mpesaDetails.accountName,
          transactionCode: mpesaTransactionCode 
        }
      })
      .eq('booking_reference', bookingReference);
      
    checkAdminVerification();
  };

  const handleCardPayment = async () => {
    const cardFieldsFilled = 
      paymentDetails.cardNumber && 
      paymentDetails.cardName && 
      paymentDetails.expiryDate && 
      paymentDetails.cvv &&
      paymentDetails.billingAddress;
    
    if (!cardFieldsFilled) {
      alert('Please fill in all card details');
      return;
    }

    setCardProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCardProcessing(false);
    setCardConfirmed(true);
    
    await supabase
      .from('bookings')
      .update({
        payment_details: { 
          method: 'card',
          amount_kes: totalWithBaggage,
          verified_by_admin: false,
          payment_status: 'awaiting_verification',
          cardNumber: '****' + paymentDetails.cardNumber.slice(-4),
          cardName: paymentDetails.cardName
        }
      })
      .eq('booking_reference', bookingReference);
      
    checkAdminVerification();
  };

  const handleCryptoSelect = () => {
    if (!cryptoDetails.cryptocurrency) {
      alert('Please select a cryptocurrency');
      return;
    }

    const totalUSD = totalWithBaggage / 130;
    const amount = (totalUSD * cryptoRates[cryptoDetails.cryptocurrency]).toFixed(8);
    setCryptoAmount(amount);

    const addresses: { [key: string]: string } = {
      BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      USDT: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
      USDC: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    };

    setPaymentAddress(addresses[cryptoDetails.cryptocurrency]);
    setCryptoStep('payment');
  };

  const handleCryptoVerify = async () => {
    if (!cryptoDetails.walletAddress && !transactionHash) {
      alert('Please enter either your wallet address or transaction hash');
      return;
    }

    setCryptoValidating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCryptoValidating(false);
    setCryptoValidated(true);
    
    await supabase
      .from('bookings')
      .update({
        payment_details: { 
          method: 'crypto',
          amount_kes: totalWithBaggage,
          verified_by_admin: false,
          payment_status: 'awaiting_verification',
          cryptocurrency: cryptoDetails.cryptocurrency,
          walletAddress: cryptoDetails.walletAddress || 'N/A',
          transactionHash: transactionHash || 'N/A',
          paymentAddress,
          cryptoAmount: cryptoAmount + ' ' + cryptoDetails.cryptocurrency
        }
      })
      .eq('booking_reference', bookingReference);
      
    checkAdminVerification();
  };

  const checkAdminVerification = async () => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('bookings')
        .select('payment_details')
        .eq('booking_reference', bookingReference)
        .single();
      
      if (data?.payment_details?.verified_by_admin === true) {
        setPaymentVerifiedByAdmin(true);
        clearInterval(interval);
      }
    }, 1500);
    
    setTimeout(() => clearInterval(interval), 1800000);
  };

  const handleRefreshVerification = async () => {
    if (!bookingReference) {
      alert('No booking reference found');
      return;
    }

    setRefreshing(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('status')
      .eq('booking_reference', bookingReference)
      .single();
    
    setRefreshing(false);

    if (error) {
      alert('Failed to check booking status. Please try again.');
      return;
    }
    
    if (data?.status === 'confirmed') {
      router.push(`/booking-ticket?ref=${bookingReference}`);
    } else if (data?.status === 'cancelled') {
      alert('Your booking has been cancelled by admin. Please contact support for more information.');
    } else {
      alert('Booking is still pending. Please wait for admin to verify and confirm your payment.');
    }
  };

  const copyToClipboard = (text: string, type: 'address' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } else {
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    }
  };

  const handleCompleteBooking = async () => {
    if (!paymentVerifiedByAdmin) {
      alert('Please wait for admin to verify your payment before completing booking');
      return;
    }

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed'
      })
      .eq('booking_reference', bookingReference);
    
    if (!error) {
      alert(`Booking confirmed! Your booking reference is ${bookingReference}. You will receive a confirmation email shortly.`);
      router.push('/my-bookings');
    } else {
      alert('Failed to complete booking. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />
      
      <PaymentMethodModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
      />

      {showBookingConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowBookingConfirmationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="size-6" />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">Booking Created!</h2>
              <p className="text-gray-600">Your booking reference has been generated</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">Important: Save Your Booking Reference</p>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Use this reference to continue your payment or track your booking
              </p>
              <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
                  <p className="text-xl font-bold text-[#cc2127] font-mono">{bookingReference}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(bookingReference, 'ref')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {refCopied ? <CheckCircle2 className="size-6 text-green-600" /> : <Copy className="size-6 text-gray-600" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleProceedToPayment}
                className="w-full px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => router.push('/my-bookings')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Continue Later
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can use your booking reference to continue payment anytime
            </p>
          </div>
        </div>
      )}
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0090da]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#0090da] text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="font-semibold">Passenger Details</span>
            </div>
            
            <div className="w-16 h-px bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0090da]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#0090da] text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-black mb-6">Passenger Details</h2>
                  
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="mb-8 pb-8 border-b last:border-b-0">
                      <h3 className="text-lg font-semibold text-black mb-4">
                        Passenger {index + 1}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                            placeholder="John"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                            placeholder="Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                            placeholder="john.doe@example.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                            placeholder="+254 700 000000"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                            placeholder="A12345678"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <Link
                    href={`/flights/search?from=${from}&to=${to}&departureDate=${departureDate}&travelers=${travelers}&cabinClass=${cabinClass}`}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back to Flights
                  </Link>
                  <button
                    onClick={handleContinueToPayment}
                    className="px-6 py-3 bg-[#cc2127] text-white rounded-md hover:bg-[#cc2127]/90 transition-colors font-bold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-black mb-6">Payment Details</h2>
                    
                    {selectedPaymentMethod === 'card' && (
                      <div className="space-y-4">
                        {cardProcessing && (
                          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <Loader2 className="size-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-lg font-semibold text-blue-900">Processing Payment...</p>
                            <p className="text-sm text-blue-700 mt-2">Please wait while we confirm your payment</p>
                          </div>
                        )}

                        {cardConfirmed && (
                          <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-green-900">Payment Submitted!</p>
                            <p className="text-sm text-green-700 mt-2">Awaiting admin verification</p>
                          </div>
                        )}

                        {!cardProcessing && !cardConfirmed && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number *
                              </label>
                              <input
                                type="text"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cardholder Name *
                              </label>
                              <input
                                type="text"
                                value={paymentDetails.cardName}
                                onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                placeholder="John Doe"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Expiry Date *
                                </label>
                                <input
                                  type="text"
                                  value={paymentDetails.expiryDate}
                                  onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CVV *
                                </label>
                                <input
                                  type="text"
                                  value={paymentDetails.cvv}
                                  onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                  placeholder="123"
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Billing Address *
                              </label>
                              <input
                                type="text"
                                value={paymentDetails.billingAddress}
                                onChange={(e) => handlePaymentChange('billingAddress', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                placeholder="123 Main Street"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  City *
                                </label>
                                <input
                                  type="text"
                                  value={paymentDetails.city}
                                  onChange={(e) => handlePaymentChange('city', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                  placeholder="Nairobi"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Country *
                                </label>
                                <input
                                  type="text"
                                  value={paymentDetails.country}
                                  onChange={(e) => handlePaymentChange('country', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0090da] focus:border-transparent"
                                  placeholder="Kenya"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleCardPayment}
                              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold"
                            >
                              Process Payment
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {selectedPaymentMethod === 'mpesa' && (
                      <div className="space-y-4">
                        {mpesaStep === 'details' ? (
                          <>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                              <p className="text-sm text-green-800 font-medium">
                                📱 M-Pesa Payment Instructions:
                              </p>
                              <ol className="text-sm text-green-700 mt-2 ml-4 list-decimal space-y-1">
                                <li>Enter your M-Pesa registered phone number</li>
                                <li>Click Validate to open payment gateway</li>
                                <li>Complete payment on M-Pesa</li>
                                <li>Enter transaction code to verify</li>
                              </ol>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                M-Pesa Phone Number *
                              </label>
                              <input
                                type="tel"
                                value={mpesaDetails.phoneNumber}
                                onChange={(e) => setMpesaDetails({ ...mpesaDetails, phoneNumber: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="+254 700 000000"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Name *
                              </label>
                              <input
                                type="text"
                                value={mpesaDetails.accountName}
                                onChange={(e) => setMpesaDetails({ ...mpesaDetails, accountName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="John Doe"
                              />
                            </div>

                            <button
                              onClick={handleMpesaValidate}
                              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold"
                            >
                              Validate & Open Payment Gateway
                            </button>
                          </>
                        ) : (
                          <>
                            {mpesaValidating && (
                              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                                <Loader2 className="size-12 text-green-600 animate-spin mx-auto mb-4" />
                                <p className="text-lg font-semibold text-green-900">Validating Transaction...</p>
                                <p className="text-sm text-green-700 mt-2">Please wait</p>
                              </div>
                            )}

                            {mpesaValidated && (
                              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                                <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-green-900">Payment Submitted!</p>
                                <p className="text-sm text-green-700 mt-2">Awaiting admin verification</p>
                              </div>
                            )}

                            {!mpesaValidating && !mpesaValidated && (
                              <>
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-sm text-yellow-800 font-medium">
                                    💳 Payment gateway opened in new tab. After completing payment, enter transaction code below:
                                  </p>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    M-Pesa Transaction Code *
                                  </label>
                                  <input
                                    type="text"
                                    value={mpesaTransactionCode}
                                    onChange={(e) => setMpesaTransactionCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                                    placeholder="SH12345678"
                                  />
                                </div>

                                <button
                                  onClick={handleMpesaVerifyCode}
                                  className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold"
                                >
                                  Verify Transaction
                                </button>

                                <button
                                  onClick={() => setMpesaStep('details')}
                                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                >
                                  Back to Details
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {selectedPaymentMethod === 'crypto' && (
                      <div className="space-y-4">
                        {cryptoStep === 'select' ? (
                          <>
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                              <p className="text-sm text-orange-800 font-medium">
                                ₿ Cryptocurrency Payment Instructions:
                              </p>
                              <ul className="text-sm text-orange-700 mt-2 ml-4 list-disc space-y-1">
                                <li>Select your preferred cryptocurrency</li>
                                <li>We'll show you payment address and amount</li>
                                <li>Send exact amount to our address</li>
                                <li>Enter transaction hash to verify</li>
                              </ul>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cryptocurrency *
                              </label>
                              <select
                                value={cryptoDetails.cryptocurrency}
                                onChange={(e) => setCryptoDetails({ ...cryptoDetails, cryptocurrency: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              >
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="USDT">Tether (USDT)</option>
                                <option value="USDC">USD Coin (USDC)</option>
                              </select>
                            </div>

                            <button
                              onClick={handleCryptoSelect}
                              className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-bold"
                            >
                              Continue
                            </button>
                          </>
                        ) : (
                          <>
                            {cryptoValidating && (
                              <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg text-center">
                                <Loader2 className="size-12 text-orange-600 animate-spin mx-auto mb-4" />
                                <p className="text-lg font-semibold text-orange-900">Validating Transaction...</p>
                                <p className="text-sm text-orange-700 mt-2">This may take a few minutes</p>
                              </div>
                            )}

                            {cryptoValidated && (
                              <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                                <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-green-900">Payment Submitted!</p>
                                <p className="text-sm text-green-700 mt-2">Awaiting admin verification</p>
                              </div>
                            )}

                            {!cryptoValidating && !cryptoValidated && (
                              <>
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                  <p className="text-sm text-orange-800 font-medium mb-3">
                                    📤 Send Payment To:
                                  </p>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-orange-700 mb-1">Amount:</p>
                                      <div className="flex items-center gap-2 bg-white p-2 rounded">
                                        <span className="font-mono text-sm font-bold text-orange-900">{cryptoAmount} {cryptoDetails.cryptocurrency}</span>
                                      </div>
                                      <p className="text-xs text-orange-600 mt-1">≈ KES {totalWithBaggage.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-orange-700 mb-1">Payment Address:</p>
                                      <div className="flex items-center gap-2 bg-white p-2 rounded">
                                        <span className="font-mono text-xs text-orange-900 flex-1 truncate">{paymentAddress}</span>
                                        <button
                                          onClick={() => copyToClipboard(paymentAddress, 'address')}
                                          className="p-1 hover:bg-orange-100 rounded transition-colors"
                                        >
                                          {addressCopied ? <CheckCircle2 className="size-4 text-green-600" /> : <Copy className="size-4 text-orange-600" />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Wallet Address (Optional if providing transaction hash)
                                  </label>
                                  <input
                                    type="text"
                                    value={cryptoDetails.walletAddress}
                                    onChange={(e) => setCryptoDetails({ ...cryptoDetails, walletAddress: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                                    placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction Hash (Optional if providing wallet address)
                                  </label>
                                  <input
                                    type="text"
                                    value={transactionHash}
                                    onChange={(e) => setTransactionHash(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                                    placeholder="0xabc123..."
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Provide either wallet address or transaction hash for verification
                                  </p>
                                </div>

                                <button
                                  onClick={handleCryptoVerify}
                                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-bold"
                                >
                                  Verify Transaction
                                </button>

                                <button
                                  onClick={() => setCryptoStep('select')}
                                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                >
                                  Back to Crypto Selection
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Back to Details
                    </button>
                    <div className="flex flex-col items-end gap-3">
                      {((selectedPaymentMethod === 'card' && cardConfirmed) ||
                        (selectedPaymentMethod === 'mpesa' && mpesaValidated) ||
                        (selectedPaymentMethod === 'crypto' && cryptoValidated)) && (
                        <>
                          {paymentVerifiedByAdmin ? (
                            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="size-5" />
                                <span className="font-semibold">Payment Verified by Admin!</span>
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Loader2 className="size-5 text-amber-600 animate-spin" />
                                <span className="text-sm text-amber-700 font-medium">Awaiting admin verification...</span>
                                <button
                                  onClick={handleRefreshVerification}
                                  disabled={refreshing}
                                  className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {refreshing ? 'Checking...' : 'Refresh'}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      <button
                        onClick={handleCompleteBooking}
                        disabled={!paymentVerifiedByAdmin}
                        className={`px-6 py-3 rounded-md transition-colors font-bold ${
                          paymentVerifiedByAdmin
                            ? 'bg-[#cc2127] text-white hover:bg-[#cc2127]/90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {paymentVerifiedByAdmin ? 'Complete Booking' : 'Pending Verification'}
                      </button>
                    </div>
                  </div>
                </>
              )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-bold text-black mb-4">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Plane className="size-5 text-[#0090da] mt-1" />
                  <div>
                    <p className="font-semibold text-black">{airline}</p>
                    <p className="text-sm text-gray-600">{flightNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-[#0090da] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-semibold text-black">{from}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-[#0090da] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">To</p>
                    <p className="font-semibold text-black">{to}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="size-5 text-[#0090da] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-semibold text-black">
                      {new Date(departureDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="size-5 text-[#0090da] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Travelers</p>
                    <p className="font-semibold text-black">{travelers} • {cabinClass}</p>
                  </div>
                </div>

                {baggageRules && (
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Luggage className="size-5 text-[#0090da] mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-black mb-2">Baggage Allowance</p>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">✓ Checked: {baggageRules.checked_baggage_kg} kg</p>
                          <p className="text-gray-600">✓ Carry-on: {baggageRules.carry_on_baggage_kg} kg</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Baggage (kg)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExtraBaggage(Math.max(0, extraBaggage - 5))}
                          className="w-10 h-10 rounded border-2 border-gray-300 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-semibold text-black">{extraBaggage} kg</span>
                        <button
                          onClick={() => setExtraBaggage(Math.min(50, extraBaggage + 5))}
                          className="w-10 h-10 rounded border-2 border-gray-300 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        KES {baggageRules.extra_baggage_price_per_kg.toLocaleString()}/kg
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-semibold text-black">KES {price.toLocaleString()}</span>
                </div>
                {extraBaggage > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Extra Baggage ({extraBaggage} kg)</span>
                    <span className="font-semibold text-black">KES {extraBaggageCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold text-black">KES {Math.round((price + extraBaggageCost) * 0.15).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-black">Total</span>
                    <span className="text-2xl font-bold text-[#cc2127]">
                      KES {totalWithBaggage.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}