export type TradeType = 'LONG' | 'SHORT';
export type AssetClass = 'STOCKS' | 'CRYPTO' | 'FOREX' | 'OPTIONS' | 'FUTURES';
export type Emotion = 'NEUTRAL' | 'CONFIDENT' | 'ANXIOUS' | 'FOMO' | 'TILTED' | 'DISCIPLINED';

export interface Trade {
  id: string;
  symbol: string;
  assetClass: AssetClass;
  type: TradeType;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  multiplier: number; // Phase 3: Multiplier for Options/Forex
  fees: number;
  setup: string;
  emotion: Emotion;
  notes: string;
  pnl: number; 
  pnlPercent: number; 
  chartUrl?: string; // Phase 2: Chart Attachment
}

export interface PlaybookRule {
  id: string;
  text: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  rules: PlaybookRule[];
}
