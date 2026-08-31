import { useMemo } from 'react';
import { palette, useCyclingIndex } from '../lib/luxury';

const messages = [
  '🎉 Sarah M. just won!',
  '💰 James T. entered 5 times',
  '🏆 New winner: Anonymous',
  '⚡ Emma R. unlocked a free entry',
  '🔥 VIP player bought 20 entries',
];

export default function ToastNotifications() {
  const index = useCyclingIndex(messages.length, 5000);
  const message = useMemo(() => messages[index], [index]);

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          minWidth: 280,
          maxWidth: 340,
          background: 'rgba(10,10,10,0.92)',
          border: `1px solid ${palette.gold}`,
          borderRadius: 12,
          padding: '0.9rem 1rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
          animation: 'luxuryFadeIn 0.4s ease, luxuryFloat 4s ease-in-out infinite',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: palette.gold }}>
          <span style={{ color: palette.urgent, animation: 'luxuryPulse 1s infinite' }}>●</span>
          LIVE FEED
        </div>
        <div style={{ color: palette.text, fontWeight: 700, lineHeight: 1.4 }}>{message}</div>
      </div>
    </div>
  );
}
