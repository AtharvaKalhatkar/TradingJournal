export type Direction = 'LONG' | 'SHORT';
export type MarketType = 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY';
export type InstrumentType = 'EQUITY' | 'FNO' | (string & {});
export type Emotion = 'NEUTRAL' | 'CONFIDENT' | 'ANXIOUS' | 'FOMO' | 'TILTED' | 'DISCIPLINED' | 'GREEDY' | 'REVENGE' | 'SATISFIED' | (string & {});
export type Mistake = 'EARLY_ENTRY' | 'LATE_ENTRY' | 'EARLY_EXIT' | 'LATE_EXIT' | 'OVERSIZED' | 'NO_SL' | 'NO_PLAN' | 'FOMO' | 'REVENGE' | 'OVERTRADE' | 'OTHER' | (string & {});

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
  mistakes: Mistake[];
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
