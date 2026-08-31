import './SupercarGallery.css';

interface Car {
  emoji: string;
  make: string;
  model: string;
  year: string;
  color: string;
  hp: string;
  topSpeed: string;
  acceleration: string;
  value: string;
  tags: string[];
}

const cars: Car[] = [
  {
    emoji: '🏎️',
    make: 'Lamborghini',
    model: 'Huracán EVO',
    year: '2024',
    color: 'Giallo Belenus (Yellow)',
    hp: '640 hp',
    topSpeed: '325 km/h',
    acceleration: '2.9s 0–100',
    value: '£220,000',
    tags: ['V10', 'AWD', 'Supercar'],
  },
  {
    emoji: '🏎️',
    make: 'Ferrari',
    model: '488 GTB',
    year: '2024',
    color: 'Rosso Corsa (Red)',
    hp: '660 hp',
    topSpeed: '330 km/h',
    acceleration: '3.0s 0–100',
    value: '£215,000',
    tags: ['V8 Twin-Turbo', 'RWD', 'Supercar'],
  },
  {
    emoji: '🏎️',
    make: 'McLaren',
    model: '720S',
    year: '2024',
    color: 'Papaya Spark (Orange)',
    hp: '720 hp',
    topSpeed: '341 km/h',
    acceleration: '2.9s 0–100',
    value: '£230,000',
    tags: ['V8 Twin-Turbo', 'RWD', 'Hypercar'],
  },
  {
    emoji: '🏎️',
    make: 'Bugatti',
    model: 'Chiron Sport',
    year: '2024',
    color: 'Nocturne Black / Blue Carbon',
    hp: '1,500 hp',
    topSpeed: '420 km/h',
    acceleration: '2.4s 0–100',
    value: '£2,500,000',
    tags: ['W16 Quad-Turbo', 'AWD', 'Hypercar'],
  },
  {
    emoji: '🏎️',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: '2024',
    color: 'Python Green',
    hp: '525 hp',
    topSpeed: '296 km/h',
    acceleration: '3.2s 0–100',
    value: '£195,000',
    tags: ['Flat-6', 'RWD', 'Track Car'],
  },
  {
    emoji: '🏎️',
    make: 'Aston Martin',
    model: 'DBS 770 Ultimate',
    year: '2024',
    color: 'Stratosphere Silver',
    hp: '770 hp',
    topSpeed: '340 km/h',
    acceleration: '3.2s 0–100',
    value: '£340,000',
    tags: ['V12 Twin-Turbo', 'RWD', 'Grand Tourer'],
  },
  {
    emoji: '🏎️',
    make: 'Rolls-Royce',
    model: 'Spectre',
    year: '2024',
    color: 'Arctic White',
    hp: '577 hp',
    topSpeed: '250 km/h',
    acceleration: '4.5s 0–100',
    value: '£330,000',
    tags: ['Electric', 'AWD', 'Ultra-Luxury'],
  },
  {
    emoji: '🏎️',
    make: 'Bentley',
    model: 'Continental GT Speed',
    year: '2024',
    color: 'Beluga Black',
    hp: '659 hp',
    topSpeed: '335 km/h',
    acceleration: '3.5s 0–100',
    value: '£265,000',
    tags: ['W12', 'AWD', 'Grand Tourer'],
  },
  {
    emoji: '🏎️',
    make: 'Koenigsegg',
    model: 'Jesko Absolut',
    year: '2024',
    color: 'Ghost White',
    hp: '1,600 hp',
    topSpeed: '330 km/h+',
    acceleration: '2.5s 0–100',
    value: '£2,800,000',
    tags: ['V8 Twin-Turbo', 'RWD', 'Hypercar'],
  },
  {
    emoji: '🏎️',
    make: 'Pagani',
    model: 'Huayra Roadster BC',
    year: '2024',
    color: 'Carbon Titanium',
    hp: '800 hp',
    topSpeed: '380 km/h',
    acceleration: '2.8s 0–100',
    value: '£2,200,000',
    tags: ['V12 Bi-Turbo', 'RWD', 'Hypercar'],
  },
  {
    emoji: '🏎️',
    make: 'Ferrari',
    model: 'SF90 Stradale',
    year: '2024',
    color: 'Blu Corsa',
    hp: '986 hp',
    topSpeed: '340 km/h',
    acceleration: '2.5s 0–100',
    value: '£380,000',
    tags: ['Hybrid V8', 'AWD', 'Hypercar'],
  },
  {
    emoji: '🏎️',
    make: 'Lamborghini',
    model: 'Revuelto',
    year: '2024',
    color: 'Verde Ithaca (Green)',
    hp: '1,015 hp',
    topSpeed: '350 km/h',
    acceleration: '2.5s 0–100',
    value: '£500,000',
    tags: ['Hybrid V12', 'AWD', 'Hypercar'],
  },
];

