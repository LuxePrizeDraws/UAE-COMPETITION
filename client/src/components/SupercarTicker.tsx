import './SupercarTicker.css';

const SUPERCARS = ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB'];

export default function SupercarTicker() {
  const items = [...SUPERCARS, ...SUPERCARS];

  return (
    <div className="supercar-ticker" aria-label="Featured supercar prizes">
      <div className="supercar-ticker__track">
        {items.map((car, idx) => (
          <span className="supercar-ticker__item" key={`${car}-${idx}`}>
            {car}
          </span>
        ))}
      </div>
    </div>
  );
}
