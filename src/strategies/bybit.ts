import WebSocket from 'ws';
import { Strategy } from './strategy.interface';

let ws: WebSocket;

export const BybitStrategy: Strategy = {
  start(pair: string, onMessage: (data: any) => void) {
    const wsUrl = this.getWebSocketUrl();
    ws = new WebSocket(wsUrl, {
      rejectUnauthorized: false
    });

    ws.on('open', () => {
      ws.send(JSON.stringify({
        op: "subscribe",
        args: ["kline.60.BTCUSDT"]
      }));
    });

    ws.on('message', (data) => {
      const json = JSON.parse(data.toString());
      if (json.type === 'snapshot' && json.data && json.data[0]) {
        const end = parseFloat(json.data[0].end);
        onMessage({ exchange: 'Bybit', pair, price: end });
      }
    });

    ws.on('error', (error) => {
      console.error(`Error on Bybit WebSocket: ${error.message}`);
      setTimeout(() => this.start(pair, onMessage), 5000);
    });

    ws.on('close', () => {
      console.warn(`Bybit WebSocket closed for pair: ${pair}`);
      setTimeout(() => this.start(pair, onMessage), 5000);
    });
  },
  stop() {
    if (ws) {
      ws.close();
      console.log('Bybit WebSocket connection closed');
    }
  },
  getWebSocketUrl() {
    return `wss://stream.bybit.com/v5/public/spot`;
  },
  getDefaultValues() {
    return { exchange: 'Bybit', pair: 'BTCUSDT', price: 0 };
  }
};
