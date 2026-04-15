'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageSquare, Send, Loader2, X, User } from 'lucide-react';

interface Msg {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('Owner');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current user + owner ID via API (bypasses RLS)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const res = await fetch('/api/get-owner-id');
        const data = await res.json() as { id?: string; name?: string };
        if (data.id) {
          setOwnerId(data.id);
          setOwnerName(data.name || 'Owner');
        }
      } catch {
        console.error('Gagal mengambil owner ID');
      }
      setLoading(false);
    };
    void init();
  }, [supabase]);

  useEffect(() => {
    if (!currentUserId || !ownerId) return;

    let ignore = false;
    const fetchMessages = async (uid: string, owId: string) => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .or(`and(sender_id.eq.${uid},receiver_id.eq.${owId}),and(sender_id.eq.${owId},receiver_id.eq.${uid})`)
        .order('created_at', { ascending: true });
      if (data && !ignore) setMessages(data as Msg[]);
    };

    void fetchMessages(currentUserId, ownerId);

    // Realtime: append new message from payload (no extra SELECT)
    const channel = supabase
      .channel(`chat-${currentUserId}-${ownerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as Msg & { receiver_id: string };
          // Only append if it belongs to this conversation
          const isRelevant =
            (msg.sender_id === currentUserId && msg.receiver_id === ownerId) ||
            (msg.sender_id === ownerId && msg.receiver_id === currentUserId);
          if (isRelevant) {
            setMessages(prev => {
              // Avoid duplicate (optimistic already added it)
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => { 
      ignore = true;
      void supabase.removeChannel(channel); 
    };
  }, [currentUserId, ownerId, supabase]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !ownerId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update: add instantly with temp id
    const tempId = `temp-${Date.now()}`;
    const optimistic: Msg = {
      id: tempId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUserId, receiver_id: ownerId, content })
      .select('id, sender_id, content, created_at')
      .single();

    if (!error && data) {
      // Replace temp with real message
      setMessages(prev => prev.map(m => m.id === tempId ? (data as Msg) : m));
    } else if (error) {
      // Rollback optimistic on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(content);
    }
    setSending(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[480px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-blue-600 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MessageSquare size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-black text-white text-sm">Chat dengan {ownerName}</p>
            <p className="text-blue-200 text-[10px] font-medium">Rental Motor Kukusan</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
          <X size={18} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : !currentUserId ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <User size={40} strokeWidth={1.5} />
            <p className="text-sm font-bold text-center">Login untuk bisa chat dengan owner</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
            <MessageSquare size={40} strokeWidth={1.5} />
            <p className="text-sm font-bold">Belum ada pesan. Sapa owner!</p>
          </div>
        ) : (
          messages.map(m => {
            const isMine = m.sender_id === currentUserId;
            const isTemp = m.id.startsWith('temp-');
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm font-medium shadow-sm transition-opacity ${isTemp ? 'opacity-60' : 'opacity-100'} ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200'}`}>
                  <p>{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
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

      {/* Input */}
      {currentUserId && !loading && (
        <div className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            placeholder="Ketik pesan..."
            className="flex-1 border border-slate-200 bg-slate-50 px-3 py-2.5 rounded-xl outline-none focus:border-blue-500 text-sm font-medium transition-all"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={sending || !newMessage.trim()}
            className="px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
          </button>
        </div>
      )}
    </div>
  );
}
