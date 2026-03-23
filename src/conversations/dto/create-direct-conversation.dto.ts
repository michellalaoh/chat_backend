import { IsUUID } from 'class-validator';

export class CreateDirectConversationDto {
  @IsUUID('all', {
    message: 'targetUserId must be a valid UUID',
  })
  targetUserId!: string;
}