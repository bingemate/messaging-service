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

  async deleteMessage(id: string, senderId: string) {
    await this.messageEntityRepository.delete({ id, senderId });
  }

  async getMessageById(id: string) {
    return await this.messageEntityRepository.findOneBy({ id });
  }

  async getMessages(userId: string) {
    return await this.messageEntityRepository
      .createQueryBuilder()
      .where('MessageEntity.senderId=:userId', { userId })
      .orWhere('MessageEntity.receiverId=:userId', { userId })
      .getMany();
  }
}
