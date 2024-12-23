export interface Strategy {
  start(pair: string, onMessage: (data: any) => void): void;
  getDefaultValues(): { exchange: string, pair: string, price: number };
  getWebSocketUrl(): string; 
  stop(): void;
}