import confetti from 'canvas-confetti';

const celebrationColors = ['#f0d080', '#c9a84c', '#ffffff', '#7dd3fc', '#f472b6'];

function canAnimate() {
  return typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getParticleCount(baseCount: number) {
  if (typeof window === 'undefined') {
    return baseCount;
  }

  return Math.round(baseCount * (window.innerWidth < 768 ? 0.7 : 1));
}

function getScalar() {
  if (typeof window === 'undefined') {
    return 1;
  }

  return window.innerWidth < 768 ? 0.85 : 1;
}

export function launchCheckoutConfetti() {
  if (!canAnimate()) {
    return;
  }

  confetti({
    particleCount: getParticleCount(45),
    spread: 72,
    startVelocity: 28,
    scalar: getScalar(),
    ticks: 180,
    gravity: 1.05,
    origin: { y: 0.72 },
    colors: celebrationColors,
    disableForReducedMotion: true,
    zIndex: 1200,
  });

  window.setTimeout(() => {
    confetti({
      particleCount: getParticleCount(30),
      angle: 120,
      spread: 55,
      startVelocity: 24,
      scalar: getScalar(),
      origin: { x: 0.15, y: 0.68 },
      colors: celebrationColors,
      disableForReducedMotion: true,
      zIndex: 1200,
    });

    confetti({
      particleCount: getParticleCount(30),
      angle: 60,
      spread: 55,
      startVelocity: 24,
      scalar: getScalar(),
      origin: { x: 0.85, y: 0.68 },
      colors: celebrationColors,
      disableForReducedMotion: true,
      zIndex: 1200,
    });
  }, 150);
}

export function playSuccessConfettiSequence() {
  if (!canAnimate()) {
    return () => undefined;
  }

  const timeouts = [
    window.setTimeout(() => {
      confetti({
        particleCount: getParticleCount(90),
        spread: 100,
        startVelocity: 34,
        scalar: getScalar(),
        origin: { y: 0.62 },
        colors: celebrationColors,
        disableForReducedMotion: true,
        zIndex: 1100,
      });
    }, 120),
    window.setTimeout(() => {
      confetti({
        particleCount: getParticleCount(55),
        angle: 115,
        spread: 70,
        startVelocity: 30,
        scalar: getScalar(),
        origin: { x: 0.08, y: 0.56 },
        colors: celebrationColors,
        disableForReducedMotion: true,
        zIndex: 1100,
      });
    }, 500),
    window.setTimeout(() => {
      confetti({
        particleCount: getParticleCount(55),
        angle: 65,
        spread: 70,
        startVelocity: 30,
        scalar: getScalar(),
        origin: { x: 0.92, y: 0.56 },
        colors: celebrationColors,
        disableForReducedMotion: true,
        zIndex: 1100,
      });
    }, 820),
  ];

  return () => {
    timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  };
}
