import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config.json';
import { WebSocketService } from './socketservice/websocket.service';
import { WebSocketServer } from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000); // Change this to 3000 to avoid conflict with WebSocket port

  const webSocketService = app.get(WebSocketService);
  const defaultExchangeName = config.exchange.name;
  const defaultPair = config.exchange.pair;

  // Create a WebSocket server
  const io = new WebSocketServer({ port: 3003 });
  io.on('connection', (client, req) => {
    console.log('Client connected');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const exchange = url.searchParams.get('exchange') || defaultExchangeName;
    const pair = url.searchParams.get('pair') || defaultPair;

    console.log(`Subscribing client to exchange: ${exchange}, pair: ${pair}`);
    webSocketService.subscribe(client, exchange, pair);

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
