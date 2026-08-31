import './MentalHealthLeaflet.css';

interface MentalHealthLeafletProps {
  onOpenChat: () => void;
}

export default function MentalHealthLeaflet({ onOpenChat }: MentalHealthLeafletProps) {
  return (
    <div className="mhl">
      <div className="mhl__hero">
        <div className="mhl__hero-icon">🧠</div>
        <h2 className="mhl__title">Mental Health Support</h2>
        <p className="mhl__subtitle">
          You are not alone. Help is always available.
        </p>
      </div>

      <section className="mhl__section">
        <h3 className="mhl__section-title">📞 Crisis Helplines</h3>
        <div className="mhl__hotlines">
          <div className="mhl__hotline">
            <span className="mhl__hotline-flag">🇦🇪</span>
            <div>
              <strong>UAE National Crisis Line</strong>
              <a href="tel:800HOPE" className="mhl__hotline-num">800 HOPE (4673)</a>
            </div>
          </div>
          <div className="mhl__hotline">
            <span className="mhl__hotline-flag">🇦🇪</span>
            <div>
              <strong>Dubai Mental Health Helpline</strong>
              <a href="tel:800MENTALHEALTH" className="mhl__hotline-num">800 MENTAL HEALTH</a>
            </div>
          </div>
          <div className="mhl__hotline">
            <span className="mhl__hotline-flag">🌍</span>
            <div>
              <strong>International Association for Suicide Prevention</strong>
              <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noreferrer" className="mhl__hotline-num">Find a crisis centre →</a>
            </div>
          </div>
          <div className="mhl__hotline">
            <span className="mhl__hotline-flag">🇬🇧</span>
            <div>
              <strong>Samaritans (UK)</strong>
              <a href="tel:116123" className="mhl__hotline-num">116 123 (free, 24/7)</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mhl__section">
        <h3 className="mhl__section-title">💡 Coping Strategies</h3>
        <div className="mhl__tips">
          {[
            { icon: '🌬️', title: 'Breathing Exercise', desc: 'Breathe in for 4 seconds, hold for 4, out for 6. Repeat 5 times to calm your nervous system.' },
            { icon: '🚶', title: 'Move Your Body', desc: 'Even a 10-minute walk can significantly reduce anxiety and boost your mood through endorphins.' },
            { icon: '📝', title: 'Journalling', desc: 'Write down your thoughts and feelings. Getting them out of your head can reduce their intensity.' },
            { icon: '🤝', title: 'Reach Out', desc: 'Talk to someone you trust. Sharing your feelings with a friend or family member can lighten the load.' },
            { icon: '😴', title: 'Prioritise Sleep', desc: 'A regular sleep schedule dramatically improves mental health. Aim for 7–9 hours per night.' },
            { icon: '🥗', title: 'Nourish Yourself', desc: 'Eat well and stay hydrated. Your brain needs fuel to regulate emotions effectively.' },
          ].map((tip) => (
            <div key={tip.title} className="mhl__tip">
              <span className="mhl__tip-icon">{tip.icon}</span>
              <div>
                <strong>{tip.title}</strong>
                <p>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mhl__section">
        <h3 className="mhl__section-title">⚠️ Warning Signs to Watch For</h3>
        <ul className="mhl__warning-list">
          <li>Persistent feelings of sadness or emptiness</li>
          <li>Withdrawal from friends, family, or activities</li>
          <li>Changes in sleep or appetite</li>
          <li>Difficulty concentrating or making decisions</li>
          <li>Feelings of hopelessness or worthlessness</li>
          <li>Thoughts of self-harm or suicide — <strong>seek immediate help</strong></li>
        </ul>
      </section>

      <div className="mhl__cta-section">
        <p className="mhl__cta-text">
          Need someone to talk to right now? Our AI support assistant is available 24/7 for a confidential conversation.
        </p>
        <button className="mhl__chat-btn" onClick={onOpenChat}>
          💬 Talk to AI Support
        </button>
        <p className="mhl__disclaimer">
          ℹ️ Our AI provides emotional support and information only. It is not a substitute for professional mental health care. If you are in crisis, please call a helpline immediately.
        </p>
      </div>
    </div>
  );
}
