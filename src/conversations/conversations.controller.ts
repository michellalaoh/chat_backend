import { Controller, Post, Body } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Post('direct')
  createDirect(@Body() body: CreateDirectConversationDto) {
    return this.conversationsService.createDirectConversation(
      body.userA,
      body.userB,
    );
  }

  @Post('group')
  createGroup(@Body() body: CreateGroupConversationDto) {
    return this.conversationsService.createGroupConversation(
      body.creatorId, 
      body.title ?? null,
      body.members,
    );
  }
}