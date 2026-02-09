'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import PaymentMethodModal from '@/components/ui/payment-method-modal';
import { Plane, Calendar, MapPin, User, AlertCircle, CheckCircle2, Loader2, Copy, X, Search, Mail, Phone, Luggage, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ManageBooking() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refParam = searchParams.get('ref');
  
  const [searchType, setSearchType] = useState<'reference' | 'email'>('reference');
  const [bookingRef, setBookingRef] = useState(refParam || '');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'mpesa' | 'crypto' | null>(null);

  const [mpesaStep, setMpesaStep] = useState<'details' | 'validate'>('details');
  const [mpesaTransactionCode, setMpesaTransactionCode] = useState('');
  const [mpesaValidating, setMpesaValidating] = useState(false);
  const [mpesaValidated, setMpesaValidated] = useState(false);
  const [mpesaDetails, setMpesaDetails] = useState({ phoneNumber: '', accountName: '' });

  const [cardProcessing, setCardProcessing] = useState(false);
  const [cardConfirmed, setCardConfirmed] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '', cardName: '', expiryDate: '', cvv: '', billingAddress: '', city: '', country: 'Kenya',
  });

  const [cryptoStep, setCryptoStep] = useState<'select' | 'payment'>('select');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [cryptoValidating, setCryptoValidating] = useState(false);
  const [cryptoValidated, setCryptoValidated] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [cryptoDetails, setCryptoDetails] = useState({ walletAddress: '', cryptocurrency: 'BTC' });
  const [refreshing, setRefreshing] = useState(false);

  const cryptoRates: { [key: string]: number } = {
    BTC: 0.000010, ETH: 0.00028, USDT: 1.0, USDC: 1.0,
  };

  useEffect(() => {
    if (refParam) {
      setBookingRef(refParam);
      handleSearch();
    }
  }, [refParam]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    
    try {
      if (searchType === 'reference') {
        if (!bookingRef) return;
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('booking_reference', bookingRef.toUpperCase())
          .single();
        
        if (data) {
          setBooking(data);
        }
      } else {
        if (!email) return;
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        
        const filtered = (allBookings || []).filter((booking: any) => 
          booking.passenger_details?.some((p: any) => 
            p.email?.toLowerCase() === email.toLowerCase()
          )
        );
        
        if (filtered.length > 0) {
          setBooking(filtered[0]);
        }
      }
    } catch (error) {
      console.error(error);
    }
    
    setLoading(false);
  };

  const needsPayment = booking && 
    (!booking.payment_details?.method || 
     booking.payment_details?.payment_status === 'awaiting_payment' ||
     booking.payment_details?.payment_status === 'awaiting_verification');

  const handleSelectPaymentMethod = (method: 'card' | 'mpesa' | 'crypto') => {
    resetPaymentStates();
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
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
  };

  const handleCardPayment = async () => {
    const cardFieldsFilled = paymentDetails.cardNumber && paymentDetails.cardName && paymentDetails.expiryDate && paymentDetails.cvv && paymentDetails.billingAddress;
    
    if (!cardFieldsFilled) {
      alert('Please fill in all card details');
      return;
    }

    setCardProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setCardProcessing(false);
    setCardConfirmed(true);
  };

  const handleCryptoSelect = () => {
    if (!cryptoDetails.cryptocurrency) {
      alert('Please select a cryptocurrency');
      return;
    }

    const totalUSD = booking.total_price / 130;
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleCompletePayment = async () => {
    let canProceed = false;

    if (selectedPaymentMethod === 'card' && cardConfirmed) {
      canProceed = true;
    } else if (selectedPaymentMethod === 'mpesa' && mpesaValidated) {
      canProceed = true;
    } else if (selectedPaymentMethod === 'crypto' && cryptoValidated) {
      canProceed = true;
    }
    
    if (canProceed) {
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_details: { 
            method: selectedPaymentMethod,
            amount_kes: booking.total_price,
            verified_by_admin: false,
            payment_status: 'awaiting_verification',
            ...(selectedPaymentMethod === 'card' ? { 
              cardNumber: '****' + paymentDetails.cardNumber.slice(-4),
              cardName: paymentDetails.cardName
            } : {}),
            ...(selectedPaymentMethod === 'mpesa' ? { 
              phoneNumber: mpesaDetails.phoneNumber,
              accountName: mpesaDetails.accountName,
              transactionCode: mpesaTransactionCode 
            } : {}),
            ...(selectedPaymentMethod === 'crypto' ? { 
              cryptocurrency: cryptoDetails.cryptocurrency,
              walletAddress: cryptoDetails.walletAddress || 'N/A',
              transactionHash: transactionHash || 'N/A',
              paymentAddress,
              cryptoAmount: cryptoAmount + ' ' + cryptoDetails.cryptocurrency
            } : {})
          }
        })
        .eq('booking_reference', bookingRef.toUpperCase());
      
      if (!error) {
        alert(`Payment submitted! Your booking reference is ${bookingRef.toUpperCase()}. Your payment is pending admin verification.`);
        handleSearch();
        setSelectedPaymentMethod(null);
      } else {
        alert('Failed to update booking. Please try again.');
      }
    } else {
      alert('Please complete payment verification first');
    }
  };

  const handleCancelBooking = async () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (!error) {
        alert('Booking cancelled successfully');
        setBooking({ ...booking, status: 'cancelled' });
      }
    }
  };

  const isPaymentVerifiedByAdmin = booking?.payment_details?.verified_by_admin === true;

  const handleRefreshBooking = async () => {
    if (!booking) return;
    
    setRefreshing(true);
    
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_reference', booking.booking_reference)
        .single();
      
      if (data) {
        setBooking(data);
        
        if (data.payment_details?.verified_by_admin) {
          alert('Your payment has been verified by admin! Your booking is now confirmed.');
        }
      }
    } catch (error) {
      console.error(error);
    }
    
    setRefreshing(false);
  };

  const resetPaymentStates = () => {
    setSelectedPaymentMethod(null);
    setMpesaStep('details');
    setMpesaTransactionCode('');
    setMpesaValidating(false);
    setMpesaValidated(false);
    setMpesaDetails({ phoneNumber: '', accountName: '' });
    setCardProcessing(false);
    setCardConfirmed(false);
    setPaymentDetails({
      cardNumber: '', cardName: '', expiryDate: '', cvv: '', billingAddress: '', city: '', country: 'Kenya',
    });
    setCryptoStep('select');
    setPaymentAddress('');
    setCryptoAmount('');
    setTransactionHash('');
    setCryptoValidating(false);
    setCryptoValidated(false);
    setAddressCopied(false);
    setCryptoDetails({ walletAddress: '', cryptocurrency: 'BTC' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />

      <PaymentMethodModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handleSelectPaymentMethod}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-black mb-2">Manage Booking</h1>
        <p className="text-gray-600 mb-8">View and manage your flight booking</p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchType === 'reference'}
                onChange={() => setSearchType('reference')}
                className="w-4 h-4 text-[#cc2127]"
              />
              <span className="text-gray-700 font-medium">Booking Reference</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchType === 'email'}
                onChange={() => setSearchType('email')}
                className="w-4 h-4 text-[#cc2127]"
              />
              <span className="text-gray-700 font-medium">Email Address</span>
            </label>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            {searchType === 'reference' ? (
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="Enter booking reference (e.g., TSABC123)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                required
              />
            ) : (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                required
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#cc2127] text-white font-bold rounded-lg hover:bg-[#cc2127]/90 disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="size-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {booking && (
          <div className="space-y-6">
            {needsPayment && !selectedPaymentMethod && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="size-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 text-lg mb-2">Payment Required</h3>
                    <p className="text-yellow-800 text-sm mb-4">
                      Your booking has been created but payment is pending. Complete your payment to confirm your booking.
                    </p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
                    >
                      Complete Payment Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMethod && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-bold text-black text-lg mb-4">
                  {selectedPaymentMethod === 'card' ? 'Card Payment' : 
                   selectedPaymentMethod === 'mpesa' ? 'M-Pesa Payment' : 
                   'Cryptocurrency Payment'}
                </h4>
                
                {selectedPaymentMethod === 'mpesa' && mpesaStep === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number *</label>
                      <input
                        type="tel"
                        value={mpesaDetails.phoneNumber}
                        onChange={(e) => setMpesaDetails({ ...mpesaDetails, phoneNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+254 700 000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
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
                  </div>
                )}

                {selectedPaymentMethod === 'mpesa' && mpesaStep === 'validate' && !mpesaValidated && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Transaction Code *</label>
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
                      disabled={mpesaValidating}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold disabled:opacity-50"
                    >
                      {mpesaValidating ? 'Validating...' : 'Verify Transaction'}
                    </button>
                  </div>
                )}

                {mpesaValidated && (
                  <div className="text-center">
                    <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-900 font-semibold mb-4">Payment Verified!</p>
                    <button
                      onClick={handleCompletePayment}
                      className="px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
                    >
                      Submit Payment
                    </button>
                  </div>
                )}

                {selectedPaymentMethod === 'card' && !cardConfirmed && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        value={paymentDetails.cardName}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address *</label>
                      <input
                        type="text"
                        value={paymentDetails.billingAddress}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, billingAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <button
                      onClick={handleCardPayment}
                      disabled={cardProcessing}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold disabled:opacity-50"
                    >
                      {cardProcessing ? 'Processing...' : 'Process Payment'}
                    </button>
                  </div>
                )}

                {cardConfirmed && (
                  <div className="text-center">
                    <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-900 font-semibold mb-4">Payment Confirmed!</p>
                    <button
                      onClick={handleCompletePayment}
                      className="px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
                    >
                      Submit Payment
                    </button>
                  </div>
                )}

                {selectedPaymentMethod === 'crypto' && cryptoStep === 'select' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cryptocurrency *</label>
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
                  </div>
                )}

                {selectedPaymentMethod === 'crypto' && cryptoStep === 'payment' && !cryptoValidated && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded p-4">
                      <p className="text-xs text-orange-700 mb-2">Amount: <span className="font-bold">{cryptoAmount} {cryptoDetails.cryptocurrency}</span></p>
                      <p className="text-xs text-orange-700 mb-2">Payment Address:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white p-2 rounded flex-1 break-all">{paymentAddress}</code>
                        <button onClick={() => copyToClipboard(paymentAddress)} className="p-2 hover:bg-orange-100 rounded">
                          {addressCopied ? <CheckCircle2 className="size-4 text-green-600" /> : <Copy className="size-4 text-orange-600" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Wallet Address (Optional)</label>
                      <input
                        type="text"
                        value={cryptoDetails.walletAddress}
                        onChange={(e) => setCryptoDetails({ ...cryptoDetails, walletAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                        placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Hash (Optional)</label>
                      <input
                        type="text"
                        value={transactionHash}
                        onChange={(e) => setTransactionHash(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                        placeholder="0xabc123..."
                      />
                    </div>
                    <button
                      onClick={handleCryptoVerify}
                      disabled={cryptoValidating}
                      className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-bold disabled:opacity-50"
                    >
                      {cryptoValidating ? 'Validating...' : 'Verify Transaction'}
                    </button>
                  </div>
                )}

                {cryptoValidated && (
                  <div className="text-center">
                    <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-900 font-semibold mb-4">Transaction Verified!</p>
                    <button
                      onClick={handleCompletePayment}
                      className="px-6 py-3 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
                    >
                      Submit Payment
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isPaymentVerifiedByAdmin && booking.payment_details?.method && !selectedPaymentMethod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Clock className="size-8 text-blue-600 animate-pulse flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 text-lg mb-1">Waiting for Payment Confirmation</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Your payment has been submitted and is awaiting admin verification. You will be notified once your payment is confirmed.
                    </p>
                    <p className="text-blue-700 text-sm font-medium mb-3">
                      If you did not complete the payment or need to try again, click the button below to make a new payment.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleRefreshBooking}
                        disabled={refreshing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 flex items-center gap-2"
                      >
                        <RefreshCw className={`size-5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Checking...' : 'Refresh'}
                      </button>
                      <button
                        onClick={() => {
                          resetPaymentStates();
                          setShowPaymentModal(true);
                        }}
                        className="px-4 py-2 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold"
                      >
                        Pay Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="text-3xl font-bold text-[#cc2127]">{booking.booking_reference}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-black">Flight Details</h3>
                  <div className="flex items-start gap-3">
                    <Plane className="size-5 text-[#0090da] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Airline</p>
                      <p className="font-semibold text-black">{booking.airline}</p>
                      <p className="text-sm text-gray-600">{booking.flight_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-[#0090da] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Route</p>
                      <p className="font-semibold text-black">{booking.from_airport} → {booking.to_airport}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="size-5 text-[#0090da] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Departure</p>
                      <p className="font-semibold text-black">
                        {new Date(booking.departure_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="size-5 text-[#0090da] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Travelers</p>
                      <p className="font-semibold text-black">{booking.travelers} • {booking.cabin_class}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-black">Passenger Information</h3>
                  {booking.passenger_details && booking.passenger_details.map((passenger: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold text-black mb-2">Passenger {index + 1}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-gray-500" />
                          <span className="text-gray-700">{passenger.firstName} {passenger.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-gray-500" />
                          <span className="text-gray-700">{passenger.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-gray-500" />
                          <span className="text-gray-700">{passenger.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-black">
                    {booking.currency} {booking.total_price.toLocaleString()}
                  </p>
                </div>

                {booking.status === 'confirmed' && isPaymentVerifiedByAdmin && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> If you need to modify your booking or have any questions, please contact our support team at support@ticketshwari.com or call +254-709-816-000.
              </p>
            </div>
          </div>
        )}

        {!loading && !booking && (bookingRef || email) && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg">Booking not found. Please check your booking reference or email and try again.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}