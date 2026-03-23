import {
    IsOptional,
    IsString,
    IsUUID,
    ArrayNotEmpty,
  } from 'class-validator';
  
  export class CreateGroupConversationDto {
    @IsOptional()
    @IsString()
    title?: string;
  
    @ArrayNotEmpty()
    @IsUUID('all', {
      each: true,
      message: 'each member must be a valid UUID',
    })
    members!: string[];
  }