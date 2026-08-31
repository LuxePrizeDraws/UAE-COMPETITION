export type SupercarType = 'sport' | 'super' | 'hyper' | 'luxury';

export interface Supercar {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  horsepower: number;
  torque: number;
  zero_to_sixty: number;
  top_speed: number;
  price_range: string;
  colors: string[];
  transmission: string;
  type: SupercarType;
  description: string;
  images: string[];
  key_features: string[];
  specs: Record<string, string>;
}
