import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageEntityRepository: Repository<MessageEntity>,
  ) {}

  async createMessage(messageEntity: {
    senderId: string;
    receiverId: string;
    text: string;
  }): Promise<MessageEntity> {
    return await this.messageEntityRepository.save(messageEntity);
  }

  async deleteStatPeriod(id: string, senderId: string) {
    await this.messageEntityRepository.delete({ id, senderId });
  }

  async getMessages(senderId: string, receiverId: string) {
    return await this.messageEntityRepository
      .createQueryBuilder()
      .where(
        'MessageEntity.senderId=:senderId AND MessageEntity.receiverId=:receiverId',
        { senderId, receiverId },
      )
      .orWhere(
        'MessageEntity.senderId=:receiverId AND MessageEntity.receiverId=:senderId',
        { senderId, receiverId },
      )
      .getMany();
  }
}
