export interface PrizeDetails {
  currency: string;
  description: string;
  includes?: string[];
}

export interface Competition {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  prizeDetails: PrizeDetails;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  drawDate: string;
  image: string;
  location: string;
  tags: string[];
  highlights: string[];
  profitMargin: string;
  expectedWinners: number;
  featured?: boolean;
}

export interface Entry {
  id: string;
  competitionId: number;
  competitionTitle: string;
  quantity: number;
  totalCost: number;
  status: string;
  createdAt: string;
  entryNumbers: string[];
  paymentIntentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthPayload {
  user: User;
  token: string;
  entries?: Entry[];
  wins?: number;
}
