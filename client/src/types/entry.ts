export interface EntryResult {
  success: boolean;
  message: string;
  competitionId: number;
  competitionTitle: string;
  quantity: number;
  totalCost: number;
  currency: string;
  prizeOption: string;
  entryNumbers: string[];
  drawReadyPercent: number;
  endsIn: string;
}
