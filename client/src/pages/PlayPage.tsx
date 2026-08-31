import { useEffect, useMemo, useState } from 'react';
import { cardShadow, pageContainerStyle, pageShellStyle, palette } from '../lib/luxury';

type ChallengeId = 'memory' | 'trivia' | 'spin' | 'scratch' | 'ball' | 'reaction' | 'pattern';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Challenge {
  id: ChallengeId;
  icon: string;
  name: string;
  difficulty: Difficulty;
  duration: string;
  winRate: string;
  description: string;
}

const challenges: Challenge[] = [
  { id: 'memory', icon: '🧠', name: 'Memory Match', difficulty: 'Easy', duration: '2-3 mins', winRate: '80%', description: 'Match all pairs before the clock hits zero.' },
  { id: 'trivia', icon: '📚', name: 'Trivia Quiz', difficulty: 'Medium', duration: '2-3 mins', winRate: '70%', description: 'Answer 4 of 5 correctly to win a free entry.' },
  { id: 'spin', icon: '🎰', name: 'Daily Spin', difficulty: 'Easy', duration: '2 mins', winRate: '50%', description: 'Spin the luxury wheel for a 50/50 shot.' },
  { id: 'scratch', icon: '🎫', name: 'Scratch Card', difficulty: 'Easy', duration: '2 mins', winRate: '60%', description: 'Reveal three matching symbols to win.' },
  { id: 'ball', icon: '🔵', name: 'Ball Drop', difficulty: 'Medium', duration: '2 mins', winRate: '70%', description: 'Drop the ball into one of the green win zones.' },
  { id: 'reaction', icon: '⚡', name: 'Reaction Test', difficulty: 'Easy', duration: '2 mins', winRate: '75%', description: 'Tap within 500ms when the light turns green.' },
  { id: 'pattern', icon: '🧩', name: 'Pattern Puzzle', difficulty: 'Medium', duration: '2-3 mins', winRate: '65%', description: 'Memorise and rebuild the glowing pattern.' },
];

const triviaQuestions = [
  { question: 'How often is the flagship draw run?', answers: ['Daily', 'Sunday 8PM UTC', 'Monthly only', 'Quarterly'], correct: 'Sunday 8PM UTC' },
  { question: 'Which option gives you instant entry?', answers: ['Reacting fast', 'Paying £5', 'Watching the draw', 'Refreshing the page'], correct: 'Paying £5' },
  { question: 'What colour is the luxury theme accent?', answers: ['Blue', 'Gold', 'Purple', 'Green'], correct: 'Gold' },
  { question: 'How many answers do you need correct to win this quiz?', answers: ['2', '3', '4', '5'], correct: '4' },
  { question: 'What does LIVE mean on this page?', answers: ['Draw is transparent and active', 'The site is offline', 'Entries are closed', 'Only staff can join'], correct: 'Draw is transparent and active' },
];

function getDifficultyStyle(difficulty: Difficulty) {
  if (difficulty === 'Easy') {
    return { background: 'rgba(22,163,74,0.18)', color: palette.success };
  }
  if (difficulty === 'Hard') {
    return { background: 'rgba(220,38,38,0.18)', color: palette.urgent };
  }
  return { background: 'rgba(249,115,22,0.18)', color: palette.hot };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function SpinGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    const won = Math.random() < 0.5;
    const finalRotation = 1440 + Math.floor(Math.random() * 720);
    setSpinning(true);
    setRotation((current) => current + finalRotation);
    window.setTimeout(() => {
      setSpinning(false);
      onFinish(won);
    }, 3000);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 1.5rem' }}>
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: 28 }}>▼</div>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `8px solid ${palette.gold}`,
            background: 'conic-gradient(#D4AF37 0deg 45deg, #1a1a1a 45deg 90deg, #FFD700 90deg 135deg, #111111 135deg 180deg, #D4AF37 180deg 225deg, #1a1a1a 225deg 270deg, #FFD700 270deg 315deg, #111111 315deg 360deg)',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.15, 0.75, 0.2, 1)' : 'none',
            animation: 'luxurySpinGlow 1.8s infinite',
          }}
        />
      </div>
      <button onClick={handleSpin} style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)', borderRadius: 8, padding: '0.95rem 1.5rem', fontWeight: 900, color: '#0a0a0a' }}>SPIN</button>
    </div>
  );
}

function ScratchCardGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [symbols] = useState(() => Array.from({ length: 3 }, () => ['🍀', '🌟', '💎', '🎯', '🎲'][Math.floor(Math.random() * 5)]));
  const [revealed, setRevealed] = useState([false, false, false]);

  const reveal = (index: number) => {
    if (revealed[index]) return;
    const next = [...revealed];
    next[index] = true;
    setRevealed(next);
    if (next.every(Boolean)) {
      window.setTimeout(() => {
        onFinish(new Set(symbols).size === 1);
      }, 400);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: palette.muted, marginBottom: '1rem' }}>Reveal all 3 boxes. Match 3 symbols to win.</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {symbols.map((symbol, index) => (
          <button
            key={`${symbol}-${index}`}
            type="button"
            onClick={() => reveal(index)}
            style={{
              width: 90,
              height: 110,
              borderRadius: 12,
              background: revealed[index] ? 'rgba(212,175,55,0.15)' : '#4b5563',
              border: `1px solid ${revealed[index] ? palette.gold : '#6b7280'}`,
              color: palette.text,
              fontSize: '2rem',
            }}
          >
            {revealed[index] ? symbol : '❔'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactionGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [phase, setPhase] = useState<'waiting' | 'ready'>('waiting');
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPhase('ready');
      setStartedAt(Date.now());
    }, 1000 + Math.floor(Math.random() * 3000));

    return () => window.clearTimeout(timeout);
  }, []);

  const handleTap = () => {
    if (phase === 'waiting' || startedAt === null) {
      onFinish(false);
      return;
    }
    onFinish(Date.now() - startedAt <= 500);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: palette.textSoft, marginBottom: '1rem' }}>Tap when the circle turns GREEN!</p>
      <button
        type="button"
        onClick={handleTap}
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: `6px solid ${phase === 'ready' ? palette.success : palette.urgent}`,
          background: phase === 'ready' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.28)',
          color: palette.text,
          fontWeight: 900,
          fontSize: '1.2rem',
          animation: phase === 'ready' ? 'luxuryPulse 0.8s infinite' : undefined,
        }}
      >
        {phase === 'ready' ? 'TAP!' : 'WAIT...'}
      </button>
      <p style={{ color: palette.muted, marginTop: '1rem' }}>Win by reacting within 500ms. Early taps lose instantly.</p>
    </div>
  );
}

function MemoryGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [deck] = useState(() => shuffle(['🍀', '💎', '🎯', '🎲', '🚀', '⭐', '🎰', '🏆', '🍀', '💎', '🎯', '🎲', '🚀', '⭐', '🎰', '🏆']));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && matched.length < deck.length) {
      onFinish(false);
    }
  }, [deck.length, matched.length, onFinish, timeLeft]);

  useEffect(() => {
    if (matched.length === deck.length) {
      onFinish(true);
    }
  }, [deck.length, matched.length, onFinish]);

  const handleCardClick = (index: number) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped;
      if (deck[first] === deck[second]) {
        window.setTimeout(() => {
          setMatched((current) => [...current, first, second]);
          setFlipped([]);
        }, 500);
      } else {
        window.setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', color: palette.hot, fontWeight: 800, marginBottom: '1rem' }}>⏱ {Math.max(timeLeft, 0)}s remaining</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem' }}>
        {deck.map((symbol, index) => {
          const isOpen = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={`${symbol}-${index}`}
              type="button"
              onClick={() => handleCardClick(index)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: 12,
                background: isOpen ? 'rgba(212,175,55,0.2)' : '#111111',
                border: `1px solid ${isOpen ? palette.gold : 'rgba(212,175,55,0.14)'}`,
                fontSize: '1.6rem',
                color: palette.text,
              }}
            >
              {isOpen ? symbol : '❖'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TriviaGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const question = triviaQuestions[currentQuestion];

  const answerQuestion = (answer: string) => {
    const nextScore = score + (answer === question.correct ? 1 : 0);
    if (currentQuestion === triviaQuestions.length - 1) {
      setScore(nextScore);
      window.setTimeout(() => onFinish(nextScore >= 4), 300);
      return;
    }
    setScore(nextScore);
    setCurrentQuestion((current) => current + 1);
  };

  return (
    <div>
      <div style={{ color: palette.hot, fontWeight: 800, marginBottom: '1rem' }}>Question {currentQuestion + 1} / {triviaQuestions.length}</div>
      <h3 style={{ color: palette.goldBright, marginBottom: '1rem' }}>{question.question}</h3>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {question.answers.map((answer) => (
          <button key={answer} type="button" onClick={() => answerQuestion(answer)} style={{ textAlign: 'left', padding: '1rem', borderRadius: 12, background: '#111111', border: '1px solid rgba(212,175,55,0.16)', color: palette.textSoft }}>
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
}

function BallDropGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const winningSlots = [0, 2, 4];
  const [slot, setSlot] = useState<number | null>(null);
  const [dropping, setDropping] = useState(false);

  const dropBall = () => {
    if (dropping) return;
    const selectedSlot = Math.floor(Math.random() * 6);
    setSlot(selectedSlot);
    setDropping(true);
    window.setTimeout(() => onFinish(winningSlots.includes(selectedSlot)), 1500);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', height: 240, marginBottom: '1rem' }}>
        <div
          style={{
            position: 'absolute',
            top: dropping ? 150 : 0,
            left: slot === null ? '50%' : `calc(${((slot + 0.5) / 6) * 100}% - 16px)`,
            transform: slot === null ? 'translateX(-50%)' : 'none',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: palette.goldBright,
            transition: 'all 1.4s ease-in',
            boxShadow: '0 0 20px rgba(255,215,0,0.6)',
          }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
          {Array.from({ length: 6 }, (_, index) => {
            const isWinning = winningSlots.includes(index);
            return (
              <div key={index} style={{ height: 60, borderRadius: 12, background: isWinning ? 'rgba(22,163,74,0.22)' : '#1f2937', border: `1px solid ${isWinning ? palette.success : '#374151'}`, display: 'grid', placeItems: 'center', color: isWinning ? palette.success : palette.textSoft }}>
                {isWinning ? 'WIN' : 'MISS'}
              </div>
            );
          })}
        </div>
      </div>
      <button onClick={dropBall} style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)', borderRadius: 8, padding: '0.95rem 1.5rem', fontWeight: 900, color: '#0a0a0a' }}>DROP</button>
    </div>
  );
}

function PatternGame({ onFinish }: { onFinish: (won: boolean) => void }) {
  const [pattern] = useState(() => {
    const board = Array(9).fill(false) as boolean[];
    const picks = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4);
    picks.forEach((index) => {
      board[index] = true;
    });
    return board;
  });
  const [showPattern, setShowPattern] = useState(true);
  const [selection, setSelection] = useState(() => Array(9).fill(false) as boolean[]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowPattern(false), 2000);
    return () => window.clearTimeout(timeout);
  }, []);

  const toggle = (index: number) => {
    if (showPattern) return;
    setSelection((current) => current.map((value, cellIndex) => (cellIndex === index ? !value : value)));
  };

  return (
    <div>
      <p style={{ color: palette.textSoft, marginBottom: '1rem', textAlign: 'center' }}>{showPattern ? 'Memorise the glowing pattern...' : 'Rebuild the pattern and submit.'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {pattern.map((cell, index) => {
          const active = showPattern ? cell : selection[index];
          return (
            <button key={index} type="button" onClick={() => toggle(index)} style={{ aspectRatio: '1 / 1', borderRadius: 12, background: active ? 'rgba(212,175,55,0.9)' : '#111111', border: `1px solid ${active ? palette.goldBright : 'rgba(212,175,55,0.14)'}`, boxShadow: active ? '0 0 20px rgba(212,175,55,0.35)' : 'none' }} />
          );
        })}
      </div>
      {!showPattern && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => onFinish(selection.every((value, index) => value === pattern[index]))} style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)', borderRadius: 8, padding: '0.95rem 1.5rem', fontWeight: 900, color: '#0a0a0a' }}>SUBMIT</button>
          <button onClick={() => setSelection(Array(9).fill(false))} style={{ background: '#111111', border: `1px solid ${palette.gold}`, borderRadius: 8, padding: '0.95rem 1.5rem', color: palette.goldBright, fontWeight: 800 }}>RESET</button>
        </div>
      )}
    </div>
  );
}

