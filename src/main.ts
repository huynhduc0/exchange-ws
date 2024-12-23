import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config.json';
import { WebSocketService } from './websocket/websocket.service';
import { Server } from 'socket.io';
import { WsAdapter } from '@nestjs/platform-ws';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WebSocketServer } from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(30001);
  const webSocketService = app.get(WebSocketService);

  const defaultExchangeName = config.exchange.name;
  const defaultPair = config.exchange.pair;

  // Create a WebSocket server
  const io = new WebSocketServer({ port: 3999 });
  io.on('connection', (client, req) => {
    console.log('Client connected');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const exchange = url.searchParams.get('exchange') || 'default_exchange';
    const pair = url.searchParams.get('pair') || 'default_pair';
    if (exchange && pair) {
      console.log(`Subscribing client to exchange: ${exchange}, pair: ${pair}`);
      webSocketService.subscribe(client, exchange, pair);
    } else {
      console.log(`Subscribing client to default exchange: ${defaultExchangeName}, pair: ${defaultPair}`);
      webSocketService.subscribe(client, defaultExchangeName, defaultPair);
    }

    client.on('disconnect', () => {
      console.log('Client disconnected');
      webSocketService.unsubscribe(client);
    });
    client.on('close', () => {
      console.log('Client disconnected');
      webSocketService.unsubscribe(client);
    });
  });
}

bootstrap();
