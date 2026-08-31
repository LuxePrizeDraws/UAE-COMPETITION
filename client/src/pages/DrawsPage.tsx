import { useEffect, useMemo, useState } from 'react';
import { cardShadow, formatCurrency, getLastSunday8PmUtc, getNextSunday8PmUtc, pageContainerStyle, pageShellStyle, palette, useCountdown } from '../lib/luxury';

interface DrawCard {
  name: string;
  pool: number;
  targetPool: number;
  entries: number;
  status: 'LIVE' | 'UPCOMING';
  prizes: string[];
  badgeColor: string;
  yourEntries: number;
  target: Date;
}

export default function DrawsPage() {
  const weeklyTarget = useMemo(() => getNextSunday8PmUtc(), []);
  const monthlyTarget = useMemo(() => getLastSunday8PmUtc(), []);
  const worldRecordTarget = useMemo(() => {
    const target = getNextSunday8PmUtc();
    target.setUTCDate(target.getUTCDate() + 14);
    return target;
  }, []);

  const weeklyCountdown = useCountdown(weeklyTarget);
  const monthlyCountdown = useCountdown(monthlyTarget);
  const worldCountdown = useCountdown(worldRecordTarget);
  const [pools, setPools] = useState([2800, 11800, 120500]);

  const draws: DrawCard[] = [
    { name: 'Weekly Draw', pool: pools[0], targetPool: 3500, entries: 2847, status: 'LIVE', prizes: ['£2,500 jackpot', '£500 runner-up', '10 bonus free entries'], badgeColor: palette.success, yourEntries: 0, target: weeklyTarget },
    { name: 'Monthly Mega Draw', pool: pools[1], targetPool: 14000, entries: 9124, status: 'UPCOMING', prizes: ['£10,000 jackpot', '£2,500 silver tier', '£1,500 lifestyle bonus'], badgeColor: palette.hot, yourEntries: 0, target: monthlyTarget },
    { name: 'World Record Competition', pool: pools[2], targetPool: 127450, entries: 55211, status: 'LIVE', prizes: ['£100,000 top prize', 'Luxury trip package', 'VIP hospitality upgrades'], badgeColor: palette.gold, yourEntries: 0, target: worldRecordTarget },
  ];

  useEffect(() => {
    const targets = [3500, 14000, 127450];
    const interval = window.setInterval(() => {
      setPools((current) => current.map((value, index) => Math.min(targets[index], value + Math.max(12, Math.round((targets[index] - value) / 12)))));
    }, 700);

    return () => window.clearInterval(interval);
  }, []);

  const countdownMap = new Map<string, string>([
    ['Weekly Draw', weeklyCountdown.label],
    ['Monthly Mega Draw', monthlyCountdown.label],
    ['World Record Competition', worldCountdown.label],
  ]);

  return (
    <div style={pageShellStyle}>
      <div style={pageContainerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: palette.urgent, fontWeight: 800, marginBottom: '1rem' }}><span style={{ animation: 'luxuryPulse 1s infinite' }}>●</span> LIVE DRAW TRACKER</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: palette.goldBright, marginBottom: '0.5rem' }}>📅 UPCOMING DRAWS</h1>
          <p style={{ color: palette.muted, fontSize: '1rem' }}>Real-time countdowns, prize pool growth, and fully transparent draw progress.</p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {draws.map((draw) => {
            const progress = Math.min(100, (draw.pool / draw.targetPool) * 100);

            return (
              <article key={draw.name} style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: '1.4rem', boxShadow: cardShadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.2rem', color: palette.goldBright }}>{draw.name}</span>
                  <span style={{ padding: '0.35rem 0.7rem', borderRadius: 999, background: `${draw.badgeColor}22`, color: draw.badgeColor, fontWeight: 800, animation: 'luxuryPulse 1.4s infinite' }}>{draw.status}</span>
                </div>
                <div style={{ color: palette.muted, marginBottom: '0.9rem' }}>Countdown: {countdownMap.get(draw.name)}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: palette.goldBright, marginBottom: '0.25rem' }}>{formatCurrency(draw.pool)}</div>
                <div style={{ color: palette.textSoft, marginBottom: '1rem' }}>Target pool {formatCurrency(draw.targetPool)} · {draw.entries.toLocaleString()} entries</div>
                <div style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: palette.muted, fontSize: 13, marginBottom: 6 }}>
                    <span>Prize pool progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: '#222222', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.45rem', marginBottom: '1rem', color: palette.textSoft }}>
                  <div>Your entries: <strong>{draw.yourEntries}</strong></div>
                  {draw.prizes.map((prize) => <div key={prize}>• {prize}</div>)}
                </div>
                <div style={{ color: palette.success, fontWeight: 700 }}>Scheduled draw time: Sunday 8PM UTC</div>
              </article>
            );
          })}
        </section>

        <section style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(17,17,17,1) 100%)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: '1.6rem', boxShadow: cardShadow }}>
          <h2 style={{ color: palette.goldBright, marginBottom: '1rem' }}>How draws work</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { title: '1. Enter', text: 'Choose free or paid entries and receive confirmed ticket numbers instantly.' },
              { title: '2. Pool builds', text: 'Live counters update as more players join and prize pools climb toward their target.' },
              { title: '3. Draw live', text: 'Every draw is published at the scheduled Sunday 8PM UTC slot with transparent outcomes.' },
            ].map((step) => (
              <div key={step.title} style={{ background: '#111111', borderRadius: 12, padding: '1rem', border: '1px solid rgba(212,175,55,0.12)' }}>
                <div style={{ color: palette.gold, fontWeight: 900, marginBottom: 6 }}>{step.title}</div>
                <div style={{ color: palette.textSoft, lineHeight: 1.5 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
