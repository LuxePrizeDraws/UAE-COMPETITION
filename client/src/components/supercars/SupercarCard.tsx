import { Supercar } from '../../types/supercar';
import './SupercarCard.css';

interface Props {
  car: Supercar;
  onClick: (car: Supercar) => void;
}

export default function SupercarCard({ car, onClick }: Props) {
  return (
    <button className="supercar-card" onClick={() => onClick(car)} aria-label={`View ${car.brand} ${car.model}`}>
      <div className="supercar-card__image-wrap">
        <img
          src={car.images[0]}
          alt={`${car.brand} ${car.model} front 3/4 view`}
          className="supercar-card__image"
          loading="lazy"
        />
      </div>
      <div className="supercar-card__content">
        <div className="supercar-card__meta">
          <span>{car.brand}</span>
          <span>{car.year}</span>
        </div>
        <h3>{car.model}</h3>
        <p className="supercar-card__price">{car.price_range}</p>
        <span className="supercar-card__type">{car.type.toUpperCase()}</span>
      </div>
    </button>
  );
}
