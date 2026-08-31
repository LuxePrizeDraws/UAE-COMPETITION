import { useState, useRef, useEffect } from 'react';
import './MentalHealthChatbot.css';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

let _idCounter = 1;
function nextId() {
  return _idCounter++;
}

const INITIAL_MESSAGE: Message = {
  id: nextId(),
  role: 'bot',
  text: "Hello 👋 I'm here to support you. Competitions and gambling can sometimes be stressful. How are you feeling today? You can talk to me about anything.",
};

const RESPONSES: Record<string, string> = {
  stressed: "I hear you — it's completely normal to feel stressed. Remember: competitions should be fun, not a source of anxiety. Would you like some tips on staying balanced?",
  anxious: "Feeling anxious is your mind's way of asking for care. Try a slow breath in for 4 counts, hold for 4, out for 4. You're not alone in this.",
  help: "I'm here to help. If you're concerned about your gambling habits, organisations like GamCare (0808 8020 133) and BeGambleAware offer free, confidential support 24/7.",
  win: "Winning can feel amazing! Enjoy the moment. Just remember to keep competitions fun and never spend more than you can comfortably afford.",
  lost: "Losing can be disappointing. It's okay to feel that way. Remember: each entry is an independent event, and the next one is no more likely to win. Take care of yourself first.",
  default: "Thank you for sharing that with me. Remember, you can always take a break, and support is always available. GamCare: 0808 8020 133 | BeGambleAware.org",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('stress') || lower.includes('pressure')) return RESPONSES.stressed;
  if (lower.includes('anxi') || lower.includes('worry') || lower.includes('worried')) return RESPONSES.anxious;
  if (lower.includes('help') || lower.includes('support') || lower.includes('problem') || lower.includes('addic')) return RESPONSES.help;
  if (lower.includes('won') || lower.includes('win') || lower.includes('winning')) return RESPONSES.win;
  if (lower.includes('lost') || lower.includes('lose') || lower.includes('losing') || lower.includes('disappoint')) return RESPONSES.lost;
  return RESPONSES.default;
}

interface Props {
  onClose: () => void;
}

export default function MentalHealthChatbot({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: nextId(), role: 'user', text: trimmed };
    const botMsg: Message = { id: nextId(), role: 'bot', text: getBotResponse(trimmed) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Mental health support chat">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-avatar">🧠</span>
            <div>
              <h3>Wellbeing Support</h3>
              <p>Confidential · Free · Always here</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose} aria-label="Close chat">✕</button>
        </div>

        <div className="chatbot-messages" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              {msg.role === 'bot' && <span className="chat-avatar">🤝</span>}
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chatbot-input-row">
          <input
            className="chatbot-input"
            type="text"
            placeholder="Type how you're feeling…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Type your message"
          />
          <button className="chatbot-send" onClick={handleSend} aria-label="Send message" disabled={!input.trim()}>
            ➤
          </button>
        </div>

        <div className="chatbot-footer">
          <span>🔒 Confidential</span>
          <span>•</span>
          <a href="https://www.gamcare.org.uk" target="_blank" rel="noopener noreferrer">GamCare</a>
          <span>•</span>
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware</a>
        </div>
      </div>
    </div>
  );
}
