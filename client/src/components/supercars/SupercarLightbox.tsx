import { useEffect, useState } from 'react';
import { Supercar } from '../../types/supercar';
import './SupercarLightbox.css';

interface Props {
  cars: Supercar[];
  selectedId: string | null;
  onClose: () => void;
}

export default function SupercarLightbox({ cars, selectedId, onClose }: Props) {
  const startIndex = selectedId ? cars.findIndex((car) => car.id === selectedId) : -1;
  const [index, setIndex] = useState(startIndex);

  useEffect(() => setIndex(startIndex), [startIndex]);

  useEffect(() => {
    if (index < 0) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((prev) => (prev + 1) % cars.length);
      if (event.key === 'ArrowLeft') setIndex((prev) => (prev - 1 + cars.length) % cars.length);
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [index, cars.length, onClose]);

  if (index < 0) return null;
  const car = cars[index];

  return (
    <div className="supercar-lightbox" role="dialog" aria-modal="true" aria-label={`${car.brand} ${car.model}`}>
      <button className="supercar-lightbox__backdrop" onClick={onClose} aria-label="Close" />
      <div className="supercar-lightbox__panel">
        <img src={car.images[0]} alt={`${car.brand} ${car.model} high resolution`} className="supercar-lightbox__image" />

        <aside className="supercar-lightbox__details">
          <button className="supercar-lightbox__close" onClick={onClose} aria-label="Close lightbox">✕</button>
          <h3>{car.brand} {car.model}</h3>
          <p>{car.year} • {car.engine}</p>
          <p>0-60: {car.zero_to_sixty}s • Top speed: {car.top_speed} mph</p>
          <p className="supercar-lightbox__price">{car.price_range}</p>
          <ul>
            {car.key_features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <button className="supercar-lightbox__cta">Could be your prize!</button>
          <button className="supercar-lightbox__secondary">Enter competition to win</button>
          <button className="supercar-lightbox__secondary">Share to social</button>
        </aside>

        <button className="supercar-lightbox__nav supercar-lightbox__nav--prev" onClick={() => setIndex((index - 1 + cars.length) % cars.length)} aria-label="Previous supercar">‹</button>
        <button className="supercar-lightbox__nav supercar-lightbox__nav--next" onClick={() => setIndex((index + 1) % cars.length)} aria-label="Next supercar">›</button>
      </div>
    </div>
  );
}