function GameOverlay({ challenge, onClose }: { challenge: Challenge; onClose: () => void }) {
  const [result, setResult] = useState<boolean | null>(null);
  const suggestions = useMemo(() => challenges.filter((item) => item.id !== challenge.id).slice(0, 3), [challenge.id]);

  const renderGame = () => {
    switch (challenge.id) {
      case 'spin':
        return <SpinGame onFinish={setResult} />;
      case 'scratch':
        return <ScratchCardGame onFinish={setResult} />;
      case 'reaction':
        return <ReactionGame onFinish={setResult} />;
      case 'memory':
        return <MemoryGame onFinish={setResult} />;
      case 'trivia':
        return <TriviaGame onFinish={setResult} />;
      case 'ball':
        return <BallDropGame onFinish={setResult} />;
      case 'pattern':
        return <PatternGame onFinish={setResult} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'relative', width: 'min(860px, 100%)', maxHeight: '92vh', overflowY: 'auto', borderRadius: 18, background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', boxShadow: '0 12px 50px rgba(0,0,0,0.55)' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', right: 16, top: 16, width: 36, height: 36, borderRadius: '50%', background: '#111111', border: `1px solid ${palette.gold}`, color: palette.goldBright }}>✕</button>
        {result === null ? (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ color: palette.goldBright, fontSize: '1.7rem', fontWeight: 900 }}>{challenge.icon} {challenge.name}</div>
              <div style={{ color: palette.textSoft, marginTop: 6 }}>{challenge.description}</div>
            </div>
            {renderGame()}
          </>
        ) : result ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', position: 'relative', overflow: 'hidden' }}>
            {Array.from({ length: 22 }, (_, index) => (
              <span key={index} style={{ position: 'absolute', left: `${(index * 4.5) % 100}%`, top: -10, color: index % 2 === 0 ? palette.goldBright : palette.hot, fontSize: 18 + (index % 4) * 4, animation: `luxuryConfetti ${2 + (index % 3)}s linear ${index * 0.08}s infinite` }}>✦</span>
            ))}
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ color: palette.goldBright, fontSize: '2.1rem', marginBottom: '0.5rem' }}>YOU WON A FREE ENTRY!</h2>
            <p style={{ color: palette.textSoft, marginBottom: '1.5rem' }}>Your entry has been added! Take another shot for even more chances.</p>
            <button type="button" onClick={onClose} style={{ background: 'linear-gradient(135deg, #D4AF37, #FFD700)', borderRadius: 8, padding: '1rem 1.6rem', fontWeight: 900, color: '#0a0a0a' }}>Play another challenge</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ color: palette.hot, fontSize: '2rem', marginBottom: '0.75rem' }}>Almost! Try another challenge →</h2>
            <p style={{ color: palette.textSoft, marginBottom: '1.5rem' }}>Hot streaks happen fast. Jump into another live game for another free entry chance.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {suggestions.map((item) => (
                <div key={item.id} style={{ background: '#111111', borderRadius: 12, border: '1px solid rgba(212,175,55,0.14)', padding: '1rem' }}>
                  <div style={{ color: palette.goldBright, fontWeight: 800 }}>{item.icon} {item.name}</div>
                  <div style={{ color: palette.muted, fontSize: 14 }}>{item.winRate} win rate</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={onClose} style={{ background: '#111111', border: `1px solid ${palette.gold}`, borderRadius: 8, padding: '1rem 1.6rem', color: palette.goldBright, fontWeight: 900 }}>Back to challenges</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayPage() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [playersOnline, setPlayersOnline] = useState(247);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlayersOnline(230 + Math.floor(Math.random() * 35));
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div style={pageShellStyle}>
      <div style={pageContainerStyle}>
        <div style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(212,175,55,0.2)', background: '#111111', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', minWidth: 'max-content', animation: 'luxuryMarquee 18s linear infinite', padding: '0.85rem 0' }}>
            {['🔴 LIVE: 247 people playing right now', '🏆 Sarah M. just won a free entry!', '🎯 Next draw: Sunday 8PM', '💰 Prize pool: £47,230', '🔴 LIVE: 247 people playing right now', '🏆 Sarah M. just won a free entry!', '🎯 Next draw: Sunday 8PM', '💰 Prize pool: £47,230'].map((item, index) => (
              <div key={`${item}-${index}`} style={{ whiteSpace: 'nowrap', padding: '0 1.4rem', color: palette.textSoft, fontWeight: 700 }}>{item}</div>
            ))}
          </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: '1rem', color: palette.success, fontWeight: 800 }}><span style={{ animation: 'luxuryPulse 1s infinite' }}>●</span>{playersOnline} playing now</div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.6rem)', color: palette.goldBright, marginBottom: '0.6rem', animation: 'luxuryFlash 1.4s infinite' }}>🎮 PLAY TO WIN — FREE ENTRY</h1>
          <p style={{ color: palette.textSoft, maxWidth: 760, margin: '0 auto' }}>Bookie-style mini games, live player energy, and a fresh free-entry chance every time you hit a win.</p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {challenges.map((challenge) => {
            const difficultyStyle = getDifficultyStyle(challenge.difficulty);
            return (
              <article key={challenge.id} style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '1.2rem', boxShadow: cardShadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{challenge.icon}</span>
                  <span style={{ color: palette.success, fontWeight: 800, animation: 'luxuryPulse 1.2s infinite' }}>● LIVE</span>
                </div>
                <h2 style={{ color: palette.goldBright, fontSize: '1.3rem', marginBottom: '0.75rem' }}>{challenge.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  <span style={{ ...difficultyStyle, borderRadius: 999, padding: '0.3rem 0.7rem', fontWeight: 800, fontSize: 12 }}>{challenge.difficulty}</span>
                  <span style={{ background: 'rgba(212,175,55,0.12)', color: palette.gold, borderRadius: 999, padding: '0.3rem 0.7rem', fontWeight: 700, fontSize: 12 }}>⏱ {challenge.duration}</span>
                </div>
                <div style={{ color: palette.success, fontWeight: 800, marginBottom: '0.7rem' }}>🎯 {challenge.winRate} WIN RATE</div>
                <p style={{ color: palette.muted, lineHeight: 1.5, minHeight: 48 }}>{challenge.description}</p>
                <button type="button" onClick={() => setActiveChallenge(challenge)} style={{ width: '100%', marginTop: '1rem', padding: '0.95rem 1rem', borderRadius: 8, background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#0a0a0a', fontWeight: 900, boxShadow: cardShadow }}>PLAY NOW →</button>
              </article>
            );
          })}
        </section>
      </div>
      {activeChallenge && <GameOverlay key={activeChallenge.id} challenge={activeChallenge} onClose={() => setActiveChallenge(null)} />}
    </div>
  );
}
