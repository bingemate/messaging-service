import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  receiverId: string;
  @ApiProperty()
  text: string;
}
