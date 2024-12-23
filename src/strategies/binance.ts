import WebSocket from 'ws';
import { Strategy } from './strategy.interface';

let ws: WebSocket;

export const BinanceStrategy: Strategy = {
  start(pair: string, onMessage: (data: any) => void) {
    const wsUrl = this.getWebSocketUrl();
    ws = new WebSocket(wsUrl, {
      rejectUnauthorized: false 
    });

    ws.on('open', () => {
      const request = {
        id: "1",
        method: "ticker.price",
        params: { symbol: pair.toUpperCase() }
      };
      ws.send(JSON.stringify(request));
    });

    ws.on('message', (data) => {
      const json = JSON.parse(data.toString());
      if (json.id === "1" && json.status === 200 && json.result) {
        const price = parseFloat(json.result.price);
        onMessage({ exchange: 'Binance', pair, price });
      }
    });

    ws.on('error', (error) => {
      console.error(`Error on Binance WebSocket: ${error.message}`);
      setTimeout(() => this.start(pair, onMessage), 5000);
    });

    ws.on('close', () => {
      console.warn(`Binance WebSocket closed for pair: ${pair}`);
      setTimeout(() => this.start(pair, onMessage), 5000);
    });
  },
  getWebSocketUrl() {
    return `wss://ws-api.binance.com:443/ws-api/v3`;
  },
  getDefaultValues() {
    return { exchange: 'Binance', pair: 'BTCUSDT', price: 0 };
  },
  stop() {
    if (ws) {
      ws.close();
      console.log('Binance WebSocket connection closed');
    }
  }
};
