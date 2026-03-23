import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMessagesDto {
  @IsUUID()
  conversationId!: string;

  @IsOptional()
  cursor?: string; // ISO timestamp

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}