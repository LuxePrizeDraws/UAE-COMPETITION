import { Supercar, SupercarType } from '../../types/supercar';
import './SupercarFilter.css';

export interface SupercarFilterState {
  search: string;
  brand: string;
  type: '' | SupercarType;
  color: string;
  price: string;
  sort: string;
}

interface Props {
  allCars: Supercar[];
  value: SupercarFilterState;
  onChange: (next: SupercarFilterState) => void;
  onClear: () => void;
  count: number;
}

export default function SupercarFilter({ allCars, value, onChange, onClear, count }: Props) {
  const brands = [...new Set(allCars.map((car) => car.brand))].sort();
  const colors = [...new Set(allCars.flatMap((car) => car.colors))].sort();

  return (
    <section className="supercar-filter" aria-label="Filter supercars">
      <input
        type="search"
        placeholder="Search model name"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        aria-label="Search model name"
      />

      <select value={value.brand} onChange={(e) => onChange({ ...value, brand: e.target.value })} aria-label="Filter by brand">
        <option value="">All brands</option>
        {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
      </select>

      <select value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value as SupercarFilterState['type'] })} aria-label="Filter by type">
        <option value="">All types</option>
        <option value="sport">Sport</option>
        <option value="super">Super</option>
        <option value="hyper">Hyper</option>
        <option value="luxury">Luxury</option>
      </select>

      <select value={value.color} onChange={(e) => onChange({ ...value, color: e.target.value })} aria-label="Filter by color">
        <option value="">All colors</option>
        {colors.map((color) => <option key={color} value={color}>{color}</option>)}
      </select>

      <select value={value.price} onChange={(e) => onChange({ ...value, price: e.target.value })} aria-label="Filter by price range">
        <option value="">All prices</option>
        <option value="lt-200k">Under £200k</option>
        <option value="200k-500k">£200k - £500k</option>
        <option value="500k-1m">£500k - £1m</option>
        <option value="1m-plus">£1m+</option>
      </select>

      <select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value })} aria-label="Sort supercars">
        <option value="newest">Newest</option>
        <option value="price-low">Price low to high</option>
        <option value="price-high">Price high to low</option>
        <option value="brand">Brand A-Z</option>
        <option value="fastest">0-60 fastest</option>
      </select>

      <button type="button" onClick={onClear}>Clear filters</button>
      <p className="supercar-filter__count">Showing {count} supercars</p>
    </section>
  );
}
