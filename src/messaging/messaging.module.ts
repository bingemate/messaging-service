import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingService } from './messaging.service';
import { MessageEntity } from './message.entity';
import { MessagingGateway } from './messaging.gateway';
import { MessagingController } from './messaging.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity])],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
  controllers: [MessagingController],
})
export class MessagingModule {}
