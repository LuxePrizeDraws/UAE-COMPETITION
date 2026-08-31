import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Fireworks } from 'fireworks-js';
import type { EntryResult } from '../types/entry';
import { playSuccessConfettiSequence } from '../utils/celebration';
import './PaymentSuccess.css';

interface PaymentSuccessLocationState {
  entryResult?: EntryResult;
}

export default function PaymentSuccess() {
  const fireworksRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const entryResult = (location.state as PaymentSuccessLocationState | null)?.entryResult;

  useEffect(() => {
    const clearConfetti = playSuccessConfettiSequence();

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !fireworksRef.current
    ) {
      return clearConfetti;
    }

    const isMobile = window.innerWidth < 768;
    const fireworks = new Fireworks(fireworksRef.current, {
      autoresize: true,
      opacity: 0.16,
      acceleration: 1.02,
      friction: 0.97,
      gravity: 1.4,
      particles: isMobile ? 60 : 90,
      explosion: 5,
      intensity: isMobile ? 14 : 18,
      flickering: 55,
      traceLength: isMobile ? 2 : 3,
      traceSpeed: 10,
      lineStyle: 'round',
      lineWidth: {
        trace: { min: 1, max: 2 },
        explosion: { min: 1, max: 2 },
      },
      hue: { min: 20, max: 360 },
      delay: { min: 28, max: 42 },
      rocketsPoint: { min: 0.2, max: 0.8 },
      brightness: { min: 50, max: 80 },
      decay: { min: 0.015, max: 0.03 },
      mouse: { click: false, move: false, max: 1 },
      sound: { enabled: false, files: [], volume: { min: 0, max: 0 } },
    });

    fireworks.start();

    const stopTimer = window.setTimeout(() => {
      fireworks.stop();
      void fireworks.waitStop().then(() => fireworks.clear());
    }, 4200);

    return () => {
      clearConfetti();
      window.clearTimeout(stopTimer);
      fireworks.stop();
      void fireworks.waitStop().then(() => fireworks.clear()).catch(() => fireworks.clear());
    };
  }, []);

  return (
    <main className="payment-success">
      <div className="payment-success__fireworks" ref={fireworksRef} aria-hidden="true" />
      <div className="payment-success__glow payment-success__glow--left" aria-hidden="true" />
      <div className="payment-success__glow payment-success__glow--right" aria-hidden="true" />

      <section className="payment-success__card">
        <span className="payment-success__badge">🎉 Payment Successful</span>
        <h1 className="payment-success__title">Your competition entry is locked in!</h1>
        <p className="payment-success__subtitle">
          {entryResult
            ? `You're officially entered into ${entryResult.competitionTitle}. Good luck in the draw.`
            : 'Your purchase has been confirmed and your celebration has started automatically.'}
        </p>

        {entryResult && (
          <>
            <div className="payment-success__summary">
              <div>
                <span>Tickets</span>
                <strong>{entryResult.quantity}</strong>
              </div>
              <div>
                <span>Total Paid</span>
                <strong>£{entryResult.totalCost.toLocaleString()}</strong>
              </div>
              <div>
                <span>Prize Choice</span>
                <strong>{entryResult.prizeOption === 'cash' ? '💰 Cash' : '🏆 Physical Prize'}</strong>
              </div>
              <div>
                <span>Draw Closes</span>
                <strong>{entryResult.endsIn}</strong>
              </div>
            </div>

            <div className="payment-success__tickets">
              <p>Your entry numbers</p>
              <div className="payment-success__ticket-list">
                {entryResult.entryNumbers.map((entryNumber) => (
                  <span key={entryNumber} className="payment-success__ticket">
                    {entryNumber}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="payment-success__actions">
          <Link className="payment-success__button payment-success__button--primary" to="/">
            Browse more competitions
          </Link>
          <Link className="payment-success__button" to="/dashboard">
            View live dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
