import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty()
  receiverId: string;
}
