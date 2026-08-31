export type CompetitionVisualType = 'vehicle' | 'cash' | 'lifestyle';

export function getCompetitionVisualType(id: number): CompetitionVisualType {
  if (id === 7) return 'vehicle';
  if ([1, 3, 4, 5, 6].includes(id)) return 'cash';
  return 'lifestyle';
}

export function getCompetitionVisualImage(id: number): string {
  const type = getCompetitionVisualType(id);
  if (type === 'vehicle') {
    return 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=70';
  }
  if (type === 'cash') {
    return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=70';
  }
  return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=70';
}
