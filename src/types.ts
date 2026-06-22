export type Direction = 'LONG' | 'SHORT';
export type MarketType = 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY';
export type InstrumentType = 'EQUITY' | 'FNO' | 'FUTURES' | 'OPTIONS';
export type Emotion = 'NEUTRAL' | 'CONFIDENT' | 'ANXIOUS' | 'FOMO' | 'TILTED' | 'DISCIPLINED' | 'GREEDY' | 'REVENGE' | 'SATISFIED';
export type MistakeType = 'EARLY_ENTRY' | 'LATE_ENTRY' | 'EARLY_EXIT' | 'LATE_EXIT' | 'OVERSIZED' | 'NO_STOPLOSS' | 'NO_PLAN' | 'FOMO' | 'REVENGE' | 'OVERTRADED' | 'OTHER';

export interface Trade {
  id: string;
  symbol: string;
  marketType: MarketType;
  instrumentType: InstrumentType;
  direction: Direction;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees: number;
  strategy: string;
  emotion: Emotion;
  mistakes: MistakeType[];
  tags: string[];
  notes: string;
  pnl: number;
  pnlPercent: number;
  investment: number;
  duration: string;
  status: 'OPEN' | 'CLOSED';
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
