import './FeaturePages.css';
import { FormEvent, useMemo, useState } from 'react';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface SupportForm {
  name: string;
  email: string;
  reason: string;
  preferredContact: string;
  urgent: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MentalHealthSupport() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi, I am here to provide supportive guidance. If this is an emergency or immediate risk, please contact local emergency services right now.',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showSupportWorkerForm, setShowSupportWorkerForm] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportResult, setSupportResult] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState<SupportForm>({
    name: '',
    email: '',
    reason: '',
    preferredContact: 'email',
    urgent: false,
  });

  const sanitizedHistory = useMemo(
    () => messages.map(({ role, content }) => ({ role, content })),
    [messages]
  );

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setChatError(null);
    setChatLoading(true);

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');

    try {
      const response = await fetch(`${API_URL}/api/mental-health/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: sanitizedHistory }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to send message right now.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: payload.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send message right now.';
      setChatError(message);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not process that just now. You can still request a support worker handoff below.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const submitSupportRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSupportError(null);
    setSupportResult(null);

    if (supportForm.name.trim().length < 2) {
      setSupportError('Please enter your name.');
      return;
    }
    if (!supportForm.email.includes('@')) {
      setSupportError('Please enter a valid email address.');
      return;
    }
    if (supportForm.reason.trim().length < 10) {
      setSupportError('Please describe your support needs in at least 10 characters.');
      return;
    }

    try {
      setSupportSubmitting(true);
      const response = await fetch(`${API_URL}/api/support-worker-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Could not submit your support request.');
      }

      setSupportResult(`Request submitted. Ticket ID: ${payload.ticketId}`);
      setSupportForm({ name: '', email: '', reason: '', preferredContact: 'email', urgent: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not submit your support request.';
      setSupportError(message);
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <section className="feature-page">
      <div className="feature-page__hero">
        <h1>Mental Health Support</h1>
        <p>
          This area offers supportive guidance and a direct support-worker handoff path.
          It is not emergency or crisis care.
        </p>
      </div>

      <article className="feature-card">
        <p className="feature-disclaimer">
          <strong>Important:</strong> If you or someone else is in immediate danger, contact local emergency services now.
        </p>
        <div className="chat-panel">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-bubble chat-bubble--${message.role}`}>
              <strong>{message.role === 'assistant' ? 'AI Support' : 'You'}:</strong> {message.content}
            </div>
          ))}
        </div>
        <form className="feature-form" onSubmit={sendMessage}>
          <label>
            Message
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Describe how you are feeling or what support you need."
              required
            />
          </label>
          <button type="submit" disabled={chatLoading}>{chatLoading ? 'Sending...' : 'Send message'}</button>
        </form>
        {chatError && <p className="feature-page__status feature-page__status--error">{chatError}</p>}
      </article>

      <article className="feature-card">
        <div className="support-worker-header">
          <h2>Need a human support worker?</h2>
          <button type="button" onClick={() => setShowSupportWorkerForm((prev) => !prev)}>
            {showSupportWorkerForm ? 'Hide Request Form' : 'Request Support Worker'}
          </button>
        </div>

        {showSupportWorkerForm && (
          <form className="feature-form" onSubmit={submitSupportRequest}>
            <label>
              Name
              <input
                type="text"
                value={supportForm.name}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={supportForm.email}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label>
              Support details
              <textarea
                value={supportForm.reason}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, reason: event.target.value }))}
                rows={4}
                minLength={10}
                required
              />
            </label>
            <label>
              Preferred contact
              <select
                value={supportForm.preferredContact}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, preferredContact: event.target.value }))}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
            <label className="feature-form__checkbox">
              <input
                type="checkbox"
                checked={supportForm.urgent}
                onChange={(event) => setSupportForm((prev) => ({ ...prev, urgent: event.target.checked }))}
              />
              Mark this request as urgent.
            </label>
            <button type="submit" disabled={supportSubmitting}>
              {supportSubmitting ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </form>
        )}

        {supportError && <p className="feature-page__status feature-page__status--error">{supportError}</p>}
        {supportResult && <p className="feature-page__status feature-page__status--success">{supportResult}</p>}
      </article>
    </section>
  );
}
