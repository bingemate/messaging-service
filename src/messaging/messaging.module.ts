import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { MessageEntity } from './message.entity';
import { MessagingGateway } from './messaging.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
