'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import NavigationHeader from '@/components/sections/navigation-header';
import Footer from '@/components/sections/footer';
import { Send, Ticket, Search, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Support() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const [view, setView] = useState<'create' | 'continue'>('create');
  const [ticketCode, setTicketCode] = useState(code || '');
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: ''
  });

  useEffect(() => {
    if (code) {
      setView('continue');
      loadTicket(code);
    }
  }, [code]);

  const loadTicket = async (code: string) => {
    setLoading(true);
    const { data: ticketData } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('ticket_code', code.toUpperCase())
      .single();

    if (ticketData) {
      setTicket(ticketData);
      
      const { data: messagesData } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketData.id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
    }
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const code = 'SUP' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_code: code,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        status: 'open'
      })
      .select()
      .single();

    if (!error && data) {
      setTicket(data);
      setTicketCode(code);
      setView('continue');
      alert(`Support ticket created! Your tracking code is: ${code}\nSave this code to continue your conversation later.`);
    }

    setLoading(false);
  };

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadTicket(ticketCode);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        sender_type: 'customer',
        message: newMessage
      });

    if (!error) {
      setNewMessage('');
      loadTicket(ticket.ticket_code);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <NavigationHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-black mb-2">Customer Support</h1>
        <p className="text-gray-600 mb-8">We're here to help you with any questions or concerns</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'create'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Create New Ticket
          </button>
          <button
            onClick={() => setView('continue')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              view === 'continue'
                ? 'bg-[#cc2127] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Continue Existing Ticket
          </button>
        </div>

        {view === 'create' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How can we help you? *
                </label>
                <textarea
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  rows={5}
                  placeholder="Please describe your issue or question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-[#cc2127] text-white font-bold rounded-lg hover:bg-[#cc2127]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Ticket className="size-5" />
                {loading ? 'Creating...' : 'Create Support Ticket'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {!ticket ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleSearchTicket} className="flex gap-3">
                  <input
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Enter your ticket code (e.g., SUPABC123)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent"
                    required
                  />
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
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Code</p>
                      <p className="text-2xl font-bold text-[#cc2127]">{ticket.ticket_code}</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{ticket.subject}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-bold text-lg text-black mb-4 flex items-center gap-2">
                    <MessageCircle className="size-5" />
                    Conversation
                  </h3>

                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.sender_type === 'customer'
                            ? 'bg-blue-50 ml-8'
                            : 'bg-gray-100 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm text-gray-700">
                            {msg.sender_type === 'customer' ? 'You' : 'Support Team'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-800">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {ticket.status !== 'closed' && (
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cc2127] focus:border-transparent resize-none"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 bg-[#cc2127] text-white font-bold rounded-lg hover:bg-[#cc2127]/90 flex items-center gap-2"
                      >
                        <Send className="size-5" />
                        Send
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
