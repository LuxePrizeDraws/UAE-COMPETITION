import { useMemo, useState } from 'react';
import { cardShadow, pageContainerStyle, pageShellStyle, palette, useCyclingIndex } from '../lib/luxury';

interface Winner {
  name: string;
  prize: string;
  amount: string;
  date: string;
  quote: string;
  draw: string;
}

const featuredWinners: Winner[] = [
  { name: 'Sarah M.', prize: 'Weekly Cash Draw', amount: '£10,000', date: '31 Aug 2026', quote: 'I entered before dinner and woke up a winner.', draw: 'Weekly Draw' },
  { name: 'James T.', prize: 'Monthly Mega Draw', amount: '£14,500', date: '24 Aug 2026', quote: 'The live draw felt electric from start to finish.', draw: 'Monthly Mega Draw' },
  { name: 'Aisha K.', prize: 'Free Entry Win', amount: '£3,500', date: '17 Aug 2026', quote: 'The free challenge actually paid off!', draw: 'Weekly Draw' },
  { name: 'Anonymous', prize: 'World Record Competition', amount: '£100,000', date: '10 Aug 2026', quote: 'Transparent, premium, and genuinely exciting.', draw: 'World Record Competition' },
  { name: 'Emma R.', prize: 'VIP Package', amount: '£8,750', date: '03 Aug 2026', quote: 'I loved being able to choose between prize and cash.', draw: 'Monthly Mega Draw' },
  { name: 'Noah B.', prize: 'Luxury Lifestyle Bonus', amount: '£5,000', date: '27 Jul 2026', quote: 'The countdown made the whole thing feel real.', draw: 'Weekly Draw' },
];

const recentWinners: Winner[] = Array.from({ length: 20 }, (_, index) => ({
  name: ['Sarah M.', 'James T.', 'Aisha K.', 'Anonymous', 'Emma R.', 'Noah B.'][index % 6],
  prize: ['Cash Prize', 'VIP Package', 'Free Entry Boost', 'Lifestyle Prize'][index % 4],
  amount: ['£10,000', '£5,000', '£1,000', '£14,500'][index % 4],
  date: `${31 - index} Aug 2026`,
  quote: 'Premium draw win',
  draw: ['Weekly Draw', 'Monthly Mega Draw', 'World Record Competition'][index % 3],
}));

export default function WinnersPage() {
  const [search, setSearch] = useState('');
  const [drawFilter, setDrawFilter] = useState('All');
  const bannerIndex = useCyclingIndex(featuredWinners.length, 3000);
  const bannerWinner = featuredWinners[bannerIndex];

  const filteredWinners = useMemo(() => {
    return recentWinners.filter((winner) => {
      const matchesSearch = winner.name.toLowerCase().includes(search.toLowerCase()) || winner.prize.toLowerCase().includes(search.toLowerCase());
      const matchesDraw = drawFilter === 'All' || winner.draw === drawFilter;
      return matchesSearch && matchesDraw;
    });
  }, [drawFilter, search]);

  return (
    <div style={pageShellStyle}>
      <div style={pageContainerStyle}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, marginBottom: '1.5rem', padding: '1.4rem', border: '1px solid rgba(212,175,55,0.22)', background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(17,17,17,1) 100%)' }}>
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} style={{ position: 'absolute', top: -12, left: `${index * 6}%`, color: index % 2 === 0 ? palette.goldBright : palette.text, animation: `luxuryConfetti ${2.5 + (index % 3) * 0.4}s linear ${index * 0.1}s infinite` }}>✦</span>
          ))}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: palette.goldBright, marginBottom: '0.5rem' }}>🏆 PRIZE DRAW WINNERS</h1>
            <p style={{ color: palette.textSoft }}>Verified celebrations, real payouts, and a constantly updating hall of fame.</p>
          </div>
        </div>

        <div style={{ background: '#111111', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 12, padding: '1rem 1.2rem', color: palette.goldBright, fontWeight: 900, textAlign: 'center', marginBottom: '1.5rem' }}>
          CONGRATULATIONS — {bannerWinner.name} won {bannerWinner.amount} in the {bannerWinner.draw}
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {featuredWinners.map((winner) => (
            <article key={`${winner.name}-${winner.date}`} style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.18)', borderRadius: 12, padding: '1.2rem', boxShadow: cardShadow }}>
              <div style={{ color: palette.goldBright, fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.4rem' }}>{winner.name}</div>
              <div style={{ color: palette.success, fontWeight: 800, marginBottom: '0.5rem' }}>{winner.amount}</div>
              <div style={{ color: palette.textSoft, marginBottom: '0.35rem' }}>{winner.prize}</div>
              <div style={{ color: palette.muted, fontSize: 14, marginBottom: '0.8rem' }}>{winner.date} · {winner.draw}</div>
              <blockquote style={{ color: palette.textSoft, lineHeight: 1.5, fontStyle: 'italic' }}>“{winner.quote}”</blockquote>
            </article>
          ))}
        </section>

        <section style={{ background: '#111111', borderRadius: 12, border: '1px solid rgba(212,175,55,0.18)', padding: '1.2rem', boxShadow: cardShadow }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search winners or prizes" style={{ flex: '1 1 260px', background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.16)', borderRadius: 8, color: palette.text, padding: '0.85rem 1rem' }} />
            <select value={drawFilter} onChange={(event) => setDrawFilter(event.target.value)} style={{ minWidth: 220, background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.16)', borderRadius: 8, color: palette.text, padding: '0.85rem 1rem' }}>
              {['All', 'Weekly Draw', 'Monthly Mega Draw', 'World Record Competition'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: palette.goldBright, textAlign: 'left' }}>
                  <th style={{ padding: '0.8rem' }}>Winner</th>
                  <th style={{ padding: '0.8rem' }}>Prize</th>
                  <th style={{ padding: '0.8rem' }}>Date</th>
                  <th style={{ padding: '0.8rem' }}>Draw</th>
                </tr>
              </thead>
              <tbody>
                {filteredWinners.map((winner, index) => (
                  <tr key={`${winner.name}-${index}`} style={{ borderTop: '1px solid rgba(212,175,55,0.12)', color: palette.textSoft }}>
                    <td style={{ padding: '0.8rem' }}>{winner.name}</td>
                    <td style={{ padding: '0.8rem' }}>{winner.amount} · {winner.prize}</td>
                    <td style={{ padding: '0.8rem' }}>{winner.date}</td>
                    <td style={{ padding: '0.8rem' }}>{winner.draw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
