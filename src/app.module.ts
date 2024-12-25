import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebSocketModule } from './socketservice/websocket.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [WebSocketModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
