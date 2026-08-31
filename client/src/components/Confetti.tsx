import { useEffect, useRef, useState } from 'react';

interface ConfettiProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ['#c9a84c', '#ffffff', '#22c55e', '#8b5cf6'];
const PARTICLE_COUNT = 120;

export default function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const particles: Particle[] = [];
    let animationFrame = 0;
    let running = true;

    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const createParticles = () => {
      particles.length = 0;
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * window.innerHeight * 0.35,
          size: 6 + Math.random() * 8,
          color: COLORS[index % COLORS.length],
          vx: -2 + Math.random() * 4,
          vy: 2 + Math.random() * 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: -0.15 + Math.random() * 0.3,
        });
      }
    };

    const render = () => {
      if (!running) {
        return;
      }

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.vy += 0.03;

        if (particle.y > window.innerHeight + 30) {
          particle.y = -20;
          particle.x = Math.random() * window.innerWidth;
          particle.vy = 2 + Math.random() * 5;
        }

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.7);
        context.restore();
      });

      animationFrame = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    createParticles();
    render();

    const stopTimer = window.setTimeout(() => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      setVisible(false);
    }, 3000);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      running = false;
      window.clearTimeout(stopTimer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display: visible ? 'block' : 'none',
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1200,
      }}
    />
  );
}
