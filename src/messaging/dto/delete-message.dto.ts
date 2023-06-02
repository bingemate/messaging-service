import { ApiProperty } from '@nestjs/swagger';

export class DeleteMessageDto {
  @ApiProperty()
  messageId: string;
}
