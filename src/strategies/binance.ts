import WebSocket from 'ws';
import { Strategy } from './strategy.interface';

export const BinanceStrategy: Strategy = {
  start(pair: string, onMessage: (data: any) => void, onError: (error: any) => void) {
    const connect = () => {
      const wsUrl = this.getWebSocketUrl();
      const ws = new WebSocket(wsUrl, { rejectUnauthorized: false });

      ws.on('open', () => {
        const request = {
          method: "SUBSCRIBE",
          params: [
            `${pair.replace("/", "").toLowerCase()}@aggTrade`,
            `${pair.replace("/", "").toLowerCase()}@depth`,
          ],
          id: 1,
        };
        ws.send(JSON.stringify(request));
      });

      ws.on('message', (data) => {
        const json = JSON.parse(data.toString());
        if (json.e && json.p) {
          const price = parseFloat(json.p);
          onMessage({ exchange: 'Binance', pair, price });
        } 
        // else if (!json.result) {
        //   onError(json);
        // }
      });

      ws.on('error', (error) => {
        onError(error);
        reconnect();
      });

      ws.on('close', () => {
        reconnect();
      });

      return ws;
    };

    const reconnect = (() => {
      let retries = 0;
      const maxRetries = 5;
      const reconnect = () => {
        if (retries < maxRetries) {
          const delay = Math.min(5000, Math.pow(2, retries) * 1000); // Exponential backoff with a cap
          console.log(`Reconnecting in ${delay / 1000}s... (attempt ${retries + 1})`);
          setTimeout(() => {
            retries += 1;
            connect();
          }, delay);
        } else {
          console.error('Max reconnect attempts reached. Stopping reconnection.');
        }
      };
      return reconnect;
    })();

    const ws = connect();
    return ws;
  },

  getWebSocketUrl() {
    return `wss://stream.binance.com:443/ws`;
  },

  getDefaultValues() {
    return { exchange: 'Binance', pair: 'BTCUSDT', price: 0 };
  },

  stop(ws: WebSocket) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      console.log('WebSocket connection closed manually');
    }
  },
};
