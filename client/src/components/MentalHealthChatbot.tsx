import { useState, useRef, useEffect } from 'react';
import './MentalHealthChatbot.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MentalHealthChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello, I'm here to listen and support you. 💙 This is a safe, confidential space. You can share whatever is on your mind — whether it's stress, anxiety, life struggles, or just needing someone to talk to. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/mental-health/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setError('Could not connect to the support service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello again. 💙 I'm here whenever you need to talk. What's on your mind?",
      },
    ]);
    setError(null);
  };

  return (
    <div className="mhc">
      <div className="mhc__header">
        <div className="mhc__header-info">
          <span className="mhc__avatar">🤖</span>
          <div>
            <p className="mhc__name">AI Support Assistant</p>
            <p className="mhc__status">🟢 Online · Confidential · Always available</p>
          </div>
        </div>
        <button className="mhc__clear-btn" onClick={clearChat} title="Start new conversation">
          🔄 New Chat
        </button>
      </div>

      <div className="mhc__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`mhc__message mhc__message--${msg.role}`}>
            {msg.role === 'assistant' && <span className="mhc__msg-avatar">💙</span>}
            <div className="mhc__bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="mhc__message mhc__message--assistant">
            <span className="mhc__msg-avatar">💙</span>
            <div className="mhc__bubble mhc__bubble--typing">
              <span className="mhc__dot" /><span className="mhc__dot" /><span className="mhc__dot" />
            </div>
          </div>
        )}
        {error && <p className="mhc__error">⚠️ {error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="mhc__input-area">
        <textarea
          className="mhc__textarea"
          placeholder="Share what's on your mind… (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={loading}
        />
        <button
          className="mhc__send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
      <p className="mhc__disclaimer">
        ℹ️ AI support only. Not a substitute for professional help. In crisis? Call your local helpline immediately.
      </p>
    </div>
  );
}
