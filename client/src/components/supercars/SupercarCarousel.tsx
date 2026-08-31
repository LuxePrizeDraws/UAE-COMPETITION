import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Supercar } from '../../types/supercar';
import './SupercarCarousel.css';

interface Props {
  cars: Supercar[];
  ctaLink?: string;
  ctaLabel?: string;
}

export default function SupercarCarousel({ cars, ctaLink = '/gallery/supercars', ctaLabel = 'Browse our supercar collection' }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const featuredCars = useMemo(() => cars.slice(0, 6), [cars]);

  useEffect(() => {
    if (paused || featuredCars.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredCars.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, featuredCars.length]);

  if (!featuredCars.length) return null;
  const active = featuredCars[index];

  return (
    <section
      className="supercar-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured luxury prize carousel"
    >
      <img src={active.images[0]} alt={`${active.brand} ${active.model} featured luxury prize`} className="supercar-carousel__image" />
      <div className="supercar-carousel__overlay">
        <p className="supercar-carousel__badge">Featured Luxury Prize</p>
        <h2>{active.brand} {active.model}</h2>
        <p>{active.price_range}</p>
        <Link to={ctaLink} className="supercar-carousel__cta">{ctaLabel}</Link>
      </div>
      <button
        className="supercar-carousel__nav supercar-carousel__nav--prev"
        onClick={() => setIndex((index - 1 + featuredCars.length) % featuredCars.length)}
        aria-label="Previous supercar"
      >
        ‹
      </button>
      <button
        className="supercar-carousel__nav supercar-carousel__nav--next"
        onClick={() => setIndex((index + 1) % featuredCars.length)}
        aria-label="Next supercar"
      >
        ›
      </button>
      <div className="supercar-carousel__dots" role="tablist" aria-label="Supercar slides">
        {featuredCars.map((car, dotIndex) => (
          <button
            key={car.id}
            className={`supercar-carousel__dot${dotIndex === index ? ' is-active' : ''}`}
            onClick={() => setIndex(dotIndex)}
            aria-label={`Show ${car.brand} ${car.model}`}
          />
        ))}
      </div>
    </section>
  );
}
