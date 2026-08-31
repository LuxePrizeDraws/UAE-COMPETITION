import { FormEvent, useState } from 'react';
import './MentalHealthModal.css';

interface MentalHealthModalProps {
  onClose: () => void;
}

type ViewMode = 'leaflet' | 'chat';
type MessageRole = 'assistant' | 'user';

interface ChatMessage {
  id: number;
  role: MessageRole;
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const clientFallback = `💚 I’m here with you. If this feels urgent or unsafe, call 999 now. You can also contact Samaritans on 116 123, Mind Infoline on 0300 123 3393, or text SHOUT to 85258. Professional support can make a real difference, and you deserve that help.`;

export default function MentalHealthModal({ onClose }: MentalHealthModalProps) {
  const [view, setView] = useState<ViewMode>('leaflet');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: '💚 Hi, I’m here to listen. Tell me what’s on your mind, and if things feel serious or unsafe, please seek professional help straight away.',
    },
  ]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: current.length + 1, role: 'user' as MessageRole, content: message },
    ]);
    setDraft('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      const reply = response.ok && typeof data.reply === 'string' && data.reply.trim()
        ? data.reply.trim()
        : clientFallback;

      setMessages((current) => [
        ...current,
        {
          id: current.length + 1,
          role: 'assistant',
          content: `💚 ${reply.replace(/^💚\s*/, '')}`,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: current.length + 1,
          role: 'assistant',
          content: clientFallback,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mental-health-overlay" onClick={onClose}>
      <div className="mental-health-modal" onClick={(event) => event.stopPropagation()}>
        <button className="mental-health-modal__close" onClick={onClose} aria-label="Close mental health support">
          ✕
        </button>

        {view === 'leaflet' ? (
          <div className="mental-health-leaflet">
            <span className="mental-health-badge">Support &amp; Wellbeing</span>
            <h2>💚 Mental Health Support</h2>
            <p className="mental-health-subtitle">You are not alone. Help is available.</p>

            <div className="mental-health-cards">
              <div className="mental-health-card">
                <strong>If you're in crisis</strong>
                <span>Call 999 (UK Emergency)</span>
              </div>
              <div className="mental-health-card">
                <strong>Samaritans</strong>
                <span>116 123 (free, 24/7)</span>
              </div>
              <div className="mental-health-card">
                <strong>Mind Infoline</strong>
                <span>0300 123 3393</span>
              </div>
              <div className="mental-health-card">
                <strong>Crisis Text Line</strong>
                <span>Text SHOUT to 85258</span>
              </div>
            </div>

            <p className="mental-health-copy">
              Gambling and competitions can sometimes affect our mental health. If you feel this is impacting you,
              please reach out. You deserve support.
            </p>

            <p className="mental-health-note">
              Play responsibly. Taking a break and speaking to a trusted professional is a strong step.
            </p>

            <div className="mental-health-actions">
              <button className="mental-health-primary" onClick={() => setView('chat')}>
                Chat with AI Support
              </button>
              <button className="mental-health-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="mental-health-chat">
            <div className="mental-health-chat__header">
              <button className="mental-health-back" onClick={() => setView('leaflet')}>
                ← Back
              </button>
              <div>
                <h2>💚 AI Support Chat</h2>
                <p>If this feels serious or urgent, please contact a professional or emergency support.</p>
              </div>
            </div>

            <div className="mental-health-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mental-health-message mental-health-message--${message.role}`}
                >
                  <span>{message.content}</span>
                </div>
              ))}
              {loading && (
                <div className="mental-health-message mental-health-message--assistant mental-health-message--loading">
                  <span>💚 Thinking of a supportive reply...</span>
                </div>
              )}
            </div>

            <form className="mental-health-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Share how you're feeling..."
                className="mental-health-input"
              />
              <button type="submit" className="mental-health-send" disabled={loading || !draft.trim()}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
