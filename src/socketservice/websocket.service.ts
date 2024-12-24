import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import WebSocket from 'ws';
import { BinanceStrategy } from '../strategies/binance';
import { BybitStrategy } from '../strategies/bybit';
import { ExchangeData } from '../models/exchange-data.model';
import { parse } from 'url';
import { json } from 'stream/consumers';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private clients: Map<Socket, { exchange: string; pair: string }> = new Map();
  private clientConnections: Map<Socket, WebSocket> = new Map();

  subscribe(client: Socket, exchange: string, pair: string) {
    this.logger.log(`Subscribing client to ${exchange} - ${pair}`);
    this.clients.set(client, { exchange, pair });
    const strategy = this.resolveExchangeStrategy(exchange);
    const ws = strategy.start(pair, (data) => this.handleMessage(client, data), (error) => this.handleError(client, error));
    this.clientConnections.set(client, ws);

    client.on('disconnect', () => {
      this.logger.log(`Client disconnected from ${exchange} - ${pair}`);
      this.unsubscribe(client);
    });
  }

  unsubscribe(client: Socket) {
    const clientData = this.clients.get(client);
    if (!clientData) return;
    this.logger.log(`Unsubscribing client from ${clientData.exchange} - ${clientData.pair}`);
    this.clients.delete(client);
    const ws = this.clientConnections.get(client);
    this.clientConnections.delete(client);
    this.resolveExchangeStrategy(clientData.exchange)?.stop(ws);
  }

  private resolveExchangeStrategy(exchange: string) {
    const strategies = {
      Binance: BinanceStrategy,
      Bybit: BybitStrategy
    };
    return strategies[exchange];
  }

  private handleMessage(client: Socket, data: ExchangeData) {
    const timestamp = new Date().toISOString();
    client.send(JSON.stringify(data));
  }
  private handleError(client: Socket, error: any) {
    this.logger.error(`Error on WebSocket: ${error.message}`);
    client.send('error', error);
  }
}
