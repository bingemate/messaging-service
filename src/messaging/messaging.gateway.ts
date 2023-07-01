import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';

@WebSocketGateway({ cors: true })
export class MessagingGateway implements OnGatewayConnection {
  private clients = new Map<string, Socket>();
  constructor(private messagingService: MessagingService) {}

  @SubscribeMessage('sendMessage')
  async createMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessage: CreateMessageDto,
  ): Promise<void> {
    try {
      const token = client.handshake.auth['token'];
      const userId = this.messagingService.getSession(token);
      if (userId === createMessage.receiverId) {
        return;
      }
      const message = await this.messagingService.createMessage({
        senderId: userId,
        receiverId: createMessage.receiverId,
        text: createMessage.text,
      });
      client.emit('newMessage', message);
      if (this.clients.has(createMessage.receiverId)) {
        this.clients.get(createMessage.receiverId).emit('newMessage', message);
      }
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('getMessages')
  async getMessages(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth['token'];
      const userId = this.messagingService.getSession(token);
      const messages = await this.messagingService.getMessages(userId);
      client.emit('messages', messages);
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() deleteMessage: DeleteMessageDto,
  ): Promise<void> {
    try {
      const token = client.handshake.auth['token'];
      const userId = this.messagingService.getSession(token);
      const msg = await this.messagingService.getMessageById(
        deleteMessage.messageId,
      );
      await this.messagingService.deleteMessage(
        deleteMessage.messageId,
        userId,
      );
      if (this.clients.has(msg.receiverId)) {
        this.clients.get(msg.receiverId).emit('deletedMessage', deleteMessage);
      }
    } catch (e) {
      console.log(e);
    }
  }

  handleConnection(client: Socket) {
    const token = client.handshake.auth['token'];
    const userId = this.messagingService.getSession(token);
    if (!userId) {
      client.disconnect();
    }
    this.clients.set(userId, client);
    client.on('disconnecting', () => {
      this.onDisconnect(client);
    });
  }

  onDisconnect(client: Socket) {
    const token = client.handshake.auth['token'];
    const userId = this.messagingService.getSession(token);
    this.messagingService.deleteSession(token);
    this.clients.delete(userId);
  }
}