export default function SupercarGallery() {
  return (
    <div className="sg-page">
      {/* Hero */}
      <section className="sg-hero">
        <div className="sg-hero-glow" />
        <div className="sg-hero-content">
          <span className="sg-hero-badge">🏎️ Exclusive Prize Collection</span>
          <h1 className="sg-hero-title">SUPERCAR<br />GALLERY</h1>
          <p className="sg-hero-sub">
            The world's most coveted supercars — all available as competition prizes.
            Enter our draws for a chance to win your dream machine.
          </p>
          <a href="/" className="sg-cta">ENTER TO WIN →</a>
        </div>
      </section>

      {/* Stats */}
      <div className="sg-stats">
        <div className="sg-stat"><strong>{cars.length}</strong><span>Supercars</span></div>
        <div className="sg-stat"><strong>£50M+</strong><span>Total Value</span></div>
        <div className="sg-stat"><strong>100%</strong><span>Cash Alternative</span></div>
        <div className="sg-stat"><strong>12</strong><span>Brands</span></div>
      </div>

      {/* Gallery grid */}
      <section className="sg-gallery">
        <div className="container">
          <h2 className="sg-section-title">🏎️ THE COLLECTION</h2>
          <div className="sg-grid">
            {cars.map((car) => (
              <div key={`${car.make}-${car.model}`} className="sg-card">
                <div className="sg-card-visual">
                  <div className="sg-car-emoji">{car.emoji}</div>
                  <div className="sg-value-badge">{car.value}</div>
                </div>
                <div className="sg-card-body">
                  <div className="sg-car-make">{car.make}</div>
                  <h3 className="sg-car-model">{car.model}</h3>
                  <div className="sg-car-year">{car.year} · {car.color}</div>
                  <div className="sg-car-specs">
                    <div className="sg-spec">
                      <span className="sg-spec-label">Power</span>
                      <span className="sg-spec-val">{car.hp}</span>
                    </div>
                    <div className="sg-spec">
                      <span className="sg-spec-label">Top Speed</span>
                      <span className="sg-spec-val">{car.topSpeed}</span>
                    </div>
                    <div className="sg-spec">
                      <span className="sg-spec-label">0–100</span>
                      <span className="sg-spec-val">{car.acceleration}</span>
                    </div>
                  </div>
                  <div className="sg-tags">
                    {car.tags.map((tag) => (
                      <span key={tag} className="sg-tag">{tag}</span>
                    ))}
                  </div>
                  <a href="/" className="sg-enter-btn">ENTER TO WIN</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sg-bottom-cta">
        <div className="container">
          <h2>WIN YOUR DREAM SUPERCAR</h2>
          <p>Every entry gives you a chance to drive away in one of these incredible machines.</p>
          <a href="/" className="sg-cta sg-cta--large">VIEW ALL COMPETITIONS →</a>
        </div>
      </section>
    </div>
  );
}
