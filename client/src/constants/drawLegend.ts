export interface DrawLegendItem {
  icon: string;
  color: string;
  label: string;
}

export const DRAW_LEGEND_ITEMS: DrawLegendItem[] = [
  { icon: '🟢', color: '#22c55e', label: 'Draw Ready (100%)' },
  { icon: '🟡', color: '#eab308', label: 'Almost Ready (75–99%)' },
  { icon: '🔵', color: '#3b82f6', label: 'In Progress (50–74%)' },
  { icon: '⚪', color: '#6b7280', label: 'Coming Soon (0–49%)' },
];
