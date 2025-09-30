import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrometheusService } from './prometheus.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrometheusService, PrismaService],
  exports: [PrometheusService],
})
export class HealthModule {}