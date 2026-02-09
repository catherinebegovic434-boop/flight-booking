'use client';

import { useState, useEffect } from 'react';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { Plane, Check, X, Clock, TrendingUp, MessageSquare, Send, Users, Mail, Shield, Edit2, DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'tickets' | 'users' | 'pricing'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editingUser, setEditingUser] = useState(false);
  const [userEditForm, setUserEditForm] = useState({ email: '', phone: '' });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, revenue: 0 });
  
  const [pricingLevel, setPricingLevel] = useState(3);
  const [updatingPricing, setUpdatingPricing] = useState(false);

  useEffect(() => {
    loadBookings();
    loadTickets();
    loadUsers();
    loadPricingSettings();
  }, [filter, ticketFilter, userFilter]);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadUsers = async () => {
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    
    if (authUsers) {
      let filteredUsers = authUsers;
      if (userFilter === 'confirmed') {
        filteredUsers = authUsers.filter(u => u.email_confirmed_at);
      } else if (userFilter === 'unconfirmed') {
        filteredUsers = authUsers.filter(u => !u.email_confirmed_at);
      }
      setUsers(filteredUsers);
    }
  };

  const handleApproveUser = async (userId: string) => {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    });

    if (!error) {
      alert('User email confirmed successfully!');
      loadUsers();
    } else {
      alert('Failed to confirm user email');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (!error) {
      alert('User deleted successfully!');
      loadUsers();
      setSelectedUser(null);
    } else {
      alert('Failed to delete user');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditingUser(true);
    setUserEditForm({
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.auth.admin.updateUserById(selectedUser.id, {
      email: userEditForm.email,
      phone: userEditForm.phone
    });

    if (!error) {
      alert('User updated successfully!');
      setEditingUser(false);
      setSelectedUser(null);
      loadUsers();
    } else {
      alert('Failed to update user');
    }
  };

  const loadBookings = async () => {
    setLoading(true);

    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    
    if (data) {
      setBookings(data);
      
      const allData = await supabase.from('bookings').select('*');
      if (allData.data) {
        setStats({
          total: allData.data.length,
          confirmed: allData.data.filter(b => b.status === 'confirmed').length,
          pending: allData.data.filter(b => b.status === 'pending').length,
          cancelled: allData.data.filter(b => b.status === 'cancelled').length,
          revenue: allData.data
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + parseFloat(b.total_price), 0)
        });
      }
    }

    setLoading(false);
  };

  const loadTickets = async () => {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketFilter !== 'all') {
      query = query.eq('status', ticketFilter);
    }

    const { data } = await query;
    if (data) {
      setTickets(data);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) {
      setTicketMessages(data);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: selectedTicket.id,
        message: replyMessage,
        sender_type: 'support'
      });

    if (!error) {
      setReplyMessage('');
      loadTicketMessages(selectedTicket.id);
    }
  };

  const handleTicketStatusUpdate = async (ticketId: string, newStatus: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (!error) {
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (!error) {
      loadBookings();
    }
  };

  const handleVerifyPayment = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'confirmed',
        payment_details: {
          ...booking.payment_details,
          verified_by_admin: true,
          verified_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString() 
      })
      .eq('id', bookingId);

    if (!error) {
      alert('Payment verified and booking confirmed!');
      loadBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } else {
      alert('Failed to verify payment');
    }
  };

  const handleDeleteBooking = async (bookingId: string, bookingReference: string) => {
    if (!confirm(`Are you sure you want to delete booking ${bookingReference}? This action cannot be undone.`)) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (!error) {
      alert('Booking deleted successfully!');
      loadBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } else {
      alert('Failed to delete booking');
    }
  };

  const loadPricingSettings = async () => {
    const { data } = await supabase
      .from('pricing_settings')
      .select('*')
      .single();
    
    if (data) {
      setPricingLevel(data.current_pricing_level);
    }
  };

  const handleUpdatePricing = async (newLevel: number) => {
    setUpdatingPricing(true);
    
    const { error } = await supabase
      .from('pricing_settings')
      .update({ 
        current_pricing_level: newLevel,
        updated_at: new Date().toISOString(),
        updated_by: 'admin'
      })
      .eq('id', (await supabase.from('pricing_settings').select('id').single()).data?.id);
    
    if (!error) {
      setPricingLevel(newLevel);
      alert(`Pricing level updated to ${newLevel}/10`);
    } else {
      alert('Failed to update pricing level');
    }
    
    setUpdatingPricing(false);
  };

  const getPricingDescription = (level: number) => {
    if (level <= 2) return 'Very Low Season (Cheapest Prices)';
    if (level <= 4) return 'Low Season (Discounted Prices)';
    if (level <= 6) return 'Regular Season (Normal Prices)';
    if (level <= 8) return 'High Season (Premium Prices)';
    return 'Peak Season (Highest Prices)';
  };

  const getPricingMultiplier = (level: number) => {
    return (0.7 + (level * 0.06)).toFixed(2);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all bookings, support tickets, and users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Bookings</p>
              <Plane className="size-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-black">{stats.total}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Confirmed</p>
              <Check className="size-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending</p>
              <Clock className="size-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <TrendingUp className="size-5 text-[#cc2127]" />
            </div>
            <p className="text-2xl font-bold text-[#cc2127]">
              KES {stats.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'bookings'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plane className="inline-block mr-2 size-5" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'tickets'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="inline-block mr-2 size-5" />
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="inline-block mr-2 size-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'pricing'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="inline-block mr-2 size-5" />
            Pricing Model
          </button>
        </div>

        {activeTab === 'bookings' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">All Bookings</h2>
              
              <div className="flex gap-2">
                {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === status
                        ? 'bg-[#cc2127] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No bookings found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Airline</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Travelers</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <>
                        <tr 
                          key={booking.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                        >
                          <td className="py-3 px-4 font-mono text-sm">{booking.booking_reference}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-black">{booking.airline}</p>
                              <p className="text-sm text-gray-600">{booking.flight_number}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{booking.from_airport} → {booking.to_airport}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(booking.departure_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">{booking.travelers}</td>
                          <td className="py-3 px-4 font-semibold">
                            {booking.currency} {booking.total_price.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.payment_details?.method === 'card' ? 'bg-blue-100 text-blue-700' :
                              booking.payment_details?.method === 'mpesa' ? 'bg-green-100 text-green-700' :
                              booking.payment_details?.method === 'crypto' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.payment_details?.method?.toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <select
                                value={booking.status}
                                onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => handleDeleteBooking(booking.id, booking.booking_reference)}
                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                title="Delete booking"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {selectedBooking?.id === booking.id && (
                          <tr className="bg-blue-50 border-b">
                            <td colSpan={9} className="py-4 px-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-bold text-black mb-2">Passenger Details</h4>
                                  {booking.passenger_details?.map((passenger: any, idx: number) => (
                                    <div key={idx} className="text-sm mb-2 p-2 bg-white rounded">
                                      <p className="font-semibold">{passenger.firstName} {passenger.lastName}</p>
                                      <p className="text-gray-600">{passenger.email}</p>
                                      <p className="text-gray-600">{passenger.phone}</p>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <h4 className="font-bold text-black mb-2">Payment Details</h4>
                                  <div className="text-sm p-3 bg-white rounded">
                                    <div className="mb-3 flex items-center justify-between">
                                      <div>
                                        <p className="mb-1">
                                          <span className="font-semibold">Method:</span>{' '}
                                          <span className="uppercase">{booking.payment_details?.method || 'N/A'}</span>
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Amount:</span> KES {booking.payment_details?.amount_kes?.toLocaleString() || 'N/A'}
                                        </p>
                                      </div>
                                      {!booking.payment_details?.verified_by_admin && booking.status === 'pending' && (
                                        <button
                                          onClick={() => handleVerifyPayment(booking.id)}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                                        >
                                          <Shield className="size-4" />
                                          Verify Payment
                                        </button>
                                      )}
                                      {booking.payment_details?.verified_by_admin && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                          <Shield className="size-3" />
                                          Verified by Admin
                                        </span>
                                      )}
                                    </div>
                                    
                                    {booking.payment_details?.method === 'card' && (
                                      <>
                                        <p className="mb-1">
                                          <span className="font-semibold">Card:</span> {booking.payment_details.cardNumber}
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Cardholder:</span> {booking.payment_details.cardName}
                                        </p>
                                      </>
                                    )}
                                    
                                    {booking.payment_details?.method === 'mpesa' && (
                                      <>
                                        <p className="mb-1">
                                          <span className="font-semibold">Phone:</span> {booking.payment_details.phoneNumber}
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Account Name:</span> {booking.payment_details.accountName}
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Transaction Code:</span>{' '}
                                          <code className="bg-gray-100 px-2 py-1 rounded text-green-700 font-mono">
                                            {booking.payment_details.transactionCode}
                                          </code>
                                        </p>
                                      </>
                                    )}
                                    
                                    {booking.payment_details?.method === 'crypto' && (
                                      <>
                                        <p className="mb-1">
                                          <span className="font-semibold">Cryptocurrency:</span> {booking.payment_details.cryptocurrency}
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Amount:</span>{' '}
                                          <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                                            {booking.payment_details.cryptoAmount}
                                          </code>
                                        </p>
                                        <p className="mb-1">
                                          <span className="font-semibold">Payment Address:</span>{' '}
                                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                                            {booking.payment_details.paymentAddress}
                                          </code>
                                        </p>
                                        {booking.payment_details.walletAddress !== 'N/A' && (
                                          <p className="mb-1">
                                            <span className="font-semibold">Customer Wallet:</span>{' '}
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                                              {booking.payment_details.walletAddress}
                                            </code>
                                          </p>
                                        )}
                                        {booking.payment_details.transactionHash !== 'N/A' && (
                                          <p className="mb-1">
                                            <span className="font-semibold">Transaction Hash:</span>{' '}
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all text-orange-700">
                                              {booking.payment_details.transactionHash}
                                            </code>
                                          </p>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'tickets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">Support Tickets</h2>
                
                <div className="flex gap-2">
                  {(['all', 'open', 'in-progress', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setTicketFilter(status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        ticketFilter === status
                          ? 'bg-[#cc2127] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No support tickets found</div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTicket?.id === ticket.id
                          ? 'border-[#cc2127] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-sm font-bold text-[#cc2127]">
                            {ticket.ticket_code}
                          </p>
                          <p className="text-sm text-gray-600">{ticket.customer_email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="font-semibold text-black mb-1">{ticket.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ticket.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {selectedTicket ? (
                <>
                  <div className="mb-6 pb-4 border-b">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h2 className="text-xl font-bold text-black mb-1">
                          {selectedTicket.subject}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Ticket #{selectedTicket.ticket_code} • {selectedTicket.customer_email}
                        </p>
                      </div>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleTicketStatusUpdate(selectedTicket.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#cc2127]"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-black mb-3">Conversation</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                      {ticketMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.sender_type === 'customer'
                              ? 'bg-gray-100 ml-0 mr-8'
                              : 'bg-blue-50 ml-8 mr-0'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {msg.sender_type === 'customer' ? 'Customer' : 'Support Team'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Send Reply
                    </label>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#cc2127] focus:border-transparent resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="mt-3 w-full bg-[#cc2127] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#a51b20] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="size-4" />
                      Send Reply
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <MessageSquare className="size-16 mx-auto mb-4 opacity-30" />
                  <p>Select a ticket to view details and reply</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">User Management</h2>
              
              <div className="flex gap-2">
                {(['all', 'confirmed', 'unconfirmed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setUserFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userFilter === status
                        ? 'bg-[#cc2127] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {editingUser && selectedUser ? (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold text-black mb-4">Edit User Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#cc2127]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={userEditForm.phone}
                      onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#cc2127]"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveUserEdit}
                    className="px-6 py-2 bg-[#cc2127] text-white rounded-lg font-semibold hover:bg-[#a51b20]"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Sign In</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.phone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {user.email_confirmed_at ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                            <Check className="size-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                            <Clock className="size-3" />
                            Unconfirmed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {!user.email_confirmed_at && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600 flex items-center gap-1"
                            >
                              <Check className="size-3" />
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600 flex items-center gap-1"
                          >
                            <Edit2 className="size-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">No users found</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-black mb-2">Pricing Model Settings</h2>
            <p className="text-gray-600 mb-8">Adjust flight pricing based on demand and seasonality (1 = lowest, 10 = highest)</p>

            <div className="max-w-2xl">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-4xl font-bold text-[#cc2127]">{pricingLevel}/10</p>
                    <p className="text-lg font-semibold text-gray-700 mt-1">{getPricingDescription(pricingLevel)}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Price Multiplier: <span className="font-mono font-bold text-[#0090da]">{getPricingMultiplier(pricingLevel)}x</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Example Base Economy Price:</p>
                    <p className="text-2xl font-bold text-black">
                      KES {(8000 * parseFloat(getPricingMultiplier(pricingLevel))).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="relative pt-6 pb-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={pricingLevel}
                    onChange={(e) => setPricingLevel(parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>1 (Cheapest)</span>
                    <span>5 (Normal)</span>
                    <span>10 (Most Expensive)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-2 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <button
                    key={level}
                    onClick={() => setPricingLevel(level)}
                    className={`h-12 rounded-lg font-bold text-sm transition-all ${
                      pricingLevel === level
                        ? 'bg-[#cc2127] text-white scale-110 shadow-lg'
                        : level <= 3
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : level <= 7
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-black mb-2">Pricing Guide:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>1-2:</strong> Off-peak season (70-82% of base price)</li>
                  <li>• <strong>3-4:</strong> Low season (88-94% of base price)</li>
                  <li>• <strong>5-6:</strong> Regular season (100-106% of base price)</li>
                  <li>• <strong>7-8:</strong> High season (112-118% of base price)</li>
                  <li>• <strong>9-10:</strong> Peak season (124-130% of base price)</li>
                </ul>
              </div>

              <button
                onClick={() => handleUpdatePricing(pricingLevel)}
                disabled={updatingPricing}
                className="w-full px-6 py-4 bg-[#cc2127] text-white rounded-lg hover:bg-[#cc2127]/90 transition-colors font-bold text-lg disabled:opacity-50"
              >
                {updatingPricing ? 'Updating...' : `Apply Pricing Level ${pricingLevel}/10`}
              </button>

              <p className="text-xs text-gray-600 text-center mt-4">
                Changes will apply to all new flight searches immediately
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
