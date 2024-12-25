import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as net from 'net';

@Injectable()
export class TcpHealthIndicator extends HealthIndicator {
  async isHealthy(key: string, options: { host: string; port: number }): Promise<HealthIndicatorResult> {
    const { host, port } = options;

    return new Promise<HealthIndicatorResult>((resolve) => {
      const client = new net.Socket();

      client.connect(port, host, () => {
        client.end();
        resolve(this.getStatus(key, true));
      });

      client.on('error', () => {
        resolve(this.getStatus(key, false));
      });
    });
  }
}
