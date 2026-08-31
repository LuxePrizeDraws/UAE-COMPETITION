export const SUPERCAR_TICKER = ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB'];

export function getCompetitionVisualImage(competitionId: number): string {
  if (competitionId === 7) {
    return 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1200&q=70';
  }

  if ([1, 3, 4, 5, 6].includes(competitionId)) {
    return 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=70';
  }

  if ([2, 8].includes(competitionId)) {
    return 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=70';
  }

  return '';
}
