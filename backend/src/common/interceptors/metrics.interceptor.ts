import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../../health/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const statusCode = response.statusCode;

        this.prometheusService.incrementHttpRequests(method, route, statusCode);
        this.prometheusService.observeHttpRequestDuration(method, route, statusCode, duration);
      }),
    );
  }
}