import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@WebSocketGateway({ cors: true })
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private messagingService: MessagingService,
    private eventEmitter: EventEmitter2,
  ) {}

  @SubscribeMessage('sendMessage')
  async createMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessage: CreateMessageDto,
  ): Promise<void> {
    const message = {
      senderId: client.handshake.headers['user-id'] as string,
      receiverId: createMessage.receiverId,
      text: createMessage.text,
    };
    await this.messagingService.createMessage(message);
  }

  @SubscribeMessage('getMessages')
  async getMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() getMessagesDto: GetMessagesDto,
  ): Promise<void> {
    await this.messagingService.getMessages(
      client.handshake.headers['user-id'] as string,
      getMessagesDto.receiverId,
    );
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() deleteMessage: DeleteMessageDto,
  ): Promise<void> {
    await this.messagingService.deleteStatPeriod(
      deleteMessage.messageId,
      client.handshake.headers['user-id'] as string,
    );
  }

  handleConnection(client: Socket) {
    const mediaId = parseInt(client.handshake.query.mediaId as string);
    if (isNaN(mediaId)) {
      client.disconnect();
      return;
    }
    this.eventEmitter.emit(`media.started`, {
      mediaId,
      userId: client.handshake.headers['user-id'] as string,
      sessionId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.eventEmitter.emit(`media.stopped`, {
      mediaId: parseInt(client.handshake.query.mediaId as string),
      userId: client.handshake.headers['user-id'] as string,
      sessionId: client.id,
    });
  }
}
