import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { TcpHealthIndicator } from './tcp-health.indicator'; 
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private tcp: TcpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('home', 'http://localhost:3000'),
      () => this.tcp.isHealthy('WebSocketPort', { host: '127.0.0.1', port: 3003 }),
    ]);
  }
}
