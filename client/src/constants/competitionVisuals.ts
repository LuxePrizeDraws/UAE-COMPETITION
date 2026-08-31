export const SUPERCAR_COMPETITION_ID = 7;
export const SUPERCAR_TICKER = ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB'];
const SUPERCAR_IMAGE_URL = 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1200&q=70';
const CASH_DRAW_IMAGE_URL = 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=70';
const LIFESTYLE_IMAGE_URL = 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=70';
const COMPETITION_IMAGE_BY_ID: Record<number, string> = {
  1: CASH_DRAW_IMAGE_URL,
  2: LIFESTYLE_IMAGE_URL,
  3: CASH_DRAW_IMAGE_URL,
  4: CASH_DRAW_IMAGE_URL,
  5: CASH_DRAW_IMAGE_URL,
  6: CASH_DRAW_IMAGE_URL,
  [SUPERCAR_COMPETITION_ID]: SUPERCAR_IMAGE_URL,
  8: LIFESTYLE_IMAGE_URL,
};

export function getCompetitionVisualImage(competitionId: number): string | undefined {
  return COMPETITION_IMAGE_BY_ID[competitionId];
}
