import { Module } from '@nestjs/common';
import { WebSocketConnection } from './websocket.connection';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [ WebSocketService],
})
export class WebSocketModule {}
