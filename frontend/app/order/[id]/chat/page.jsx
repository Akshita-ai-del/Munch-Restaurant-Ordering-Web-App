'use client';
import { useState, useEffect, useRef, use } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { chatApi } from '@/services/api';
import { connectSocket } from '@/services/socket';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatPage({ params }) {
  // Next.js 15+: params is a Promise — unwrap with React.use()
  const { id } = use(params);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    chatApi.get(id).then(({ data }) => {
      setMessages(data.chat.messages);
      setChatId(data.chat.id);

      const socket = connectSocket();
      socket.emit('join-chat', data.chat.id);
      socket.on('new-message', (msg) => setMessages((prev) => [...prev, msg]));
      return () => { socket.off('new-message'); socket.emit('leave-chat', data.chat.id); };
    });
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await chatApi.send(id, input.trim());
      setInput('');
    } finally { setSending(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="page-header">
        <button className="page-header-back" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="h4">Order Chat</h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ask the store anything</p>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥤</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-8)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            <p>No messages yet. Say hi!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2, paddingLeft: 'var(--space-1)' }}>{msg.senderName}</span>}
              <div className={`chat-bubble ${isMe ? 'chat-bubble-mine' : 'chat-bubble-theirs'}`}>{msg.content}</div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, paddingInline: 'var(--space-1)' }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary btn-icon" onClick={send} disabled={!input.trim() || sending}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
