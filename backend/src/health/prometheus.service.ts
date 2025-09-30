import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly notesTotal: Gauge<string>;
  private readonly usersTotal: Gauge<string>;

  constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register });

    // HTTP request counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    // Active connections gauge
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [register],
    });

    // Notes total gauge
    this.notesTotal = new Gauge({
      name: 'notes_total',
      help: 'Total number of notes in the system',
      registers: [register],
    });

    // Users total gauge
    this.usersTotal = new Gauge({
      name: 'users_total',
      help: 'Total number of users in the system',
      registers: [register],
    });
  }

  incrementHttpRequests(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  observeHttpRequestDuration(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode.toString(),
      },
      duration,
    );
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  setNotesTotal(count: number): void {
    this.notesTotal.set(count);
  }

  setUsersTotal(count: number): void {
    this.usersTotal.set(count);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  getRegister() {
    return register;
  }
}