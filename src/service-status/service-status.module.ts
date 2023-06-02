import { Module } from '@nestjs/common';
import { ServiceStatusController } from './service-status.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule],
  controllers: [ServiceStatusController],
})
export class ServiceStatusModule {}
