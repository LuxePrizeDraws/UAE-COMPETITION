import { CSSProperties, useEffect, useState } from 'react';

export const palette = {
  gold: '#D4AF37',
  goldBright: '#FFD700',
  dark: '#1a1a1a',
  nearBlack: '#0a0a0a',
  surface: '#111111',
  text: '#ffffff',
  textSoft: '#e5e5e5',
  muted: '#a0a0a0',
  urgent: '#dc2626',
  hot: '#f97316',
  success: '#16a34a',
};

export const cardShadow = '0 4px 20px rgba(212,175,55,0.15)';
export const hoverShadow = '0 8px 40px rgba(212,175,55,0.35)';

export const pageShellStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
  color: palette.text,
  padding: '2rem 1rem 5rem',
};

export const pageContainerStyle: CSSProperties = {
  maxWidth: 1280,
  margin: '0 auto',
};

export const luxuryCardStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
  border: '1px solid rgba(212,175,55,0.2)',
  borderRadius: 12,
  boxShadow: cardShadow,
};

export const primaryButtonStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
  color: '#0a0a0a',
  border: 'none',
  borderRadius: 8,
  padding: '0.95rem 1.4rem',
  fontWeight: 800,
  letterSpacing: 0.4,
  boxShadow: cardShadow,
};

export const luxuryAnimations = `
  @keyframes luxuryMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes luxuryPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.08); }
  }
  @keyframes luxuryFlash {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 rgba(220,38,38,0); }
    50% { opacity: 0.8; box-shadow: 0 0 22px rgba(220,38,38,0.6); }
  }
  @keyframes luxuryGlow {
    0%, 100% { box-shadow: 0 0 0 rgba(212,175,55,0.15); }
    50% { box-shadow: 0 0 30px rgba(212,175,55,0.4); }
  }
  @keyframes luxuryFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes luxuryConfetti {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
    15% { opacity: 1; }
    100% { transform: translateY(320px) rotate(540deg); opacity: 0; }
  }
  @keyframes luxuryFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes luxurySpinGlow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.15); }
  }
`;

export function getNextSunday8PmUtc(now = new Date()): Date {
  const target = new Date(now);
  const daysUntilSunday = (7 - target.getUTCDay()) % 7;
  target.setUTCDate(target.getUTCDate() + daysUntilSunday);
  target.setUTCHours(20, 0, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setUTCDate(target.getUTCDate() + 7);
  }

  return target;
}

export function getLastSunday8PmUtc(reference = new Date()): Date {
  const target = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0, 20, 0, 0, 0));
  while (target.getUTCDay() !== 0) {
    target.setUTCDate(target.getUTCDate() - 1);
  }

  if (target.getTime() <= reference.getTime()) {
    const nextMonth = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 2, 0, 20, 0, 0, 0));
    while (nextMonth.getUTCDay() !== 0) {
      nextMonth.setUTCDate(nextMonth.getUTCDate() - 1);
    }
    return nextMonth;
  }

  return target;
}

export function formatCurrency(value: number): string {
  return `£${value.toLocaleString()}`;
}

export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    shortLabel: `${days}d ${hours}h ${minutes}m`,
  };
}

export function useCyclingIndex(length: number, delay = 5000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, delay);

    return () => window.clearInterval(interval);
  }, [delay, length]);

  return index;
}
