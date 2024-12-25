import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { TcpHealthIndicator } from './tcp-health.indicator';
@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [TcpHealthIndicator],
})
export class HealthModule {}
