import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import WebSocket from 'ws';
import { BinanceStrategy } from '../strategies/binance';
import { BybitStrategy } from '../strategies/bybit';
import { ExchangeData } from '../models/exchange-data.model';
import { parse } from 'url';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private clients: Map<Socket, { exchange: string, pair: string }> = new Map();
  private connections: Map<string, WebSocket> = new Map();

  subscribe(client: Socket, exchange: string, pair: string) {
    this.logger.log(`Subscribing client to ${exchange} - ${pair}`);
    this.clients.set(client, { exchange, pair });
    this.connectToExchange(client, exchange, pair);

    client.on('disconnect', () => {
      this.logger.log(`Client disconnected from ${exchange} - ${pair}`);
      this.unsubscribe(client);
    });
  }

  unsubscribe(client: Socket) {
    const clientData = this.clients.get(client);
    console.log('Client data:', clientData);
    this.logger.log(`Unsubscribing client from ${clientData.exchange} - ${clientData.pair}`);
    this.clients.delete(client);
    this.checkAndDisconnectFromExchange(clientData.exchange, clientData.pair);
  }

  private resolveExchangeStrategy(exchange: string) {
    const strategies = {
      Binance: BinanceStrategy,
      Bybit: BybitStrategy
    };
    return strategies[exchange];
  }

  private connectToExchange(client: Socket, exchange: string, pair: string) {
    const strategy = this.resolveExchangeStrategy(exchange);
    if (strategy) {
      const connectionKey = `${exchange}-${pair}`;
      if (!this.connections.has(connectionKey)) {
        this.logger.log(`Connecting to ${exchange} - ${pair}`);
        const ws = new WebSocket(strategy.getWebSocketUrl(), {
          rejectUnauthorized: false
        });
        this.connections.set(connectionKey, ws);
        strategy.start(pair, (data: ExchangeData) => this.handleMessage(client, data));
      
        ws.on('open', () => {
          this.logger.log(`WebSocket opened for ${exchange} - ${pair}`);
        });

        ws.on('close', () => {
          this.logger.log(`WebSocket closed for ${exchange} - ${pair}`);
          this.connections.delete(connectionKey);
        });

        ws.on('error', (error) => {
          this.logger.error(`WebSocket error for ${exchange} - ${pair}: ${error.message}`);
          ws.close();
        });
      }
    } else {
      this.logger.error(`Unsupported exchange: ${exchange}`);
    }
  }

  private checkAndDisconnectFromExchange(exchange: string, pair: string) {
    const connectionKey = `${exchange}-${pair}`;
    const isClientConnected = Array.from(this.clients.values()).some(
      (client) => client.exchange === exchange && client.pair === pair
    );

    if (!isClientConnected && this.connections.has(connectionKey)) {
      this.logger.log(`No clients connected to ${exchange} - ${pair}, disconnecting`);
      const ws = this.connections.get(connectionKey);
      ws?.close();
      BinanceStrategy.stop();
      BybitStrategy.stop();
      this.connections.delete(connectionKey);
      this.logger.log(`Disconnected from ${exchange} for pair ${pair}`);
    }
  }

  private handleMessage(client: Socket, data: ExchangeData) {
    const timestamp = new Date().toISOString();
    this.logger.log(`[${timestamp}] Exchange: ${data.exchange}, Market Pair: ${data.pair}, Price: ${data.price}`);
    client.emit('price', data);
  }
}
