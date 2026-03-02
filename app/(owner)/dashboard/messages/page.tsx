'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageSquare, Send, Loader2, User, Search } from 'lucide-react';

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get owner ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setOwnerId(data.user.id);
    });
  }, [supabase]);

  // Fetch all customers
  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('role', 'customer')
      .order('full_name');
    if (data) setCustomers(data as CustomerProfile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Fetch messages for selected customer (initial load only)
  const fetchMessages = useCallback(async (customerId: string, owId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, created_at')
      .or(`and(sender_id.eq.${owId},receiver_id.eq.${customerId}),and(sender_id.eq.${customerId},receiver_id.eq.${owId})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  }, [supabase]);

  // Subscribe to realtime when customer is selected
  useEffect(() => {
    if (!selectedCustomer || !ownerId) return;

    setMessages([]);
    void fetchMessages(selectedCustomer.id, ownerId);

    const channel = supabase
      .channel(`owner-chat-${selectedCustomer.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as Message;
          // Only append messages relevant to this conversation
          const isRelevant =
            (msg.sender_id === ownerId && msg.receiver_id === selectedCustomer.id) ||
            (msg.sender_id === selectedCustomer.id && msg.receiver_id === ownerId);
          if (isRelevant) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [selectedCustomer, ownerId, supabase, fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || !ownerId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: ownerId,
      receiver_id: selectedCustomer.id,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: ownerId, receiver_id: selectedCustomer.id, content })
      .select('id, sender_id, receiver_id, content, created_at')
      .single();

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === tempId ? (data as Message) : m));
    } else if (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
    }
    setSending(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pesan</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home &gt; Pesan</p>
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left: Customer List */}
        <div className="w-72 border-r border-blue-100 flex flex-col shrink-0">
          <div className="p-4 border-b border-blue-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari pelanggan..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm font-bold">Tidak ada pelanggan</div>
            ) : (
              filteredCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all border-b border-slate-100 ${selectedCustomer?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-black text-sm">{c.full_name?.charAt(0)?.toUpperCase() || '?'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{c.full_name || 'No Name'}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{c.phone || c.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Area */}
        {selectedCustomer ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-blue-100 flex items-center gap-3 bg-blue-50/40">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-black text-sm">{selectedCustomer.full_name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-black text-slate-900">{selectedCustomer.full_name}</p>
                <p className="text-xs text-slate-400 font-medium">{selectedCustomer.phone || selectedCustomer.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                  <MessageSquare size={48} strokeWidth={1.5} />
                  <p className="font-bold text-sm">Belum ada pesan. Mulai percakapan!</p>
                </div>
              ) : (
                messages.map(m => {
                  const isOwner = m.sender_id === ownerId;
                  const isTemp = m.id.startsWith('temp-');
                  return (
                    <div key={m.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                      {!isOwner && (
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1">
                          <User size={13} className="text-blue-600" strokeWidth={2.5} />
                        </div>
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm transition-opacity ${isTemp ? 'opacity-60' : 'opacity-100'} ${isOwner ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-900 rounded-bl-sm'}`}>
                        <p>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwner ? 'text-blue-200' : 'text-slate-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          {isTemp && ' · mengirim...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-blue-100 flex gap-3">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                placeholder={`Kirim pesan ke ${selectedCustomer.full_name}...`}
                className="flex-1 border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl outline-none focus:border-blue-500 font-medium text-sm transition-all"
              />
              <button
                onClick={() => void sendMessage()}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
            <MessageSquare size={64} strokeWidth={1} />
            <div className="text-center">
              <p className="font-black text-lg">Pilih Pelanggan</p>
              <p className="text-sm font-medium mt-1">Pilih pelanggan dari daftar untuk mulai chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
