import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cardShadow, pageContainerStyle, pageShellStyle, palette } from '../lib/luxury';

const faqs = [
  { question: 'How do free entry challenges work?', answer: 'Complete a live mini-game and, when you win, a free entry is credited immediately.' },
  { question: 'Can I skip the game?', answer: 'Yes. You can pay £5 for instant entry and receive draw numbers straight away.' },
  { question: 'When are draws run?', answer: 'The platform promotes transparent Sunday 8PM UTC draws with live updates across the site.' },
  { question: 'Are the draws transparent?', answer: 'Yes. Progress bars, live counters, and winner feeds are shown throughout the experience.' },
  { question: 'Do I get entry confirmation?', answer: 'Yes. Paid entries show entry numbers instantly and free-entry wins confirm on-screen.' },
  { question: 'Can I choose cash?', answer: 'Many competitions include a cash alternative, shown clearly on the entry flow.' },
  { question: 'Is checkout secure?', answer: 'The pay page highlights 256-bit SSL, PCI DSS Level 1, and instant confirmation messaging.' },
  { question: 'How do I see past winners?', answer: 'Visit the Winners page for the hall of fame, recent results table, and draw filters.' },
];

export default function HowItWorksPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={pageShellStyle}>
      <div style={pageContainerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: palette.goldBright, marginBottom: '0.5rem' }}>How it works</h1>
          <p style={{ color: palette.textSoft, maxWidth: 760, margin: '0 auto' }}>Three simple steps to go from player to winner, with transparent draws and premium styling throughout.</p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { title: '🎮 Play a Free Challenge', text: 'Beat a live mini-game, unlock a free entry, and head straight into the next draw cycle.' },
            { title: '💳 Or Pay £5 to Enter', text: 'Skip the game and secure instant entry with premium demo checkout and live confirmation.' },
            { title: '🏆 Win in the Draw', text: 'Every Sunday 8PM UTC, the draw closes and winners are revealed with transparent progress and results.' },
          ].map((step) => (
            <article key={step.title} style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '1.3rem', boxShadow: cardShadow }}>
              <h2 style={{ color: palette.goldBright, marginBottom: '0.7rem' }}>{step.title}</h2>
              <p style={{ color: palette.textSoft, lineHeight: 1.6 }}>{step.text}</p>
            </article>
          ))}
        </section>

        <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(17,17,17,1) 100%)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', boxShadow: cardShadow }}>
          <h2 style={{ color: palette.goldBright, marginBottom: '1rem' }}>Why players trust the platform</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem' }}>
            {['🔒 Secure entry flow', '📡 Transparent draw schedule', '💰 Clear prize pool displays', '🏆 Public winners showcase'].map((item) => (
              <div key={item} style={{ background: '#111111', borderRadius: 12, border: '1px solid rgba(212,175,55,0.14)', padding: '1rem', color: palette.textSoft }}>{item}</div>
            ))}
          </div>
        </section>

        <section style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 12, padding: '1.5rem', boxShadow: cardShadow }}>
          <h2 style={{ color: palette.goldBright, marginBottom: '1rem' }}>Frequently asked questions</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <button key={faq.question} type="button" onClick={() => setOpenIndex(isOpen ? null : index)} style={{ textAlign: 'left', background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.14)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: palette.text, fontWeight: 800 }}>{faq.question}</span>
                    <span style={{ color: palette.goldBright }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && <div style={{ marginTop: '0.75rem', color: palette.textSoft, lineHeight: 1.6 }}>{faq.answer}</div>}
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/play" style={{ padding: '1rem 1.4rem', borderRadius: 8, background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#0a0a0a', fontWeight: 900, boxShadow: cardShadow }}>Play for free</Link>
          <Link to="/pay" style={{ padding: '1rem 1.4rem', borderRadius: 8, border: `1px solid ${palette.gold}`, color: palette.goldBright, fontWeight: 900, background: '#111111' }}>Pay £5 now</Link>
          <Link to="/draws" style={{ padding: '1rem 1.4rem', borderRadius: 8, border: `1px solid ${palette.gold}`, color: palette.goldBright, fontWeight: 900, background: '#111111' }}>View draws</Link>
        </div>
      </div>
    </div>
  );
}
