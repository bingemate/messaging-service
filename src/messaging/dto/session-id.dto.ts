import { ApiProperty } from '@nestjs/swagger';

export class SessionIdDto {
  @ApiProperty()
  sessionId: string;
}
