import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateDirectConversationDto } from './dto/create-direct-conversation.dto';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Post('direct')
  createDirect(
    @Body() body: CreateDirectConversationDto,
    @CurrentUser() user: any,
  ) {
    return this.conversationsService.createDirectConversation(
      user.userId,
      body.targetUserId,
    );
  }

  @Post('group')
  createGroup(
    @Body() body: CreateGroupConversationDto,
    @CurrentUser() user: any,
  ) {
    return this.conversationsService.createGroupConversation(
      user.userId,
      body.title ?? null,
      body.members,
    );
  }
}