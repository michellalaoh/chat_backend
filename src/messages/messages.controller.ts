import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetMessagesDto } from './dto/get-messages.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private service: MessagesService) { }

  @Post()
  send(
    @Body() body: SendMessageDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.sendMessage({
      conversationId: body.conversationId,
      senderId: user.userId, // ✅ secure
      content: body.content,
    });
  }

  @Get()
  getMessages(@Query() query: GetMessagesDto) {
    return this.service.getMessagesPaginated({
      conversationId: query.conversationId,
      cursor: query.cursor,
      limit: query.limit ?? 20,
    });
  }

  @Post(':id/read')
  markRead(
    @Param('id') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.markAsRead(
      messageId,
      user.userId,
    );
  }
}