import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config.json';
import { WebSocketService } from './socketservice/websocket.service';
import { WebSocketServer } from 'ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const webSocketService = app.get(WebSocketService);
  const defaultExchangeName = config.exchange.name;
  const defaultPair = config.exchange.pair;

  const io = new WebSocketServer({ port: 3003 });
  io.on('connection', (client, req) => {
    console.log('Client connected');
    const url = new URL(req.url, `http://${req.headers.host}`);
    const exchange = url.searchParams.get('exchange') || defaultExchangeName;
    const pair = url.searchParams.get('pair') || defaultPair;

    console.log(`Subscribing client to exchange: ${exchange}, pair: ${pair}`);
    webSocketService.subscribe(client, exchange, pair);
    client.on('message', (message) => {
      // console.log('Received message:', message.toString('utf-8'));
    });

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
