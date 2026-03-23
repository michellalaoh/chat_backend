import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID('all', { message: 'conversationId must be a valid UUID' })
  conversationId!: string;

  @IsUUID('all', { message: 'senderId must be a valid UUID' })
  senderId!: string;

  @IsString()
  @MinLength(1, { message: 'content cannot be empty' })
  @MaxLength(10000)
  content!: string;
}
