import WebSocket from 'ws';
import { Strategy } from './strategy.interface';

export const BybitStrategy: Strategy = {
  start(pair: string, onMessage: (data: any) => void, onError: (error: any) => void) {
    const connect = () => {
      const wsUrl = this.getWebSocketUrl();
      const ws = new WebSocket(wsUrl, { rejectUnauthorized: false });

      ws.on('open', () => {
        console.log('Bybit WebSocket connection opened');
        ws.send(JSON.stringify({
          op: "subscribe",
          args: [`kline.60.${pair.replace("/", "")}`],
        }));
      });

      ws.on('message', (data) => {
        try {
          const json = JSON.parse(data.toString());
          if (json.type === 'snapshot' && json.data && json.data[0]) {
            const end = parseFloat(json.data[0].high);
            onMessage({ exchange: 'Bybit', pair, price: end });
          }
        } catch (err) {
          console.error('Error parsing Bybit WebSocket message', err);
          onError(err);
        }
      });

      ws.on('error', (error) => {
        console.error(`Bybit WebSocket error: ${error.message}`);
        onError(error);
        reconnect();
      });

      ws.on('close', () => {
        console.warn(`Bybit WebSocket connection closed for pair: ${pair}`);
        reconnect();
      });

      return ws;
    };

    const reconnect = (() => {
      let retries = 0;
      const maxRetries = 5;
      const timestamp = new Date().toISOString();
      onError({ message: `[${timestamp}] Error reconnecting to Bybit, Market Pair: ${pair}: Error `});
      const reconnect = () => {
        if (retries < maxRetries) {
          const delay = Math.min(5000, Math.pow(2, retries) * 1000); // Exponential backoff with a max of 5s
          console.log(`Reconnecting to Bybit WebSocket in ${delay / 1000}s... (attempt ${retries + 1})`);
          setTimeout(() => {
            retries += 1;
            connect();
          }, delay);
        } else {
          console.error('Max reconnect attempts reached for Bybit WebSocket. Stopping reconnection.');
        }
      };
      return reconnect;
    })();

    const ws = connect();
    return ws;
  },

  stop(ws: WebSocket) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      console.log('Bybit WebSocket connection closed manually');
    }
  },

  getWebSocketUrl() {
    return `wss://stream.bybit.com/v5/public/spot`;
  },

  getDefaultValues() {
    return { exchange: 'Bybit', pair: 'BTCUSDT', price: 0 };
  },
};
