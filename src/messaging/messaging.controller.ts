import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionIdDto } from './dto/session-id.dto';
import { MessagingService } from './messaging.service';

@ApiTags('/messaging')
@Controller('/messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @ApiOperation({
    description: 'Get a session id',
  })
  @ApiOkResponse({
    type: SessionIdDto,
  })
  @Get('session')
  async getSessionId(@Headers() headers): Promise<SessionIdDto> {
    const userId = headers['user-id'];
    return {
      sessionId: await this.messagingService.createSession(userId),
    };
  }
}
