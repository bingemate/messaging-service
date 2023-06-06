import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';

@WebSocketGateway({ cors: true })
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private clients = new Map<string, Socket>();
  constructor(private messagingService: MessagingService) {}

  @SubscribeMessage('sendMessage')
  async createMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessage: CreateMessageDto,
  ): Promise<void> {
    const message = await this.messagingService.createMessage({
      senderId: client.handshake.headers['user-id'] as string,
      receiverId: createMessage.receiverId,
      text: createMessage.text,
    });
    client.emit('newMessage', message);
    if (this.clients.has(createMessage.receiverId)) {
      this.clients.get(createMessage.receiverId).emit('newMessage', message);
    }
  }

  @SubscribeMessage('getMessages')
  async getMessages(@ConnectedSocket() client: Socket): Promise<void> {
    const messages = await this.messagingService.getMessages(
      client.handshake.headers['user-id'] as string,
    );
    client.emit('messages', messages);
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() deleteMessage: DeleteMessageDto,
  ): Promise<void> {
    const msg = await this.messagingService.getMessageById(
      deleteMessage.messageId,
    );
    await this.messagingService.deleteMessage(
      deleteMessage.messageId,
      client.handshake.headers['user-id'] as string,
    );
    if (this.clients.has(msg.receiverId)) {
      this.clients.get(msg.receiverId).emit('deletedMessage', deleteMessage);
    }
  }

  handleConnection(client: Socket) {
    this.clients.set(client.handshake.headers['user-id'] as string, client);
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.handshake.headers['user-id'] as string);
  }
}
