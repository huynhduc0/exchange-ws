import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';
import config from 'config.json';
import { parse } from 'url';

@WebSocketGateway(3003, { path: '/ws', transports: ['websocket'] })
export class WebSocketConnection implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private defaultExchangeName: string;
  private defaultPair: string;
  
  constructor(private readonly websocketService: WebSocketService) {
    this.defaultExchangeName = config.exchange.name;
    this.defaultPair = config.exchange.pair;
  }

  handleConnection(client: Socket, ...args: any[]) {
    const url = client.request.url;
    console.log(`URL: ${url}`);
    console.log('Connected'+ url);
    if (url) {
      const query = parse(url, true).query;
      const exchange = Array.isArray(query.exchange) ? query.exchange[0] : query.exchange;
      let pair = Array.isArray(query.pair) ? query.pair[0] : query.pair;
      pair = pair.replace('/', ''); 
      console.log('Parsed query:', query);
      console.log(`Exchange: ${exchange}, Pair: ${pair}`);
      this.websocketService.subscribe(client, exchange, pair);
    }
    
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected');
    this.websocketService.unsubscribe(client);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, @MessageBody() data: { exchange: string, pair: string }) {
    this.websocketService.subscribe(client, data.exchange, data.pair);
    client.emit('price', { exchange: data.exchange, pair: data.pair, price: 0 });
  }
}
