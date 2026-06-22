export type Direction = 'LONG' | 'SHORT';
export type MarketType = 'STOCK' | 'CRYPTO' | 'FOREX' | 'COMMODITY';
export type InstrumentType = 'EQUITY' | 'FNO';
export type Emotion = 'NEUTRAL' | 'CONFIDENT' | 'ANXIOUS' | 'FOMO' | 'TILTED' | 'DISCIPLINED' | 'GREEDY' | 'REVENGE' | 'SATISFIED';
export type Mistake = 'EARLY_ENTRY' | 'LATE_ENTRY' | 'EARLY_EXIT' | 'LATE_EXIT' | 'OVERSIZED' | 'NO_SL' | 'NO_PLAN' | 'FOMO' | 'REVENGE' | 'OVERTRADE' | 'OTHER';
export type TradeStatus = 'OPEN' | 'CLOSED' | 'PARTIAL';

export interface Trade {
  id: string;
  symbol: string;
  marketType: MarketType;
  instrumentType: InstrumentType;
  direction: Direction;
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
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
  status: TradeStatus;
  screenshot?: string;
  partialExits?: PartialExit[];
  rating?: number;
}

export interface PartialExit {
  date: string;
  price: number;
  quantity: number;
  pnl: number;
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

export interface TradeGoal {
  id: string;
  type: 'MONTHLY_PNL' | 'DAILY_TRADES' | 'WIN_RATE' | 'MAX_DRAWDOWN' | 'CONSECUTIVE_WINS';
  target: number;
  current: number;
  period: string;
}
