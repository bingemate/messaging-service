import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { validate as isValidUUID } from 'uuid';

@WebSocketGateway(3001, { cors: true })
export class MessagingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Socket;
  constructor(private messagingService: MessagingService) {}

  @SubscribeMessage('sendMessage')
  async createMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessage: CreateMessageDto,
  ): Promise<void> {
    try {
      const token = client.handshake.auth['token'];
      const userId = this.messagingService.getSession(token);
      if (
        userId === createMessage.receiverId ||
        !isValidUUID(createMessage.receiverId)
      ) {
        return;
      }
      const message = await this.messagingService.createMessage({
        senderId: userId,
        receiverId: createMessage.receiverId,
        text: createMessage.text,
      });
      client.emit('newMessage', message);
      this.server.to(createMessage.receiverId).emit('newMessage', message);
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
      if (!msg) {
        return;
      }
      await this.messagingService.deleteMessage(
        deleteMessage.messageId,
        userId,
      );
      this.server.to(msg.receiverId).emit('deletedMessage', deleteMessage);
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
    client.join(userId);
    client.on('disconnecting', () => {
      this.onDisconnect(client);
    });
  }

  onDisconnect(client: Socket) {
    const token = client.handshake.auth['token'];
    const userId = this.messagingService.getSession(token);
    this.messagingService.deleteSession(token);
    client.leave(userId);
  }
}
