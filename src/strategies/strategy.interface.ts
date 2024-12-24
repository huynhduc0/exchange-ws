export interface Strategy {
  start(pair: string, onMessage: (data: any) => void, onError: (error: any) => void): WebSocket;
  getDefaultValues(): { exchange: string, pair: string, price: number };
  getWebSocketUrl(): string; 
  stop(ws: WebSocket): void;
}