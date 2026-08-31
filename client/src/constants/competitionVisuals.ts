export const SUPERCAR_NAMES = ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB'] as const;
export const POSTAL_ENTRY_ADDRESS = 'Luxe Prize Draws, PO Box 911, London, UK';

export type CompetitionVisualType = 'vehicle' | 'cash' | 'lifestyle';

export function getVisualTypeFromIdAndType(_id: number, type: string): CompetitionVisualType {
  if (/vehicle|supercar|car/i.test(type)) return 'vehicle';
  if (/cash|money|currency/i.test(type)) return 'cash';
  return 'lifestyle';
}
