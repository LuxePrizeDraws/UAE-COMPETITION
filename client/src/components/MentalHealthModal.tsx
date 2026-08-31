import { useState } from 'react';
import MentalHealthLeaflet from './MentalHealthLeaflet';
import MentalHealthChatbot from './MentalHealthChatbot';
import './MentalHealthModal.css';

interface MentalHealthModalProps {
  onClose: () => void;
}

export default function MentalHealthModal({ onClose }: MentalHealthModalProps) {
  const [view, setView] = useState<'leaflet' | 'chatbot'>('leaflet');

  return (
    <div className="mh-overlay" onClick={onClose}>
      <div className="mh-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mh-modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="mh-modal__tabs">
          <button
            className={`mh-tab ${view === 'leaflet' ? 'mh-tab--active' : ''}`}
            onClick={() => setView('leaflet')}
          >
            📋 Resources
          </button>
          <button
            className={`mh-tab ${view === 'chatbot' ? 'mh-tab--active' : ''}`}
            onClick={() => setView('chatbot')}
          >
            💬 Talk to AI
          </button>
        </div>
        <div className="mh-modal__body">
          {view === 'leaflet' ? (
            <MentalHealthLeaflet onOpenChat={() => setView('chatbot')} />
          ) : (
            <MentalHealthChatbot />
          )}
        </div>
      </div>
    </div>
  );
}
